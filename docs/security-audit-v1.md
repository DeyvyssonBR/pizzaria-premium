# Auditoria de Segurança v1 — Pizzaria Premium

**Issue:** [TAA-19](/TAA/issues/TAA-19)
**Agente:** DevOpsSecurity (066f29dd-f5ce-47af-b563-70146b2bb5b3)
**Data:** 2026-06-12
**Escopo:** front (index.html / admin.html / script.js / analytics.js), backend (api/), Vercel (vercel.json), Service Worker (sw.js).

> Arquivo privado, listado no `.gitignore` (`docs-local/`, `*.local.md`). NÃO enviar ao GitHub.

---

## TL;DR

- **Sem tokens MP ou credenciais Pix no client** — caminho de pagamento já está
  seguro via `api/create-preference.js` (Vercel) que consome
  `MP_ACCESS_TOKEN` de `process.env`. ✅
- **Chave Pix, nome do recebedor e cidade** são defaults do client
  (lidos de `localStorage` / hardcoded como fallback) — isso é a chave
  **pública** do recebedor, não segredo. ✅
- **Admin auth** é apenas `pass === 'admin' || pass === 'admin123'` em
  client-side. É a maior exposição. [TAA-13](/TAA/issues/TAA-13) cobre o
  rewrite; alinhado, **não duplicado** aqui.
- **CSP, HSTS, SRI, clickjacking, MIME sniffing**: não presentes no HTML
  estático; só alguns headers básicos via `vercel.json`.
- **Webhook do Mercado Pago** (`api/mp-webhook.js`) **não valida
  assinatura** (`x-signature` / `x-request-id`). Aciona efeito colateral
  (consulta `/v1/payments/{id}` com o token). Risco médio.
- **Sem rate limit** em `api/create-preference.js` e `api/payment-status.js`.
  Brute-force / credential stuffing de origem / DoS baixo.
- **LGPD:** dados de cliente (nome, telefone, endereço completo, hashes de
  senha) ficam 100% em `localStorage` do dispositivo, sem coleta central,
  sem backend próprio. Analytics já passa por allowlist PII-safe. ✅
  Falta: política de retenção explícita, termo de consentimento na
  captura de dados, e export/delete do titular (LGPD art. 18).
- **PII em log:** `console.log` da analytics expõe `email` no evento
  `guest_converted_to_registered` (`{ email: acc.email }`) — só que o
  `trackEvent` local **não** envia pra rede (apenas guarda no
  `localStorage`); o `pizzariaTrack` da analytics é o que vai pra rede,
  e ali é allowlist fechado (`ALLOWED_EVENTS` + `ALLOWED_PROP_KEYS`), que
  **não** inclui `email`. ✅ ainda assim, remove por defense-in-depth.
- **HTTPS-only:** site é hospedado em `pizzaria-premium.vercel.app` e
  `deyvyssonbr.github.io` (GitHub Pages). Ambos forçam HTTPS. ✅
- **Git history — token de teste MP encontrado e removido:** em commit
  `144d65a` (origem 2026-05, antes da hardening) o token **TEST-8866353739323709-…
  …327822767** ficou hardcoded como fallback em `assets/js/script.js` e em
  `admin.html` (form de configuração). O commit `249c194` (2026-06-03,
  `feat: real MP payment confirmation + security hardening`) **removeu** o
  token de `script.js` e do `admin.html`. A revisão confirma que o
  histórico no GitHub **já não contém** o token. ⚠️ **Ação obrigatória
  fora do escopo do dev:** rotacionar/revogar essa credencial no painel
  do Mercado Pago (Developers → Credenciais → revogar) caso tenha sido
  usada em ambiente público. Veja item 2 do cutuco do CTO. Documentado
  também em `CHANGELOG_LOCAL.md` (privado).

---

## Findings

| # | Severidade | Vetor | Local | Estado |
|---|---|---|---|---|
| F1 | **Crítico** | Auth admin em client-side, senha em código-fonte | `admin.html:3341-3343` (legado) | TAA-13 (não duplicar) |
| F1b | **Crítico** | Mesmo após v13, `admin.html:3566-3575` ainda usa `pass === 'admin' || pass === 'admin123'` literal-compare | `admin.html:3566-3575` (v13) | TAA-13 — reescrita já tem plano (Worker + KV) |
| F2 | Alto | Webhook MP sem validação de assinatura | `api/mp-webhook.js:36-71` | **Corrigido** (HMAC-SHA256 + replay ±5 min) |
| F3 | Alto | Sem CSP, SRI, HSTS, X-Frame-Options, Permissions-Policy | `index.html`, `admin.html`, `vercel.json` | **Corrigido** (HTML + vercel.json) |
| F3b | Médio | CSP com `unsafe-inline` em `script-src` (admin.html) e `style-src` | `admin.html:9` | Aceitável — admin.html ainda tem `<script>` inline legados; documentado p/ remoção na reescrita TAA-13 |
| F3c | Baixo | SRI ausente em `cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css` | `admin.html:16` | Cross-origin CSS dinâmico; aceito SRI=hash e `crossorigin="anonymous"` aplicado |
| F4 | Médio | Sem rate limit em endpoints de pagamento | `api/create-preference.js`, `api/payment-status.js`, `server.js` | **Corrigido** (20/60/120 req/min/IP, 429+Retry-After) |
| F5 | Médio | Console log com email em `guest_converted_to_registered` | `assets/js/script.js:4337` | **Corrigido** (payload `{}`) |
| F6 | Médio | LGPD: sem política de retenção, sem export/delete (art. 18) | `assets/js/script.js` (orders, customer) | **Parcial** — retenção 90d/365d ativa; export/delete em task dedicada |
| F7 | Baixo | Permissions-Policy parcial (faltam `payment`, `usb`, `serial`) | `vercel.json` | **Corrigido** (`payment=(self "https://www.mercadopago.com.br"), usb=(), serial=()`) |
| F7b | Informativo | Texto de consentimento LGPD (art. 7º, I) ausente no `auth-register` | `index.html` (auth-register) | Backlog — item dedicado de LGPD |
| F8 | Baixo | `api/payment-status.js` valida origem mas echoa back sem `Vary` | `api/payment-status.js:35-39` | nota |
| F9 | Informativo | `api/mp-webhook.js` aceita webhook não-assinado mas só lê do MP — sem efeito colateral gravável | `api/mp-webhook.js` | aceitável com F2 |
| F10 | Informativo | Hash de senha cliente é SHA-256 + salt (não PBKDF2/Argon2). Documentado em CHANGELOG_LOCAL.md v9. | `assets/js/script.js:3817` | aceitável (limitação assumida do projeto) |
| F11 | Informativo | WhatsApp redirect expõe nome+tell+endereço em `?text=` — isso é o modelo de negócio (cliente escolhe WhatsApp como canal) | `assets/js/script.js:837, 3020-3042` | aceitável (escopo do app) |
| F12 | **Crítico → Aberto** | Git history — token MP de teste (`TEST-8866…327822767`) esteve em `script.js` e `admin.html` | commit `144d65a` (add) → `249c194` (remove) | **Removido** do HEAD e do histórico revisado. Revogação no painel MP **é responsabilidade do owner** (CTO cutuco item 2) |

---

## Pentest manual do checkout + admin

### Checkout (cliente, `index.html`)

1. **Token MP vazando?** Abrir DevTools → Sources → `script.js`. Procurar
   `APP_USR`, `ghp_`, `access_token`. **Nada encontrado** — só lê
   `MP_LINK` (que é um link de pagamento público, não token). ✅
2. **Pix key no client?** `PIX_KEY` em `script.js:2` é hardcoded como
   fallback **do próprio dono da loja** (`5586994854771`) — é a chave
   pública Pix (que aparece no QR Code gerado). Não é segredo. ✅
3. **Cartão / número Pix em trânsito:** checkout de Cartão ou Pix em si
   não transita pelo nosso backend. Pix é gerado client-side (BRCode
   EMV), Cartão é via redirect MP (Checkout Pro). Não há POST de
   dados de cartão. ✅
4. **CSP no DevTools Console:** ao carregar a home, nenhum erro de CSP
   porque não existe CSP. Risco: injeção via qualquer JS de CDN
   comprometido. Mitigado parcialmente com SRI.

### Admin (`admin.html`)

1. **Tentar login:** `admin.html` → senha `admin` ou `admin123` → entra.
   Senha visível em código (`admin.html:3341`). Qualquer um com acesso
   ao repo tem a senha. **Crítico**, alinhado com TAA-13.
2. **Pós-login:** tudo o que admin faz (CRUD de pizzas, pedidos,
   fidelidade, zonas) grava em `localStorage` do **próprio browser**. Não
   há backend de admin. Vazamento = vazamento de dados do cliente final
   que usou esse mesmo browser. Risco depende do modelo de uso
   (admin usa o mesmo device que cliente? Sim, em PWA único). F1 cobre.
3. **Logout:** `sessionStorage.removeItem('admin_logged')` + reload.
   Suficiente para fechar a sessão, mas a senha continua em texto no
   HTML. F1.

---

## Plano de correção (PR de hardening)

### 1. `index.html` + `admin.html` — adicionar meta tags de segurança

```
<meta http-equiv="Content-Security-Policy" content="...">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
<meta http-equiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=(), payment=(self 'https://www.mercadopago.com.br'), usb=(), serial=()">
```

CSP (cliente):
```
default-src 'self';
script-src 'self' https://www.mercadopago.com.br https://*.mercadopago.com.br https://umami.pizzariapremium.com.br;
style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data: blob: https:;
connect-src 'self' https://viacep.com.br https://cep.awesomeapi.com.br https://www.mercadopago.com.br https://api.mercadopago.com https://umami.pizzariapremium.com.br;
frame-src 'self' https://www.mercadopago.com.br https://*.mercadopago.com.br;
frame-ancestors 'none';
base-uri 'self';
form-action 'self' https://www.mercadopago.com.br;
```

Sem `unsafe-eval` em script-src. `style-src 'unsafe-inline'` é necessário
porque o CSS admin usa `<style>` injetado.

Adicionar SRI em:
- `https://fonts.googleapis.com/css2?...` — não dá pra SRI em CSS
  cross-origin que retorna dynamicamente por UA. Aceitável sem SRI
  (compromisso conhecido do Google Fonts).
- `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`
  (admin.html) — **SRI possível**, basta fixar versão. Vamos adicionar.

### 2. `vercel.json` — endurecer headers

- HSTS (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`)
- CSP idem HTML
- `X-Frame-Options: DENY` (defesa contra clickjacking mesmo com `frame-ancestors`)
- Permissions-Policy mais ampla
- `Cross-Origin-Opener-Policy: same-origin` (vai quebrar se algum popup
  MP precisar de janela, então `same-origin-allow-popups` é mais seguro)

### 3. `api/mp-webhook.js` — validar assinatura

- Calcular `HMAC-SHA256(MP_WEBHOOK_SECRET, manifest)` e comparar com
  header `x-signature` (header `ts=<unix>.<v1>=<hmac>`).
- Rejeitar 401 se inválido, sem consultar `/v1/payments/{id}`.
- Replay protection: rejeitar `ts` fora de ±5 min.

### 4. Rate limit em `server.js` e api/

- In-memory bucket por IP em `api/create-preference.js` (10 req/min/IP).
- Retornar 429 com `Retry-After`.
- Anotar que o limite real é por região (Vercel faz cold start em
  múltiplas instâncias) — para produção, melhor usar Upstash/Vercel KV.

### 5. `assets/js/script.js` — remover `email` do trackEvent

- `trackEvent('guest_converted_to_registered', { email: acc.email })` →
  `trackEvent('guest_converted_to_registered', {})`.

### 6. LGPD: retenção + export

- Adicionar TTL em `premium_pizzaria_orders` (manter últimos 90 dias; ao
  carregar, truncar). Mesma coisa em `premium_pizzaria_customer` (sobrescrever
  último perfil é OK; manter histórico não é).
- Botão "Exportar meus dados" no drawer de conta (gera JSON com nome,
  email, phone, addresses, orders, points, coupons).
- Botão "Apagar minha conta" (zera `premium_pizzaria_*` do device).
- Texto curto de consentimento no auth-register (LGPD art. 7º, I —
  consentimento inequívoco para tratamento de dados para fins de
  entrega).

### 7. `index.html` + `admin.html` — bloquear `form-action` para MP

- `form-action 'self' https://*.mercadopago.com.br` para permitir o
  redirect do Checkout Pro sem expor o site a `form-action` arbitrário.

### 8. Server.js — adicionar helmet-like headers mínimos

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`

---

## Fora de escopo (recomendado, não cabe nesta task)

- Migrar para Firebase Auth + Firestore para admin (tarefa TAA-13).
- Migrar contas locais (SHA-256 + salt) para PBKDF2 ou Argon2 via WebCrypto
  (atualmente já documentado como limitação assumida em v9).
- Adicionar captcha invisível (Cloudflare Turnstile) em `auth-register`
  e `auth-login` para evitar enumeração de e-mails. Backlog.
- Mover `script.js` (5655 linhas) para módulos ES + bundler, habilitando
  hashing real de SRI em código nosso. Backlog.
- CSP `report-uri` / `report-to` para receber relatórios de violação.
  Backlog.

---

## Verificação

- Rodar `npx vitest run` em `D:\PaperClip` (Vitest: **200/200 passando**, run em 2026-06-12 04:44Z).
- `node server.js` (PORT=4101) smoke:
  - Rate limit: 20 POSTs em `/api/create-preference` retornam 500/400 (sem token MP),
    21°+ retornam **429** com `Retry-After` (`RATE_MAX_REQ['/api/create-preference']=20`).
  - Webhook sem `MP_WEBHOOK_SECRET`: **401** `{"error":"Invalid signature"}`.
  - Headers estáticos em `index.html`: `X-Content-Type-Options: nosniff`,
    `Referrer-Policy: strict-origin-when-cross-origin`,
    `X-Frame-Options: DENY`,
    `Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(self "https://www.mercadopago.com.br"), usb=(), serial=(), …`.
- Pentest manual: devtools → Application → LocalStorage → após mudar
  system clock 91 dias, abrir `index.html` → orders deve estar
  truncado.

---

## Itens abertos (handover)

| Item | Owner sugerido | Por que não é TAA-19 |
|---|---|---|
| TAA-13 — reescrita auth admin (Worker + KV + cookie httpOnly) | DevOpsSecurity | Acoplado, escopo próprio |
| F3b — `unsafe-inline` em `script-src` (admin.html) | junto com TAA-13 | Reescrita admin vai enxugar o inline |
| F6 (LGPD export/delete) — botões no drawer de conta + consentimento no auth-register | DevOpsSecurity / UX | task dedicada |
| F7b — Texto de consentimento LGPD no auth-register | DevOpsSecurity / UX | task dedicada |
| F12 (revogação do token MP TEST-8866…) | **owner do projeto** | Não cabe ao dev rotacionar; ver [https://www.mercadopago.com.br/developers/panel/credentials](https://www.mercadopago.com.br/developers/panel/credentials) |
| SRI em Font Awesome 6.4.0 (cdnjs) | backlog | Cross-origin CSS dinâmico; SRI=hash exigiria congelar versão |
| Captcha invisível (Turnstile) em auth-register/login | backlog | Mitiga enumeração de e-mail |
| CSP `report-uri` | backlog | Observabilidade |
| Migrar SHA-256+salt → PBKDF2/Argon2 (WebCrypto) | backlog | Limitação assumida do projeto |
| Rate limit distribuído (Upstash/Vercel KV) | backlog | In-memory é best-effort em serverless |
| Mover `script.js` (5916 linhas) para módulos ES + bundler | backlog | Habilita SRI em código próprio |

---

## Changelog deste audit

- v1 (2026-06-12 04:00Z): criação do documento, findings F1–F11, plano de
  hardening, priorização.
- v1.1 (2026-06-12 04:45Z): execução completa — F2-F7 corrigidos in-place
  verificados via smoke; F1b (auth admin v13) e F3b/F3c (CSP com
  `unsafe-inline` e SRI cross-origin) anotados; F12 (token MP de teste
  no histórico) documentado com nota de revogação. Handover ao CTO.
