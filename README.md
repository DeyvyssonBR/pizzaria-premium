# 🍕 Pizzaria Premium Teresina

Plataforma interativa premium de cardápio digital e pedidos diretos via WhatsApp para a **Pizzaria Premium Teresina**. Desenvolvido com foco absoluto em alta performance, design visual premium e experiência mobile-first impecável.

---

## 🚀 Resumo do Projeto

O site é uma **Single Page Application (SPA)** de alta conversão, construída com HTML5 semântico, CSS3 customizado e JavaScript nativo. Ele foi projetado para encantar o cliente logo no primeiro olhar através de gradientes modernos, efeitos de vidro (glassmorphism), animações sutis e um fluxo de montagem de pizza extremamente intuitivo.

---

## 🛠️ O que foi Desenvolvido e Otimizado recentemente

### 1. ⚙️ Painel Administrativo Completo (`admin.html`)
* **Gestão de Itens:** Adicione, edite e remova sabores de pizzas, bebidas, acompanhamentos e combos diretamente pelo navegador.
* **Configurações Gerais:** Gerencie dinamicamente o número do WhatsApp de recebimento de pedidos, a Chave Pix da loja, o nome e cidade do beneficiário Pix, e o link de pagamento do Mercado Pago.
* **Sincronização:** Os dados ficam salvos de forma persistente no `localStorage` do dispositivo e atualizam o cardápio público da página inicial instantaneamente.
* **Acesso Seguro:** Acesso protegido por senha administrativa (`admin`).

### 2. ⚡ Pix EMV Dinâmico Client-Side & QR Code
* **Gerador BR Code Nativo:** Algoritmo implementado em JavaScript puro com cálculo real de **CRC16 (CCITT)** para gerar a linha digitável do Pix Copia e Cola automaticamente com base no total do carrinho.
* **QR Code Dinâmico:** Exibição do QR Code de pagamento gerado em tempo real.
* **Botão Copiar Pix Animado:** Efeitos visuais de brilho metálico correndo no botão, ícone pulando dinamicamente e cor escura de alto contraste para máxima legibilidade.

### 3. 💳 Mercado Pago & Mercado Pay
* **Checkout Integrado:** Opção de pagamento online integrada ao fluxo de finalização.
* **Link Customizável:** Redirecionamento direto para a preferência de pagamento criada no Mercado Pago, configurada livremente pelo administrador no painel.

### 4. 🛵 Fluxo de Checkout no Drawer & Navegação
* **Passos Fluidos:** Organização sequencial dos passos do carrinho (Itens ➔ Identificação ➔ Entrega e Pagamento ➔ Detalhes do Pagamento / Pix ou Mercado Pago ➔ Sucesso).
* **Navegação de Retorno:** Botões "Voltar ao Método de Pagamento" e "Voltar" totalmente integrados, permitindo trocar o método a qualquer momento sem perder o pedido.
* **Botões Focados e Premium:** O botão final do WhatsApp foi repensado em **verde WhatsApp vibrante com o logo oficial**, sombra pulsante de destaque e largura compactada e centralizada no mobile e desktop.
* **Rolagem Automática (Foco de Sabor):** Ao mudar a modalidade da pizza na tela de montagem, o modal desce com rolagem automática suave em direção à barra de busca de sabores.

---

## 📍 Ponto de Parada Atual
* **Estado do Código:** Os arquivos `index.html`, `admin.html`, `assets/css/styles.css` e `assets/js/script.js` estão limpos, integrados, responsivos e sem bugs de script.
* **Rodapé Oficial:** O rodapé está configurado com o seguinte texto oficial solicitado:
  ```text
  Verde Lar / Avenida Senador Sigefredo Pacheco, 4727
  Teresina - PI
  2026 — Pizzaria Premium
  Desenvolvido por Scheeren Company com ☕ & ❤️
  ```

---

---

## 🚀 Deploy (Vercel)

> **⚠️ ATENÇÃO:** O deploy Vercel foi configurado mas **nunca foi finalizado** — o projeto precisa ser importado no painel Vercel (ação manual do dono do repositório, ver abaixo). Enquanto isso, o site continua no **GitHub Pages** em `https://deyvyssonbr.github.io/pizzaria-premium/`.

O projeto é publicado continuamente na **Vercel** a partir do branch `main` deste repositório. Por que Vercel e não GitHub Pages:

- HTTPS automático no subdomínio gratuito (ex.: `pizzaria-premium.vercel.app`).
- Suporta a **função serverless** `api/create-preference.js` (Mercado Pago) — o GitHub Pages é estático puro e não atende.
- Variável de ambiente `MP_ACCESS_TOKEN` fica protegida no servidor, nunca exposta ao cliente.
- Deploy a cada push em `main`.

### Configuração inicial (ação manual — ~5 min)

O `vercel.json` e a função `/api/create-preference.js` já estão commitados no `main`. Falta apenas importar o projeto:

1. Acessar [vercel.com/new](https://vercel.com/new) → "Import Git Repository" → autorizar GitHub → escolher `deyvyssonbr/pizzaria-premium`.
2. **Framework Preset:** `Other`
3. **Root Directory:** `./` (default)
4. **Build Command:** deixar vazio
5. **Output Directory:** deixar vazio
6. Em **Environment Variables**, adicionar:
   - `MP_ACCESS_TOKEN` = token de produção do Mercado Pago (nunca comitar)
7. Clicar **Deploy** (~1 minuto)
8. Em **Settings → Domains**, configurar alias para `pizzaria-premium.vercel.app`

O arquivo `vercel.json` controla:
- **SPA rewrites**: todas as rotas caem em `index.html` (cliente-side routing)
- **Cache de assets**: `/assets/*` por 1 ano (immutable), `sw.js` e `manifest.json` sem cache
- **Headers de segurança**: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`

### Trocar para o domínio próprio (quando aprovado)

Quando o domínio `pizzariapremium.com.br` for comprado:

1. Vercel → **Project → Settings → Domains → Add** → digitar `pizzariapremium.com.br` e `www.pizzariapremium.com.br`.
2. A Vercel mostrará 2 registros DNS para criar no painel do registrador (Registro.br):
   - **Apex (`pizzariapremium.com.br`)** → `A` apontando para `76.76.21.21` (IP da Vercel — confirmar o atual no painel da Vercel).
   - **www (`www.pizzariapremium.com.br`)** → `CNAME` apontando para `cname.vercel-dns.com`.
3. Salvar no Registro.br. Propagação leva de minutos a algumas horas.
4. A Vercel emite o certificado HTTPS (Let's Encrypt) automaticamente assim que detecta os registros.
5. **Atualizar as constantes de URL no código** — buscar por `pizzaria-premium.vercel.app` em:
   - `index.html` (canonical, `og:url`, `og:image`, `twitter:url`, `twitter:image`)
   - Substituir por `https://www.pizzariapremium.com.br`.
6. Commit + push → Vercel redeploya automaticamente.

Não é necessário mexer em `manifest.json` nem em paths internos — todos são relativos.

---

*Desenvolvido com ☕ & ❤️ por **Scheeren Company**.*

---

## v12 — Painel admin "no ponto" (TAA-23, 2026-06-12)

**O que o dono ganhou**

- **Onboarding automático em 1 página** — tour guiado de 6 passos que aparece no primeiro login. Reabrível em "Onboarding" no menu lateral.
- **Aba "Horários"** — edita os 7 dias da semana (faixa de horário + flag "Fechado"). A home page mostra a pílula "Aberto · Fecha às HH:MM" / "Abre amanhã às HH:MM" / "Fechado" lendo o `localStorage` em tempo real.
- **Aba "Mensagens"** — 4 templates prontos (boas-vindas, saiu para entrega, pronto para retirada, fora do horário) com placeholders `{{nome}}` / `{{pedido}}` / `{{eta}}` / `{{horario}}`. Copia com 1 clique para colar no WhatsApp Business.
- **Aba "Backup"** — exporta TODAS as chaves `premium_pizzaria_*` em 1 JSON; importa de volta para restaurar em outro dispositivo. Botão "Apagar tudo" com dupla confirmação.
- **Não-duplicação** — login/dashboard continuam cobertos por [TAA-13](/TAA/issues/TAA-13) e [TAA-2](/TAA/issues/TAA-2). Esta entrega só ADICIONA abas.

**Como abrir**

```
abrir admin.html
# no primeiro login: tour de 6 passos aparece sozinho
# force reload sem cache se a UI parecer velha: Ctrl+Shift+R
```

**Onde está no código**

- `assets/js/admin.js` (novo, 651 linhas) — `window.PP_ADMIN` com 4 features, deferred script.
- `admin.html:2096-2108` — 4 nav items novos: `Horários`, `Mensagens`, `Backup`, `Onboarding`.
- `admin.html:2774-2871` — 4 abas com mesmo `.tab-content` style.
- `admin.html:3354-3455` — overlay de onboarding + CSS escopado `.pp-*` + `<script src="assets/js/admin.js" defer>`.
- `assets/js/script.js:3713-3746` — `SCHEDULE` lê `premium_pizzaria_store_hours` do `localStorage`. Fallback preserva o padrão Teresina 18:00–23:30.
- `assets/js/script.js:3777-3786` — lista de horários da pílula re-renderiza com os valores editados e marca "Fechado" para `closed:true`.
- `sw.js:1,5` — `CACHE_NAME` → `pizzaria-premium-v14-owner-self-service`; `assets/js/admin.js` adicionado à lista de precache.
- `tests/admin-self-service.{mjs,test.mjs}` — 21 testes (parity) cobrindo constants, getHours/saveHours, getMessages/saveMessages, renderPreview, collectAllStorage, onboarding flow.
- `docs-local/admin-onboarding.md` (privado, gitignored) — passo-a-passo para o dono em pt-BR.

**Limitações**

- Tudo persiste no `localStorage` do navegador. Trocar de dispositivo = perder tudo a menos que tenha backup.
- Mensagens não disparam sozinhas — são biblioteca de templates para colar no WhatsApp Business.
- Horários não bloqueiam pedidos (cliente pode mandar WhatsApp mesmo fechado). Integração automática fica para próximo nível.

**Tests**

```
164 passed (164) — 138 pre-existing + 5 v11 + 21 v12 (TAA-23)
```

Refs: [TAA-23](/TAA/issues/TAA-23), [TAA-13](/TAA/issues/TAA-13), [TAA-2](/TAA/issues/TAA-2), CHANGELOG_LOCAL.md.

