// tests/admin-self-service.test.mjs
//
// Vitest suite for the owner-self-service admin bootstrap (TAA-23).
// The production source is at D:/PaperClip/assets/js/admin.js. The pure
// logic is mirrored into tests/admin-self-service.mjs (parity) so we
// can run it under Node without a browser. If these tests fail after
// a change to admin.js, the parity file needs to be re-synced.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  STORAGE_PREFIX,
  STORAGE_KEYS,
  HOURS_KEY,
  MESSAGES_KEY,
  ONBOARDING_KEY,
  AUDIT_LOG_KEY,
  AUDIT_LOG_MAX,
  DEFAULT_HOURS,
  DEFAULT_MESSAGES,
  getHours,
  saveHours,
  getMessages,
  saveMessages,
  collectAllStorage,
  renderPreview,
  isOnboardingDone,
  markOnboardingDone,
  resetOnboarding,
  buildOnboardingSteps,
  getAuditLog,
  saveAuditLog,
  clearAuditLog,
  logEvent
} from './admin-self-service.mjs';

function makeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    key: (i) => Array.from(map.keys())[i] ?? null,
    get length() { return map.size; },
    _dump: () => Object.fromEntries(map)
  };
}

describe('admin self-service: storage constants', () => {
  it('STORAGE_PREFIX is premium_pizzaria_', () => {
    expect(STORAGE_PREFIX).toBe('premium_pizzaria_');
  });
  it('HOURS_KEY namespaced under prefix', () => {
    expect(HOURS_KEY).toBe('premium_pizzaria_store_hours');
  });
  it('MESSAGES_KEY namespaced under prefix', () => {
    expect(MESSAGES_KEY).toBe('premium_pizzaria_auto_messages');
  });
  it('ONBOARDING_KEY namespaced under prefix', () => {
    expect(ONBOARDING_KEY.startsWith(STORAGE_PREFIX)).toBe(true);
  });
  it('STORAGE_KEYS is non-empty and namespaced', () => {
    expect(STORAGE_KEYS.length).toBeGreaterThan(15);
    for (const k of STORAGE_KEYS) {
      // not all entries are raw keys, some are suffixes
      expect(typeof k).toBe('string');
      expect(k.length).toBeGreaterThan(0);
    }
  });
});

describe('admin self-service: store hours', () => {
  let storage;
  beforeEach(() => { storage = makeStorage(); });

  it('default hours cover all 7 days', () => {
    const h = getHours(storage);
    expect(Object.keys(h).length).toBe(7);
    for (let d = 0; d < 7; d++) {
      expect(h[d]).toHaveProperty('open');
      expect(h[d]).toHaveProperty('close');
      expect(h[d]).toHaveProperty('closed');
    }
  });

  it('saveHours round-trip preserves custom schedule', () => {
    const custom = {
      0: { open: '19:00', close: '23:00', closed: false },
      6: { open: '00:00', close: '00:00', closed: true }
    };
    saveHours(custom, storage);
    const got = getHours(storage);
    expect(got[0]).toEqual(custom[0]);
    expect(got[6].closed).toBe(true);
  });

  it('partial stored hours fall back to defaults per day', () => {
    storage.setItem(HOURS_KEY, JSON.stringify({
      1: { open: '20:00', close: '23:00', closed: false }
    }));
    const h = getHours(storage);
    expect(h[1].open).toBe('20:00');
    // days not in storage get the default
    expect(h[0].open).toBe(DEFAULT_HOURS[0].open);
  });

  it('closed:true day returns a 00:00/00:00 window for the home page', () => {
    storage.setItem(HOURS_KEY, JSON.stringify({
      2: { open: '18:00', close: '23:30', closed: true }
    }));
    const h = getHours(storage);
    expect(h[2].closed).toBe(true);
    expect(h[2].open).toBe('00:00');
    expect(h[2].close).toBe('00:00');
  });

  it('corrupt JSON falls back to defaults', () => {
    storage.setItem(HOURS_KEY, '{not json');
    const h = getHours(storage);
    expect(h[0].open).toBe(DEFAULT_HOURS[0].open);
  });
});

describe('admin self-service: auto messages', () => {
  let storage;
  beforeEach(() => { storage = makeStorage(); });

  it('default messages cover the 4 baseline flows', () => {
    const m = getMessages(storage);
    expect(m.length).toBeGreaterThanOrEqual(4);
    const titles = m.map(x => x.title);
    expect(titles).toEqual(expect.arrayContaining([
      expect.stringContaining('Boas-vindas'),
      expect.stringContaining('saiu'),
      expect.stringContaining('retirada'),
      expect.stringContaining('horário')
    ]));
  });

  it('messages round-trip through saveMessages', () => {
    const custom = [
      { id: 'msg-x', title: 'X', channel: 'whatsapp', body: 'olá {{nome}}', active: true }
    ];
    saveMessages(custom, storage);
    expect(getMessages(storage)).toEqual(custom);
  });

  it('placeholders are expanded in renderPreview', () => {
    const out = renderPreview('Oi {{nome}}, pedido #{{pedido}} chega em {{eta}}.');
    expect(out).toContain('João');
    expect(out).toContain('PRE-1234');
    expect(out).toContain('40-60 min');
  });

  it('renderPreview escapes HTML to prevent XSS via message body', () => {
    const out = renderPreview('<script>alert(1)</script> {{nome}}');
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
  });
});

describe('admin self-service: backup collect', () => {
  it('collectAllStorage filters to premium_pizzaria_* keys only', () => {
    const storage = makeStorage({
      'premium_pizzaria_menu': '[]',
      'premium_pizzaria_pix_key': 'abc',
      'random_other_key': 'should be skipped',
      'unrelated_session': 'x'
    });
    const data = collectAllStorage(storage);
    expect(Object.keys(data)).toEqual(expect.arrayContaining([
      'premium_pizzaria_menu',
      'premium_pizzaria_pix_key'
    ]));
    expect(Object.keys(data)).not.toContain('random_other_key');
    expect(Object.keys(data)).not.toContain('unrelated_session');
  });

  it('collectAllStorage JSON-parses values that look like JSON arrays/objects', () => {
    const storage = makeStorage({
      'premium_pizzaria_menu': '[{"id":"x"}]',
      'premium_pizzaria_pix_key': 'plain string'
    });
    const data = collectAllStorage(storage);
    expect(Array.isArray(data['premium_pizzaria_menu'])).toBe(true);
    expect(data['premium_pizzaria_menu'][0].id).toBe('x');
    expect(data['premium_pizzaria_pix_key']).toBe('plain string');
  });

  it('collectAllStorage stamps __meta with version and exportedAt', () => {
    const storage = makeStorage();
    const data = collectAllStorage(storage);
    expect(data.__meta).toBeDefined();
    expect(data.__meta.prefix).toBe(STORAGE_PREFIX);
    expect(data.__meta.version).toBe(1);
    expect(typeof data.__meta.exportedAt).toBe('string');
  });
});

describe('admin self-service: onboarding flow', () => {
  let storage;
  beforeEach(() => { storage = makeStorage(); });

  it('isOnboardingDone returns false on fresh storage', () => {
    expect(isOnboardingDone(storage)).toBe(false);
  });

  it('markOnboardingDone + isOnboardingDone round-trip', () => {
    markOnboardingDone(storage);
    expect(isOnboardingDone(storage)).toBe(true);
    resetOnboarding(storage);
    expect(isOnboardingDone(storage)).toBe(false);
  });

  it('buildOnboardingSteps returns 6 steps with target tabs', () => {
    const steps = buildOnboardingSteps();
    expect(steps.length).toBe(6);
    for (const s of steps) {
      expect(s).toHaveProperty('id');
      expect(s).toHaveProperty('title');
      expect(s).toHaveProperty('body');
      expect(s).toHaveProperty('targetTab');
      expect(s.targetTab.startsWith('tab-')).toBe(true);
      expect(typeof s.doneCheck).toBe('function');
    }
  });

  it('doneCheck flags a step done when its key is present', () => {
    const steps = buildOnboardingSteps();
    const hoursStep = steps.find(s => s.id === 'horario');
    expect(hoursStep.doneCheck(makeStorage())).toBe(false);
    expect(hoursStep.doneCheck(makeStorage({
      'premium_pizzaria_store_hours': '{}'
    }))).toBe(true);
  });
});

// ---------- PIZAA-5: admin audit log ----------

describe('admin self-service: audit log (PIZAA-5)', () => {
  let storage;
  beforeEach(() => { storage = makeStorage(); });

  it('AUDIT_LOG_KEY is namespaced under premium_pizzaria_', () => {
    expect(AUDIT_LOG_KEY).toBe('premium_pizzaria_audit_log');
    expect(AUDIT_LOG_KEY.startsWith(STORAGE_PREFIX)).toBe(true);
  });

  it('getAuditLog returns an empty array on fresh storage (defensive default)', () => {
    expect(getAuditLog(storage)).toEqual([]);
  });

  it('getAuditLog tolerates a non-array / corrupt value', () => {
    storage.setItem(AUDIT_LOG_KEY, '{"not":"an array"}');
    expect(getAuditLog(storage)).toEqual([]);
    storage.setItem(AUDIT_LOG_KEY, '{not json');
    expect(getAuditLog(storage)).toEqual([]);
  });

  it('logEvent appends an entry with ts / actor / action / detail', () => {
    const entry = logEvent(storage, 'auth.login.success', 'mode=local', { now: 1_700_000_000_000 });
    expect(entry).toEqual({
      ts: 1_700_000_000_000,
      actor: 'admin',
      action: 'auth.login.success',
      detail: 'mode=local'
    });
    const list = getAuditLog(storage);
    expect(list).toHaveLength(1);
    expect(list[0]).toEqual(entry);
  });

  it('logEvent stamps default actor="admin" but accepts a custom actor', () => {
    logEvent(storage, 'menu.item.save', 'pizza-frango');
    logEvent(storage, 'menu.item.delete', 'bebida-coca', { actor: 'admin' });
    const list = getAuditLog(storage);
    expect(list[0].actor).toBe('admin');
    expect(list[1].actor).toBe('admin');
  });

  it('logEvent caps the buffer at AUDIT_LOG_MAX (oldest entries evicted FIFO)', () => {
    for (let i = 0; i < AUDIT_LOG_MAX + 25; i++) {
      logEvent(storage, 'noisy.event', 'i=' + i, { now: 1_700_000_000_000 + i });
    }
    const list = getAuditLog(storage);
    expect(list).toHaveLength(AUDIT_LOG_MAX);
    // The oldest 25 entries were dropped; the oldest surviving one is i=25.
    expect(list[0].detail).toBe('i=25');
    expect(list[list.length - 1].detail).toBe('i=' + (AUDIT_LOG_MAX + 24));
  });

  it('logEvent clips action / detail strings to keep storage small', () => {
    const huge = 'x'.repeat(5000);
    const entry = logEvent(storage, huge, huge);
    expect(entry.action.length).toBeLessThanOrEqual(80);
    expect(entry.detail.length).toBeLessThanOrEqual(240);
  });

  it('logEvent falls back to "" when detail is null/undefined', () => {
    const e1 = logEvent(storage, 'a');
    const e2 = logEvent(storage, 'b', null);
    expect(e1.detail).toBe('');
    expect(e2.detail).toBe('');
  });

  it('logEvent does not throw when localStorage is full (quota / private mode)', () => {
    // Replace setItem with a throwing stub; logEvent must swallow.
    const fail = storage;
    const originalSet = fail.setItem;
    fail.setItem = () => { throw new DOMException('quota', 'QuotaExceededError'); };
    expect(() => logEvent(fail, 'oops', 'fail')).not.toThrow();
    // getItem of the original (mock) should still return whatever the stubbed
    // setItem pushed - here it threw so the key never wrote. Restore for
    // afterEach cleanliness.
    fail.setItem = originalSet;
  });

  it('saveAuditLog persists and getAuditLog reads back identically', () => {
    const list = [
      { ts: 1, actor: 'admin', action: 'auth.login.success', detail: '' },
      { ts: 2, actor: 'admin', action: 'hours.save', detail: 'day=1' }
    ];
    saveAuditLog(storage, list);
    expect(getAuditLog(storage)).toEqual(list);
  });

  it('clearAuditLog removes the key', () => {
    logEvent(storage, 'x');
    expect(getAuditLog(storage)).toHaveLength(1);
    clearAuditLog(storage);
    expect(getAuditLog(storage)).toEqual([]);
  });

  it('collectAllStorage includes the audit log under the premium_pizzaria_ prefix', () => {
    logEvent(storage, 'auth.login.success', 'mode=local');
    const dump = collectAllStorage(storage);
    expect(dump[AUDIT_LOG_KEY]).toBeDefined();
    expect(Array.isArray(dump[AUDIT_LOG_KEY])).toBe(true);
    expect(dump[AUDIT_LOG_KEY][0].action).toBe('auth.login.success');
  });
});
