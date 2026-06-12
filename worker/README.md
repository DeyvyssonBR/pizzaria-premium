# Pizzaria Premium — Cloudflare Worker (Mercado Pago Pix)

Backend mínimo, sem framework, que guarda o **Access Token do Mercado Pago** em
secret e cria cobranças Pix em nome do dono.

> O token **NUNCA** é enviado para o navegador. O front chama este Worker;
> o Worker chama a API do MP. Mesmo se o DevOps falhar no CSP, o token não vaza.

## Endpoints

| Método | Path                       | Quem chama        | O que faz                                                |
| ------ | -------------------------- | ----------------- | -------------------------------------------------------- |
| POST   | `/api/mp/create-pix`       | `assets/js/script.js` (front) | Cria `Payment` Pix no MP, devolve `qr_code` + `qr_code_base64` + `payment_id`. Idempotente por `external_ref`. |
| POST   | `/api/mp/webhook`          | Mercado Pago      | Recebe IPN, valida assinatura HMAC, faz `GET /v1/payments/{id}` no MP (poll-after-webhook) e grava no KV. |
| GET    | `/api/mp/payment-status?ref=…` | `assets/js/script.js` (polling) | Lê o status atual do KV. Sem token, sem PII, sem 4xx quando o cliente só quer saber se já pagou. |

## Setup (5 min)

```bash
cd worker
npm install

# 1) Crie o namespace KV (rode duas vezes — uma pra prod, uma pra preview)
wrangler kv:namespace create MP_TX
# wrangler kv:namespace create MP_TX --preview

# 2) Cole os IDs no wrangler.toml onde tem "REPLACE_WITH_REAL_ID"

# 3) Configure os secrets (nunca em texto puro!)
wrangler secret put MP_ACCESS_TOKEN      # cole aqui o APP_USR-... de produção
wrangler secret put MP_WEBHOOK_SECRET    # segredo do webhook configurado no painel MP

# 4) Deploy
npm run deploy
```

A URL final será tipo `https://pizzaria-premium-mp.<seu-subdominio>.workers.dev`.

## Variáveis de ambiente (no `wrangler.toml` → `[vars]`)

| Variável          | Obrigatório | Default                                | Descrição                                       |
| ----------------- | ----------- | -------------------------------------- | ----------------------------------------------- |
| `MP_ACCESS_TOKEN` | sim (secret)| —                                      | Access Token do Mercado Pago                    |
| `MP_WEBHOOK_SECRET` | sim (secret)| —                                     | Segredo do webhook (configurado no painel MP)   |
| `ALLOWED_ORIGINS` | não         | `https://deyvyssonbr.github.io,https://pizzaria-premium.vercel.app` | CSV de origens permitidas no CORS |
| `MP_ENV`          | não         | produção                               | `sandbox` para forçar credenciais de teste      |

## Bindings

- `MP_TX` (KV) — namespace obrigatório para guardar status dos pagamentos.
- `RATE_LIMIT` (KV, opcional) — namespace opcional para rate-limit compartilhado entre instâncias. Sem ele, o rate-limit é no-op.

## Webhook no painel do Mercado Pago

1. Acesse [developers.mercadopago.com](https://developers.mercadopago.com.br/) → seu app → **Webhooks**.
2. Cadastre a URL: `https://<sua-url-do-worker>/api/mp/webhook`.
3. Marque os eventos **`payment`** (criação e atualização).
4. Copie o **segredo** gerado e rode `wrangler secret put MP_WEBHOOK_SECRET` colando o valor.

## O que este Worker **NÃO** faz

- **Não** armazena dados pessoais. O único campo persistido é `payer.email` (opcional, se o front mandar).
- **Não** processa cartão. Só Pix (escopo da TAA-18).
- **Não** faz checkout Pro / redirect. O fluxo é Pix nativo no nosso checkout.
- **Não** fala com ERP. Integração com cozinha/pedidos é em outro agente.

## Limites / quando trocar

- Workers free = 100k req/dia. Cada checkout usa 1 (create) + N polls + 1 webhook. ~30k pedidos/dia cabem com folga.
- Se passar disso, faça upgrade para Workers Paid ($5/mês).
- KV free = 100k reads + 1k writes/dia. Cada pedido grava ~3 entries. ~300 pedidos/dia cabem; acima disso, upgrade.

## Verificação manual (curl)

```bash
# 1) Criar cobrança Pix de R$ 1,00
curl -X POST https://<worker-url>/api/mp/create-pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 1.00, "external_ref": "test-001", "description": "Teste Pix"}'
# → { "payment_id": 123, "qr_code": "00020126...", "qr_code_base64": "iVBORw0KGgo..." }

# 2) Checar status
curl "https://<worker-url>/api/mp/payment-status?ref=test-001"
# → { "payment_id": 123, "status": "pending", ... }

# 3) Webhook (simular — MP real mandaria com x-signature)
curl -X POST https://<worker-url>/api/mp/webhook \
  -H "Content-Type: application/json" \
  -H "x-signature: ts=$(date +%s),v1=deadbeef" \
  -d '{"type":"payment","data":{"id":123}}'
# → 401 invalid_signature (esperado sem secret certo)
```
