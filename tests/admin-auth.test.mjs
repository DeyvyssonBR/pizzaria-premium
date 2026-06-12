// tests/admin-auth.test.mjs
import { describe, it, expect, beforeEach } from 'vitest';
import {
  ADMIN_PEPPER_KEY,
  ADMIN_VERIFIER_KEY,
  ADMIN_MIGRATION_KEY,
  ADMIN_SESSION_FLAG,
  ADMIN_LOGIN_ATTEMPTS_KEY,
  PEPPER_LEN,
  RATE_FAIL_THRESHOLD_LV1,
  RATE_FAIL_THRESHOLD_LV2,
  RATE_FAIL_THRESHOLD_LV3,
  RATE_LOCKOUT_LV1_MS,
  RATE_LOCKOUT_LV2_MS,
  RATE_LOCKOUT_LV3_MS,
  RATE_WINDOW_MS,
  INACTIVITY_TIMEOUT_MS,
  isFirstRun,
  setupAdminPassword,
  resetAdminAuth,
  tryAdminLogin,
  migrateLegacyIfNeeded,
  adminLogout,
  isSessionActive,
  touchActivity,
  clearAttempts,
  getLockoutState,
  constantTimeEqual,
  makeSessionStorage,
  makeStorage
} from './admin-auth.mjs';

const FIXED_NOW = 1_700_000_000_000; // 2023-11-14T22:13:20Z
const clock = () => FIXED_NOW;
const advance = (ms) => { FIXED_NOW + ms; };
const nowProxy = () => clock();
const opts = { now: nowProxy, rng: () => 0.5 };

// ---------- constantTimeEqual ----------

describe('constantTimeEqual', () => {
  it('returns true for equal hex strings', () => {
    expect(constantTimeEqual('abc123', 'abc123')).toBe(true);
  });
  it('returns false for different strings of equal length', () => {
    expect(constantTimeEqual('abc123', 'abc124')).toBe(false);
  });
  it('returns false for different lengths', () => {
    expect(constantTimeEqual('abc', 'abcd')).toBe(false);
  });
  it('returns false for non-strings', () => {
    expect(constantTimeEqual(null, 'abc')).toBe(false);
    expect(constantTimeEqual(123, 'abc')).toBe(false);
  });
});

// ---------- First-run detection ----------

describe('isFirstRun', () => {
  it('returns true when storage is empty', () => {
    const ls = makeStorage();
    expect(isFirstRun(ls)).toBe(true);
  });
  it('returns true when only pepper is present', () => {
    const ls = makeStorage();
    ls.setItem(ADMIN_PEPPER_KEY, 'a'.repeat(64));
    expect(isFirstRun(ls)).toBe(true);
  });
  it('returns false when both keys are present', () => {
    const ls = makeStorage();
    ls.setItem(ADMIN_PEPPER_KEY, 'a'.repeat(64));
    ls.setItem(ADMIN_VERIFIER_KEY, 'b'.repeat(64));
    expect(isFirstRun(ls)).toBe(false);
  });
});

// ---------- setupAdminPassword ----------

describe('setupAdminPassword', () => {
  let ls;
  beforeEach(() => { ls = makeStorage(); });

  it('persists a 64-char pepper and a 64-char verifier', async () => {
    const r = await setupAdminPassword(ls, 'hunter2', opts);
    expect(r.pepper).toMatch(/^[0-9a-f]{64}$/);
    expect(r.verifier).toMatch(/^[0-9a-f]{64}$/);
    expect(ls.getItem(ADMIN_PEPPER_KEY)).toBe(r.pepper);
    expect(ls.getItem(ADMIN_VERIFIER_KEY)).toBe(r.verifier);
  });

  it('rejects empty password', async () => {
    await expect(setupAdminPassword(ls, '')).rejects.toThrow();
  });

  it('rejects passwords shorter than 4 characters', async () => {
    await expect(setupAdminPassword(ls, 'ab')).rejects.toThrow(/4/);
    await expect(setupAdminPassword(ls, 'abc')).rejects.toThrow(/4/);
  });

  it('uses the injected RNG', async () => {
    const r = await setupAdminPassword(ls, 'hunter2', { rng: () => 0.5 });
    expect(r.pepper).toBe('80'.repeat(32));
  });

  it('produces a different verifier for a different password', async () => {
    const a = await setupAdminPassword(ls, 'hunter2', opts);
    ls._map.clear();
    const b = await setupAdminPassword(ls, 'hunter3', opts);
    expect(a.pepper).toBe(b.pepper); // same RNG seed -> same pepper
    expect(a.verifier).not.toBe(b.verifier);
  });
});

// ---------- tryAdminLogin ----------

describe('tryAdminLogin', () => {
  let ls, ss;
  beforeEach(async () => {
    ls = makeStorage();
    ss = makeSessionStorage();
    await setupAdminPassword(ls, 'hunter2', opts);
  });

  it('returns ok=true for the correct password', async () => {
    const r = await tryAdminLogin(ls, ss, 'hunter2', opts);
    expect(r.ok).toBe(true);
    expect(r.sessionStartedAt).toBe(FIXED_NOW);
  });

  it('sets admin_logged in sessionStorage on success', async () => {
    await tryAdminLogin(ls, ss, 'hunter2', opts);
    expect(ss.getItem(ADMIN_SESSION_FLAG)).toBe('true');
  });

  it('returns bad_password for a wrong password', async () => {
    const r = await tryAdminLogin(ls, ss, 'wrong-pwd', opts);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('bad_password');
    expect(ss.getItem(ADMIN_SESSION_FLAG)).toBeNull();
  });

  it('returns no_setup if the wizard never ran', async () => {
    const fresh = makeStorage();
    const r = await tryAdminLogin(fresh, ss, 'hunter2', opts);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('no_setup');
  });

  it('returns no_setup if only the pepper is present', async () => {
    const half = makeStorage({ [ADMIN_PEPPER_KEY]: 'a'.repeat(64) });
    const r = await tryAdminLogin(half, ss, 'hunter2', opts);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('no_setup');
  });

  it('treats empty string as a bad password (does not crash)', async () => {
    const r = await tryAdminLogin(ls, ss, '', opts);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('bad_password');
  });

  it('clears the attempts counter on successful login', async () => {
    await tryAdminLogin(ls, ss, 'wrong', opts);
    await tryAdminLogin(ls, ss, 'wrong', opts);
    expect(getLockoutState(ss, FIXED_NOW).fails).toBe(2);
    await tryAdminLogin(ls, ss, 'hunter2', opts);
    expect(getLockoutState(ss, FIXED_NOW).fails).toBe(0);
  });
});

// ---------- Rate limiting ----------

describe('rate limiting', () => {
  let ls, ss;
  beforeEach(async () => {
    ls = makeStorage();
    ss = makeSessionStorage();
    await setupAdminPassword(ls, 'hunter2', opts);
  });

  it('locks for 60s after 5 failed attempts within 60s', async () => {
    for (let i = 0; i < RATE_FAIL_THRESHOLD_LV1 - 1; i++) {
      const r = await tryAdminLogin(ls, ss, 'wrong', opts);
      expect(r.ok).toBe(false);
      expect(r.reason).not.toBe('locked');
    }
    const fifth = await tryAdminLogin(ls, ss, 'wrong', opts);
    expect(fifth.ok).toBe(false);
    expect(fifth.reason).toBe('bad_password');
    // The lockout becomes active on the NEXT call.
    const sixth = await tryAdminLogin(ls, ss, 'wrong', opts);
    expect(sixth.reason).toBe('locked');
    expect(sixth.until).toBe(FIXED_NOW + RATE_LOCKOUT_LV1_MS);
  });

  it('even the correct password is rejected while locked', async () => {
    for (let i = 0; i < RATE_FAIL_THRESHOLD_LV1; i++) {
      await tryAdminLogin(ls, ss, 'wrong', opts);
    }
    const r = await tryAdminLogin(ls, ss, 'hunter2', opts);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('locked');
  });

  it('escalates to 5-min lockout at 10 fails', async () => {
    for (let i = 0; i < RATE_FAIL_THRESHOLD_LV2; i++) {
      await tryAdminLogin(ls, ss, 'wrong', opts);
    }
    // The 10th failed attempt itself triggers the LV2 lockout. We assert that
    // the lockout report (returned on the *next* call) carries the LV2 window.
    const r = await tryAdminLogin(ls, ss, 'wrong', opts);
    expect(r.reason).toBe('locked');
    expect(r.until).toBe(FIXED_NOW + RATE_LOCKOUT_LV2_MS);
  });

  it('escalates to 30-min lockout at 15 fails', async () => {
    for (let i = 0; i < RATE_FAIL_THRESHOLD_LV3; i++) {
      await tryAdminLogin(ls, ss, 'wrong', opts);
    }
    const r = await tryAdminLogin(ls, ss, 'wrong', opts);
    expect(r.reason).toBe('locked');
    expect(r.until).toBe(FIXED_NOW + RATE_LOCKOUT_LV3_MS);
  });

  it('lifts the lockout once the window elapses', async () => {
    for (let i = 0; i < RATE_FAIL_THRESHOLD_LV1; i++) {
      await tryAdminLogin(ls, ss, 'wrong', opts);
    }
    const after = await tryAdminLogin(ls, ss, 'hunter2', { now: () => FIXED_NOW + RATE_LOCKOUT_LV1_MS + 1, rng: opts.rng });
    expect(after.ok).toBe(true);
  });

  it('clearAttempts resets the counter', async () => {
    for (let i = 0; i < 3; i++) {
      await tryAdminLogin(ls, ss, 'wrong', opts);
    }
    expect(getLockoutState(ss, FIXED_NOW).fails).toBe(3);
    clearAttempts(ss);
    expect(getLockoutState(ss, FIXED_NOW).fails).toBe(0);
  });
});

// ---------- Legacy migration ----------

describe('migrateLegacyIfNeeded', () => {
  let ls, ss;
  beforeEach(() => { ls = makeStorage(); ss = makeSessionStorage(); });

  it('is a no-op on non-legacy passwords', async () => {
    const r = await migrateLegacyIfNeeded(ls, ss, 'hunter2', opts);
    expect(r.migrated).toBe(false);
    expect(isFirstRun(ls)).toBe(true);
  });

  it('bootstraps from `admin` on first run', async () => {
    const r = await migrateLegacyIfNeeded(ls, ss, 'admin', opts);
    expect(r.migrated).toBe(true);
    expect(isFirstRun(ls)).toBe(false);
    const stored = ls.getItem(ADMIN_PEPPER_KEY);
    expect(stored).toMatch(/^[0-9a-f]{64}$/);
    const migration = JSON.parse(ls.getItem(ADMIN_MIGRATION_KEY));
    expect(migration.from).toBe('admin_legacy_placeholder');
  });

  it('bootstraps from `admin123` on first run', async () => {
    await migrateLegacyIfNeeded(ls, ss, 'admin123', opts);
    expect(isFirstRun(ls)).toBe(false);
  });

  it('does NOT overwrite an already-set up admin', async () => {
    await setupAdminPassword(ls, 'real-pwd', opts);
    const before = ls.getItem(ADMIN_VERIFIER_KEY);
    const r = await migrateLegacyIfNeeded(ls, ss, 'admin', opts);
    expect(r.migrated).toBe(false);
    expect(ls.getItem(ADMIN_VERIFIER_KEY)).toBe(before);
  });
});

// ---------- adminLogout ----------

describe('adminLogout', () => {
  it('clears the session flag and the attempts counter', async () => {
    const ls = makeStorage();
    const ss = makeSessionStorage();
    await setupAdminPassword(ls, 'hunter2', opts);
    await tryAdminLogin(ls, ss, 'hunter2', opts);
    expect(ss.getItem(ADMIN_SESSION_FLAG)).toBe('true');
    adminLogout(ss);
    expect(ss.getItem(ADMIN_SESSION_FLAG)).toBeNull();
    expect(ss.getItem(ADMIN_LOGIN_ATTEMPTS_KEY)).toBeNull();
  });
});

// ---------- Inactivity ----------

describe('isSessionActive', () => {
  let ss;
  beforeEach(() => { ss = makeSessionStorage(); });

  it('returns false when no session flag is set', () => {
    expect(isSessionActive(ss, FIXED_NOW, FIXED_NOW)).toBe(false);
  });

  it('returns true within the inactivity window', () => {
    ss.setItem(ADMIN_SESSION_FLAG, 'true');
    expect(isSessionActive(ss, FIXED_NOW + 60_000, FIXED_NOW)).toBe(true);
  });

  it('returns false after the inactivity window expires', () => {
    ss.setItem(ADMIN_SESSION_FLAG, 'true');
    expect(isSessionActive(ss, FIXED_NOW + INACTIVITY_TIMEOUT_MS + 1, FIXED_NOW)).toBe(false);
  });

  it('returns false if lastActivityAt is missing', () => {
    ss.setItem(ADMIN_SESSION_FLAG, 'true');
    expect(isSessionActive(ss, FIXED_NOW, undefined)).toBe(false);
    expect(isSessionActive(ss, FIXED_NOW, null)).toBe(false);
  });
});

describe('touchActivity', () => {
  it('writes the current timestamp to the session marker', () => {
    const ss = makeSessionStorage();
    touchActivity(ss, FIXED_NOW);
    expect(ss.getItem('admin_session_started')).toBe(String(FIXED_NOW));
  });
});

// ---------- resetAdminAuth ----------

describe('resetAdminAuth', () => {
  it('clears pepper, verifier, and the migration marker', async () => {
    const ls = makeStorage();
    await setupAdminPassword(ls, 'hunter2', opts);
    await migrateLegacyIfNeeded(ls, makeSessionStorage(), 'admin', opts);
    expect(isFirstRun(ls)).toBe(false);
    resetAdminAuth(ls);
    expect(isFirstRun(ls)).toBe(true);
    expect(ls.getItem(ADMIN_MIGRATION_KEY)).toBeNull();
  });
});

// ---------- Inactivity timeout (TAA-13) ----------
//
// The activity-aware auto-logout lives in the inline admin.html code, but the
// underlying predicate (isSessionActive) is exported from admin-auth.mjs. We
// pin its behavior here.

describe('inactivity logout (TAA-13)', () => {
  it('keeps a freshly-touched session alive past the lockout window', () => {
    const ss = makeSessionStorage();
    ss.setItem(ADMIN_SESSION_FLAG, 'true');
    ss.setItem('admin_session_started', String(FIXED_NOW));
    // Even 14 min in, a recent touch keeps us in.
    expect(isSessionActive(ss, FIXED_NOW + INACTIVITY_TIMEOUT_MS - 60_000, FIXED_NOW + INACTIVITY_TIMEOUT_MS - 60_000))
      .toBe(true);
  });

  it('expires the session when the activity timestamp is older than the window', () => {
    const ss = makeSessionStorage();
    ss.setItem(ADMIN_SESSION_FLAG, 'true');
    // lastActivityAt is from 16 minutes ago -> expired.
    expect(isSessionActive(ss, FIXED_NOW, FIXED_NOW - INACTIVITY_TIMEOUT_MS - 60_000))
      .toBe(false);
  });

  it('does not let the inactivity window revive a logged-out session', () => {
    const ss = makeSessionStorage();
    // No flag set at all.
    expect(isSessionActive(ss, FIXED_NOW, FIXED_NOW)).toBe(false);
  });
});
