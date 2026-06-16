# Pizzaria Premium — Tests

Vitest suite covering the pure logic the SPA relies on:

- `assets/js/script.js` — geocoding, haversine, delivery calc, accounts, prizes,
  coupons, points, CEP zones.
- PWA smoke — start a static server, assert the homepage / admin / `script.js`
  / `sw.js` are served, and run a full localStorage round-trip
  (register → order → coupon redeem → mark used).

The testable bodies live in `pizzaria-logic.mjs` (parity with the live
`assets/js/script.js` — same control flow, same constants, same edge cases).
A `makeStorage` adapter takes the place of `window.localStorage` so the suite
runs in pure Node. `geocodeCep` accepts an injected `fetchers` object so it
does not hit the real network.

## Run

```bash
npm install   # one time (adds vitest + jsdom as devDeps)
npm test      # runs all *.test.mjs in this directory once
npm run test:watch  # interactive
```

Expected output (last run on this branch):

```
 Test Files  2 passed (2)
      Tests  90 passed (90)
   Duration  ~400ms
```

## Layout

```
tests/
├── helpers/
│   └── static-server.mjs       # tiny SPA-friendly static server for the smoke
├── pizzaria-logic.mjs          # pure logic (extracted parity, not re-implemented)
├── pizzaria-logic.test.mjs     # 84 unit tests
├── smoke.test.mjs              # 6 PWA smoke tests
├── junit.xml                   # CI-friendly report (regenerated on `npm test`)
└── test-output.log             # last run, for human review
```

## What's covered

| Surface | Tests |
|---|---|
| `genSalt` / `hashPassword` / `bytesToHex` | 13 |
| `loadStoreConfig` / `loadDeliveryConfig` | 7 |
| `haversineKm` | 5 |
| `geocodeCep` (cache, AwesomeAPI, ViaCEP, municipality fallback) | 8 |
| `calcDeliveryByDistance` (per-km, bands, max radius, missing coords) | 8 |
| `calcDeliveryByCep` (legacy zones fallback) | 6 |
| `registerAccount` / `login` / `resetPassword` (round-trip) | 15 |
| `redeemPrize` / `markCouponUsed` / `getActiveCoupons` / `genCouponCode` | 11 |
| `awardPointsForOrder` (default + custom ratio + disabled + zero + full flow) | 6 |
| PWA smoke (static server + localStorage round-trip) | 6 |
| Misc (storage, prizes, loyalty config, order helpers) | 5 |

## Notes

- We do not exercise the real `genSalt`/`hashPassword` paths against
  `crypto.subtle` from `jsdom` — the parity module uses `node:crypto` /
  WebCrypto under the hood, both of which match the browser's SHA-256
  output for the same input. The test suite verifies the **hex encoding**,
  the **size** (32-byte salt, 64-char hash), and the **round-trip**
  (register → logout → login) so a regression in the hash format would
  fail loudly.
- The smoke test starts its own static server on a random port, then
  asserts the real `index.html` / `admin.html` / `script.js` / `sw.js`
  are served and contain the expected hooks. This is the closest thing
  to "open the site in a browser" we can do in CI without Playwright.
- The full `localStorage` round-trip test asserts the keys called out in
  the project changelog (`premium_pizzaria_accounts`,
  `premium_pizzaria_orders`, `premium_pizzaria_session`) and a couple
  others are populated and shaped correctly.
