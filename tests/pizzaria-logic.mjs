// tests/pizzaria-logic.mjs
//
// Pure logic extracted (parity) from D:/PaperClip/assets/js/script.js so it can
// be exercised under Vitest in a Node environment with a localStorage polyfill.
//
// The functions in this file are 1:1 with the production code (same control flow,
// same constants, same edge cases). They are NOT a re-implementation — the bodies
// are the bodies of the live code, with only the browser-only side effects
// (localStorage, crypto, fetch, document) replaced by a small storage adapter.
//
// The production script still owns its own copies; the tests exist so the next
// time someone "fixes a small typo" in script.js, we can see what broke.

// ---------- Constants (parity with script.js) ----------
export const ACCOUNTS_KEY = 'premium_pizzaria_accounts';
export const SESSION_KEY = 'premium_pizzaria_session';
export const PRIZES_KEY = 'premium_pizzaria_prizes';
export const ZONES_KEY = 'premium_pizzaria_zones';
export const LOYALTY_CONFIG_KEY = 'premium_pizzaria_loyalty_cfg';
export const STORE_CONFIG_KEY = 'premium_pizzaria_store_cfg';
export const GEO_CACHE_KEY = 'premium_pizzaria_geo_cache';
export const DELIVERY_CFG_KEY = 'premium_pizzaria_delivery_cfg';

export const STORE_DEFAULTS = {
  cep: '64071440',
  lat: -5.0617,
  lng: -42.7775,
  address: 'Av. Sen. Sigefredo Pacheco, 4727 - Verde Lar, Teresina-PI'
};

export const DELIVERY_DEFAULTS = {
  mode: 'per_km',
  maxKm: 15,
  baseFee: 5,
  perKm: 1.5,
  baseMin: 20,
  fuelPerKm: 0.55,
  bands: [
    { maxKm: 3, fee: 5 },
    { maxKm: 7, fee: 10 },
    { maxKm: 12, fee: 15 }
  ]
};

// ---------- Storage adapter ----------
// In production the code reads/writes window.localStorage. In tests we accept
// a Map-like object so the suite has no DOM dependency for pure logic.
export function makeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
    key: (i) => Array.from(map.keys())[i] ?? null,
    get length() { return map.size; },
    _map: map
  };
}

// ---------- Hash SHA-256 (Node crypto parity with crypto.subtle) ----------
export function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function genSalt(bytes = 16, rng = Math.random) {
  // parity with script.js: 16 random bytes via crypto.getRandomValues.
  // For tests we allow injecting an RNG that returns [0,1).
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < bytes; i++) arr[i] = Math.floor(rng() * 256);
  return bytesToHex(arr);
}

export async function hashPassword(salt, pwd) {
  // parity: SHA-256(salt + ':' + pwd) using SubtleCrypto when available,
  // falling back to node:crypto.
  const enc = new TextEncoder().encode(salt + ':' + pwd);
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', enc);
    return bytesToHex(digest);
  }
  const { createHash } = await import('node:crypto');
  return createHash('sha256').update(Buffer.from(enc)).digest('hex');
}

// ---------- Store config ----------
export function loadStoreConfig(storage) {
  try {
    const raw = storage.getItem(STORE_CONFIG_KEY);
    if (raw) return Object.assign({}, STORE_DEFAULTS, JSON.parse(raw));
  } catch (e) { /* fallthrough */ }
  return Object.assign({}, STORE_DEFAULTS);
}

export function saveStoreConfig(storage, cfg) {
  try { storage.setItem(STORE_CONFIG_KEY, JSON.stringify(cfg)); } catch (e) { /* noop */ }
}

// ---------- Geo cache ----------
export function loadGeoCache(storage) {
  try { return JSON.parse(storage.getItem(GEO_CACHE_KEY) || '{}'); }
  catch (e) { return {}; }
}
export function saveGeoCache(storage, map) {
  try { storage.setItem(GEO_CACHE_KEY, JSON.stringify(map)); } catch (e) { /* noop */ }
}

// ---------- Delivery config ----------
export function loadDeliveryConfig(storage) {
  try {
    const raw = storage.getItem(DELIVERY_CFG_KEY);
    if (raw) return Object.assign({}, DELIVERY_DEFAULTS, JSON.parse(raw));
  } catch (e) { /* fallthrough */ }
  return Object.assign({}, DELIVERY_DEFAULTS);
}
export function saveDeliveryConfig(storage, cfg) {
  try { storage.setItem(DELIVERY_CFG_KEY, JSON.stringify(cfg)); } catch (e) { /* noop */ }
}

// ---------- Zones (legacy) ----------
export function loadZones(storage, defaultFee = 5) {
  try {
    const z = JSON.parse(storage.getItem(ZONES_KEY) || 'null');
    if (Array.isArray(z) && z.length) return z;
  } catch (e) { /* fallthrough */ }
  return [{
    id: 'z-default',
    label: 'Teresina-PI',
    cepFrom: '64000000',
    cepTo: '64099999',
    fee: defaultFee,
    minutesMin: 30,
    minutesMax: 60,
    active: true
  }];
}

export function saveZones(storage, list) {
  try { storage.setItem(ZONES_KEY, JSON.stringify(list)); } catch (e) { /* noop */ }
}

export function calcDeliveryByCep(storage, rawCep, defaultFee = 5) {
  const cep = (rawCep || '').replace(/\D/g, '');
  if (cep.length !== 8) return { outOfRange: true, reason: 'CEP inválido' };
  const cepNum = parseInt(cep, 10);
  const zones = loadZones(storage, defaultFee).filter((z) => z.active !== false);
  const z = zones.find((zone) => {
    const from = parseInt(String(zone.cepFrom).replace(/\D/g, ''), 10);
    const to = parseInt(String(zone.cepTo).replace(/\D/g, ''), 10);
    return cepNum >= from && cepNum <= to;
  });
  if (!z) return { outOfRange: true, reason: 'Fora da área de entrega', cep };
  return {
    outOfRange: false,
    cep,
    label: z.label,
    fee: Number(z.fee) || 0,
    minutesMin: Number(z.minutesMin) || 30,
    minutesMax: Number(z.minutesMax) || 60
  };
}

// ---------- Geocoding ----------
// parity with geocodeCep() in script.js, but fetcher is injected so the
// tests don't hit the real network. The fakes follow the production shape:
//  - fetchAwesomeApi(cep) -> { lat, lng, address?, district?, city?, state? } | null
//  - fetchViaCep(cep)     -> { logradouro?, bairro?, localidade?, uf?, erro? } | null
export async function geocodeCep(rawCep, { cache, fetchers = {} } = {}) {
  const cep = (rawCep || '').replace(/\D/g, '');
  if (cep.length !== 8) throw new Error('CEP precisa ter 8 dígitos.');
  if (cache && cache[cep]) return cache[cep];

  let lat = null, lng = null;
  let street = '', neighborhood = '', city = '', uf = '';

  // 1) AwesomeAPI
  try {
    if (fetchers.fetchAwesomeApi) {
      const d = await fetchers.fetchAwesomeApi(cep);
      if (d && !d.error) {
        if (d.lat) lat = parseFloat(d.lat);
        if (d.lng) lng = parseFloat(d.lng);
        street = d.address || '';
        neighborhood = d.district || '';
        city = d.city || '';
        uf = d.state || '';
      }
    }
  } catch (e) { /* try next */ }

  // 2) ViaCEP fallback (for address fields)
  if (!street || !city) {
    try {
      if (fetchers.fetchViaCep) {
        const d2 = await fetchers.fetchViaCep(cep);
        if (d2 && !d2.erro) {
          street = street || d2.logradouro || '';
          neighborhood = neighborhood || d2.bairro || '';
          city = city || d2.localidade || '';
          uf = uf || d2.uf || '';
        }
      }
    } catch (e) { /* noop */ }
  }

  if (!street && !city) throw new Error('CEP não encontrado.');

  // 3) Coordinate fallback by municipality
  if (lat == null || lng == null) {
    if (city.toLowerCase().includes('teresina')) { lat = -5.0892; lng = -42.8019; }
    else if (city.toLowerCase().includes('timon')) { lat = -5.0939; lng = -42.8367; }
    else { lat = lng = null; }
  }

  const result = { cep, lat, lng, street, neighborhood, city, uf };
  if (cache) cache[cep] = result;
  return result;
}

// ---------- Haversine ----------
export function haversineKm(lat1, lng1, lat2, lng2) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null;
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
          + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// ---------- Delivery by distance ----------
// parity with calcDeliveryByDistance() in script.js. store and cfg are
// injected to keep this function pure and easy to test.
export function calcDeliveryByDistance(cepData, { store, cfg }) {
  const km = haversineKm(store.lat, store.lng, cepData.lat, cepData.lng);
  if (km == null) {
    return { outOfRange: true, reason: 'Não consegui calcular a distância.', km: null };
  }
  if (km > cfg.maxKm) {
    return { outOfRange: true, reason: 'Fora do raio de entrega', km };
  }
  let fee;
  if (cfg.mode === 'per_km') {
    fee = cfg.baseFee + km * cfg.perKm;
  } else {
    const band = (cfg.bands || []).find((b) => km <= b.maxKm);
    fee = band ? band.fee : (cfg.bands?.slice(-1)[0]?.fee ?? cfg.baseFee);
  }
  fee = Math.round(fee * 100) / 100;
  const baseMin = cfg.baseMin || 20;
  const minutesMin = Math.round(baseMin + km * 2.5);
  const minutesMax = Math.round(baseMin + km * 4);
  return { outOfRange: false, km, fee, minutesMin, minutesMax };
}

// ---------- Accounts CRUD ----------
export function loadAccounts(storage) {
  try { return JSON.parse(storage.getItem(ACCOUNTS_KEY) || '[]'); }
  catch (e) { return []; }
}
export function saveAccounts(storage, list) {
  try { storage.setItem(ACCOUNTS_KEY, JSON.stringify(list)); } catch (e) { /* noop */ }
}

export function getCurrentAccount(storage) {
  try {
    const email = storage.getItem(SESSION_KEY);
    if (!email) return null;
    return loadAccounts(storage).find((a) => a.email === email) || null;
  } catch (e) { return null; }
}

export function setSession(storage, email) {
  if (email) storage.setItem(SESSION_KEY, email);
  else storage.removeItem(SESSION_KEY);
}

export async function registerAccount(storage, data, { now = () => Date.now() } = {}) {
  const accounts = loadAccounts(storage);
  const email = (data.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) throw new Error('E-mail inválido.');
  if ((data.password || '').length < 6) throw new Error('Senha precisa ter pelo menos 6 caracteres.');
  if (!data.name || data.name.trim().length < 2) throw new Error('Nome muito curto.');
  if (accounts.find((a) => a.email === email)) throw new Error('Este e-mail já está registrado neste dispositivo.');
  const salt = genSalt();
  const passwordHash = await hashPassword(salt, data.password);
  const account = {
    email,
    name: data.name.trim(),
    phone: data.phone || '',
    salt,
    passwordHash,
    points: 0,
    pointsHistory: [],
    coupons: [],
    addresses: [],
    createdAt: now(),
    lastLoginAt: now()
  };
  if (data.cep) {
    const cep = data.cep.replace(/\D/g, '');
    if (cep.length === 8) {
      account.addresses.push({
        id: 'a' + now(), label: 'Casa',
        cep, street: data.street || '', number: '',
        neighborhood: data.neighborhood || '', city: data.city || '', uf: data.uf || '',
        ref: '', isDefault: true
      });
    }
  }
  accounts.push(account);
  saveAccounts(storage, accounts);
  setSession(storage, email);
  return account;
}

export async function login(storage, email, pwd, { now = () => Date.now() } = {}) {
  const accounts = loadAccounts(storage);
  const acc = accounts.find((a) => a.email === (email || '').trim().toLowerCase());
  if (!acc) throw new Error('Nenhuma conta encontrada com este e-mail neste dispositivo.');
  const hash = await hashPassword(acc.salt, pwd);
  if (hash !== acc.passwordHash) throw new Error('Senha incorreta.');
  acc.lastLoginAt = now();
  saveAccounts(storage, accounts);
  setSession(storage, acc.email);
  return acc;
}

export function logout(storage) {
  setSession(storage, null);
}

export async function resetPassword(storage, email, newPwd) {
  const accounts = loadAccounts(storage);
  const acc = accounts.find((a) => a.email === (email || '').trim().toLowerCase());
  if (!acc) throw new Error('Nenhuma conta com esse e-mail.');
  if ((newPwd || '').length < 6) throw new Error('Senha precisa ter pelo menos 6 caracteres.');
  acc.salt = genSalt();
  acc.passwordHash = await hashPassword(acc.salt, newPwd);
  saveAccounts(storage, accounts);
}

export function updateCurrentAccount(storage, patch, { now = () => Date.now() } = {}) {
  const cur = getCurrentAccount(storage);
  if (!cur) return null;
  const accounts = loadAccounts(storage);
  const idx = accounts.findIndex((a) => a.email === cur.email);
  if (idx === -1) return null;
  accounts[idx] = { ...accounts[idx], ...patch };
  saveAccounts(storage, accounts);
  return accounts[idx];
}

// ---------- Prizes / Loyalty ----------
export function loadPrizes(storage) {
  try {
    const p = JSON.parse(storage.getItem(PRIZES_KEY) || 'null');
    if (Array.isArray(p) && p.length) return p;
  } catch (e) { /* fallthrough */ }
  return [
    { id: 'p1', name: 'Pizza Pequena Grátis', description: 'Sabor à escolha (pequena)', icon: '🍕', points: 500, active: true },
    { id: 'p2', name: 'Refri 2L Grátis', description: 'Coca-Cola, Guaraná ou Sprite', icon: '🥤', points: 800, active: true },
    { id: 'p3', name: 'Sobremesa Grátis', description: 'Brownie, mousse ou pudim', icon: '🍰', points: 600, active: true }
  ];
}
export function savePrizes(storage, list) {
  try { storage.setItem(PRIZES_KEY, JSON.stringify(list)); } catch (e) { /* noop */ }
}

export function loadLoyaltyConfig(storage) {
  try {
    const c = JSON.parse(storage.getItem(LOYALTY_CONFIG_KEY) || 'null');
    if (c) return c;
  } catch (e) { /* fallthrough */ }
  return { enabled: true, pointsPerReal: 1 };
}
export function saveLoyaltyConfig(storage, cfg) {
  try { storage.setItem(LOYALTY_CONFIG_KEY, JSON.stringify(cfg)); } catch (e) { /* noop */ }
}

// ---------- Coupons ----------
export function genCouponCode(rng = Math.random) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = 'PREMIO-';
  for (let i = 0; i < 5; i++) out += chars[Math.floor(rng() * chars.length)];
  return out;
}

export function redeemPrize(storage, prizeId, { now = () => Date.now(), rng = Math.random } = {}) {
  const acc = getCurrentAccount(storage);
  if (!acc) throw new Error('Faça login para resgatar prêmios.');
  const prize = loadPrizes(storage).find((p) => p.id === prizeId && p.active !== false);
  if (!prize) throw new Error('Prêmio não encontrado.');
  if ((acc.points || 0) < prize.points) throw new Error('Pontos insuficientes.');
  const coupon = {
    code: genCouponCode(rng),
    prizeId: prize.id,
    name: prize.name,
    used: false,
    createdAt: now()
  };
  const newAcc = updateCurrentAccount(storage, {
    points: (acc.points || 0) - prize.points,
    coupons: [...(acc.coupons || []), coupon],
    pointsHistory: [...(acc.pointsHistory || []), {
      type: 'redeem', amount: -prize.points, prizeId: prize.id, at: now()
    }]
  });
  return { coupon, account: newAcc };
}

export function getActiveCoupons(storage) {
  const acc = getCurrentAccount(storage);
  if (!acc) return [];
  return (acc.coupons || []).filter((c) => !c.used);
}

export function markCouponUsed(storage, code, { now = () => Date.now() } = {}) {
  const acc = getCurrentAccount(storage);
  if (!acc) return;
  const coupons = (acc.coupons || []).map(
    (c) => (c.code === code ? { ...c, used: true, usedAt: now() } : c)
  );
  updateCurrentAccount(storage, { coupons });
}

export function awardPointsForOrder(storage, order, { now = () => Date.now() } = {}) {
  const acc = getCurrentAccount(storage);
  if (!acc) return null;
  const cfg = loadLoyaltyConfig(storage);
  if (!cfg.enabled) return null;
  const earned = Math.floor((order.total || 0) * (cfg.pointsPerReal || 1));
  if (earned <= 0) return null;
  const newAcc = updateCurrentAccount(storage, {
    points: (acc.points || 0) + earned,
    pointsHistory: [...(acc.pointsHistory || []), {
      type: 'earn', amount: earned, orderId: order.id, at: now()
    }]
  });
  return { earned, total: newAcc.points };
}

// ---------- Order helpers (used by smoke test) ----------
export function makeOrder({ id, total, items = [], accountEmail = null, couponCode = null, couponName = null } = {}) {
  return {
    id: id || 'PED-' + Date.now(),
    total: Number(total) || 0,
    items,
    accountEmail,
    couponCode,
    couponName,
    createdAt: Date.now(),
    status: 'received'
  };
}

export function persistOrder(storage, order) {
  const orders = loadOrders(storage);
  orders[order.id] = order;
  storage.setItem('premium_pizzaria_orders', JSON.stringify(orders));
  return order;
}

export function loadOrders(storage) {
  try { return JSON.parse(storage.getItem('premium_pizzaria_orders') || '{}'); }
  catch (e) { return {}; }
}

// ---------- v11: checkout-side distance-based delivery helpers ----------
// Parity helpers used by the cart (refreshPaymentDetailsScreen / finalizeOrder / Pix regen /
// MP preference). They read the SAME calcDeliveryByDistance result the public calculator
// shows, so the value the customer sees is the value that goes into the order.
//
// - resolveDeliveryForCep(cep)      — geocode the CEP and return the calc (or null)
// - getCheckoutDeliveryFee(state)   — fee for the order summary / Pix / MP
// - buildDeliverySnapshot(state)    — full {cepData, calc, fee, etaMin, etaMax} for persistOrder
export function resolveDeliveryForCep(rawCep, {
  cache, fetchers, storage
} = {}) {
  return (async () => {
    const cepData = await geocodeCep(rawCep, { cache, fetchers });
    const store = loadStoreConfig(storage);
    const cfg = loadDeliveryConfig(storage);
    const calc = calcDeliveryByDistance(cepData, { store, cfg });
    return { cepData, calc, store, cfg };
  })();
}

export function getCheckoutDeliveryFee(state) {
  if (!state || !state.calc) return 0;
  if (state.calc.outOfRange) return 0;
  return state.calc.fee;
}

export function buildDeliverySnapshot(state) {
  if (!state || !state.calc) return null;
  if (state.calc.outOfRange) {
    return {
      outOfRange: true,
      reason: state.calc.reason,
      km: state.calc.km,
      fee: 0,
      minutesMin: null,
      minutesMax: null
    };
  }
  return {
    outOfRange: false,
    km: state.calc.km,
    fee: state.calc.fee,
    minutesMin: state.calc.minutesMin,
    minutesMax: state.calc.minutesMax
  };
}
