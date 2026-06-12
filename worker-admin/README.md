# Pizzaria Premium — Admin Auth Worker (TAA-13)

> Worker Cloudflare que substitui o gate client-side de `admin.html` (a
> comparação literal `pass === 'admin' || 'admin123'`) por auth real: PBKDF2
> server-side, cookie httpOnly, KV para usuários + sessões.

## Endpoints

| Método | Path                   | Descrição |
|--------|------------------------|-----------|
| `POST` | `/api/admin/setup`    | Bootstrap do **primeiro** admin. Body `{ username, password, bootstrapKey }`. Requer `ADMIN_BOOTSTRAP_KEY`. Retorna 409 se já houver usuário. |
| `POST` | `/api/admin/login`    | Body `{ password }` (username default `admin`). Deriva PBKDF2, compara constant-time, cria sessão em KV e seta cookie `pp_admin_session` (httpOnly, Secure, SameSite=Strict, 1h). 401 = `invalid` (genérico). |
| `POST` | `/api/admin/logout`   | Limpa o cookie e a sessão em KV. |
| `GET`  | `/api/admin/me`       | Valida o cookie, retorna `{ ok, user, expiresAt }`. Estende a expiração (sliding). |

## Storage (KV `pp_admin_USERS`)

| Chave              | Valor | TTL |
|--------------------|-------|-----|
| `user:<username>`  | JSON `{ username, role, saltHex, pbkdf2Hex, iterations, createdAt }` | permanente |
| `session:<token>`  | JSON `{ username, expiresAt }` | 2× SESSION_TTL_S |
| `rl:<route>:<ip>:<bucket>` | contador do rate limit | 2 min |

## Variáveis de ambiente

| Nome                | Obrigatório | Default | Notas |
|---------------------|-------------|---------|-------|
| `ADMIN_BOOTSTRAP_KEY` | só p/ setup | — | Compare no `POST /api/admin/setup`. Use um valor descartável e remova depois. |
| `ALLOWED_ORIGINS`   | não | lista hardcoded | CSV de origins com CORS. |
| `PBKDF2_ITERATIONS` | não | 100_000 | Iterações PBKDF2-SHA256. |
| `PP_ADMIN_USERS` (binding) | sim | — | Namespace KV. |

## Setup (1ª vez)

```bash
cd worker-admin
npm install
wrangler kv:namespace create PP_ADMIN_USERS        # copia o id → wrangler.toml
wrangler kv:namespace create PP_ADMIN_USERS --preview
wrangler secret put ADMIN_BOOTSTRAP_KEY             # cola um valor descartável
npm run deploy                                       # pega a URL pública
```

Depois de subir, faça o primeiro admin com `?setup=1` em `admin.html`, ou
chame direto:

```bash
curl -X POST https://pizzaria-premium-admin.<conta>.workers.dev/api/admin/setup \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"<senha forte>","bootstrapKey":"<ADMIN_BOOTSTRAP_KEY>"}'
```

## Integração com `admin.html`

1. Abra `admin.html` no navegador.
2. Na aba **Configurações**, cole a URL do Worker no campo "URL do Worker
   admin" (a chave nova `premium_pizzaria_admin_worker_url`, exposta pela
   PR TAA-13).
3. Recarregue. O `submitAdminAuth()` detecta o modo "Servidor" e posta
   `{ password }` para `/api/admin/login`. O cookie de sessão é mantido
   pelo browser; `logout()` chama `/api/admin/logout`.

Se a URL do Worker **não** estiver configurada, `admin.html` cai no modo
local (pepper + verifier em `localStorage`) — ainda seguro, apenas single-
device.

## Hardening

- **PBKDF2-SHA256** com salt de 16 bytes e 100k iterações. Senha nunca é
  armazenada; só o derivado.
- **Constant-time compare** (`constantTimeEqual`).
- **Timing-safe** para "no such user" (deriva um hash dummy).
- **Cookie httpOnly + Secure + SameSite=Strict** — JS do client não
  consegue ler, CSRF bloqueado, MitM só com HTTPS quebrado.
- **Rate limit por IP** em todas as rotas (KV best-effort).
- **Resposta genérica 401** — nunca revela se o username existe.
- **Sliding session** (renova `expiresAt` a cada `/me`).
- **CORS** allowlist via `ALLOWED_ORIGINS`.

## Limitações honestas

- KV é best-effort: uma queda do Cloudflare derruba o login. PWA ainda
  funciona em modo local (single-device) sem o Worker.
- Sem 2FA / TOTP. Para um único operador num único device é aceitável;
  para multi-tenant adicione.
- Sem auditoria de logins bem-sucedidos — se quiser, plugar um KV key
  `audit:login:<ip>:<dia>`.

## Tests

A suíte do projeto (`npx vitest run` em `D:\PaperClip`) não exercita este
Worker diretamente porque requer Cloudflare KV. O que está coberto:

- `tests/admin-auth.test.mjs` cobre a lógica local (pepper + lockout +
  inactivity) que é a camada 1.
- Manual smoke (com `wrangler dev`): setup, login, me, logout.
