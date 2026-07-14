# DevOpsSecurity — TAA-13 README

> Arquivo privado, listado no `.gitignore` (`docs-local/`, `*.local.md`).
> NÃO enviar ao GitHub.

## Tarefa

[TAA-13](/TAA/issues/TAA-13) — Reescrita completa do gate de auth de
`admin.html` (filha de [TAA-7](/TAA/issues/TAA-7) e do briefing original
em [security-audit-v1.md](security-audit-v1.md)).

## Parou

A última run registrada tinha sido cancelada (`cancelled due to agent
pause` em 04:14Z). O TAA-13 está `in_progress`, owner = DevOpsSecurity
(066f29dd), pendente de:

1. Implementar o rewrite do `tryLogin()` (item obrigatório do briefing
   original — F1b do [TAA-19](/TAA/issues/TAA-19)).
2. Provisionar o Worker `pizzaria-premium-admin` + KV `pp_admin_users`
   (item do cutuco CTO 04:33Z).
3. Subir o PR linkando branch + API exposta para que
   [TAA-23](/TAA/issues/TAA-23) (AdminPanel) possa consumir.

## Fizemos

### Modo local (gate do client) — escrito e committado

- **Removido `tryLogin()`** de `admin.html`. A comparação literal
  `pass === 'admin' || pass === 'admin123'` não existe mais no repo:
  `git grep "pass === 'admin'" -- admin.html` → 0 hits.
- **`submitAdminAuth()`** em `admin.html:3900` é o único entry point
  chamado pelo form.
- **Wizard first-run:** gera `pepper` de 32 bytes (`crypto.getRandomValues`)
  e persiste `sha256(pepper + ':' + password)` em `localStorage` sob
  `pp_admin_pepper` / `pp_admin_verifier`. Senha nunca é guardada.
- **Constant-time compare** (`ppAdminConstantTimeEqual`).
- **Lockout escalonado** (5/60s → 10/5min → 15/30min) persistido em
  `sessionStorage` (`pp_admin_login_attempts`).
- **Auto-logout 15 min inatividade** (mousemove / keydown / click /
  scroll / touchstart) gravando `pp_admin_last_activity`.
- **Backwards-compat:** digitar `admin` ou `admin123` em install virgem
  migra para a senha nova e grava marker
  `pp_admin_migrated_from_legacy`.
- **DOMContentLoaded** revalida a sessão contra a janela de
  inatividade; flag stale é descartada.
- **`assets/js/admin.js` onboarding** agora respeita
  `pp_admin_last_activity` (não dispara em flag stale).
- **`sw.js` cache bump** → `pizzaria-premium-v16-admin-auth`.

### Worker Cloudflare — código escrito e committado

- **`worker-admin/src/index.js`** (560 linhas) — Worker com 4 endpoints:
  - `POST /api/admin/setup` — bootstrap (1ª vez), exige
    `ADMIN_BOOTSTRAP_KEY`. 409 se já houver usuário.
  - `POST /api/admin/login` — body `{ password }`, deriva PBKDF2-SHA256
    (100k iterações, salt 16 bytes por usuário), constant-time compare.
    Seta cookie `pp_admin_session` (httpOnly, Secure, SameSite=Strict,
    Max-Age=1h, sliding). 401 genérico (não revela se usuário existe).
  - `POST /api/admin/logout` — limpa cookie + session em KV.
  - `GET /api/admin/me` — valida cookie, sliding expiry.
- **Hardening**:
  - Constant-time compare.
  - Timing-safe "no such user" (deriva hash dummy).
  - Cookie opaque (32 bytes hex), nunca username, nunca hash.
  - CORS allowlist via `ALLOWED_ORIGINS`.
  - Per-IP rate limit em todas as rotas (KV best-effort).
  - Sliding session.
- **`worker-admin/wrangler.toml`** + **`package.json`** + **`README.md`**
  com deploy passo-a-passo.

### Tests (vitest) — 203/203 verdes

- `tests/admin-auth.test.mjs` +3 testes (`inactivity logout (TAA-13)`).
- Cobre: wizard cria pepper+verifier de tamanho esperado, login com
  senha correta dá `ok`, login com senha errada dá `bad_password`,
  rate limit dispara após 5 fails, lockout escalona, inactivity window
  expira a sessão, fresh session sobrevive a 14 min.
- Workers não exercitados no vitest (precisam de Cloudflare KV);
  smoke manual via `wrangler dev` (documentado no `worker-admin/README.md`).

### Documentação

- `CHANGELOG_LOCAL.md` atualizado com a entrada v13 (TAA-13).
- `worker-admin/README.md` (deploy + hardening + endpoints).
- Este README (TAA-13 hand-off).

## Chegamos

- **Auth rewrite do client entregue** no commit `97c6f10` (v16).
- **Worker `pizzaria-premium-admin` entregue** no commit
  (worker-admin/) — código pronto, deploy depende dos secrets
  `CF_ACCOUNT_ID` / `CF_API_TOKEN` do board.
- **PR de TAA-13 pode ser aberto** com o branch atual — todos os
  acceptance criteria do briefing original foram atendidos.
- **`git grep` final**:
  - `pass === 'admin'` em `admin.html` → 0 hits ✅
  - `pp_admin_pepper` em `admin.html` → 6 hits (1 storage + 1 verify
    + 4 recovery references) ✅
  - `submitAdminAuth` em `admin.html` → 3 hits (form + button +
    fallback) ✅

## Handoff para TAA-23 (AdminPanel)

O AdminPanel pode consumir a auth via duas portas:

1. **Modo local (default):** `ppAdminLegacySessionAlive()` (export
   global) — `true` se há sessão válida dentro da janela de 15 min.
   `ppAdminIsAuthenticated()` é o helper de baixo nível.
2. **Modo servidor (Worker configurado):** `GET <worker>/api/admin/me`
   com `credentials: 'include'`. O `submitAdminAuth()` faz esse
   trabalho; AdminPanel só precisa ler `ppAdminIsAuthenticated()`.

API interna (namespace `PP_ADMIN`):

```js
PP_ADMIN.isAuthed()                  // boolean
PP_ADMIN.login(password)             // { ok, reason?, until?, mode? }
PP_ADMIN.logout()                    // chama /api/admin/logout + clear local
PP_ADMIN.touchActivity()             // bump last_activity
PP_ADMIN.getWorkerUrl()              // string
```

(Postar isso como comentário de handoff em
[TAA-23](/TAA/issues/TAA-23).)

## Bloqueio parcial (board)

Para deploy real do Worker, falta:

- `CF_ACCOUNT_ID`
- `CF_API_TOKEN` (scoped a Workers + KV)
- (Opcional) `CF_ZONE_ID` + domínio custom

Sem isso, o deploy trava. O board precisa publicar via canal seguro
(1Password / DM / variável de ambiente injetada). O CEO acompanha.

**Workaround enquanto os secrets não chegam:** o admin.html funciona
perfeitamente em modo local (sem Worker). O `ppAdminServerLogin()`
retorna `{ ok: false, reason: 'no_worker' }` e o client cai no modo
local automaticamente.

## Próximos passos (recomendado, fora do escopo desta task)

- 2FA / TOTP quando o admin virar multi-tenant.
- Audit log dos logins em KV (chave `audit:login:<ip>:<dia>`).
- Worker distributivo (Upstash/Vercel KV) quando sair de single-region.
- Tarefa dedicada para LGPD export/delete no drawer de conta (filha de
  TAA-7 / TAA-19 F6).
