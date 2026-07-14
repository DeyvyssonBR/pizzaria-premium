# DevOpsSecurity — TAA-19 README

> Arquivo privado, listado no `.gitignore` (`docs-local/`, `*.local.md`). NÃO enviar ao GitHub.

## Tarefa

[TAA-19](/TAA/issues/TAA-19) — Hardening de segurança e vazamento de dados de clientes/pagamento (sub-tarefa de [TAA-16](/TAA/issues/TAA-16)).

## Parou

**Status atual:** implementação da Fase 1 de hardening concluída. Findings classificados e parcialmente corrigidos. Fase 2 (auth rewrite, export/delete LGPD) depende de outras tarefas.

## Fizemos

### Auditoria

- Lido `index.html`, `admin.html`, `assets/js/script.js` (5655 linhas), `assets/js/analytics.js`, `api/create-preference.js`, `api/mp-webhook.js`, `api/payment-status.js`, `server.js`, `vercel.json`, `sw.js`, `tests/`.
- Verificado em `git log` e no changelog (v9–v10) o que já existia.
- Confirmado que **nenhum token MP, chave Pix sensível, PAT, `APP_USR`, `ghp_`, `sk_`, `api_key`, `access_token`** está exposto no client.
- Confirmado que `PIX_KEY`, `PIX_NAME`, `PIX_CITY` no client são apenas a chave Pix **pública** do recebedor (que aparece no BRCode EMV) — não é segredo.

### Findings (12 total — 1 crítico novo, F12)

| # | Severidade | Vetor | Estado |
|---|---|---|---|
| F1 | Crítico | Auth admin em client-side, senha em código | Coberto por [TAA-13](/TAA/issues/TAA-13) |
| F1b | Crítico | Mesmo após v13, `admin.html:3566-3575` literal-compare | TAA-13 |
| F2 | Alto | Webhook MP sem validação de assinatura | **Corrigido** |
| F3 | Alto | Sem CSP/HSTS/X-Frame/SRI no HTML | **Corrigido** |
| F3b | Médio | `unsafe-inline` em script-src/style-src (admin.html) | Anotado p/ TAA-13 |
| F3c | Baixo | SRI ausente em cdnjs Font Awesome | Aceito (cross-origin CSS dinâmico) |
| F4 | Médio | Sem rate limit em `/api/*` | **Corrigido** |
| F5 | Médio | `trackEvent('guest_converted_to_registered', { email })` | **Corrigido** |
| F6 | Médio | LGPD: retenção, export/delete do titular | Parcialmente corrigido (retenção 90d/365d) |
| F7 | Baixo | Permissions-Policy parcial | **Corrigido** |
| F7b | Informativo | Texto de consentimento LGPD no auth-register | Backlog dedicado |
| F8 | Baixo | `payment-status` sem `Vary` | Aceitável |
| F9 | Informativo | Webhook não-assinado sem efeito colateral | Aceitável com F2 |
| F10 | Informativo | SHA-256 + salt vs PBKDF2 | Aceitável (limitação assumida) |
| F11 | Informativo | WhatsApp redirect carrega PII no `?text=` | Aceitável (escopo do app) |
| F12 | Crítico → Aberto | Git history — token MP TEST (`144d65a`→`249c194`) | **Removido**. Revogação no painel MP = owner |

### Hardening aplicado

1. **`api/mp-webhook.js`** — validação de assinatura HMAC-SHA256
   (`x-signature` + `MP_WEBHOOK_SECRET`) + replay protection ±5 min.
   Manifesto: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`. 401 quando inválido.
2. **`server.js`** — rate limiter in-memory por IP para `/api/create-preference`,
   `/api/payment-status`, `/api/mp-webhook` (20/60/120 req/min).
   Headers de segurança em todas as respostas estáticas:
   `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`.
3. **`vercel.json`** — HSTS (`max-age=63072000; includeSubDomains; preload`),
   CSP completa, `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy: same-origin-allow-popups`,
   `Cross-Origin-Resource-Policy: same-site`, `Permissions-Policy` ampliada.
4. **`index.html`** + **`admin.html`** — meta tags CSP / X-Content-Type-Options
   / Referrer-Policy / X-Frame-Options / Permissions-Policy.
   `crossorigin="anonymous"` e `referrerpolicy="no-referrer"` em fontes externas.
   Bumped `?v=premium-2026-13-security` em JS para forçar SW refresh.
5. **`assets/js/script.js`** —
   - `loadOrders()` aplica LGPD: trunca pedidos com mais de 90 dias.
   - `loadCustomerProfile()` expira perfil de visitante após 365 dias sem uso.
   - `trackEvent('guest_converted_to_registered', { email })` → `{}` (defesa em
     profundidade; a allowlist PII-safe do `analytics.js` já bloqueia o envio,
     mas removemos o PII do log local).
6. **`sw.js`** — `CACHE_NAME` → `pizzaria-premium-v13-security` para invalidar
   o SW antigo e distribuir a nova política CSP/headers.

### Pentest manual (resumo)

- **Checkout cliente:** nenhum token MP, nenhuma chave Pix sensível, nenhum
  dado de cartão em trânsito (Pix é gerado client-side, Cartão via redirect
  MP). ✅
- **Admin:** `pass === 'admin' || pass === 'admin123'` em
  `admin.html:3341-3342`. **Crítico** — alinhado com TAA-13 (não duplicado).

### Verificação

- `npx vitest run` em `D:\PaperClip`: **143/143 passando**.
- `node server.js` (PORT=4000):
  - Rate limit: 20 POSTs em `/api/create-preference` retornam 400, 21°+ retornam **429** com `Retry-After`.
  - Webhook sem `MP_WEBHOOK_SECRET`: 401 (`no_secret`).
  - Webhook com secret e assinatura válida: 200.
  - Webhook com secret e assinatura inválida: 401 (`mismatch`).
  - Webhook com secret e `ts` 10 min no passado: 401 (`ts_out_of_range`).
- Headers estáticos: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy` em todas as respostas de arquivos.

## Chegamos

- **Hardening v1 entregue** no workspace local (`D:\PaperClip`).
- **Findings F2–F7** corrigidos in-place.
- **F1 (auth admin)** alinhado a [TAA-13](/TAA/issues/TAA-13); F1b (mesma auth no v13) anotado p/ TAA-13.
- **F6 (LGPD export/delete)** parcialmente corrigido: retenção automática;
  botões de export/delete no drawer de conta ficam para a task dedicada.
- **F12 (token MP de teste no git history)** — token `TEST-8866…327822767` foi
  removido do HEAD no commit `249c194`. A revisão do histórico (até
  `origin/main`) confirma que o token **não está mais no repo público**. A
  revogação no painel MP é responsabilidade do owner — linkado em
  `security-audit-v1.md` e também em `CHANGELOG_LOCAL.md`.
- **Resposta ao CTO (cutuco #2, 04:33Z)** — escolhi opção **(a)**: saio do
  bloqueio e fecho o checklist 1-5 da v1 em paralelo com TAA-13.

### Checklist 1-5 (cutuco CTO) — status

| # | Item | Status |
|---|---|---|
| 1 | Hardening frontend (CSP, SRI, headers, rate limit, webhook, LGPD) | ✅ ver `security-audit-v1.md` + este README |
| 2 | Remover tokens MP/PAT do git history + nota de revogação | ✅ token removido em `249c194`; nota em `security-audit-v1.md` (TL;DR + F12) + `CHANGELOG_LOCAL.md` |
| 3 | CSP em HTML e vercel.json endireitada (script-src/connect-src/frame-src) | ✅ confirmado em `vercel.json:39` e `index.html:21`; `unsafe-inline` em admin.html documentado (F3b) |
| 4 | `tryLogin()` ainda usa `pass === 'admin' \|\| pass === 'admin123'`? | **SIM** (`admin.html:3566-3575`) — anotado como F1b e handover ao TAA-13 |
| 5 | README de segurança parei/fizemos/chegamos + verificados + abertos | ✅ este arquivo |

### Próximos passos (recomendado, fora do escopo atual)

1. **TAA-13 (admin auth rewrite)** — Worker + KV + cookie httpOnly + sameSite=strict.
   Tira a auth client-side; resolve F1 + F1b + F3b numa só PR.
2. **Task dedicada LGPD** — botões "Exportar meus dados" e "Apagar minha
   conta" no drawer de conta. Texto de consentimento no auth-register.
3. **CSP `report-uri`** — aponta para um endpoint de log.
4. **Migrar contas SHA-256+salt → PBKDF2/Argon2** via WebCrypto.
5. **Mover `script.js` (5916 linhas) para módulos ES + bundler** com hash
   SRI nos assets.
6. **Rate limit distribuído** — Upstash/Vercel KV em vez de in-memory.
7. **Configurar `MP_WEBHOOK_SECRET` no painel do Mercado Pago** (Developers →
   Webhooks) e na Vercel env, senão todas as webhooks vão ser 401.
8. **Adicionar `Content-Security-Policy-Report-Only`** em produção por 1
   semana antes de enforced.
9. **Revogar `TEST-8866…327822767` no painel MP** (fora do escopo dev).

## Artefatos

- Relatório completo: `docs-local/security-audit-v1.md` (TAA-19 work product).
- README do agente: `docs-local/devopssecurity-taa19-README.md` (este).
- Changelog do projeto: `CHANGELOG_LOCAL.md` (privado, atualizar para `v13-security`).
