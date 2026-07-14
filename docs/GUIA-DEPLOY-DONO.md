# 🚀 GUIA DE DEPLOY — Pizzaria Premium

> **Para:** Dono da Pizzaria Premium Teresina
> **Tempo estimado:** 30-45 minutos
> **Nível:** Técnico básico (segue passos)

Este guia coloca o site no ar com pagamento Pix real. Você precisa de:
- Conta no **GitHub** (já tem)
- Conta no **Cloudflare** (gratuita)
- Conta no **Mercado Pago** (já tem)

---

## 📋 Pré-requisitos (uma vez)

### 1. Verificar credenciais

| Plataforma | O que precisa | Onde pegar |
|---|---|---|
| Mercado Pago | Access Token (`APP_USR-...`) | [developers.mercadopago.com.br](https://developers.mercadopago.com.br/) → Credenciais |
| Cloudflare | Conta criada | [cloudflare.com](https://dash.cloudflare.com/sign-up) (grátis) |

---

## 🎯 Passo 1: Vercel (site principal)

O site estática já roda no GitHub Pages. Vercel é opcional, mas recomendada para cache SSL mais rápido.

### Se quiser só GitHub Pages (mais simples):
- ✅ **Já está no ar!** [deyvyssonbr.github.io/pizzaria-premium](https://deyvyssonbr.github.io/pizzaria-premium/)
- Pule para o **Passo 2**.

### Se quiser Vercel (recomendado):
1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub.
2. Clique **"Add New Project"** → importe `deyvyssonbr/pizzaria-premium`.
3. Framework: **Other** (não detectar automaticamente).
4. Build Command: deixar vazio.
5. Output Directory: deixar vazio (raiz).
6. Clique **Deploy**.

**URL final:** `https://pizzaria-premium.vercel.app`

---

## 🎯 Passo 2: Cloudflare Worker (backend de pagamentos)

Este Worker processa Pix, confirma pagamentos via webhook e guarda status.

### 2.1. Instalar Wrangler (CLI)

```bash
# No Terminal (Windows: PowerShell ou Git Bash)
npm install -g wrangler
wrangler login   # abre navegador para autenticar
```

### 2.2. Criar namespace KV (banco de dados do Worker)

```bash
cd D:\PaperClip\worker
npm install
wrangler kv:namespace create MP_TX
```

Você vai ver algo assim:
```
{ "id": "abc123def456...", "title": "MP_TX" }
```

**Anote o `id`** (vai usar no passo 2.4).

### 2.3. Configurar secrets (credenciais)

```bash
# Access Token de PRODUÇÃO do Mercado Pago
wrangler secret put MP_ACCESS_TOKEN
# Cole: APP_USR-... (seu token real)

# Segredo do webhook (crie uma senha forte, ex: 32 caracteres aleatórios)
wrangler secret put MP_WEBHOOK_SECRET
# Cole: sua-senha-secreta-aleatória-aqui
```

### 2.4. Atualizar wrangler.toml

Abra `D:\PaperClip\worker\wrangler.toml` e **descomente** o bloco `[[kv_namespaces]]`, substituindo o ID:

```toml
[[kv_namespaces]]
binding = "MP_TX"
id = "abc123def456..."  # ← substitua pelo ID do passo 2.2
preview_id = "xyz789..."  # ← opcional, rode `wrangler kv:namespace create MP_TX --preview`
```

### 2.5. Deploy do Worker

```bash
cd D:\PaperClip\worker
npm run deploy
```

**URL final do Worker:** `https://pizzaria-premium-mp.seu-subdominio.workers.dev`

**Anote esta URL** — vai precisar no Passo 4.

---

## 🎯 Passo 3: Configurar Webhook no Mercado Pago

1. Vá em [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers/panel/app) → sua aplicação.
2. **Webhooks** → **Criar**:
   - **URL:** `https://pizzaria-premium-mp.seu-subdominio.workers.dev/api/mp/webhook`
   - **Eventos:** `payment` (marcar todos: created, updated, etc.)
3. **Anote o Secret do Webhook** (mostrado após criar).
4. Rode no terminal:
   ```bash
   cd D:\PaperClip\worker
   wrangler secret put MP_WEBHOOK_SECRET
   # Cole o Secret do Webhook do passo 3
   ```

---

## 🎯 Passo 4: Conectar site → Worker

No painel admin do site:

1. Acesse `admin.html` (login como admin).
2. Vá em **Configurações** → aba **Mercado Pago**.
3. Preencha:
   - **Worker URL:** `https://pizzaria-premium-mp.seu-subdominio.workers.dev`
   - **Integração:** `worker` (não `link`)
4. **Salvar**.

---

## ✅ Checklist Final

- [ ] Site no ar (GitHub Pages ou Vercel)
- [ ] Cloudflare Worker deployado
- [ ] Secret `MP_ACCESS_TOKEN` configurado
- [ ] Secret `MP_WEBHOOK_SECRET` configurado
- [ ] KV namespace `MP_TX` no wrangler.toml
- [ ] Webhook criado no painel MP
- [ ] Admin do site aponta para Worker URL
- [ ] **Teste:** faça um pedido de R$ 0,01 e confirme se o Pix aparece

---

## 🆘 Troubleshooting

### Worker não responde
```bash
cd D:\PaperClip\worker
wrangler tail  # mostra logs em tempo real
```

### Pix não confirma
- Verifique se o webhook URL está acessível publicamente.
- Veja logs: `wrangler tail` enquanto faz um pedido de teste.

### Token inválido
- Pegue o token de **produção** (não o de teste).
- Verifique se não há espaços antes/depois do token.

---

*Dúvidas? Contate o desenvolvedor. Última atualização: 19/06/2026.*
