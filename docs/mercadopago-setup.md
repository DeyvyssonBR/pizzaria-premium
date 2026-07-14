# Mercado Pago — Setup "plug-and-play" para o dono

**Issue:** [TAA-18](/TAA/issues/TAA-18)
**Agente:** MercadoPagoSpecialist (e45a668e-69da-4f06-8be4-b6f39827a422)
**Data:** 2026-06-12
**Stack:** Cloudflare Worker (`worker/`) + front (`assets/js/script.js`) + admin (`admin.html`)

> Arquivo privado, listado no `.gitignore` (`docs-local/`, `*.local.md`). NÃO enviar ao GitHub.

---

## O que o dono ganha com esta entrega

- **Pix "de verdade" via Mercado Pago** — o cliente escaneia o QR ou copia o BRCode e paga no app do banco. Dinheiro cai direto na sua conta MP.
- **Token nunca exposto** — o Access Token fica em **secret** do Cloudflare (variável de ambiente, inacessível ao navegador). Mesmo se um DevTools inspecionar o JS, não vê nada.
- **Confirmação automática** — o front faz polling de 3s consultando o Worker. Quando o MP confirma o pagamento, o site mostra a tela de sucesso sem o cliente precisar voltar.
- **Webhook validado** — toda notificação do MP é verificada por assinatura HMAC. Notificações forjadas são rejeitadas com 401.
- **Sem build, sem framework** — o Worker é um único arquivo JavaScript que roda no Cloudflare Workers (free tier: 100k req/dia).

---

## Passo-a-passo (dono, ~10 min)

### 1. Criar aplicação no Mercado Pago

1. Acesse [developers.mercadopago.com.br](https://developers.mercadopago.com.br/) e faça login com sua conta MP.
2. Vá em **Suas aplicações** → **Criar aplicação**.
3. Nome: `Pizzaria Premium` (ou o nome que quiser). Selecione **Pagamentos online** como produto.
4. Após criada, abra a aplicação e anote o `client_id` e `client_secret` (você vai precisar deles no passo 2).

### 2. Gerar as credenciais de teste (sandbox) e produção

Em **Credenciais**, você encontra 2 pares:

| Ambiente | Public Key começa com | Access Token começa com | Quando usar |
| --- | --- | --- | --- |
| **Teste (sandbox)** | `APP_USR-...-test` | `APP_USR-...-test` | Antes de ir pra produção. Use pra fazer pedidos fictícios. |
| **Produção** | `APP_USR-...` | `APP_USR-...` | Recebimento real. Ative só depois de testar. |

> **Importante:** Para o **Pix nativo** (que é o que esta entrega usa), você só precisa do **Access Token**. A Public Key fica guardada para quando você for ativar Checkout Pro / Bricks no futuro (escopo fora de TAA-18).

### 3. Subir o Cloudflare Worker

Você precisa de uma conta Cloudflare (free tier serve). Se já tem conta, pule para o deploy.

#### 3.1. Instalar o `wrangler` (CLI do Cloudflare Workers)

```bash
cd worker
npm install
```

> O `npm install` instala o `wrangler`. Você também precisa do Node 18+ (`node -v`).

#### 3.2. Autenticar

```bash
npx wrangler login
# Abre o navegador. Faça login com sua conta Cloudflare e autorize.
```

#### 3.3. Criar o namespace KV (vai guardar status dos pagamentos)

```bash
npx wrangler kv:namespace create MP_TX
# → vai mostrar um id tipo "abc123...". Copie.

# Repita para o ambiente preview (mesmo comando, sufixo --preview):
npx wrangler kv:namespace create MP_TX --preview
# → outro id. Copie.
```

#### 3.4. Colar os IDs no `wrangler.toml`

Abra `worker/wrangler.toml` e substitua:

```toml
[[kv_namespaces]]
binding = "MP_TX"
id = "COLE_O_ID_PRODUCAO_AQUI"
preview_id = "COLE_O_ID_PREVIEW_AQUI"
```

> Se preferir, descomente as 3 linhas que já estão no arquivo (linhas com `# [[kv_namespaces]]` etc.).

#### 3.5. Configurar os secrets (NUNCA em texto puro)

```bash
npx wrangler secret put MP_ACCESS_TOKEN
# Cole aqui o Access Token de PRODUÇÃO (APP_USR-...) ou de TESTE (APP_USR-...-test).
# Não ecoa de volta. Não fica em arquivo nenhum.

npx wrangler secret put MP_WEBHOOK_SECRET
# Vamos gerar o segredo do webhook no próximo passo. Pode rodar este comando de novo depois.
```

#### 3.6. Deploy do Worker

```bash
npm run deploy
# → vai subir e devolver a URL: https://pizzaria-premium-mp.<sua-conta>.workers.dev
```

Anote essa URL — você vai colar no admin do site.

### 4. Configurar o webhook no painel do Mercado Pago

1. Volte para [developers.mercadopago.com.br](https://developers.mercadopago.com.br/) → sua aplicação → **Webhooks**.
2. Em **URL de produção** (e **URL de teste** se for testar), cole:
   ```
   https://pizzaria-premium-mp.<sua-conta>.workers.dev/api/mp/webhook
   ```
3. Marque o evento **`payment`** (criação/atualização).
4. Clique em **Salvar**. O MP vai gerar um **segredo do webhook** — copie.
5. Volte ao terminal e rode:
   ```bash
   npx wrangler secret put MP_WEBHOOK_SECRET
   # Cole o segredo que o MP gerou.
   ```
6. Rode `npm run deploy` de novo para o segredo entrar em vigor.

### 5. Configurar o admin do site

1. Abra `admin.html` no navegador (precisa estar logado).
2. Vá em **Configurações Loja** → role até **Configuração Mercado Pago**.
3. **Tipo de Integração**: escolha **API Oficial Mercado Pago (Link de Pagamento Dinâmico)**.
4. Preencha:
   - **URL do Worker**: `https://pizzaria-premium-mp.<sua-conta>.workers.dev` (a URL do passo 3.6)
   - **Access Token do Mercado Pago**: ⚠️ **NÃO SALVE AQUI**. O campo existe só pra você conferir se colou certo no Cloudflare. O `saveConfigStore()` recusa persistir — você DEVE colar no Worker.
   - **Public Key**: opcional, só se for ativar Checkout Pro no futuro.
5. Clique **Testar conexão com o Worker** — deve aparecer "✅ Conectado!".
6. Clique **Gerar Link de Teste (R$ 1,00)** — vai mostrar um QR Pix de R$ 1,00. Abra o app do seu banco, escolha Pix Copia e Cola, cole o código e pague (em modo teste, o MP devolve "cancelado" mas a integração está validada).
7. Clique **Salvar Configurações**.

### 6. Testar o fluxo completo

1. Abra o site (`index.html`) em outra aba/janela anônima.
2. Adicione 1 pizza ao carrinho → avançar → preencher nome e telefone → avançar.
3. Digite CEP `64071-440` (a pizzaria) → esperar taxa de R$ 5 → avançar.
4. Escolha **Pix** → vai para a tela de pagamento.
5. Aparece um QR Code novo. Escaneie com o app do banco (em modo teste, use uma conta MP de teste).
6. Pague R$ 1,00 (ou o total do pedido).
7. Em 3-10 segundos, a tela muda sozinha para "✅ Pagamento aprovado pelo Mercado Pago!".

> Se aparecer "Pagamento não concluído", abra o DevTools → Network → veja a resposta de `/api/mp/payment-status`. Se o Worker estiver retornando 404, é porque o webhook ainda não caiu (MP pode demorar até 30s).

### 7. Ir para produção

1. No painel MP, gere o Access Token de **Produção** (botão "Trocar para produção" em Credenciais).
2. Rode `npx wrangler secret put MP_ACCESS_TOKEN` e cole o token de produção.
3. No painel MP, troque a URL do webhook de teste para produção (mesmo endpoint, mas marque "Produção" no checkbox).
4. Rode `npm run deploy` de novo.
5. Mude o admin: **URL do Worker** continua a mesma, **Access Token** continua no Worker (não salva no admin).
6. Pronto. Os clientes reais vão pagar Pix e cair na sua conta.

---

## Limitações honestas

- **Cloudflare Workers free tier**: 100k requests/dia. Cada checkout usa 1 (create) + ~5 polls + 1 webhook. ~15k pedidos/dia cabem. Se passar, upgrade para Workers Paid ($5/mês).
- **KV free tier**: 100k reads + 1k writes/dia. Cada pedido grava ~3 entries. ~300 pedidos/dia cabem; acima disso, upgrade.
- **Pix expira em 15 min** (default do MP). O timer no front é só visual — o polling para de buscar status depois de 15min pra não sobrecarregar.
- **Sem cartão, sem Checkout Pro**: só Pix nativo. Cartão é escopo fora de TAA-18.
- **Não tem retry de webhook**: se a Cloudflare tiver hiccup e o webhook for entregue com sucesso 5min depois, o `payment-status` polling vai continuar tentando até confirmar.
- **Logs no Worker expiram em 3 dias** (free tier do wrangler tail). Para auditoria de longo prazo, conecte um Logpush.

## Próximos passos (fora do escopo desta entrega)

- **Cardápio + frete dinâmico no Pix payload** — passar descrição detalhada do pedido no `description` (hoje vai "Pedido Pizzaria Premium" genérico).
- **Notificação por e-mail/SMS** — o MP manda e-mail por padrão; para SMS é necessário integração com Twilio.
- **Reembolso parcial** — endpoint `POST /v1/payments/{id}/refunds` no Worker (admin ganha botão "Reembolsar").
- **Multi-Pizzaria / multi-conta MP** — hoje o Worker usa 1 token. Para várias lojas, criar namespace MP_TX por pizzaria.
- **Webhook com KV fora do Cloudflare** — se preferir Upstash Redis ou Vercel KV, é só trocar o `safeKvPut` / `safeKvGet` em `worker/src/index.js`.

---

## Onde está no código

| Arquivo | O que faz |
| --- | --- |
| `worker/src/index.js` | O Worker inteiro: 3 endpoints (`create-pix`, `webhook`, `payment-status`), validação de assinatura, idempotência, KV. |
| `worker/wrangler.toml` | Config do deploy (KV bindings, allowed origins). |
| `worker/package.json` | `npm run deploy` para subir. |
| `worker/README.md` | Doc técnica do Worker (em inglês, p/ quem for mexer no código). |
| `assets/js/script.js:1-15` | `MP_BASE` agora vem do `localStorage` (admin grava). |
| `assets/js/script.js:3330-3450` | `regeneratePixCode` chama o Worker, renderiza QR, dispara polling. |
| `assets/js/script.js:3700-3708` | `cartBackToDelivery` + `btnBackToPaymentMethod` param o polling ao voltar. |
| `admin.html:2714-2750` | Campos novos: Worker URL, Public Key, Access Token (não persistido). |
| `admin.html:5940-6020` | `testMpConnection()` + `testMpPreference()` reescritos pra Worker. |
| `admin.html:3810-3855` | `saveConfigStore()` recusa persistir Access Token. |

## Quando algo dá errado

- **"Não foi possível gerar o QR Pix"** no front → abra DevTools → Network. O erro 502/400/500 do Worker está na resposta. Se for 502 com `mp_create_pix_failed`, o Access Token está errado ou expirou. Se for 400, payload inválido.
- **Webhook retorna 401** → segredo do webhook mudou. Atualize `MP_WEBHOOK_SECRET` no Worker (`wrangler secret put MP_WEBHOOK_SECRET`) e faça redeploy.
- **KV retornando null** → o namespace `MP_TX` não está bindado. Rode `wrangler kv:namespace list` e confira se o id no `wrangler.toml` bate.
- **"CORS policy: No 'Access-Control-Allow-Origin' header"** → a origem do site não está em `ALLOWED_ORIGINS`. Adicione a URL exata (com `https://`, sem `/` final) e faça redeploy.
