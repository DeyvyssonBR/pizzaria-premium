# Auditoria Visual / UX — Pizzaria Premium Teresina

**Viewports auditados (renderização real):** Desktop **1440x900** e Mobile **390x844** (iPhone 14). Capturas via Chrome headless + CDP, servidor local em `127.0.0.1:8765`.

**Anexos:** 7 screenshots no thread (desktop-hero, mobile-hero, desktop-cardapio, mobile-cardapio, mobile-pizza-modal, mobile-cart-step3-delivery, admin-desktop).

---

## 1. Resumo Executivo

O site **já está num patamar muito acima** do cardápio Zapermenu genérico: estrutura SPA, paleta vinho/grafite/dourado coerente, hero com foto real da fachada, cardápio em cards, personalizador de pizza estilo iFood, checkout em 4 etapas curtas, pagamento com Pix/Mercado Pago/cartão/dinheiro, carrinho flutuante, drawer de conta, painel admin. A engenharia está sólida.

O que **falta para ficar "premium-vendedor"** segundo o brief:

1. **Brief não cumprido em 3 seções críticas** — "Por que escolher", "Promoções da semana" (bloco dedicado) e **prova social** estão ausentes; só existe a promo-bar no topo.
2. **Hero desktop desperdiça a primeira dobra** — fundo escuro + cover fotográfico baixo + título grande empurram o cardápio para muito abaixo da dobra; falta "gostinho" (combo em destaque, prova social) na primeira tela desktop.
3. **Fotos placeholder em produtos** — Bacon Especial, Chocolate com Morango, Bombom de Chocolate e suco usam o logo da pizzaria como imagem. O brief é explícito: "fotos reais e boas" (Norman — visceral / loss aversion).
4. **Fragmentação do CEP / endereço** — o `delivery-calc` (calcular taxa pelo CEP) está numa seção solta da home; no checkout, o passo 3 só pede Rua/Bairro/Referência sem CEP visível. Usuário pode cair na duplicidade.
5. **Acessibilidade visual com contraste duvidoso** no badge `PIZZARIA ARTESANAL · TERESINA-PI` (dourado claro sobre marrom translúcido) e em alguns "Toque para montar seu pedido" laranja sobre creme.
6. **Footer com pegadinhas operacionais**: link "⚙️ Painel Admin" exposto no rodapé público (segurança/UX — não deveria ser descoberto pelo cliente).

**Meta "pedido em <1 min" — atingida** no mobile com login já feito (commit `77fbd0f` pula a tela "Identifique-se"), mas para **primeiro pedido** o fluxo ainda força nome+telefone numa tela separada.

**Visual-quality bar geral: 7.5/10.** Funcional e razoavelmente polido, mas falta cumprir o brief e fechar 2-3 lacunas de conversão.

---

## 2. Achados priorizados

> Lentes citadas conforme `AGENTS.md`. AC = critério de aceitação.

### 🔴 CRÍTICO (bloqueia o brief / fere conversão)

**C1 — Faltam 3 seções obrigatórias do brief (Por que escolher, Promoções, Prova social).**
- **Lente:** Social Proof + Loss Aversion + brief não atendido.
- **Por que importa:** sem cards de diferenciais o "premium" fica só estético; sem prova social a confiança cai (Nielsen #4 - consistência com expectativas de e-commerce); sem bloco de promoções, urgência depende só da `promo-bar`.
- **AC:** existem 3 seções implementadas entre Hero e Cardápio (mobile) ou após Cardápio (desktop): "Por que escolher" (6 cards com ícones do brief), "Promoções da semana" (fundo vinho, com 2-3 promoções e CTA WhatsApp), "O que os clientes dizem" (3+ depoimentos com estrelas; pode começar com placeholders editáveis pelo admin).

**C2 — Fotos placeholder no cardápio quebram a expectativa premium.**
- **Lente:** Visceral (Norman) + Aesthetic-Usability.
- **Por que importa:** itens com logo no lugar da foto convertem muito menos que itens com foto apetitosa. Em pizzaria, foto é 70% da venda.
- **AC:** todos os itens visíveis no scroll inicial do mobile têm foto real do produto; itens sem foto pronta ficam fora do destaque ou recebem um shot genérico claramente apetitoso (queijo, massa). Lista atual de problemáticos: Bacon Especial, Chocolate com Morango, Bombom de Chocolate, Suco Maracujá, Combo Premium/Casal/Galera no mobile.

**C3 — Link "⚙️ Painel Admin" exposto no rodapé público.**
- **Lente:** Heurística "Security & visibility of system status" + UX (rodapé é para clientes).
- **AC:** remover do footer público; mover para `/admin` direto ou usar bookmark/atalho. Texto "⚙️ Painel Admin" não pode aparecer no `index.html` em nenhum estado.

### 🟠 ALTO (fricção significativa / impacta meta de 1 minuto)

**A1 — Hero desktop desperdiça a primeira dobra; primeiro cardápio aparece muito abaixo.**
- **Lente:** Peak-End + Fitts's Law (CTAs longe do conteúdo) + 2-second test.
- **Por que importa:** no desktop 1440x900 a primeira dobra mostra só "hero + atalhos de categoria"; combos aparecem só depois de scroll. Em mobile o problema é menor (botão CTA aparece na primeira dobra).
- **AC:** desktop 1440x900 mostra na primeira dobra ao menos 1 combo destacado OU 3 categorias de pizza pré-renderizadas como teaser. Reduzir altura do hero desktop em ~25% (ex.: cover menor, padding vertical).

**A2 — CEP fragmentado entre `delivery-calc` (home) e checkout (sem campo CEP).**
- **Lente:** Mental Models + Jakob's Law (iFood/Rappi pedem CEP no início do checkout) + Postel's Law.
- **Por que importa:** quem calcula taxa na home vê valor X, depois no checkout não sabe se vai valer; quem pula a calculadora descobre taxa só no resumo final → desistência.
- **AC:** no passo "Entrega e Pagamento" existe campo CEP autocomplete (ViaCEP), e a taxa calculada é mostrada **antes** do botão "Avançar para pagamento". Quem já calculou na home tem o valor pré-preenchido.

**A3 — Sem foto de pizza no Hero / falta prova-social no scroll inicial.**
- **Lente:** Visceral + Social Proof + 2-second test.
- **Por que importa:** hero usa fachada noturna do prédio, não pizza. Brief é explícito: "Foto grande e apetitosa de pizza" no banner.
- **AC:** opção A — substituir cover da fachada por close-up de pizza saindo do forno com queijo derretendo, mantendo overlay escuro para texto legível; opção B — adicionar logo após hero uma faixa "PIZZA EM DESTAQUE DO DIA" com foto grande + preço promocional + CTA. Inclui badge "+50 pedidos esta semana" ou nota Google 4.9★ visível.

**A4 — Auth obrigatória para 1º pedido força etapa antes da fome ser convertida.**
- **Lente:** Choice Overload + Loss Aversion (cliente com fome desiste).
- **Por que importa:** brief diz "Evite cadastro obrigatório". Hoje o passo "Identifique-se" pede nome+telefone antes do endereço. Para retornantes já está skipado (commit `77fbd0f`), mas para 1º pedido não.
- **AC:** passo "Identifique-se" mostra título "Para entregar precisamos do seu contato" + permite seguir com nome+telefone (não força cadastro/senha). Nada de "Crie uma conta" obrigatório no fluxo de checkout linear — a captura de conta vira opt-in no fim ("Salvar meus dados para próximos pedidos?").

### 🟡 MÉDIO (polimento + conversão incremental)

**M1 — Promo-bar do topo concorre visualmente com o header e some no scroll.**
- **Lente:** Common Region + Doherty Threshold.
- **AC:** promo-bar fica sticky junto com o header OU vira chip dentro do hero ("HOJE: R$ 30") com link âncora para a seção Promoções.

**M2 — Hero mobile com `PIZZARIA ARTESANAL · TERESINA-PI` em dourado fraco sobre marrom translúcido.**
- **Lente:** WCAG POUR (contraste).
- **AC:** medir e atingir AA (4.5:1) — escurecer fundo da badge ou clarear o texto para `#F8AA07` puro.

**M3 — Cards de pizza com pill "PERSONALIZÁVEL" repetido em 100% dos itens vira ruído.**
- **Lente:** Similarity (Gestalt) + Hick's Law inverso (ruído sem decisão).
- **AC:** remover a pill quando todos os itens são personalizáveis; substituir por pill condicional só em itens com flag especial (ex.: "MAIS PEDIDO", "NOVO", "Sem lactose").

**M4 — "Toque para montar seu pedido" em laranja sobre creme tem peso visual de link mas é texto estático.**
- **Lente:** Affordances (Norman).
- **AC:** transformar em CTA real (`button`) ou remover; alternativa: substituir por chevron `›` discreto + área inteira do card clicável (já é, mas o texto cria expectativa de hover state).

**M5 — Carrinho flutuante só aparece com item; falta sticky CTA "Pedir pelo WhatsApp" antes do primeiro item.**
- **Lente:** Mobile thumb zones + brief explícito ("botão fixo no rodapé").
- **AC:** se carrinho está vazio, sticky bar inferior no mobile mostra "💬 Falar no WhatsApp · 4.9★". Some quando o carrinho recebe item e vira a barra de "Ver Carrinho · R$ X".

**M6 — Loading/empty states do cardápio invisíveis no SSR (cardápio é renderizado client-side).**
- **Lente:** Doherty Threshold + Aesthetic-Usability.
- **AC:** entre `<div id="menu-grid">` vazio e o JS pronto, inserir 6 skeleton cards (mesma altura do card final) com shimmer. Mesmo para combos-carousel.

**M7 — Footer com "Desenvolvido por Scheeren Company..." + "2026 — Pizzaria Premium" misturados.**
- **Lente:** Hierarquia + Brand (Trust).
- **AC:** assinatura do desenvolvedor em font-size menor (10px), 1 linha, opacidade 50%; copyright separado.

### 🟢 BAIXO (refinamento futuro)

**B1 — Bloco Instagram não mostra grid real de posts.** AC: adicionar embed simples (4-6 thumbs) via Instagram Graph ou cards estáticos atualizáveis pelo admin.
**B2 — Map embed sem fallback de erro.** AC: se o iframe falhar, mostrar card com endereço + botão "Como chegar".
**B3 — `aria-label` ausente em alguns ícones do header de carrinho (badge "0").** AC: revisar axe-core nas telas principais.
**B4 — Brand-accent vermelho varia entre `#D50201` e `#8f0100` em diferentes lugares.** AC: tokens consolidados, log de variáveis CSS sem cores hard-coded fora das `:root`.

---

## 3. Recomendação — Fase 1 vs Fase 2

### Fase 1 — IMPLEMENTAR AGORA (bloqueia "site vende")
1. **C1** — adicionar 3 seções do brief (Por que escolher, Promoções, Prova social). Componentes novos, 1 dia.
2. **C2** — substituir fotos placeholder ou esconder esses itens do destaque inicial. 0,5 dia + assets.
3. **C3** — esconder link do admin do footer. 5 min.
4. **A1** — encolher hero desktop para mostrar combos na primeira dobra. 0,5 dia.
5. **A2** — CEP no checkout com taxa antes do "Avançar". 1 dia.
6. **A4** — auth opt-in no fim do fluxo, não obrigatória no meio. 0,5 dia.
7. **M2/M3/M4** — pulir contraste de badges, remover pill redundante, transformar texto em CTA discreto. 0,5 dia.

**Custo estimado:** 3-4 dias de Coder + briefing de fotos. **Impacto:** sobe de "site competente" para "site que efetivamente converte" e fecha o brief.

### Fase 2 — DEPOIS (refinamento contínuo)
- **A3** — sessão "Pizza do dia" com prova social inline.
- **M1, M5, M6, M7** — pulir promo-bar, sticky WhatsApp, skeletons, footer.
- **B1-B4** — Instagram real, map fallback, a11y completa, design tokens consolidados.
- Admin: visual-quality gate ainda pendente (não consegui passar do login nesta auditoria — só vi a tela de senha, ver anexo). Sugiro issue separada para auditoria do painel logado.

---

## 4. O que NÃO foi auditado nesta sessão

- **Painel admin pós-login** — protegido por senha; sem credenciais, capturei só a tela de auth. Recomendo issue filha "Auditoria UX do painel admin logado" com credenciais.
- **Fluxo de pagamento real** (Mercado Pago redirect, QR Pix gerado) — depende de backend ativo.
- **Performance / Core Web Vitals** — escopo desta issue é visual/UX; CWV deve virar issue própria para QA.
- **Tablet (768-1024px)** — fora do escopo solicitado (1440 + 390).

---

## 5. Próximo passo proposto

Aprovação do board / Takamura desta priorização. Posso destrinchar a Fase 1 em issues filhas atribuíveis ao Coder assim que o board aprovar — recomendo abrir 4 child issues: (1) seções do brief faltantes, (2) fotos do cardápio + esconder admin do footer, (3) hero desktop + checkout com CEP, (4) auth opt-in + polimento de badges.

— UXDesigner
