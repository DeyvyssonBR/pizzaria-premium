# Mercado Pago — Sandbox × Produção

Toda a configuração passa por **`lib/mercadoPago.js`** e variáveis de ambiente.

## Variáveis

| Variável | Descrição |
|----------|-----------|
| `MERCADOPAGO_PUBLIC_KEY` | Public Key (pode ir ao front / Bricks) |
| `MERCADOPAGO_ACCESS_TOKEN` | Access Token (**só servidor**) |
| `MERCADOPAGO_ENV` | `sandbox` ou `production` |
| `MERCADOPAGO_WEBHOOK_SECRET` | Opcional — assinatura de webhook |

Aliases legados: `MP_PUBLIC_KEY`, `MP_ACCESS_TOKEN`, `MP_ENV`, `MP_WEBHOOK_SECRET`.

## Alternar ambiente

### Desenvolvimento (Sandbox)

```env
MERCADOPAGO_PUBLIC_KEY=TEST-...
MERCADOPAGO_ACCESS_TOKEN=TEST-...
MERCADOPAGO_ENV=sandbox
```

Reinicie: `node server.js`

### Produção

```env
MERCADOPAGO_PUBLIC_KEY=APP_USR-...
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_ENV=production
```

Na Vercel/Cloudflare: as mesmas chaves em Environment Variables / Secrets.  
**Não altere código** — só as variáveis + redeploy/restart.

## Onde o módulo é usado

- `api/create-preference.js`
- `api/create-pix.js`
- `api/verify-payment.js`
- `api/mp-config.js`
- `api/payment-status-local.js`
- `api/mp-webhook.js`
- `server.js` (boot log)
- Worker: `worker/src/index.js` (lê `MERCADOPAGO_*` ou `MP_*` do `env` Cloudflare)
