# Deploy produção — Railway + Mercado Pago

## Pré-requisitos

1. Conta [Railway](https://railway.app)
2. Credenciais **produção** do Mercado Pago (`APP_USR-...`)
3. CLI: `npm i -g @railway/cli` → `railway login`

## Deploy (CLI)

```bash
cd PaperClip
railway login
railway init          # cria projeto se não existir
railway up            # deploy
```

## Variáveis no Railway (obrigatórias)

```text
NODE_ENV=production
PORT=3000

MERCADOPAGO_ENV=production
MERCADOPAGO_PUBLIC_KEY=APP_USR-...
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_WEBHOOK_SECRET=<gere uma string forte aleatória>

# URL pública (CORS + back_urls do checkout)
PUBLIC_SITE_URL=https://SEU-APP.up.railway.app
ALLOWED_ORIGINS=https://SEU-APP.up.railway.app
```

Opcionais:

```text
# Se usar Cloudflare Worker para Pix
# WORKER_URL=https://....workers.dev
```

Defina no painel: **Project → Variables** ou:

```bash
railway variables set MERCADOPAGO_ENV=production
railway variables set MERCADOPAGO_PUBLIC_KEY="APP_USR-..."
railway variables set MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
railway variables set MERCADOPAGO_WEBHOOK_SECRET="..."
railway variables set NODE_ENV=production
```

## Config Railway

| Item | Valor |
|------|--------|
| Root Directory | `PaperClip` (se o repo for a pasta pai) |
| Build | `npm run build` (no-op) |
| Start | `npm start` → `node server.js` |
| Healthcheck | `/health` |
| Port | `$PORT` (Railway injeta) |

## Pós-deploy

1. URL pública: `railway domain` ou painel → Domains
2. Mercado Pago → Webhooks →  
   `https://SEU-DOMINIO.up.railway.app/api/mp-webhook`  
   (evento `payment`) + mesmo `MERCADOPAGO_WEBHOOK_SECRET`
3. Teste:
   - `GET /health`
   - `GET /api/mp/config` → `"env":"production","isSandbox":false`
   - Pedido real pequeno no site

## Segurança

- Access Token **somente** no Railway Variables
- Nunca commitar `.env.local` com `APP_USR`
- `/api/mp/config` e `/health` **não** expõem o Access Token
