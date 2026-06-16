/* ============================================================
   Pizzaria Premium — Privacy-respecting analytics (Umami self-host)
   --------------------------------------------------------------
   - Page views: auto-tracked via history API + pushState/replaceState.
   - Custom events: window.pizzariaTrack(name, props) → POSTs to
     /api/send (default Umami endpoint) of the self-hosted instance.
   - Runtime errors: window 'error' and 'unhandledrejection' hooks emit
     a 'runtime_error' / 'unhandled_rejection' event with a sanitized,
     PII-free fingerprint (hashed message + first stack frame, broad
     UA class, no raw User-Agent).
   - No cookies, no PII, no fingerprinting. IP is anonymized server-side
     by Umami. User-Agent is not stored; only device/browser class.
   - Works OFFLINE-OK: when the network is down, events are queued in
     localStorage under "premium_pizzaria_analytics_outbox" and flushed
     on the next "online" event. Order in the queue is FIFO with a
     hard cap of 200 events to bound localStorage.
   - No event ever carries: email, phone, full address, customer name,
     payment details, or MP txId. A small allowlist in
     PRIVACY_ALLOWED_KEYS enforces this on the client (defense in depth,
     in case a future contributor calls pizzariaTrack with bad props).
   - Runtime errors additionally: redact the stack to <=5 frames, drop
     the raw message, dedupe by fingerprint within DEDUPE_WINDOW_MS,
     and rate-limit to RATE_LIMIT_MAX events per RATE_LIMIT_WINDOW_MS.
   ============================================================ */

(function () {
  'use strict';

  // ---- Configuration ------------------------------------------------------
  // The host URL of the self-hosted Umami instance. Default points at the
  // project-owned instance. Override at runtime via:
  //   localStorage.setItem('premium_pizzaria_umami_host', 'https://...')
  // The website-id is fixed for the customer-facing app and registered in
  // Umami as "pizzaria-premium-storefront".
  const STORE_KEY_HOST = 'premium_pizzaria_umami_host';
  const STORE_KEY_WEBSITE = 'premium_pizzaria_umami_website_id';
  const OUTBOX_KEY = 'premium_pizzaria_analytics_outbox';
  const MAX_OUTBOX = 200;
  const APP_VERSION = 'pizzaria-premium-2026.12-errors';

  const DEFAULT_HOST = 'https://umami.pizzariapremium.com.br';
  const DEFAULT_WEBSITE_ID = 'pizzaria-premium-storefront';

  // Error-reporter knobs. All in milliseconds.
  const DEDUPE_WINDOW_MS = 5_000;     // same fingerprint within this window = 1 send
  const RATE_LIMIT_MAX = 20;          // max error events in
  const RATE_LIMIT_WINDOW_MS = 60_000;//  this rolling window
  const MAX_STACK_FRAMES = 5;
  const MAX_FP_FILE_LEN = 80;

  function getHost() {
    try {
      return localStorage.getItem(STORE_KEY_HOST) || DEFAULT_HOST;
    } catch (e) {
      return DEFAULT_HOST;
    }
  }
  function getWebsiteId() {
    try {
      return localStorage.getItem(STORE_KEY_WEBSITE) || DEFAULT_WEBSITE_ID;
    } catch (e) {
      return DEFAULT_WEBSITE_ID;
    }
  }

  // ---- Privacy allowlist --------------------------------------------------
  // Event names and stringified prop keys are limited to this allowlist.
  // Anything else is dropped with a console warning. This guarantees we
  // never accidentally exfiltrate PII through custom-event payload.
  const ALLOWED_EVENTS = new Set([
    'page_view',
    'cart_open',
    'cart_step_view',
    'checkout_start',
    'order_complete',
    'runtime_error',
    'unhandled_rejection'
  ]);
  const ALLOWED_PROP_KEYS = new Set([
    'step',           // cart_step_view payload
    'cart_size',      // cart_open payload (item count, not items)
    'cart_total_brl', // cart_open payload (rounded BRL, not full precision)
    'order_id',       // order_complete payload (random short id, not MP txId)
    'order_total_brl',// order_complete payload (rounded BRL)
    'payment_method', // order_complete payload (cod|pix|mp|card, no PII)
    // Error payload (PII-safe)
    'error_kind',         // 'js_error' | 'unhandled_rejection' | 'resource_error'
    'error_class',        // Error.name / 'TypeError' / 'Error' / ''
    'error_msg_hash',     // 16 hex chars of SHA-256 of the trimmed message
    'error_msg_len',      // length of original message (cap with 999)
    'error_fingerprint',  // 16 hex chars: hash(error_class + trimmed_msg + first_frame_path)
    'error_path',         // last path segment of the file that errored
    'error_line',         // line number, integer, capped at 100000
    'error_col',          // column number, integer, capped at 100000
    'error_stack_head',   // first MAX_STACK_FRAMES frames, file:line only (no source)
    'ua_class',           // 'mobile'|'tablet'|'desktop' + browser family
    'app_version',        // APP_VERSION constant
    'online'              // navigator.onLine at the time of the error
  ]);

  function isAllowedKey(k) {
    return ALLOWED_PROP_KEYS.has(k);
  }

  function sanitize(name, props) {
    if (!ALLOWED_EVENTS.has(name)) {
      console.warn('[analytics] dropped event not in allowlist:', name);
      return null;
    }
    const safe = {};
    if (props && typeof props === 'object') {
      for (const k of Object.keys(props)) {
        if (!isAllowedKey(k)) {
          console.warn('[analytics] dropped prop not in allowlist:', k);
          continue;
        }
        let v = props[k];
        if (Array.isArray(v)) {
          // Allow-list of array props is implicit: their elements must be
          // strings (e.g. error_stack_head) or numbers (e.g. ordered counts).
          v = v.map(function (e) {
            if (typeof e === 'string') return e.slice(0, 200);
            if (typeof e === 'number') return Math.round(e * 100) / 100;
            return String(e).slice(0, 200);
          });
        } else if (typeof v === 'string') {
          v = v.slice(0, 200); // bound payload size
        } else if (typeof v === 'number') {
          v = Math.round(v * 100) / 100; // bound precision
        } else if (typeof v === 'boolean') {
          // keep
        } else {
          v = String(v).slice(0, 200);
        }
        safe[k] = v;
      }
    }
    return safe;
  }

  // ---- Crypto helpers -----------------------------------------------------
  // SHA-256 via SubtleCrypto, then return first 16 hex chars. Used to
  // produce a stable but non-reversible identifier for an error.
  async function sha256Hex16(str) {
    try {
      const data = new TextEncoder().encode(String(str));
      const buf = await crypto.subtle.digest('SHA-256', data);
      const bytes = new Uint8Array(buf);
      let hex = '';
      for (let i = 0; i < 8 && i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, '0');
      }
      return hex;
    } catch (e) {
      // SubtleCrypto unavailable: produce a non-crypto fallback fingerprint.
      // This is still privacy-safe: it's a hash, not the original string.
      // We expand FNV-1a to 16 hex chars (two passes) so the fingerprint
      // width matches the SubtleCrypto path.
      let h1 = 0x811c9dc5;
      let h2 = 0x01000193;
      const s = String(str);
      for (let i = 0; i < s.length; i++) {
        h1 ^= s.charCodeAt(i);
        h1 = Math.imul(h1, 0x01000193) >>> 0;
        h2 ^= s.charCodeAt(s.length - 1 - i);
        h2 = Math.imul(h2, 0x811c9dc5) >>> 0;
      }
      let hex = '';
      for (let i = 0; i < 4; i++) hex += ((h1 >>> (i * 8)) & 0xff).toString(16).padStart(2, '0');
      for (let i = 0; i < 4; i++) hex += ((h2 >>> (i * 8)) & 0xff).toString(16).padStart(2, '0');
      return hex;
    }
  }

  // ---- UA classifier ------------------------------------------------------
  // We never send the raw User-Agent. We classify it into broad, low-entropy
  // buckets so a single error report tells us "Safari on iPhone" without
  // identifying the user.
  function classifyUA(ua) {
    const s = String(ua || navigator.userAgent || '');
    let device = 'desktop';
    if (/iPad|Tablet/.test(s)) device = 'tablet';
    else if (/Mobi|Android.*Mobile|iPhone|iPod/.test(s)) device = 'mobile';

    let browser = 'other';
    if (/Edg\//.test(s)) browser = 'edge';
    else if (/OPR\//.test(s) || /Opera/.test(s)) browser = 'opera';
    else if (/Firefox\//.test(s)) browser = 'firefox';
    else if (/Chrome\//.test(s) && !/Chromium\//.test(s)) browser = 'chrome';
    else if (/Safari\//.test(s) && /Version\//.test(s)) browser = 'safari';
    else if (/SamsungBrowser\//.test(s)) browser = 'samsung';

    return device + ':' + browser;
  }

  // ---- Stack redactor -----------------------------------------------------
  // Strip a stack string to a small list of file:line tokens. No source code
  // is forwarded. This is the minimum context needed to recognize a known
  // bug (e.g. "sw.js:42" or "script.js:3010") without leaking anything else.
  function redactStack(stack, maxFrames) {
    if (!stack) return [];
    const lines = String(stack).split(/\r?\n/).slice(0, maxFrames * 2);
    const out = [];
    const seen = new Set();
    for (const line of lines) {
      // Match common V8/SpiderMonkey frame shapes. We capture: file path,
      // line, column. Path is later reduced to its last segment.
      const m = line.match(/(?:at\s+.*?\s+\()?(?:(https?:[^\s)]+)|([^)\s]+))(?::(\d+))(?::(\d+))?\)?/);
      if (!m) continue;
      const file = m[1] || m[2] || '';
      const ln = m[3] || '0';
      const col = m[4] || '0';
      if (!file) continue;
      const last = file.split('/').pop().split('?')[0].slice(0, MAX_FP_FILE_LEN);
      const tok = last + ':' + ln + ':' + col;
      if (seen.has(tok)) continue;
      seen.add(tok);
      out.push(tok);
      if (out.length >= maxFrames) break;
    }
    return out;
  }

  // ---- Outbox (offline queue) --------------------------------------------
  function loadOutbox() {
    try {
      const raw = localStorage.getItem(OUTBOX_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }
  function saveOutbox(arr) {
    try {
      localStorage.setItem(OUTBOX_KEY, JSON.stringify(arr.slice(-MAX_OUTBOX)));
    } catch (e) { /* ignore quota */ }
  }
  function enqueue(payload) {
    const arr = loadOutbox();
    arr.push(payload);
    saveOutbox(arr);
  }

  // ---- Sender ------------------------------------------------------------
  // Sends an event to the Umami self-hosted collection endpoint.
  // We never throw out of the public API.
  function send(payload) {
    const host = getHost();
    const website = getWebsiteId();
    const url = host.replace(/\/+$/, '') + '/api/send';
    const body = Object.assign({}, payload, {
      website: website,
      hostname: location.hostname,
      language: navigator.language || 'pt-BR',
      screen: (screen && screen.width) ? `${screen.width}x${screen.height}` : undefined
      // NOTE: do not include url/title for custom events; Umami auto-resolves
      // from the current page when the event is a page_view.
    });
    let payloadStr;
    try {
      payloadStr = JSON.stringify(body);
    } catch (e) {
      return;
    }
    // Use sendBeacon when available so events survive page-unload.
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([payloadStr], { type: 'application/json' });
        const ok = navigator.sendBeacon(url, blob);
        if (ok) return;
      } catch (e) { /* fall through to fetch */ }
    }
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payloadStr,
      keepalive: true,
      mode: 'cors',
      credentials: 'omit'
    }).catch(function () {
      enqueue(body);
    });
  }

  function flushOutbox() {
    if (!navigator.onLine) return;
    const arr = loadOutbox();
    if (!arr.length) return;
    saveOutbox([]);
    for (const item of arr) {
      try { send(item); } catch (e) { /* ignore */ }
    }
  }

  // ---- Public API --------------------------------------------------------
  function track(name, props) {
    const safe = sanitize(name, props);
    if (!safe) return;
    const payload = {
      type: 'event',
      event: name,
      data: safe,
      ts: Date.now()
    };
    // Also stash a copy locally so the admin can see what fired
    // even if the network is dead. This is the SAME local key used by
    // the existing in-page analytics shim, so admin.html can read it.
    try {
      const KEY = 'premium_pizzaria_analytics';
      const log = JSON.parse(localStorage.getItem(KEY) || '[]');
      log.push({ name: name, props: safe, ts: Date.now() });
      if (log.length > 500) log.splice(0, log.length - 500);
      localStorage.setItem(KEY, JSON.stringify(log));
    } catch (e) { /* ignore */ }

    if (!navigator.onLine) {
      enqueue(payload);
      return;
    }
    send(payload);
  }

  function pageview() {
    const payload = {
      type: 'pageview',
      url: location.pathname + location.search,
      referrer: document.referrer || undefined,
      ts: Date.now()
    };
    try {
      const KEY = 'premium_pizzaria_analytics';
      const log = JSON.parse(localStorage.getItem(KEY) || '[]');
      log.push({ name: 'page_view', props: { url: payload.url }, ts: Date.now() });
      if (log.length > 500) log.splice(0, log.length - 500);
      localStorage.setItem(KEY, JSON.stringify(log));
    } catch (e) { /* ignore */ }
    if (!navigator.onLine) {
      enqueue(payload);
      return;
    }
    send(payload);
  }

  // ---- Runtime error reporter --------------------------------------------
  // We expose a small builder that, given either an ErrorEvent or a
  // PromiseRejectionEvent, returns a PII-safe payload. The handler hooks
  // call this async (so we can sha256 the message) and forward through
  // the same `track()` path, which keeps deduping and rate limiting in
  // one place.
  //
  // Why a builder + sync path: the sync `track()` is fine, but the hash
  // is async (SubtleCrypto is async). We await it inside the handler,
  // and we let `track()` do the final allowlist check / send.

  const recentFingerprints = {};   // fingerprint -> ts
  const recentSendTimes = [];      // rolling window of send ts

  function pruneFingerprints(now) {
    for (const k of Object.keys(recentFingerprints)) {
      if (now - recentFingerprints[k] > DEDUPE_WINDOW_MS) {
        delete recentFingerprints[k];
      }
    }
  }
  function pruneSendTimes(now) {
    while (recentSendTimes.length && now - recentSendTimes[0] > RATE_LIMIT_WINDOW_MS) {
      recentSendTimes.shift();
    }
  }
  function isOverRate(now) {
    pruneSendTimes(now);
    return recentSendTimes.length >= RATE_LIMIT_MAX;
  }

  // Best-effort normalizer that pulls the standard fields from a thrown
  // value (Error / object / primitive) without leaking it whole.
  function normalizeThrown(thrown) {
    if (!thrown) return { name: '', message: '', stack: '' };
    if (thrown instanceof Error) {
      return {
        name: String(thrown.name || 'Error').slice(0, 60),
        message: String(thrown.message || '').slice(0, 500),
        stack: String(thrown.stack || '')
      };
    }
    // Plain object with .message / .stack
    if (typeof thrown === 'object') {
      return {
        name: String(thrown.name || 'Object').slice(0, 60),
        message: String(thrown.message || thrown.reason || '').slice(0, 500),
        stack: String(thrown.stack || '')
      };
    }
    return {
      name: 'Value',
      message: String(thrown).slice(0, 500),
      stack: ''
    };
  }

  function firstFramePath(stack) {
    if (!stack) return '';
    const head = String(stack).split(/\r?\n/)[0] || '';
    const m = head.match(/(https?:[^\s)]+|[^)\s]+)(?::\d+)(?::\d+)?/);
    if (!m) return '';
    return m[1].split('?')[0];
  }

  async function buildErrorPayload(kind, info) {
    const { name, message, stack, filename, lineno, colno } = info;
    const trimmedMsg = String(message || '').trim();
    const headPath = firstFramePath(stack) || filename || '';
    const headFile = headPath ? headPath.split('/').pop().split('?')[0].slice(0, MAX_FP_FILE_LEN) : '';
    const fpSource = (name || 'Error') + '|' + trimmedMsg + '|' + headFile;
    const [fp, msgHash] = await Promise.all([
      sha256Hex16(fpSource),
      sha256Hex16(trimmedMsg)
    ]);
    const safe = {
      error_kind: kind,
      error_class: name || '',
      error_msg_hash: msgHash,
      error_msg_len: Math.min(999, trimmedMsg.length),
      error_fingerprint: fp,
      error_path: headFile,
      error_line: Math.min(100000, Number(lineno) || 0),
      error_col: Math.min(100000, Number(colno) || 0),
      error_stack_head: redactStack(stack, MAX_STACK_FRAMES),
      ua_class: classifyUA(navigator.userAgent),
      app_version: APP_VERSION,
      online: !!navigator.onLine
    };
    return safe;
  }

  async function reportError(kind, info) {
    if (!navigator.onLine && !loadOutbox().length) {
      // Best effort: still enqueue below
    }
    const now = Date.now();
    pruneFingerprints(now);
    let payload;
    try {
      payload = await buildErrorPayload(kind, info);
    } catch (e) {
      // We failed to build the payload; do nothing rather than leak.
      return;
    }
    // Dedupe by fingerprint
    if (payload.error_fingerprint && recentFingerprints[payload.error_fingerprint]
        && now - recentFingerprints[payload.error_fingerprint] < DEDUPE_WINDOW_MS) {
      return;
    }
    if (isOverRate(now)) {
      // Drop silently. We don't want a flood of errors to be a self-DoS.
      return;
    }
    recentFingerprints[payload.error_fingerprint] = now;
    recentSendTimes.push(now);
    track(kind === 'unhandled_rejection' ? 'unhandled_rejection' : 'runtime_error', payload);
  }

  function onWindowError(event) {
    if (!event) return;
    // event.error is the thrown value; event.message/filename/lineno/colno
    // are populated even when the throw came from a non-Error source.
    const thrown = event.error || {
      name: 'Error',
      message: event.message || '',
      stack: ''
    };
    const norm = normalizeThrown(thrown);
    reportError('runtime_error', {
      name: norm.name,
      message: norm.message || event.message || '',
      stack: norm.stack,
      filename: event.filename || '',
      lineno: event.lineno || 0,
      colno: event.colno || 0
    });
    // Returning true / void does not suppress — we WANT the browser's
    // default handling. We just observe.
  }

  function onUnhandledRejection(event) {
    if (!event) return;
    const reason = event.reason;
    const norm = normalizeThrown(reason);
    reportError('unhandled_rejection', {
      name: norm.name,
      message: norm.message,
      stack: norm.stack,
      filename: '',
      lineno: 0,
      colno: 0
    });
  }

  // ---- Auto page-view on history changes --------------------------------
  // Single-page apps don't fire a real navigation, so we hook pushState/
  // replaceState and popstate and emit a pageview on every transition.
  function wrapHistory() {
    const origPush = history.pushState;
    const origReplace = history.replaceState;
    history.pushState = function () {
      const ret = origPush.apply(this, arguments);
      window.dispatchEvent(new Event('pizzaria:locationchange'));
      return ret;
    };
    history.replaceState = function () {
      const ret = origReplace.apply(this, arguments);
      window.dispatchEvent(new Event('pizzaria:locationchange'));
      return ret;
    };
    window.addEventListener('popstate', function () {
      window.dispatchEvent(new Event('pizzaria:locationchange'));
    });
    window.addEventListener('pizzaria:locationchange', function () {
      // Defer so the new view has time to update document.title
      setTimeout(pageview, 50);
    });
  }

  // ---- Boot --------------------------------------------------------------
  function boot() {
    wrapHistory();
    window.addEventListener('online', flushOutbox);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) flushOutbox();
    });
    // Runtime error hooks — observe only, do not preventDefault.
    window.addEventListener('error', onWindowError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    // First pageview
    if (document.readyState === 'complete') {
      pageview();
    } else {
      window.addEventListener('load', function () {
        pageview();
        flushOutbox();
      });
    }
  }

  // Expose
  window.pizzariaTrack = track;
  window.pizzariaPageview = pageview;
  window.pizzariaReportError = reportError;
  window.pizzariaAnalytics = {
    track: track,
    pageview: pageview,
    reportError: reportError,
    flushOutbox: flushOutbox,
    config: function (host, websiteId) {
      try {
        if (host) localStorage.setItem(STORE_KEY_HOST, host);
        if (websiteId) localStorage.setItem(STORE_KEY_WEBSITE, websiteId);
      } catch (e) { /* ignore */ }
    }
  };

  // Self-disable if Do-Not-Track is set
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') {
    window.pizzariaTrack = function () { /* DNT respected */ };
    return;
  }

  boot();
})();
