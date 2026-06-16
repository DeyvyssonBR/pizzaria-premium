// tests/smoke.test.mjs
//
// Smoke test for the PWA: starts a static server on the repo root, then
// asserts that the homepage and admin page are served, that the script.js
// bundle exposes the expected hooks, and that a full localStorage round-trip
// (register → order → coupon redeem → mark used) preserves the premium_pizzaria_*
// keys it claims to.
//
// This is the closest thing to "open the site, click around" that we can
// do in a CI without a browser. For the real browser flow the README still
// recommends `python -m http.server` against D:\PaperClip.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './helpers/static-server.mjs';
import {
  makeStorage,
  registerAccount,
  login,
  setSession,
  awardPointsForOrder,
  redeemPrize,
  markCouponUsed,
  getActiveCoupons,
  persistOrder,
  loadOrders,
  makeOrder
} from './pizzaria-logic.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

describe('PWA smoke: static server', () => {
  let server;
  beforeAll(async () => {
    server = await startServer(repoRoot);
  });
  afterAll(async () => {
    if (server) await server.close();
  });

  it('serves the homepage at /', async () => {
    const r = await fetch(server.url + '/');
    expect(r.status).toBe(200);
    const body = await r.text();
    expect(body).toMatch(/<title>/i);
    // The PWA shell should be a single HTML page with the store appbar.
    expect(body.toLowerCase()).toMatch(/pizzaria|appbar|app-bar/);
  });

  it('serves /admin.html for the admin panel', async () => {
    const r = await fetch(server.url + '/admin.html');
    expect(r.status).toBe(200);
    const body = await r.text();
    // The admin page must have a tab area and not be the customer SPA.
    expect(body).toMatch(/tab-(orders|loyalty|zones|config)/);
  });

  it('serves the main script with the expected API surface', async () => {
    // The HTML references the script with a ?v= cache buster, so look up the
    // real path by parsing the HTML.
    const html = await (await fetch(server.url + '/')).text();
    const m = html.match(/src="(assets\/js\/script\.js[^"]*)"/i);
    expect(m, 'homepage should include a <script> for script.js').toBeTruthy();
    const r = await fetch(server.url + '/' + m[1]);
    expect(r.status).toBe(200);
    const body = await r.text();
    // Spot-check the public surface the tests cover.
    for (const fn of [
      'function haversineKm',
      'function calcDeliveryByDistance',
      'async function geocodeCep',
      'async function registerAccount',
      'async function login',
      'async function resetPassword',
      'function awardPointsForOrder',
      'function redeemPrize',
      'function markCouponUsed',
      'function genCouponCode',
      'function calcDeliveryByCep'
    ]) {
      expect(body, `script.js should expose ${fn}`).toContain(fn);
    }
  });

  it('serves the service worker', async () => {
    const r = await fetch(server.url + '/sw.js');
    expect(r.status).toBe(200);
    const body = await r.text();
    expect(body).toMatch(/CACHE_NAME/);
  });
});

describe('PWA smoke: localStorage round-trip (register → order → coupon → used)', () => {
  it('preserves every premium_pizzaria_* key across the full flow', async () => {
    const storage = makeStorage();

    // 1) register
    const acc = await registerAccount(storage, {
      email: 'smoke@teste.com',
      password: 'pwd123',
      name: 'Smoke Test',
      cep: '64.071-440',
      street: 'Av. Sen. Sigefredo Pacheco',
      neighborhood: 'Verde Lar',
      city: 'Teresina',
      uf: 'PI'
    });
    expect(acc.email).toBe('smoke@teste.com');
    expect(acc.addresses).toHaveLength(1);

    // 2) place an order
    const order = makeOrder({
      id: 'PED-SMOKE-1',
      total: 90,
      accountEmail: acc.email,
      items: [{ name: 'Pizza Calabresa M', price: 45, quantity: 2 }]
    });
    persistOrder(storage, order);

    // 3) award points
    const pts = awardPointsForOrder(storage, order);
    expect(pts.earned).toBe(90);
    expect(pts.total).toBe(90);

    // 4) log out + log back in (round-trip the password hash through storage)
    setSession(storage, null);
    const relog = await login(storage, 'smoke@teste.com', 'pwd123');
    expect(relog.email).toBe('smoke@teste.com');
    expect(relog.points).toBe(90);

    // 5) top up so we can redeem
    const updated = relog;
    // Manually bump points to 600 so we can redeem a 500-pt prize
    setSession(storage, null);
    const accounts = JSON.parse(storage.getItem('premium_pizzaria_accounts'));
    accounts[0].points = 600;
    storage.setItem('premium_pizzaria_accounts', JSON.stringify(accounts));
    setSession(storage, 'smoke@teste.com');

    const redemption = redeemPrize(storage, 'p1');
    expect(redemption.coupon.code).toMatch(/^PREMIO-[A-Z2-9]{5}$/);
    expect(redemption.account.points).toBe(100);
    expect(redemption.account.coupons).toHaveLength(1);

    // 6) mark the coupon used at checkout
    markCouponUsed(storage, redemption.coupon.code);
    expect(getActiveCoupons(storage)).toHaveLength(0);

    // 7) every premium_pizzaria_* key the spec calls out must exist + look right
    const keysSeen = {};
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith('premium_pizzaria_')) keysSeen[k] = storage.getItem(k);
    }
    expect(Object.keys(keysSeen).sort()).toEqual([
      'premium_pizzaria_accounts',
      'premium_pizzaria_orders',
      'premium_pizzaria_session'
    ].sort());

    // accounts
    const accounts2 = JSON.parse(keysSeen['premium_pizzaria_accounts']);
    expect(accounts2).toHaveLength(1);
    const a = accounts2[0];
    expect(a.email).toBe('smoke@teste.com');
    expect(a.salt).toMatch(/^[0-9a-f]{32}$/);
    expect(a.passwordHash).toMatch(/^[0-9a-f]{64}$/);
    expect(a.points).toBe(100);
    expect(a.coupons[0].used).toBe(true);
    expect(a.coupons[0].code).toBe(redemption.coupon.code);
    expect(a.addresses[0].cep).toBe('64071440');

    // session
    expect(keysSeen['premium_pizzaria_session']).toBe('smoke@teste.com');

    // orders
    const orders = JSON.parse(keysSeen['premium_pizzaria_orders']);
    expect(orders['PED-SMOKE-1'].accountEmail).toBe('smoke@teste.com');
    expect(orders['PED-SMOKE-1'].total).toBe(90);
  });

  it('reused order id overwrites in place (idempotent persistOrder)', () => {
    const storage = makeStorage();
    const a = makeOrder({ id: 'PED-1', total: 50 });
    const b = makeOrder({ id: 'PED-1', total: 75, status: 'paid' });
    persistOrder(storage, a);
    persistOrder(storage, b);
    const map = loadOrders(storage);
    expect(Object.keys(map)).toEqual(['PED-1']);
    expect(map['PED-1'].total).toBe(75);
  });
});
