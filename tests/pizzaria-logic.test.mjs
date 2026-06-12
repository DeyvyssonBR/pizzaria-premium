// tests/pizzaria-logic.test.mjs
import { describe, it, expect, beforeEach } from 'vitest';
import {
  ACCOUNTS_KEY,
  SESSION_KEY,
  PRIZES_KEY,
  ZONES_KEY,
  LOYALTY_CONFIG_KEY,
  STORE_CONFIG_KEY,
  GEO_CACHE_KEY,
  DELIVERY_CFG_KEY,
  STORE_DEFAULTS,
  DELIVERY_DEFAULTS,
  bytesToHex,
  genSalt,
  hashPassword,
  loadStoreConfig,
  saveStoreConfig,
  loadGeoCache,
  saveGeoCache,
  loadDeliveryConfig,
  saveDeliveryConfig,
  loadZones,
  saveZones,
  calcDeliveryByCep,
  geocodeCep,
  haversineKm,
  calcDeliveryByDistance,
  loadAccounts,
  saveAccounts,
  getCurrentAccount,
  setSession,
  registerAccount,
  login,
  resetPassword,
  updateCurrentAccount,
  loadPrizes,
  savePrizes,
  loadLoyaltyConfig,
  saveLoyaltyConfig,
  genCouponCode,
  redeemPrize,
  getActiveCoupons,
  markCouponUsed,
  awardPointsForOrder,
  makeOrder,
  persistOrder,
  loadOrders,
  makeStorage,
  // v11: distance-based delivery parity helpers
  resolveDeliveryForCep,
  getCheckoutDeliveryFee,
  buildDeliverySnapshot
} from './pizzaria-logic.mjs';

// ---------- genSalt / hashPassword ----------

describe('genSalt', () => {
  it('returns 32 hex chars (16 bytes)', () => {
    const s = genSalt();
    expect(s).toMatch(/^[0-9a-f]{32}$/);
  });

  it('produces unique salts across calls', () => {
    const salts = new Set();
    for (let i = 0; i < 20; i++) salts.add(genSalt());
    expect(salts.size).toBe(20);
  });

  it('respects custom byte length', () => {
    expect(genSalt(8).length).toBe(16);
    expect(genSalt(32).length).toBe(64);
  });

  it('uses injected RNG', () => {
    const deterministic = () => 0.5;
    expect(genSalt(16, deterministic)).toBe('80'.repeat(16));
  });
});

describe('bytesToHex', () => {
  it('formats bytes with leading zeros', () => {
    const bytes = new Uint8Array([0, 1, 15, 16, 255]);
    expect(bytesToHex(bytes)).toBe('00010f10ff');
  });
});

describe('hashPassword', () => {
  it('produces 64-char hex (SHA-256 size)', async () => {
    const h = await hashPassword('a'.repeat(32), 'p');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is deterministic for the same salt+password', async () => {
    const salt = 'fixed-salt-1234';
    const h1 = await hashPassword(salt, 'hunter2');
    const h2 = await hashPassword(salt, 'hunter2');
    expect(h1).toBe(h2);
  });

  it('changes when the salt changes', async () => {
    const pwd = 'hunter2';
    const h1 = await hashPassword('salt-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', pwd);
    const h2 = await hashPassword('salt-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', pwd);
    expect(h1).not.toBe(h2);
  });

  it('changes when the password changes', async () => {
    const salt = 'same-salt-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const h1 = await hashPassword(salt, 'hunter2');
    const h2 = await hashPassword(salt, 'hunter3');
    expect(h1).not.toBe(h2);
  });

  it('uses salt + ":" + password as the input (separator test)', async () => {
    // Two salts that, with the same password, would otherwise collide without a
    // separator: 'ab' + 'c' === 'a' + 'bc' if we dropped the colon.
    const h1 = await hashPassword('ab', 'c');
    const h2 = await hashPassword('a', 'bc');
    expect(h1).not.toBe(h2);
  });
});

// ---------- Storage adapter ----------

describe('makeStorage', () => {
  it('seeds from initial object', () => {
    const s = makeStorage({ foo: 'bar' });
    expect(s.getItem('foo')).toBe('bar');
  });

  it('round-trips setItem -> getItem as string', () => {
    const s = makeStorage();
    s.setItem('n', 7);
    expect(s.getItem('n')).toBe('7');
  });

  it('removeItem drops the key', () => {
    const s = makeStorage({ a: '1', b: '2' });
    s.removeItem('a');
    expect(s.getItem('a')).toBeNull();
    expect(s.getItem('b')).toBe('2');
  });
});

// ---------- loadStoreConfig / loadDeliveryConfig ----------

describe('loadStoreConfig', () => {
  let storage;
  beforeEach(() => { storage = makeStorage(); });

  it('returns STORE_DEFAULTS when storage is empty', () => {
    const cfg = loadStoreConfig(storage);
    expect(cfg).toEqual(STORE_DEFAULTS);
  });

  it('returns a *copy* of defaults (not the shared object)', () => {
    const a = loadStoreConfig(storage);
    a.lat = 0;
    const b = loadStoreConfig(storage);
    expect(b.lat).toBe(STORE_DEFAULTS.lat);
  });

  it('merges persisted values over defaults', () => {
    storage.setItem(STORE_CONFIG_KEY, JSON.stringify({ cep: '01001000', lat: -23.55, lng: -46.63 }));
    const cfg = loadStoreConfig(storage);
    expect(cfg.cep).toBe('01001000');
    expect(cfg.lat).toBe(-23.55);
    expect(cfg.lng).toBe(-46.63);
    expect(cfg.address).toBe(STORE_DEFAULTS.address); // untouched keys still come from defaults
  });

  it('survives corrupted JSON', () => {
    storage.setItem(STORE_CONFIG_KEY, '{not valid json');
    expect(() => loadStoreConfig(storage)).not.toThrow();
    expect(loadStoreConfig(storage)).toEqual(STORE_DEFAULTS);
  });
});

describe('saveStoreConfig', () => {
  it('persists and reloads', () => {
    const storage = makeStorage();
    saveStoreConfig(storage, { cep: '64000000', lat: -5.1, lng: -42.8, address: 'X' });
    expect(loadStoreConfig(storage).cep).toBe('64000000');
  });
});

describe('loadDeliveryConfig', () => {
  it('returns DELIVERY_DEFAULTS when empty', () => {
    const cfg = loadDeliveryConfig(makeStorage());
    expect(cfg).toEqual(DELIVERY_DEFAULTS);
    expect(cfg.mode).toBe('per_km');
    expect(cfg.maxKm).toBe(15);
    expect(cfg.bands).toHaveLength(3);
  });

  it('merges persisted values over defaults', () => {
    const storage = makeStorage();
    storage.setItem(DELIVERY_CFG_KEY, JSON.stringify({ mode: 'bands', maxKm: 10 }));
    const cfg = loadDeliveryConfig(storage);
    expect(cfg.mode).toBe('bands');
    expect(cfg.maxKm).toBe(10);
    expect(cfg.baseFee).toBe(DELIVERY_DEFAULTS.baseFee);
  });
});

// ---------- Haversine ----------

describe('haversineKm', () => {
  it('returns 0 for the same point', () => {
    expect(haversineKm(-5.06, -42.78, -5.06, -42.78)).toBe(0);
  });

  it('returns null when any coordinate is null', () => {
    expect(haversineKm(null, -42.78, -5.06, -42.78)).toBeNull();
    expect(haversineKm(-5.06, null, -5.06, -42.78)).toBeNull();
    expect(haversineKm(-5.06, -42.78, null, -42.78)).toBeNull();
    expect(haversineKm(-5.06, -42.78, -5.06, null)).toBeNull();
  });

  it('computes Teresina → São Paulo ~ 2.090 km (within 1%)', () => {
    // Teresina-PI: -5.0892, -42.8019
    // São Paulo-SP: -23.5505, -46.6333
    const km = haversineKm(-5.0892, -42.8019, -23.5505, -46.6333);
    expect(km).toBeGreaterThan(2070);
    expect(km).toBeLessThan(2110);
  });

  it('is symmetric: haversine(a,b) === haversine(b,a)', () => {
    const a = haversineKm(-5.0, -42.0, -5.1, -42.9);
    const b = haversineKm(-5.1, -42.9, -5.0, -42.0);
    expect(a).toBeCloseTo(b, 9);
  });

  it('handles the antipodal case (close to half the circumference)', () => {
    const km = haversineKm(0, 0, 0, 180);
    // πR ≈ 20015 km
    expect(km).toBeGreaterThan(20000);
    expect(km).toBeLessThan(20040);
  });
});

// ---------- geocodeCep ----------

describe('geocodeCep', () => {
  it('rejects CEPs that are not 8 digits', async () => {
    await expect(geocodeCep('123')).rejects.toThrow(/8 dígitos/);
    await expect(geocodeCep('abc12345')).rejects.toThrow(/8 dígitos/);
    await expect(geocodeCep('')).rejects.toThrow(/8 dígitos/);
  });

  it('uses the cache when present', async () => {
    const cache = { '01310100': { cep: '01310100', lat: -23.55, lng: -46.63, street: 'cached' } };
    const result = await geocodeCep('01310-100', { cache, fetchers: {
      fetchAwesomeApi: async () => { throw new Error('should not be called'); },
      fetchViaCep: async () => { throw new Error('should not be called'); }
    } });
    expect(result.street).toBe('cached');
  });

  it('uses AwesomeAPI lat/lng directly when it returns coords', async () => {
    const cache = {};
    const result = await geocodeCep('64071440', {
      cache,
      fetchers: {
        fetchAwesomeApi: async (cep) => ({ lat: -5.06, lng: -42.78, address: 'Rua X', district: 'Bairro Y', city: 'Teresina', state: 'PI' }),
        fetchViaCep: async () => { throw new Error('should not be called'); }
      }
    });
    expect(result.lat).toBe(-5.06);
    expect(result.lng).toBe(-42.78);
    expect(result.street).toBe('Rua X');
    expect(result.city).toBe('Teresina');
    expect(cache['64071440']).toEqual(result);
  });

  it('falls back to ViaCEP when AwesomeAPI returns no address', async () => {
    const result = await geocodeCep('64071440', {
      cache: {},
      fetchers: {
        fetchAwesomeApi: async () => ({ lat: -5.06, lng: -42.78 }),
        fetchViaCep: async () => ({ logradouro: 'Rua A', bairro: 'Centro', localidade: 'Teresina', uf: 'PI' })
      }
    });
    expect(result.street).toBe('Rua A');
    expect(result.city).toBe('Teresina');
  });

  it('falls back to Teresina coordinates when only the address came from ViaCEP', async () => {
    const result = await geocodeCep('64071440', {
      cache: {},
      fetchers: {
        fetchAwesomeApi: async () => null,
        fetchViaCep: async () => ({ logradouro: 'Rua A', localidade: 'Teresina', uf: 'PI' })
      }
    });
    // Teresina city → uses the default fallback coords
    expect(result.lat).toBe(-5.0892);
    expect(result.lng).toBe(-42.8019);
  });

  it('falls back to Timon coords when the city is Timon', async () => {
    const result = await geocodeCep('65630000', {
      cache: {},
      fetchers: {
        fetchAwesomeApi: async () => null,
        fetchViaCep: async () => ({ logradouro: 'Av B', localidade: 'Timon', uf: 'MA' })
      }
    });
    expect(result.lat).toBe(-5.0939);
    expect(result.lng).toBe(-42.8367);
  });

  it('leaves coords null when the city is unknown', async () => {
    const result = await geocodeCep('99999999', {
      cache: {},
      fetchers: {
        fetchAwesomeApi: async () => null,
        fetchViaCep: async () => ({ logradouro: 'Rua Z', localidade: 'Cidade Inventada', uf: 'XX' })
      }
    });
    expect(result.lat).toBeNull();
    expect(result.lng).toBeNull();
  });

  it('throws when neither source resolves an address', async () => {
    await expect(geocodeCep('99999999', {
      cache: {},
      fetchers: {
        fetchAwesomeApi: async () => null,
        fetchViaCep: async () => ({ erro: true })
      }
    })).rejects.toThrow(/CEP não encontrado/);
  });
});

// ---------- calcDeliveryByDistance ----------

describe('calcDeliveryByDistance', () => {
  const store = { ...STORE_DEFAULTS };
  const perKmCfg = { ...DELIVERY_DEFAULTS, mode: 'per_km' };
  const bandsCfg = {
    ...DELIVERY_DEFAULTS,
    mode: 'bands',
    bands: [
      { maxKm: 3, fee: 5 },
      { maxKm: 7, fee: 10 },
      { maxKm: 12, fee: 15 }
    ]
  };

  it('per-km mode: 0 km → baseFee only', () => {
    const r = calcDeliveryByDistance(
      { lat: store.lat, lng: store.lng },
      { store, cfg: perKmCfg }
    );
    expect(r.outOfRange).toBe(false);
    expect(r.km).toBeCloseTo(0, 5);
    expect(r.fee).toBe(5);
  });

  it('per-km mode: 5 km-equivalent offset → baseFee + km * perKm (computed from real km)', () => {
    const r = calcDeliveryByDistance(
      { lat: store.lat, lng: store.lng - 0.045 }, // ~5 km west
      { store, cfg: perKmCfg }
    );
    expect(r.outOfRange).toBe(false);
    expect(r.km).toBeGreaterThan(4.9);
    expect(r.km).toBeLessThan(5.1);
    // The 0.045 lng offset is not *exactly* 5 km; the fee must follow
    // whatever km the formula computed, rounded to 2 decimals.
    expect(r.fee).toBe(Math.round((5 + r.km * 1.5) * 100) / 100);
  });

  it('per-km mode: rounds the fee to 2 decimal places', () => {
    const r = calcDeliveryByDistance(
      { lat: store.lat, lng: store.lng - 0.027 }, // ~3 km
      { store, cfg: { ...perKmCfg, baseFee: 4.99, perKm: 1.111 } }
    );
    // The fee should equal the literal 4.99 + km*1.111 rounded to 2 decimals.
    const expected = Math.round((4.99 + r.km * 1.111) * 100) / 100;
    expect(r.fee).toBe(expected);
    // And it must always have at most 2 decimal places.
    expect(Math.round(r.fee * 100)).toBe(r.fee * 100);
  });

  it('per-km mode: returns outOfRange when distance > maxKm', () => {
    const r = calcDeliveryByDistance(
      { lat: -23.55, lng: -46.63 }, // São Paulo
      { store, cfg: { ...perKmCfg, maxKm: 15 } }
    );
    expect(r.outOfRange).toBe(true);
    expect(r.reason).toMatch(/Fora do raio/);
    expect(r.km).toBeGreaterThan(2000);
  });

  it('returns outOfRange when coords are missing', () => {
    const r = calcDeliveryByDistance(
      { lat: null, lng: null },
      { store, cfg: perKmCfg }
    );
    expect(r.outOfRange).toBe(true);
    expect(r.reason).toMatch(/distância/);
    expect(r.km).toBeNull();
  });

  it('bands mode: matches the band for the km range', () => {
    expect(calcDeliveryByDistance(
      { lat: store.lat, lng: store.lng },
      { store, cfg: bandsCfg }
    ).fee).toBe(5);

    // ~5 km
    const mid = calcDeliveryByDistance(
      { lat: store.lat, lng: store.lng - 0.045 },
      { store, cfg: bandsCfg }
    );
    expect(mid.km).toBeGreaterThan(4);
    expect(mid.km).toBeLessThan(6);
    expect(mid.fee).toBe(10);

    // ~10 km
    const far = calcDeliveryByDistance(
      { lat: store.lat, lng: store.lng - 0.09 },
      { store, cfg: bandsCfg }
    );
    expect(far.km).toBeGreaterThan(8);
    expect(far.km).toBeLessThan(12);
    expect(far.fee).toBe(15);
  });

  it('bands mode: above all bands falls back to the last band fee', () => {
    const r = calcDeliveryByDistance(
      { lat: store.lat, lng: store.lng - 0.105 }, // ~11.5 km, last band is 12
      { store, cfg: bandsCfg }
    );
    expect(r.km).toBeGreaterThan(11);
    expect(r.km).toBeLessThan(13);
    expect(r.fee).toBe(15);
  });

  it('time estimate: minutesMin = baseMin + km*2.5, minutesMax = baseMin + km*4', () => {
    const r = calcDeliveryByDistance(
      { lat: store.lat, lng: store.lng - 0.045 }, // ~5 km
      { store, cfg: perKmCfg }
    );
    expect(r.minutesMin).toBe(Math.round(20 + r.km * 2.5));
    expect(r.minutesMax).toBe(Math.round(20 + r.km * 4));
  });
});

// ---------- calcDeliveryByCep (legacy zones fallback) ----------

describe('calcDeliveryByCep', () => {
  let storage;
  beforeEach(() => { storage = makeStorage(); });

  it('returns outOfRange for CEPs that are not 8 digits', () => {
    expect(calcDeliveryByCep(storage, '123').outOfRange).toBe(true);
    expect(calcDeliveryByCep(storage, '64').outOfRange).toBe(true);
  });

  it('uses the default Teresina zone when nothing is persisted', () => {
    const r = calcDeliveryByCep(storage, '64050000');
    expect(r.outOfRange).toBe(false);
    expect(r.label).toBe('Teresina-PI');
    expect(r.fee).toBe(5);
    expect(r.minutesMin).toBe(30);
    expect(r.minutesMax).toBe(60);
  });

  it('matches a CEP inside the configured range', () => {
    saveZones(storage, [
      { id: 'z1', label: 'Centro', cepFrom: '64000000', cepTo: '64009999', fee: 7, minutesMin: 20, minutesMax: 40, active: true }
    ]);
    const r = calcDeliveryByCep(storage, '64005000');
    expect(r.outOfRange).toBe(false);
    expect(r.label).toBe('Centro');
    expect(r.fee).toBe(7);
  });

  it('ignores inactive zones', () => {
    saveZones(storage, [
      { id: 'z1', label: 'Inativa', cepFrom: '64000000', cepTo: '64009999', fee: 7, minutesMin: 20, minutesMax: 40, active: false }
    ]);
    const r = calcDeliveryByCep(storage, '64005000');
    expect(r.outOfRange).toBe(true);
  });

  it('returns outOfRange when the CEP is outside any zone', () => {
    saveZones(storage, [
      { id: 'z1', label: 'Centro', cepFrom: '01000000', cepTo: '01999999', fee: 9, minutesMin: 25, minutesMax: 45, active: true }
    ]);
    const r = calcDeliveryByCep(storage, '64050000');
    expect(r.outOfRange).toBe(true);
    expect(r.reason).toMatch(/Fora/);
  });

  it('handles CEP input with non-digit chars', () => {
    saveZones(storage, [
      { id: 'z1', label: 'Centro', cepFrom: '64000000', cepTo: '64099999', fee: 7, minutesMin: 20, minutesMax: 40, active: true }
    ]);
    const r = calcDeliveryByCep(storage, '64.050-000');
    expect(r.outOfRange).toBe(false);
    expect(r.cep).toBe('64050000');
  });
});

// ---------- Accounts ----------

describe('registerAccount', () => {
  let storage;
  beforeEach(() => { storage = makeStorage(); });

  it('creates an account with salt + SHA-256 hash, no plain password', async () => {
    const acc = await registerAccount(storage, { email: 'a@b.com', password: 'pwd123', name: 'Alice' });
    expect(acc.email).toBe('a@b.com');
    expect(acc.salt).toMatch(/^[0-9a-f]{32}$/);
    expect(acc.passwordHash).toMatch(/^[0-9a-f]{64}$/);
    expect(acc).not.toHaveProperty('password');
    expect(acc.points).toBe(0);
    expect(acc.coupons).toEqual([]);
  });

  it('hash is verifiable: re-hashing the same salt+password reproduces it', async () => {
    const acc = await registerAccount(storage, { email: 'a@b.com', password: 'pwd123', name: 'Alice' });
    const rehash = await hashPassword(acc.salt, 'pwd123');
    expect(rehash).toBe(acc.passwordHash);
  });

  it('round-trip: register then login with the same password succeeds', async () => {
    await registerAccount(storage, { email: 'a@b.com', password: 'pwd123', name: 'Alice' });
    // registerAccount sets the session, so log out first
    setSession(storage, null);
    const acc = await login(storage, 'a@b.com', 'pwd123');
    expect(acc.email).toBe('a@b.com');
  });

  it('login with the wrong password throws', async () => {
    await registerAccount(storage, { email: 'a@b.com', password: 'pwd123', name: 'Alice' });
    setSession(storage, null);
    await expect(login(storage, 'a@b.com', 'wrongpwd')).rejects.toThrow(/Senha incorreta/);
  });

  it('rejects duplicate e-mails on the same storage', async () => {
    await registerAccount(storage, { email: 'a@b.com', password: 'pwd123', name: 'Alice' });
    setSession(storage, null);
    await expect(registerAccount(storage, { email: 'A@B.com', password: 'pwd456', name: 'Alice 2' }))
      .rejects.toThrow(/já está registrado/);
  });

  it('rejects invalid e-mails, short passwords, short names', async () => {
    await expect(registerAccount(storage, { email: 'nope', password: 'pwd123', name: 'Alice' })).rejects.toThrow(/E-mail/);
    await expect(registerAccount(storage, { email: 'a@b.com', password: '123', name: 'Alice' })).rejects.toThrow(/6 caracteres/);
    await expect(registerAccount(storage, { email: 'a@b.com', password: 'pwd123', name: 'A' })).rejects.toThrow(/Nome/);
  });

  it('lowercases the e-mail and trims whitespace', async () => {
    const acc = await registerAccount(storage, { email: '  A@B.COM  ', password: 'pwd123', name: 'Alice' });
    expect(acc.email).toBe('a@b.com');
  });

  it('attaches the default address when CEP is 8 digits', async () => {
    const acc = await registerAccount(storage, {
      email: 'a@b.com', password: 'pwd123', name: 'Alice',
      cep: '64.071-440', street: 'Rua X', neighborhood: 'Verde Lar', city: 'Teresina', uf: 'PI'
    });
    expect(acc.addresses).toHaveLength(1);
    expect(acc.addresses[0].cep).toBe('64071440');
    expect(acc.addresses[0].isDefault).toBe(true);
  });

  it('ignores a malformed CEP at registration (no address added)', async () => {
    const acc = await registerAccount(storage, {
      email: 'a@b.com', password: 'pwd123', name: 'Alice', cep: '1234'
    });
    expect(acc.addresses).toEqual([]);
  });

  it('setSession writes/clears the session key', async () => {
    await registerAccount(storage, { email: 'a@b.com', password: 'pwd123', name: 'Alice' });
    expect(storage.getItem(SESSION_KEY)).toBe('a@b.com');
    setSession(storage, null);
    expect(storage.getItem(SESSION_KEY)).toBeNull();
    expect(getCurrentAccount(storage)).toBeNull();
  });
});

describe('login', () => {
  it('throws when the e-mail is not registered', async () => {
    const storage = makeStorage();
    await expect(login(storage, 'ghost@nowhere.com', 'pwd123')).rejects.toThrow(/Nenhuma conta/);
  });

  it('updates lastLoginAt on success', async () => {
    const storage = makeStorage();
    let t = 1000;
    await registerAccount(storage, { email: 'a@b.com', password: 'pwd123', name: 'Alice' }, { now: () => t });
    setSession(storage, null);
    t = 2000;
    const acc = await login(storage, 'a@b.com', 'pwd123', { now: () => t });
    expect(acc.lastLoginAt).toBe(2000);
  });
});

describe('resetPassword', () => {
  it('produces a brand-new salt + hash that authenticates', async () => {
    const storage = makeStorage();
    await registerAccount(storage, { email: 'a@b.com', password: 'oldpass1', name: 'Alice' });
    setSession(storage, null);
    const before = loadAccounts(storage)[0];
    const oldHash = before.passwordHash;
    const oldSalt = before.salt;
    await resetPassword(storage, 'a@b.com', 'newpass1');
    const after = loadAccounts(storage)[0];
    expect(after.salt).not.toBe(oldSalt);
    expect(after.passwordHash).not.toBe(oldHash);
    setSession(storage, null);
    await expect(login(storage, 'a@b.com', 'oldpass1')).rejects.toThrow(/Senha incorreta/);
    const ok = await login(storage, 'a@b.com', 'newpass1');
    expect(ok.email).toBe('a@b.com');
  });

  it('throws when the e-mail is not registered', async () => {
    await expect(resetPassword(makeStorage(), 'ghost@x.com', 'newpass1')).rejects.toThrow(/Nenhuma conta/);
  });

  it('rejects short new passwords', async () => {
    const storage = makeStorage();
    await registerAccount(storage, { email: 'a@b.com', password: 'oldpass1', name: 'Alice' });
    await expect(resetPassword(storage, 'a@b.com', '123')).rejects.toThrow(/6 caracteres/);
  });
});

// ---------- Prizes / loyalty ----------

describe('loadPrizes', () => {
  it('returns the default 3 prizes when nothing is persisted', () => {
    const p = loadPrizes(makeStorage());
    expect(p).toHaveLength(3);
    expect(p.find((x) => x.id === 'p1').points).toBe(500);
  });

  it('returns the persisted list when it is non-empty', () => {
    const storage = makeStorage();
    storage.setItem(PRIZES_KEY, JSON.stringify([{ id: 'x', name: 'X', points: 100, active: true }]));
    expect(loadPrizes(storage)).toEqual([{ id: 'x', name: 'X', points: 100, active: true }]);
  });
});

describe('loadLoyaltyConfig', () => {
  it('returns defaults when nothing is persisted', () => {
    expect(loadLoyaltyConfig(makeStorage())).toEqual({ enabled: true, pointsPerReal: 1 });
  });

  it('returns the persisted config', () => {
    const storage = makeStorage();
    storage.setItem(LOYALTY_CONFIG_KEY, JSON.stringify({ enabled: false, pointsPerReal: 2 }));
    expect(loadLoyaltyConfig(storage)).toEqual({ enabled: false, pointsPerReal: 2 });
  });
});

describe('genCouponCode', () => {
  it('returns PREMIO- + 5 chars from the safe alphabet', () => {
    for (let i = 0; i < 50; i++) {
      const code = genCouponCode();
      expect(code).toMatch(/^PREMIO-[A-Z2-9]{5}$/);
    }
  });

  it('uses the injected RNG (deterministic output)', () => {
    // Pick specific indices by feeding a RNG that always returns 0
    const r = () => 0;
    const code = genCouponCode(r);
    expect(code).toBe('PREMIO-AAAAA');
  });

  it('excludes the visually-ambiguous characters the production alphabet omits (0, 1, O, I)', () => {
    // The production alphabet is ABCDEFGHJKLMNPQRSTUVWXYZ23456789. So 0, 1, O and I
    // are *not* in there. Verify by sampling many codes and confirming none of
    // those characters ever appear in the suffix.
    for (let i = 0; i < 200; i++) {
      const suffix = genCouponCode().slice(7);
      expect(suffix, `genCouponCode produced ambiguous char in "${suffix}"`).not.toMatch(/[01OI]/);
    }
  });
});

describe('redeemPrize', () => {
  let storage;
  beforeEach(async () => {
    storage = makeStorage();
    await registerAccount(storage, { email: 'a@b.com', password: 'pwd123', name: 'Alice' });
  });

  it('deducts points, creates a coupon, and records history', () => {
    // Top up points first
    updateCurrentAccount(storage, { points: 600 });
    setSession(storage, 'a@b.com');

    const r = redeemPrize(storage, 'p1'); // p1 = 500 pts (Pizza Pequena)
    expect(r.coupon.code).toMatch(/^PREMIO-/);
    expect(r.coupon.used).toBe(false);
    expect(r.account.points).toBe(100);
    expect(r.account.coupons).toHaveLength(1);
    expect(r.account.coupons[0].prizeId).toBe('p1');
    expect(r.account.pointsHistory.some((h) => h.type === 'redeem' && h.amount === -500)).toBe(true);
  });

  it('rejects redemption when points are insufficient', () => {
    updateCurrentAccount(storage, { points: 100 });
    setSession(storage, 'a@b.com');
    expect(() => redeemPrize(storage, 'p1')).toThrow(/Pontos insuficientes/);
  });

  it('rejects inactive or missing prizes', () => {
    updateCurrentAccount(storage, { points: 9999 });
    setSession(storage, 'a@b.com');
    expect(() => redeemPrize(storage, 'p-does-not-exist')).toThrow(/Prêmio não encontrado/);
    // Disable p1
    savePrizes(storage, loadPrizes(storage).map((p) => p.id === 'p1' ? { ...p, active: false } : p));
    expect(() => redeemPrize(storage, 'p1')).toThrow(/Prêmio não encontrado/);
  });

  it('throws when there is no logged-in account', () => {
    setSession(storage, null);
    expect(() => redeemPrize(storage, 'p1')).toThrow(/Faça login/);
  });
});

describe('getActiveCoupons / markCouponUsed', () => {
  let storage;
  beforeEach(async () => {
    storage = makeStorage();
    await registerAccount(storage, { email: 'a@b.com', password: 'pwd123', name: 'Alice' });
    updateCurrentAccount(storage, { points: 600 });
    setSession(storage, 'a@b.com');
    redeemPrize(storage, 'p1');
  });

  it('getActiveCoupons returns only unused coupons', () => {
    expect(getActiveCoupons(storage)).toHaveLength(1);
  });

  it('markCouponUsed flips used=true and stamps usedAt', () => {
    const code = getActiveCoupons(storage)[0].code;
    let now = 1234567890;
    markCouponUsed(storage, code, { now: () => now });
    const acc = getCurrentAccount(storage);
    expect(acc.coupons[0].used).toBe(true);
    expect(acc.coupons[0].usedAt).toBe(1234567890);
    expect(getActiveCoupons(storage)).toHaveLength(0);
  });

  it('markCouponUsed is a no-op when there is no logged-in account', () => {
    setSession(storage, null);
    expect(() => markCouponUsed(storage, 'PREMIO-AAAAA')).not.toThrow();
  });

  it('markCouponUsed ignores unknown codes', () => {
    const before = JSON.stringify(loadAccounts(storage));
    markCouponUsed(storage, 'PREMIO-NOPE');
    const after = JSON.stringify(loadAccounts(storage));
    expect(after).toBe(before);
  });
});

describe('awardPointsForOrder', () => {
  it('multiplies order.total by pointsPerReal (default 1) and floors it', () => {
    const storage = makeStorage();
    return registerAccount(storage, { email: 'a@b.com', password: 'pwd123', name: 'Alice' })
      .then(() => {
        const r = awardPointsForOrder(storage, { id: 'PED-1', total: 90.7 });
        expect(r.earned).toBe(90); // floor(90.7 * 1)
        expect(r.total).toBe(90);
        expect(getCurrentAccount(storage).pointsHistory.some((h) => h.type === 'earn' && h.orderId === 'PED-1')).toBe(true);
      });
  });

  it('respects a custom pointsPerReal', () => {
    const storage = makeStorage();
    saveLoyaltyConfig(storage, { enabled: true, pointsPerReal: 2 });
    return registerAccount(storage, { email: 'a@b.com', password: 'pwd123', name: 'Alice' })
      .then(() => {
        const r = awardPointsForOrder(storage, { id: 'PED-1', total: 50 });
        expect(r.earned).toBe(100);
      });
  });

  it('returns null when loyalty is disabled', () => {
    const storage = makeStorage();
    saveLoyaltyConfig(storage, { enabled: false, pointsPerReal: 1 });
    return registerAccount(storage, { email: 'a@b.com', password: 'pwd123', name: 'Alice' })
      .then(() => {
        expect(awardPointsForOrder(storage, { id: 'PED-1', total: 100 })).toBeNull();
      });
  });

  it('returns null when total * ratio is 0 (no free points)', () => {
    const storage = makeStorage();
    return registerAccount(storage, { email: 'a@b.com', password: 'pwd123', name: 'Alice' })
      .then(() => {
        expect(awardPointsForOrder(storage, { id: 'PED-1', total: 0 })).toBeNull();
        expect(awardPointsForOrder(storage, { id: 'PED-1', total: 0.4 })).toBeNull();
      });
  });

  it('returns null when there is no logged-in account', () => {
    const storage = makeStorage();
    expect(awardPointsForOrder(storage, { id: 'PED-1', total: 100 })).toBeNull();
  });

  it('full flow: register → order → redeem → coupon used → order points accumulate', async () => {
    const storage = makeStorage();
    await registerAccount(storage, { email: 'a@b.com', password: 'pwd123', name: 'Alice' });
    // 1) Order → +90 points
    const r1 = awardPointsForOrder(storage, { id: 'PED-1', total: 90 });
    expect(r1.earned).toBe(90);
    // 2) Redeem Pizza Pequena (500 pts) — we have 90, so first grant extra to get to 500
    setSession(storage, null);
    await resetPassword(storage, 'a@b.com', 'pwd123'); // noop
    setSession(storage, 'a@b.com');
    updateCurrentAccount(storage, { points: 600 });
    setSession(storage, 'a@b.com');
    const r2 = redeemPrize(storage, 'p1');
    expect(r2.account.points).toBe(100);
    // 3) Mark the coupon as used
    markCouponUsed(storage, r2.coupon.code);
    expect(getActiveCoupons(storage)).toHaveLength(0);
    // 4) A second order → +20 more
    const r3 = awardPointsForOrder(storage, { id: 'PED-2', total: 20.4 });
    expect(r3.earned).toBe(20);
    expect(getCurrentAccount(storage).points).toBe(120);
  });
});

// ---------- Order helpers (used by smoke) ----------

describe('persistOrder / loadOrders', () => {
  it('round-trips an order by id', () => {
    const storage = makeStorage();
    const order = makeOrder({ id: 'PED-X', total: 49.9, items: [{ name: 'Pizza', price: 49.9, quantity: 1 }] });
    persistOrder(storage, order);
    const map = loadOrders(storage);
    expect(map['PED-X']).toEqual(order);
  });
});

// ---------- v11: distance-based delivery parity ----------
// The acceptance criterion for TAA-2: "Public calculator and checkout produce the same fee
// for the same CEP (parity test)." We exercise the cart-side helpers in the same way
// finalizeOrder / refreshPaymentDetailsScreen / getMPPreferenceUrl do: geocode the CEP,
// run the same calcDeliveryByDistance, snapshot the result, and assert the fee the
// order would carry matches the public calculator's value.

describe('v11: distance-based delivery parity (public calculator ≡ checkout)', () => {
  // 64071-440 → Av. Sen. Sigefredo Pacheco, 4727, Verde Lar, Teresina-PI = the store's
  // own CEP. ~0 km → baseFee only (R$ 5 in DELIVERY_DEFAULTS).
  const inStoreCep = '64071440';
  // 64057-400 → Vale Quem Tem, mid-distance from the store.
  const midCep = '64057400';
  // 01310-100 → Av. Paulista, SP — well past the 15 km maxKm default.
  const outOfRangeCep = '01310100';

  const fakeAwesomeApi = (cep) => {
    if (cep === inStoreCep) return Promise.resolve({
      lat: STORE_DEFAULTS.lat, lng: STORE_DEFAULTS.lng,
      address: 'Av. Sen. Sigefredo Pacheco, 4727', district: 'Verde Lar',
      city: 'Teresina', state: 'PI'
    });
    if (cep === midCep) return Promise.resolve({
      lat: STORE_DEFAULTS.lat - 0.045, lng: STORE_DEFAULTS.lng,
      address: 'Av. Vale Quem Tem', district: 'Vale Quem Tem',
      city: 'Teresina', state: 'PI'
    });
    if (cep === outOfRangeCep) return Promise.resolve({
      lat: -23.561, lng: -46.656,
      address: 'Av. Paulista', district: 'Bela Vista',
      city: 'São Paulo', state: 'SP'
    });
    return Promise.resolve(null);
  };
  const fakeViaCep = (cep) => Promise.resolve({ erro: true });

  it('parity: 0 km CEP → public-calc fee === checkout fee (baseFee only)', async () => {
    const storage = makeStorage();
    // Public calculator path
    const pub = await resolveDeliveryForCep(inStoreCep, {
      cache: {}, fetchers: { fetchAwesomeApi: fakeAwesomeApi, fetchViaCep: fakeViaCep }, storage
    });
    expect(pub.calc.outOfRange).toBe(false);
    expect(pub.calc.km).toBeCloseTo(0, 5);
    expect(pub.calc.fee).toBe(DELIVERY_DEFAULTS.baseFee);

    // Checkout path — the same fee flows into the order
    const fee = getCheckoutDeliveryFee(pub);
    const snap = buildDeliverySnapshot(pub);
    expect(fee).toBe(pub.calc.fee);
    expect(snap.fee).toBe(pub.calc.fee);
    expect(snap.outOfRange).toBe(false);
    expect(snap.km).toBe(pub.calc.km);
    expect(snap.minutesMin).toBe(pub.calc.minutesMin);
    expect(snap.minutesMax).toBe(pub.calc.minutesMax);

    // Persist with the same fee and verify it round-trips
    const order = makeOrder({ id: 'PED-PARITY-NEAR', total: 90 + fee });
    order.deliveryFee = fee;
    order.deliveryDistanceKm = snap.km;
    order.deliveryEtaMin = snap.minutesMin;
    order.deliveryEtaMax = snap.minutesMax;
    order.deliverySource = 'distance';
    persistOrder(storage, order);
    const map = loadOrders(storage);
    expect(map['PED-PARITY-NEAR'].deliveryFee).toBe(pub.calc.fee);
  });

  it('parity: mid-distance CEP → same fee for public and checkout, scales with km', async () => {
    const storage = makeStorage();
    const pub = await resolveDeliveryForCep(midCep, {
      cache: {}, fetchers: { fetchAwesomeApi: fakeAwesomeApi, fetchViaCep: fakeViaCep }, storage
    });
    expect(pub.calc.outOfRange).toBe(false);
    // 0.045 lat offset ≈ 5 km
    expect(pub.calc.km).toBeGreaterThan(4.5);
    expect(pub.calc.km).toBeLessThan(5.5);

    const fee = getCheckoutDeliveryFee(pub);
    // per-km mode default: baseFee + km * perKm
    const expected = Math.round((DELIVERY_DEFAULTS.baseFee + pub.calc.km * DELIVERY_DEFAULTS.perKm) * 100) / 100;
    expect(fee).toBe(expected);
    expect(buildDeliverySnapshot(pub).fee).toBe(expected);
  });

  it('parity: out-of-range CEP → checkout fee is 0 and snapshot is outOfRange', async () => {
    const storage = makeStorage();
    const pub = await resolveDeliveryForCep(outOfRangeCep, {
      cache: {}, fetchers: { fetchAwesomeApi: fakeAwesomeApi, fetchViaCep: fakeViaCep }, storage
    });
    expect(pub.calc.outOfRange).toBe(true);
    expect(pub.calc.reason).toMatch(/raio/i);
    expect(pub.calc.km).toBeGreaterThan(2000);

    // Checkout path
    const fee = getCheckoutDeliveryFee(pub);
    const snap = buildDeliverySnapshot(pub);
    expect(fee).toBe(0);
    expect(snap.outOfRange).toBe(true);
    expect(snap.fee).toBe(0);
    expect(snap.minutesMin).toBeNull();
    expect(snap.minutesMax).toBeNull();
  });

  it('parity: bands mode yields the same fee in both paths', async () => {
    const storage = makeStorage();
    // Persist a bands-mode delivery config
    storage.setItem(DELIVERY_CFG_KEY, JSON.stringify({
      mode: 'bands',
      maxKm: 15,
      baseFee: 5,
      bands: [
        { maxKm: 3, fee: 5 },
        { maxKm: 7, fee: 10 },
        { maxKm: 12, fee: 15 }
      ]
    }));
    const pub = await resolveDeliveryForCep(midCep, {
      cache: {}, fetchers: { fetchAwesomeApi: fakeAwesomeApi, fetchViaCep: fakeViaCep }, storage
    });
    expect(pub.calc.fee).toBe(10); // ~5 km → band[7]
    expect(getCheckoutDeliveryFee(pub)).toBe(10);
  });

  it('parity: empty state → fee is 0 (forces user to fill CEP)', () => {
    expect(getCheckoutDeliveryFee(null)).toBe(0);
    expect(getCheckoutDeliveryFee(undefined)).toBe(0);
    expect(getCheckoutDeliveryFee({ calc: null })).toBe(0);
    expect(buildDeliverySnapshot(null)).toBeNull();
  });
});
