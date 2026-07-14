# TAA-20 — Google Analytics 4 + Search Console

> Documento privado (dono da pizzaria + agentes). Caminho
> `docs-local/analytics-setup.md`. Nao vai pro GitHub.

## 1. Resumo

A pizzaria usa **dois destinos de analytics em paralelo**:

- **Umami self-hosted** (existente) — telemetria de runtime, page views,
  erros JS, dedupe/rate-limit. Continua sendo o sistema primario de
  observabilidade e privacidade (sem cookies, sem PII).
- **Google Analytics 4 (GA4) + Google Tag Manager (GTM)** (novo, TAA-20) —
  visibilidade de negocio para o dono (eventos de compra, leads, funil de
  checkout) usando os nomes recomendados pelo GA4.

A mesma chamada `window.pizzariaTrack(name, props)` em `script.js` agora
entrega em ambos os destinos. Umami recebe sempre; GA4 so recebe se o
container estiver configurado (ver secao 4).

## 2. O que ja foi instrumentado

| Evento GA4     | Onde dispara                                                | Props principais                                  |
| -------------- | ----------------------------------------------------------- | ------------------------------------------------- |
| `view_item`    | `script.js` ao renderizar cardapio (cada item de menu)      | `items[]` com `item_id`, `item_name`, `price_brl` |
| `add_to_cart`  | `addSimpleItemToCart()` e `confirmPizzaSelection()`         | `items[]`, `value`, `currency`                    |
| `begin_checkout` | Ao entrar no step "Entrega e Pagamento"                   | `cart_size`, `cart_value_brl`, `items[]`          |
| `purchase`     | Em `finalizeOrder()` apos Pix gerado                        | `order_id` (curto, derivado de `order.id` — **nunca** o `txid` Pix/MP), `value`, `currency`, `items[]`  |
| `generate_lead` | Todo clique em CTA WhatsApp (floating, hero, recibo)      | `source`, `item_id` (id do botao)                 |

**Sem PII.** Nenhum evento carrega telefone, e-mail, endereco completo,
CPF, dados do Mercado Pago ou txid Pix. `pizzariaTrack` tem allowlist
de chaves (no `analytics.js`) que bloqueia chaves novas nao-listadas.

## 3. Search Console + Sitemap

- Sitemap ja existe: `https://pizzaria-premium.vercel.app/sitemap.xml`
  (TAA-20 atualizou `lastmod` e adicionou URLs dos combos e da
  calculadora de frete).
- `robots.txt` criado em `D:/PaperClip/robots.txt` apontando para o
  sitemap. Subir para o deploy do Vercel/Pages.
- A verificacao do Search Console **precisa do dono da pizzaria**:
  escolher uma das opcoes (DNS TXT, HTML file upload ou meta tag) na
  conta Google do dono. Quando o metodo for escolhido, eu implemento a
  meta tag `<meta name="google-site-verification" content="..." />`.

## 4. Como ligar GA4 e GTM (passo a passo para o dono)

1. Crie uma propriedade GA4 em https://analytics.google.com/ (se ainda
   nao existir). Va em **Administrador > Fluxos de dados > Web > adicionar**
   e anote o ID no formato `G-XXXXXXXX`.
2. Crie um container GTM em https://tagmanager.google.com/ (recomendado,
   mas opcional). Anote o ID no formato `GTM-XXXXXXX`.
3. Abra o site publicado (`https://pizzaria-premium.vercel.app/`) em
   modo anonimo. No DevTools (Console) rode:
   ```js
   localStorage.setItem('premium_pizzaria_ga4_id', 'G-XXXXXXXX');
   localStorage.setItem('premium_pizzaria_gtm_id', 'GTM-XXXXXXX');
   location.reload();
   ```
4. Recarregue. Abra **DevTools > Network** e filtre por `gtag/js` e
   `gtm.js` — ambas devem aparecer com status `200`. Abra
   **Google Tag Assistant** (extensao Chrome) e valide o container GTM.
5. Em **GA4 > Relatorios > Tempo real**, faca uma acao no site
   (adicionar item, abrir checkout, finalizar pedido) e confirme que
   aparecem em tempo real.

> Se o dono preferir nao usar GTM, pode pular o passo 2 e 5b. Apenas
> GA4 + `gtag.js` ja cobrem todos os eventos de negocio do TAA-20.

## 5. Painel do dono: o que olhar

| Pergunta de negocio                                  | Onde no GA4                                              |
| ---------------------------------------------------- | -------------------------------------------------------- |
| Quantos pedidos finalizei hoje?                      | Relatorios > Monetizacao > Compras                       |
| Quantos clientes chegaram ate o checkout e sairam?   | Relatorios > Funil de aquisicao (exploracao livre)       |
| Qual o item mais pedido?                             | Relatorios > Monetizacao > Desempenho de ecommerce      |
| Quantas pessoas clicaram no WhatsApp?                | Relatorios > Engajamento > Eventos > `generate_lead`     |
| Qual bairro entrega mais (sem expor endereco)?       | Relatorios > Demografia > Localizacao (cidade)           |

## 6. Verificacoes tecnicas (como checar apos deploy)

- [ ] `<head>` contem `<script src="https://www.googletagmanager.com/gtag/js?id=G-...">` quando o `localStorage` esta setado.
- [ ] `<body>` contem `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-...">` quando o `localStorage` esta setado.
- [ ] Network: `region1.google-analytics.com` recebe hits.
- [ ] DevTools Console: nenhum warning de CSP para `googletagmanager.com`.
- [ ] Lighthouse: Privacy & Performance nao regrediram (Privacy mantem
      nota boa porque a propriedade GA4 fica desativada ate plugar os IDs).

## 7. Privacidade & LGPD

- **Sem cookies de terceiros** ate o dono setar `ga4_id`. O site entra
  em producao com Umami (no PII) e **zero** cookies GA.
- Apos ligar GA4, o Google tageara IPs com `_anonymizeIp` automatico
  (default do snippet). Cookies do GA4 expiram em 2 anos.
- O fluxo de checkout nao envia nome/telefone/endereco para GA. Apenas
  `order_id` (curto, derivado de `order.id` no `script.js`), `value`,
  `currency`, `items[]` agregados. **NUNCA** enviamos o `txid` do
  MercadoPago/Pix — esse identificador muda entre tentativas e nao
  correlaciona com a contagem de pedidos reais, alem de aumentar risco
  de correlacao com pagamento.
- Em `analytics.js`, ha um allowlist que bloqueia props fora do conjunto
  permitido. Defesa em profundidade.

## 8. O que falta (continuacao)

- IDs reais de GA4 e GTM (blocker externo, decidido pelo dono).
- Verificacao do Search Console (blocker externo).
- (Opcional) instalar `gatsby-plugin-google-gtag` ou equivalente se o
  site migrar de SPA vanilla para um gerador estatico.
- (Opcional) configurar Enhanced Conversions no GA4 (envia hash do
  e-mail/telefone, opt-in). NAO esta habilitado.
