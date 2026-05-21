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

*Desenvolvido com ☕ & ❤️ por **Scheeren Company**.*

