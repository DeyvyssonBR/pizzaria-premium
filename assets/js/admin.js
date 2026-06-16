/* ============================================================
   Pizzaria Premium — Admin Panel Modular Bootstrap
   --------------------------------------------------------------
   v13 (PIZAA-5): owner self-service features that complement the
   existing admin.html. Loaded as a deferred <script> at the
   end of admin.html. Everything is namespaced under
   `window.PP_ADMIN` to avoid colliding with the inline scripts.

   Pieces (Tudo em pt-BR, sem framework, sem build):
     1. Backup/restore do localStorage (export/import JSON).
     2. Horários de funcionamento (semana × faixa de horário) que
        a home page lê em tempo real.
     3. Mensagens automáticas (templates) com placeholders para o
        dono copiar e colar no WhatsApp Business / resposta rápida.
     4. Onboarding em 1 página: checklist guiado para o primeiro
        acesso do dono com 6 passos numerados.
     5. Log de auditoria (PIZAA-5): ring buffer das últimas 200
        ações sensíveis do admin (login, edições, exports, deletes).
        Mantido no `localStorage` e exposto em uma aba dedicada
        "Auditoria" (renderizada pela produção em admin.html via
        hook de switchTab).

   Não-duplicação: este arquivo NÃO sobrescreve o que já existe
   em admin.html. Ele só ADICIONA as abas "Backup", "Horários",
   "Mensagens", "Onboarding" e "Auditoria" e injeta o modal de
   Onboarding no primeiro login.
   ============================================================ */

(function () {
  'use strict';

  if (window.PP_ADMIN && window.PP_ADMIN.loaded) return;
  const PP_ADMIN = window.PP_ADMIN = { loaded: true, version: 'v17-audit-log' };

  // ---------- Constants ----------
  const STORAGE_PREFIX = 'premium_pizzaria_';
  const STORAGE_KEYS = [
    'whatsapp', 'pix_key', 'pix_name', 'pix_city', 'mp_link', 'mp_integration_type',
    'delivery_fee', 'estimated_time',
    'menu', 'orders', 'saved_orders', 'auto_print',
    'promos', 'prizes', 'zones', 'loyalty_cfg',
    'store_cfg', 'delivery_cfg', 'geo_cache',
    'coupons', 'notificacoes', 'accounts',
    'customer', 'session'
  ];
  const HOURS_KEY = STORAGE_PREFIX + 'store_hours';
  const MESSAGES_KEY = STORAGE_PREFIX + 'auto_messages';
  const ONBOARDING_KEY = STORAGE_PREFIX + 'onboarding_done_v1';
  const AUDIT_LOG_KEY = STORAGE_PREFIX + 'audit_log';
  const AUDIT_LOG_MAX = 200;

  const DEFAULT_HOURS = {
    0: { open: '18:00', close: '23:30', closed: false },
    1: { open: '18:00', close: '22:00', closed: false },
    2: { open: '18:00', close: '23:30', closed: false },
    3: { open: '18:00', close: '23:30', closed: false },
    4: { open: '18:00', close: '23:30', closed: false },
    5: { open: '18:00', close: '23:30', closed: false },
    6: { open: '18:00', close: '23:30', closed: false }
  };

  const DEFAULT_MESSAGES = [
    {
      id: 'msg-boas-vindas',
      title: 'Boas-vindas',
      channel: 'whatsapp',
      body: 'Olá {{nome}}, aqui é da Pizzaria Premium! 👋 Recebemos seu pedido #{{pedido}} e já estamos preparando. Qualquer dúvida é só chamar por aqui. 🍕',
      active: true
    },
    {
      id: 'msg-saiu',
      title: 'Pedido saiu para entrega',
      channel: 'whatsapp',
      body: '{{nome}}, seu pedido #{{pedido}} acabou de sair para entrega! 🛵 Previsão de chegada: {{eta}}.',
      active: true
    },
    {
      id: 'msg-pronto-retirada',
      title: 'Pedido pronto para retirada',
      channel: 'whatsapp',
      body: '{{nome}}, seu pedido #{{pedido}} está pronto para retirada no balcão! 🛍️ Pode vir buscar.',
      active: true
    },
    {
      id: 'msg-fora-horario',
      title: 'Fora do horário',
      channel: 'whatsapp',
      body: 'Oi! No momento estamos fora do horário de atendimento. 🕐 Atendemos de {{horario}}. Assim que abrir respondemos por aqui. 🍕',
      active: true
    }
  ];

  const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  // ---------- Util ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[PP_ADMIN] falha lendo', key, e);
      return fallback;
    }
  }
  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('[PP_ADMIN] falha salvando', key, e);
      return false;
    }
  }
  function readStr(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : raw;
    } catch (e) { return fallback; }
  }

  function showToast(msg, opts) {
    opts = opts || {};
    try {
      const t = document.createElement('div');
      t.textContent = msg;
      t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#fff;padding:12px 22px;border-radius:999px;z-index:99999;font-size:0.92rem;box-shadow:0 8px 22px rgba(0,0,0,0.35);';
      if (opts.danger) t.style.background = '#b00020';
      if (opts.success) t.style.background = '#2e7d32';
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2400);
    } catch (e) { console.log(msg); }
  }

  // ---------- 1. Backup / Restore ----------
  function collectAllStorage() {
    const data = {};
    data.__meta = { exportedAt: new Date().toISOString(), prefix: STORAGE_PREFIX, version: 1 };
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.indexOf(STORAGE_PREFIX) !== 0) continue;
      const raw = localStorage.getItem(k);
      try {
        data[k] = JSON.parse(raw);
      } catch (e) {
        data[k] = raw;
      }
    }
    return data;
  }

  function exportBackup() {
    const data = collectAllStorage();
    const keys = Object.keys(data).filter(k => k !== '__meta');
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.href = url;
    a.download = `pizzaria-premium-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
    showToast(`Backup exportado (${keys.length} chaves)`, { success: true });
    const summary = $('#backup-summary');
    if (summary) {
      summary.textContent = `Última exportação: ${new Date().toLocaleString('pt-BR')} · ${keys.length} chaves no arquivo.`;
    }
    try { logEvent('backup.export', 'keys=' + keys.length); } catch (e) { /* noop */ }
  }

  function importBackupFromFile(file) {
    if (!file) return;
    if (!confirm('Substituir os dados atuais pelos do arquivo de backup? Recomendamos exportar um backup novo ANTES de continuar.')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const data = JSON.parse(String(ev.target.result || ''));
        if (!data || typeof data !== 'object' || !data.__meta) {
          showToast('Arquivo inválido (faltou __meta).', { danger: true });
          return;
        }
        if (data.__meta.prefix && data.__meta.prefix !== STORAGE_PREFIX) {
          if (!confirm('Este backup não parece ser da Pizzaria Premium (prefixo diferente). Continuar mesmo assim?')) {
            return;
          }
        }
        const keys = Object.keys(data).filter(k => k !== '__meta');
        let n = 0;
        for (const k of keys) {
          const v = data[k];
          try {
            localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
            n++;
          } catch (e) {
            console.warn('[PP_ADMIN] import falhou em', k, e);
          }
        }
        showToast(`Backup restaurado (${n} chaves). Recarregando…`, { success: true });
        try { logEvent('backup.import', 'keys=' + n); } catch (e) { /* noop */ }
        setTimeout(() => window.location.reload(), 1200);
      } catch (e) {
        showToast('Arquivo JSON inválido.', { danger: true });
        try { logEvent('backup.import.fail', String(e && e.message || e).slice(0, 200)); } catch (e2) { /* noop */ }
      }
    };
    reader.readAsText(file);
  }

  function clearAllLocal() {
    if (!confirm('Apagar TODAS as chaves premium_pizzaria_* deste navegador? Recomendamos exportar um backup antes.')) {
      return;
    }
    if (!confirm('Tem certeza mesmo? Esta ação é IRREVERSÍVEL.')) return;
    const removed = [];
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.indexOf(STORAGE_PREFIX) === 0) {
        localStorage.removeItem(k);
        removed.push(k);
      }
    }
    showToast(`LocalStorage limpo (${removed.length} chaves). Recarregando…`, { success: true });
    try { logEvent('backup.clear', 'keys=' + removed.length); } catch (e) { /* noop */ }
    setTimeout(() => window.location.reload(), 1200);
  }

  function bindBackupTab() {
    const btnExport = $('#pp-btn-export');
    const btnImport = $('#pp-btn-import');
    const btnClear = $('#pp-btn-clear');
    const fileInput = $('#pp-import-file');
    if (btnExport) btnExport.addEventListener('click', exportBackup);
    if (btnImport && fileInput) {
      btnImport.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) importBackupFromFile(file);
        e.target.value = '';
      });
    }
    if (btnClear) btnClear.addEventListener('click', clearAllLocal);
  }

  // ---------- 2. Store Hours ----------
  function getHours() {
    const stored = readJSON(HOURS_KEY, null);
    if (stored && typeof stored === 'object') {
      const out = {};
      for (let d = 0; d < 7; d++) {
        const h = stored[d] || DEFAULT_HOURS[d];
        const closed = h.closed === true;
        out[d] = {
          open: closed ? '00:00' : (h.open || DEFAULT_HOURS[d].open),
          close: closed ? '00:00' : (h.close || DEFAULT_HOURS[d].close),
          closed
        };
      }
      return out;
    }
    return JSON.parse(JSON.stringify(DEFAULT_HOURS));
  }
  function saveHours(hours) {
    writeJSON(HOURS_KEY, hours);
  }

  function renderHoursForm() {
    const wrap = $('#pp-hours-form');
    if (!wrap) return;
    const hours = getHours();
    let html = '';
    for (let d = 0; d < 7; d++) {
      const h = hours[d];
      html += `
        <div class="pp-hours-row" data-day="${d}">
          <label class="pp-day">${DAY_NAMES[d]}</label>
          <label class="pp-toggle">
            <input type="checkbox" data-field="closed" ${h.closed ? 'checked' : ''}>
            <span>Fechado</span>
          </label>
          <input type="time" data-field="open" value="${h.open}" ${h.closed ? 'disabled' : ''}>
          <span class="pp-sep">até</span>
          <input type="time" data-field="close" value="${h.close}" ${h.closed ? 'disabled' : ''}>
          <span class="pp-hours-state" data-state></span>
        </div>`;
    }
    wrap.innerHTML = html;
    $$('#pp-hours-form .pp-hours-row').forEach((row) => {
      const day = row.getAttribute('data-day');
      const cbClosed = row.querySelector('input[data-field="closed"]');
      const inOpen = row.querySelector('input[data-field="open"]');
      const inClose = row.querySelector('input[data-field="close"]');
      const state = row.querySelector('[data-state]');
      function updateState() {
        if (cbClosed.checked) {
          inOpen.disabled = true;
          inClose.disabled = true;
          state.textContent = 'Fechado o dia todo';
          state.dataset.kind = 'closed';
        } else {
          inOpen.disabled = false;
          inClose.disabled = false;
          state.textContent = `Aberto ${inOpen.value} – ${inClose.value}`;
          state.dataset.kind = 'open';
        }
      }
      cbClosed.addEventListener('change', updateState);
      inOpen.addEventListener('change', updateState);
      inClose.addEventListener('change', updateState);
      updateState();
    });
  }

  function persistHoursFromForm() {
    const hours = {};
    $$('#pp-hours-form .pp-hours-row').forEach((row) => {
      const day = Number(row.getAttribute('data-day'));
      const cbClosed = row.querySelector('input[data-field="closed"]');
      const inOpen = row.querySelector('input[data-field="open"]');
      const inClose = row.querySelector('input[data-field="close"]');
      hours[day] = {
        open: inOpen.value || DEFAULT_HOURS[day].open,
        close: inClose.value || DEFAULT_HOURS[day].close,
        closed: cbClosed.checked
      };
    });
    saveHours(hours);
    showToast('Horários salvos. A home page já mostra o novo status.', { success: true });
    try { logEvent('hours.save', '7days'); } catch (e) { /* noop */ }
  }

  function bindHoursTab() {
    const btn = $('#pp-btn-save-hours');
    if (btn) btn.addEventListener('click', persistHoursFromForm);
  }

  // ---------- 3. Auto Messages ----------
  function getMessages() {
    const stored = readJSON(MESSAGES_KEY, null);
    if (Array.isArray(stored) && stored.length) return stored;
    return JSON.parse(JSON.stringify(DEFAULT_MESSAGES));
  }
  function saveMessages(list) {
    writeJSON(MESSAGES_KEY, list);
  }

  function renderMessages() {
    const wrap = $('#pp-messages-list');
    if (!wrap) return;
    const list = getMessages();
    wrap.innerHTML = list.map((m) => `
      <div class="pp-msg-row" data-id="${m.id}">
        <div class="pp-msg-head">
          <input type="text" data-field="title" value="${escapeAttr(m.title)}" placeholder="Título (ex: Boas-vindas)">
          <label class="pp-msg-channel">
            Canal:
            <select data-field="channel">
              <option value="whatsapp" ${m.channel === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
              <option value="instagram" ${m.channel === 'instagram' ? 'selected' : ''}>Instagram</option>
              <option value="interno" ${m.channel === 'interno' ? 'selected' : ''}>Interno</option>
            </select>
          </label>
          <label class="pp-msg-active">
            <input type="checkbox" data-field="active" ${m.active ? 'checked' : ''}> ativo
          </label>
          <button type="button" class="pp-btn-copy" data-action="copy"><i class="fa-regular fa-copy"></i> Copiar</button>
          <button type="button" class="pp-btn-del" data-action="del"><i class="fa-regular fa-trash-can"></i></button>
        </div>
        <textarea data-field="body" rows="3" placeholder="Use {{nome}}, {{pedido}}, {{eta}}, {{horario}} como placeholders.">${escapeText(m.body)}</textarea>
        <div class="pp-msg-preview">${renderPreview(m.body)}</div>
      </div>
    `).join('');

    $$('#pp-messages-list .pp-msg-row').forEach((row) => {
      const id = row.getAttribute('data-id');
      const titleEl = row.querySelector('input[data-field="title"]');
      const chanEl = row.querySelector('select[data-field="channel"]');
      const actEl = row.querySelector('input[data-field="active"]');
      const bodyEl = row.querySelector('textarea[data-field="body"]');
      const preview = row.querySelector('.pp-msg-preview');
      const copyBtn = row.querySelector('[data-action="copy"]');
      const delBtn = row.querySelector('[data-action="del"]');

      [titleEl, chanEl, actEl, bodyEl].forEach((el) => {
        el.addEventListener('input', () => {
          preview.innerHTML = renderPreview(bodyEl.value);
          // live save for owner-self-service: persist on each edit
          const list = getMessages();
          const idx = list.findIndex((x) => x.id === id);
          if (idx >= 0) {
            list[idx] = {
              id,
              title: titleEl.value,
              channel: chanEl.value,
              active: actEl.checked,
              body: bodyEl.value
            };
            saveMessages(list);
          }
        });
      });

      copyBtn.addEventListener('click', () => {
        const text = bodyEl.value || '';
        try {
          navigator.clipboard.writeText(text).then(
            () => showToast('Mensagem copiada.', { success: true }),
            () => fallbackCopy(text)
          );
        } catch (e) { fallbackCopy(text); }
      });
      delBtn.addEventListener('click', () => {
        if (!confirm('Excluir esta mensagem?')) return;
        const list = getMessages().filter((x) => x.id !== id);
        saveMessages(list);
        renderMessages();
      });
    });
  }

  function renderPreview(body) {
    if (!body) return '<em style="color:#888;">(vazio)</em>';
    const sample = body
      .replace(/\{\{nome\}\}/g, 'João')
      .replace(/\{\{pedido\}\}/g, 'PRE-1234')
      .replace(/\{\{eta\}\}/g, '40-60 min')
      .replace(/\{\{horario\}\}/g, '18:00 às 23:30');
    return escapeText(sample);
  }

  function addNewMessage() {
    const list = getMessages();
    const id = 'msg-' + Date.now().toString(36);
    list.push({
      id,
      title: 'Nova mensagem',
      channel: 'whatsapp',
      body: 'Olá {{nome}}, …',
      active: true
    });
    saveMessages(list);
    renderMessages();
    try { logEvent('messages.add', id); } catch (e) { /* noop */ }
  }

  function resetMessagesToDefault() {
    if (!confirm('Restaurar as 4 mensagens padrão? Suas personalizações serão perdidas.')) return;
    saveMessages(JSON.parse(JSON.stringify(DEFAULT_MESSAGES)));
    renderMessages();
    showToast('Mensagens restauradas.', { success: true });
    try { logEvent('messages.reset', 'default'); } catch (e) { /* noop */ }
  }

  function bindMessagesTab() {
    const btnAdd = $('#pp-btn-add-msg');
    const btnReset = $('#pp-btn-reset-msg');
    if (btnAdd) btnAdd.addEventListener('click', addNewMessage);
    if (btnReset) btnReset.addEventListener('click', resetMessagesToDefault);
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    try { document.execCommand('copy'); showToast('Copiado.', { success: true }); }
    catch (e) { showToast('Não foi possível copiar.', { danger: true }); }
    document.body.removeChild(ta);
  }

  // ---------- 4. Onboarding Wizard ----------
  function buildOnboardingSteps() {
    return [
      {
        id: 'horario',
        title: '1. Horário de funcionamento',
        body: 'Defina os dias e horários que sua pizzaria abre. Esse status aparece no site para o cliente ver se está aberto.',
        targetTab: 'tab-horarios',
        doneCheck: () => !!localStorage.getItem(HOURS_KEY)
      },
      {
        id: 'whatsapp',
        title: '2. WhatsApp de atendimento',
        body: 'Confirme o número (com 55 + DDD + número) que recebe os pedidos. Sem o DDD 86, o cliente não consegue abrir conversa.',
        targetTab: 'tab-config',
        doneCheck: () => !!readStr(STORAGE_PREFIX + 'whatsapp', '').match(/^55\d{10,11}$/)
      },
      {
        id: 'pix',
        title: '3. Pix para receber pedidos',
        body: 'Cadastre sua chave Pix, nome do beneficiário (até 25 letras) e cidade (até 15 letras). Gere um QR de teste para confirmar.',
        targetTab: 'tab-config',
        doneCheck: () => !!readStr(STORAGE_PREFIX + 'pix_key', '') && !!readStr(STORAGE_PREFIX + 'pix_name', '')
      },
      {
        id: 'cardapio',
        title: '4. Cardápio',
        body: 'Revise as pizzas, bebidas e combos. Edite preços, fotos e disponibilidade direto pelo painel — não precisa mexer em código.',
        targetTab: 'tab-pizzas',
        doneCheck: () => {
          const menu = readJSON(STORAGE_PREFIX + 'menu', []);
          return Array.isArray(menu) && menu.length >= 5;
        }
      },
      {
        id: 'entrega',
        title: '5. Zonas e taxa de entrega',
        body: 'Configure o CEP da pizzaria, raio máximo e regras de frete. A calculadora do site passa a usar essas regras.',
        targetTab: 'tab-zones',
        doneCheck: () => {
          const cfg = readJSON(STORAGE_PREFIX + 'store_cfg', null);
          return cfg && !!cfg.cep;
        }
      },
      {
        id: 'backup',
        title: '6. Backup do seu trabalho',
        body: 'Exporte um JSON com TODAS as configurações. Se trocar de celular ou limpar o navegador, é só importar de volta.',
        targetTab: 'tab-backup',
        doneCheck: () => false // nunca "auto-feito"; o dono marca manualmente
      }
    ];
  }

  function isOnboardingDone() {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  }
  function markOnboardingDone() {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  }
  function resetOnboarding() {
    localStorage.removeItem(ONBOARDING_KEY);
  }

  function openOnboarding() {
    const overlay = $('#pp-onboarding-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderOnboarding();
  }
  function closeOnboarding() {
    const overlay = $('#pp-onboarding-overlay');
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
  }
  function renderOnboarding() {
    const body = $('#pp-onboarding-body');
    if (!body) return;
    const steps = buildOnboardingSteps();
    body.innerHTML = `
      <p style="margin:0 0 14px 0;color:#ddd;font-size:0.92rem;">Siga os 6 passos abaixo para deixar o painel operando. Você pode fechar e voltar quando quiser.</p>
      <ol class="pp-onb-list">
        ${steps.map((s) => {
          const done = s.doneCheck();
          return `<li class="pp-onb-item${done ? ' is-done' : ''}" data-target="${s.targetTab}">
            <span class="pp-onb-bullet">${done ? '✓' : '·'}</span>
            <div class="pp-onb-text">
              <strong>${escapeText(s.title)}</strong>
              <p>${escapeText(s.body)}</p>
            </div>
            <button type="button" class="pp-onb-go" data-tab="${s.targetTab}">Abrir</button>
          </li>`;
        }).join('')}
      </ol>
      <div class="pp-onb-actions">
        <button type="button" class="pp-btn-secondary" id="pp-onb-skip">Pular por agora</button>
        <button type="button" class="pp-btn-primary" id="pp-onb-done">Marcar onboarding concluído</button>
      </div>`;
    $$('#pp-onboarding-body .pp-onb-go').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab && typeof window.switchTab === 'function') {
          const nav = document.querySelector(`.nav-item[onclick*="${tab}"]`);
          window.switchTab(tab, nav);
        }
        closeOnboarding();
      });
    });
    const btnSkip = $('#pp-onb-skip');
    if (btnSkip) btnSkip.addEventListener('click', closeOnboarding);
    const btnDone = $('#pp-onb-done');
    if (btnDone) btnDone.addEventListener('click', () => {
      markOnboardingDone();
      closeOnboarding();
      showToast('Onboarding marcado como concluído.', { success: true });
    });
  }

  // ---------- Escaping helpers ----------
  function escapeText(s) {
    return String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  }
  function escapeAttr(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ---------- 5. Audit Log (PIZAA-5) ----------
  // Ring-buffered, cap-pinned audit log. Each entry is { ts, actor, action, detail }.
  // The buffer is bounded by AUDIT_LOG_MAX so localStorage cannot grow without
  // limit if the owner leaves the panel open. Storage failures are swallowed so
  // a corrupted quota never breaks the UI (defense in depth).
  function getAuditLog() {
    const stored = readJSON(AUDIT_LOG_KEY, null);
    return Array.isArray(stored) ? stored : [];
  }
  function saveAuditLog(list) {
    writeJSON(AUDIT_LOG_KEY, list);
  }
  function clearAuditLogStorage() {
    try { localStorage.removeItem(AUDIT_LOG_KEY); } catch (e) { /* noop */ }
  }
  function logEvent(action, detail, opts) {
    opts = opts || {};
    const entry = {
      ts: typeof opts.now === 'number' ? opts.now : Date.now(),
      actor: opts.actor || 'admin',
      action: String(action || '').slice(0, 80),
      detail: detail == null ? '' : String(detail).slice(0, 240)
    };
    const list = getAuditLog();
    list.push(entry);
    const trimmed = list.length > AUDIT_LOG_MAX ? list.slice(list.length - AUDIT_LOG_MAX) : list;
    try { saveAuditLog(trimmed); } catch (e) { /* localStorage may throw in some sandboxes */ }
    return entry;
  }
  function fmtAuditTime(ts) {
    if (!ts) return '—';
    try {
      const d = new Date(ts);
      return d.toLocaleString('pt-BR');
    } catch (e) { return String(ts); }
  }
  function renderAuditList() {
    const wrap = $('#pp-audit-list');
    if (!wrap) return;
    const list = getAuditLog();
    if (!list.length) {
      wrap.innerHTML = '<div class="pp-audit-empty">Nenhuma ação registrada ainda. As ações do admin (login, edições, exports) aparecem aqui em tempo real.</div>';
      return;
    }
    // Newest first.
    const rows = list.slice().reverse().map((e) => {
      const action = escapeAttr(e.action || '');
      const detail = escapeText(e.detail || '');
      const actor = escapeAttr(e.actor || 'admin');
      const ts = escapeAttr(fmtAuditTime(e.ts));
      return '<div class="pp-audit-row" data-action="' + action + '">' +
        '<span class="pp-audit-ts">' + ts + '</span>' +
        '<span class="pp-audit-actor">' + actor + '</span>' +
        '<span class="pp-audit-action">' + action + '</span>' +
        '<span class="pp-audit-detail">' + detail + '</span>' +
      '</div>';
    }).join('');
    wrap.innerHTML = rows;
  }
  function clearAuditLog() {
    if (!confirm('Apagar todo o histórico de auditoria? Esta ação é IRREVERSÍVEL.')) return;
    clearAuditLogStorage();
    renderAuditList();
    showToast('Log de auditoria limpo.', { success: true });
  }
  function bindAuditTab() {
    const btn = $('#pp-btn-clear-audit');
    if (btn) btn.addEventListener('click', clearAuditLog);
  }

  // ---------- Bootstrap ----------
  function refreshAll() {
    renderHoursForm();
    renderMessages();
    renderAuditList();
  }

  function onReady() {
    bindBackupTab();
    bindHoursTab();
    bindMessagesTab();
    bindAuditTab();
    refreshAll();

    // Open onboarding on first login if not done yet.
    // v16 (TAA-13): respect the inactivity window — if the dashboard was
    // shown because of a stale flag, don't pop the wizard.
    try {
      const flag = sessionStorage.getItem('admin_logged') === 'true';
      const last = Number(sessionStorage.getItem('pp_admin_last_activity') || 0);
      const fresh = last && (Date.now() - last) < (15 * 60 * 1000);
      if (flag && fresh && !isOnboardingDone()) {
        // small delay so the dashboard has a moment to render behind the overlay
        setTimeout(openOnboarding, 400);
      }
    } catch (e) { /* sessionStorage may throw in some sandboxes */ }

    // Hook into existing switchTab so we re-render when the new tabs are opened
    const original = window.switchTab;
    if (typeof original === 'function') {
      window.switchTab = function (tabId, el) {
        original.apply(this, arguments);
        if (tabId === 'tab-backup') {
          // refresh summary lazily
        } else if (tabId === 'tab-horarios') {
          renderHoursForm();
        } else if (tabId === 'tab-mensagens') {
          renderMessages();
        } else if (tabId === 'tab-auditoria') {
          renderAuditList();
        } else if (tabId === 'tab-onboarding') {
          resetOnboarding();
          openOnboarding();
        }
      };
    }

    // Expose a small API for QA / smoke tests
    window.PP_ADMIN.exportBackup = exportBackup;
    window.PP_ADMIN.importBackup = importBackupFromFile;
    window.PP_ADMIN.getHours = getHours;
    window.PP_ADMIN.saveHours = saveHours;
    window.PP_ADMIN.getMessages = getMessages;
    window.PP_ADMIN.saveMessages = saveMessages;
    window.PP_ADMIN.openOnboarding = openOnboarding;
    window.PP_ADMIN.closeOnboarding = closeOnboarding;
    window.PP_ADMIN.refresh = refreshAll;
    window.PP_ADMIN.getAuditLog = getAuditLog;
    window.PP_ADMIN.saveAuditLog = saveAuditLog;
    window.PP_ADMIN.clearAuditLog = clearAuditLog;
    window.PP_ADMIN.logEvent = logEvent;
    window.PP_ADMIN.STORAGE_KEYS = STORAGE_KEYS;
    window.PP_ADMIN.HOURS_KEY = HOURS_KEY;
    window.PP_ADMIN.MESSAGES_KEY = MESSAGES_KEY;
    window.PP_ADMIN.AUDIT_LOG_KEY = AUDIT_LOG_KEY;
    window.PP_ADMIN.AUDIT_LOG_MAX = AUDIT_LOG_MAX;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
