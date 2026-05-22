# 💳 Guia de Integração Mercado Pago — Pizzaria Premium

Este guia (Skill) explica como configurar, homologar e manter segura a integração com o Mercado Pago para pagamentos via Pix e Cartão de Crédito de forma automática em seu site.

---

## 1. Como Obter suas Credenciais

Para que o pagamento online caia direto na sua conta do Mercado Pago, você precisa obter o seu **Access Token** (Token de Acesso) e sua **Chave Pública (Public Key)**:

1. Faça login na sua conta no site do **[Mercado Pago](https://www.mercadopago.com.br/)**.
2. Acesse o **[Painel do Desenvolvedor](https://developers.mercadopago.com.br/)**.
3. Crie uma nova aplicação (ex: "Pizzaria Premium") ou selecione uma existente.
4. No menu lateral, acesse **Credenciais de Produção** (ou Credenciais de Teste para simular pagamentos).
5. Copie os seguintes campos:
   * **Chave Pública (Public Key)** (Começa com `APP_USR-...`)
   * **Token de Acesso (Access Token)** (Começa com `APP_USR-...`)

---

## 2. O Risco de Exposição do Token (E como resolver)

> [!WARNING]
> O seu **Access Token** é uma chave secreta. Qualquer pessoa com acesso a ele pode fazer reembolsos, transferir dinheiro ou ler seu histórico de transações. 
> Como o site da pizzaria roda diretamente no navegador do cliente (front-end estático), colocar o Token de Acesso diretamente nas configurações locais significa que ele poderá ser lido por programadores ou usuários mal-intencionados que inspecionarem o código da página.

### Como funciona no site (Modo Rápido / Homologação)
Para facilitar seu uso imediato, implementamos a geração do pagamento diretamente no navegador usando um proxy de CORS. Isso funciona perfeitamente para testes, mas **não recomendamos usar em produção com seu Token de Produção oficial**.

### Solução Profissional e Segura (Serverless)
A forma correta é criar uma pequena função backend (chamada serverless) que oculta o seu Token. O fluxo seguro é:
1. O cliente clica em "Pagar" no site.
2. O site envia o valor do pedido para a sua função backend segura (hospedada gratuitamente na Vercel, Netlify ou Firebase).
3. A função backend cria a preferência de pagamento no Mercado Pago usando seu Token secreto (que fica guardado nas configurações do servidor, inacessível ao cliente).
4. O backend responde ao site apenas com o link de pagamento.
5. O cliente é redirecionado de forma 100% segura.

---

## 3. Código do Backend Seguro (Pronto para Uso)

Criamos uma pasta `api` na raiz do seu projeto com o arquivo `create-preference.js`.
Se você hospedar seu site na **Vercel** (que é gratuita e excelente para sites estáticos em HTML/CSS), a Vercel reconhecerá essa pasta automaticamente e criará uma API funcional e segura!

### Como implantar na Vercel em 5 minutos:
1. Crie uma conta gratuita em [Vercel.com](https://vercel.com).
2. Conecte o repositório do seu site no GitHub à Vercel.
3. Nas configurações do projeto na Vercel (Project Settings -> Environment Variables), adicione:
   * **Nome:** `MP_ACCESS_TOKEN`
   * **Valor:** Seu Token de Acesso oficial (`APP_USR-...`)
4. Faça o deploy. O site agora chamará `/api/create-preference` de forma 100% segura, sem expor seu token a nenhum cliente!

---

## 4. Testando o Pagamento (Modo Sandbox)

Antes de vender para clientes reais, teste com a sua credencial de teste:
1. Configure as **Credenciais de Teste** no painel de administração.
2. Adicione itens ao carrinho e escolha Mercado Pago.
3. O sistema abrirá a tela do Mercado Pago em modo Sandbox (Teste).
4. Use os **cartões de teste oficiais do Mercado Pago** para simular pagamentos aprovados, recusados, etc. (veja a lista de cartões de teste na documentação oficial do Mercado Pago).
5. Após validar que tudo funciona, mude para suas **Credenciais de Produção** e comece a vender!
