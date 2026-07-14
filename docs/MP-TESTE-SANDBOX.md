# Mercado Pago — Teste (Sandbox)

Credenciais de teste ficam em `.env.local` (raiz) e `worker/.dev.vars` — **não vão pro Git**.

## O que já foi validado

- Access Token `TEST-…` cria preferência na API do MP (**HTTP 201**).
- Checkout de teste usa `sandbox_init_point` (URL `sandbox.mercadopago.com.br`).

## Como testar no PC (Checkout Pro / preferência)

```bash
cd PaperClip
node server.js
```

Abra `http://localhost:3000`, monte um pedido, escolha **Mercado Pago**.

O servidor chama `POST /api/create-preference` com o token de teste e devolve o link sandbox.

### Cartões de teste (documentação MP)

Use os cartões de teste do painel de desenvolvedores, por exemplo:

- Mastercard aprovado: `5031 4332 1540 6351` (e demais dados da doc oficial)
- Sempre com usuário/comprador de **teste** quando o fluxo exigir

Lista oficial: [Cartões de teste](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/test-cards)

### Usuários de teste

No painel do desenvolvedor → **Contas de teste** → crie comprador e vendedor de teste.  
Pague o sandbox logado como **comprador de teste**.

## Pix real

Com credencial **TEST**, Pix **muitas vezes não simula pagamento real**.  
Para Pix de verdade: token de **produção** + Worker Cloudflare (ver `docs/mercadopago-setup.md`).

## Subir na internet (GitHub Pages / Level7)

O HTML sozinho **não** guarda o Access Token com segurança.

| Opção | O que fazer |
|-------|-------------|
| **Vercel** | Importar repo → env `MP_ACCESS_TOKEN` = token teste → depois produção |
| **Cloudflare Worker** | `cd worker` → `npm i` → `wrangler secret put MP_ACCESS_TOKEN` → deploy |
| **Só link** | Criar link no app MP e colar no admin (sem API) |

## Segurança

- **Nunca** cole Access Token de **produção** no chat, no HTML ou no Git.
- Token de teste ainda não deve ir pro repositório público.
- Se o token vazou em lugar público, **regenere** no painel MP.
