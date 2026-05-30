# Termo de Propriedade Intelectual e Licença de Uso de Software

**Anexo II ao Contrato de Prestação de Serviços de Desenvolvimento, Hospedagem e Manutenção de Software**

> **Modelo editável.** Campos `__________` devem ser preenchidos antes do envio.
> Marcações `[REVISAR COM ADVOGADO]` indicam pontos que pedem revisão jurídica antes de assinar.

---

## 1. Definições

Para os fins deste Termo:

- **"Sistema"** — o software desenvolvido pelo CONTRATADO para a CONTRATANTE, incluindo páginas HTML/CSS/JavaScript da SPA, painel administrativo, código de cálculo de frete, integrações e demais componentes funcionais descritos no contrato e seus anexos.
- **"Código-fonte"** — o conjunto de arquivos legíveis por humano que compõem o Sistema, suas dependências internas, scripts de build, configurações de deploy e documentação técnica associada.
- **"Conteúdo do Cliente"** — textos, fotos, vídeos, logos, marca, identidade visual, cardápios, descrições de produtos, dados de clientes finais e dados operacionais (pedidos, vendas) fornecidos ou gerados pela CONTRATANTE.
- **"Componentes de Terceiros"** — bibliotecas, frameworks, fontes, ícones e demais software de terceiros embarcados no Sistema sob suas licenças próprias (open source ou comerciais).
- **"CONTRATADO"** e **"CONTRATANTE"** — conforme identificados no Contrato principal.

---

## 2. Titularidade do código-fonte

2.1. **O Código-fonte do Sistema é e permanece de propriedade exclusiva do CONTRATADO**, incluindo:

- arquitetura, lógica de negócio, organização dos arquivos;
- código JavaScript do storefront, do painel admin, do Service Worker;
- estilos CSS proprietários, componentes visuais reutilizáveis;
- scripts de build, deploy e automação;
- documentação técnica produzida pelo CONTRATADO.

2.2. A titularidade abrange todos os direitos patrimoniais previstos na **Lei nº 9.609/1998** (Lei do Software) e na **Lei nº 9.610/1998** (Lei de Direitos Autorais), notadamente os direitos de reprodução, modificação, distribuição, sublicenciamento e exploração comercial.

2.3. O fato de o desenvolvimento ter sido feito sob encomenda da CONTRATANTE **não transfere a titularidade do Código-fonte**. O que a CONTRATANTE adquire mediante pagamento é o direito de **uso** do Sistema, conforme a licença descrita na Cláusula 4.

2.4. O CONTRATADO poderá, a seu exclusivo critério, reaproveitar componentes, bibliotecas internas e padrões arquiteturais do Sistema em outros projetos, **desde que** preserve a confidencialidade do Conteúdo do Cliente e da configuração específica da CONTRATANTE.

---

## 3. Titularidade do conteúdo e dos dados do cliente

3.1. **O Conteúdo do Cliente é e permanece de propriedade exclusiva da CONTRATANTE.** Isto inclui:

- **Marca, nome fantasia, logotipo, identidade visual** ("Pizzaria Premium Teresina" e variações);
- **Fotos** dos produtos e do estabelecimento;
- **Textos** descritivos do cardápio, sobre a pizzaria, copy de marketing;
- **Cardápio** estruturado (lista de produtos, preços, categorias);
- **Dados cadastrais dos clientes finais** (nome, telefone, endereço de entrega) — sob regime da LGPD (Cláusula 9 do Contrato);
- **Histórico de pedidos**, faturamento, métricas operacionais;
- **Configurações de negócio** (zonas de entrega, taxas, horários de funcionamento, cupons).

3.2. A CONTRATANTE concede ao CONTRATADO licença **não-exclusiva, gratuita e limitada à vigência do contrato** para usar marca, logo e fotos exclusivamente para:

- (a) exibir o Sistema da CONTRATANTE em portfólio do CONTRATADO (após a entrada em produção e mediante anuência prévia);
- (b) referenciar a CONTRATANTE como cliente em material institucional (case de uso, depoimento — sempre com aprovação prévia da CONTRATANTE).

3.3. **Cessada esta autorização** (rescisão do contrato ou pedido escrito da CONTRATANTE), o CONTRATADO removerá referências à marca e logos da CONTRATANTE de seu material em até **30 (trinta) dias**.

3.4. **Garantia de titularidade do conteúdo.** A CONTRATANTE declara ser titular ou ter autorização para uso de todo Conteúdo do Cliente entregue ao CONTRATADO (em especial fotos e textos de terceiros), respondendo isoladamente por eventuais infrações a direitos de imagem, autorais ou de marca.

---

## 4. Licença de uso concedida à CONTRATANTE

4.1. Mediante o pagamento dos valores previstos no Contrato, o CONTRATADO concede à CONTRATANTE uma **licença de uso do Sistema** com as seguintes características:

- **Não-exclusiva:** o CONTRATADO pode licenciar Sistema similar ou derivado a outros clientes;
- **Não-transferível e não-sublicenciável:** a CONTRATANTE não pode ceder, alugar, sublicenciar ou disponibilizar o Sistema a terceiros sem prévia anuência escrita do CONTRATADO;
- **Limitada ao prazo de vigência do Contrato:** a licença vigora enquanto a CONTRATANTE estiver adimplente com a mensalidade;
- **Restrita ao escopo de uso:** uso operacional do Sistema para o negócio de pizzaria da CONTRATANTE, no endereço/contexto comercial declarado.

4.2. A licença **inclui**:

- uso do Sistema hospedado pelo CONTRATADO;
- uso do painel administrativo pelos funcionários da CONTRATANTE;
- recebimento e processamento dos pedidos gerados pelo Sistema;
- exportação dos próprios dados da CONTRATANTE a qualquer momento.

4.3. A licença **não inclui** (salvo adendo de buy-out, Cláusula 7):

- acesso ao Código-fonte;
- direito de modificar, descompilar ou fazer engenharia reversa do Sistema, salvo na exata medida permitida por lei;
- direito de hospedar o Sistema fora da infraestrutura contratada pelo CONTRATADO;
- direito de revender o Sistema, comercializar acesso ou criar produto derivado.

4.4. **Encerramento da licença.** Com a rescisão do Contrato ou inadimplência não sanada (Cláusula 4.7 do Contrato), a licença cessa automaticamente, e a CONTRATANTE deverá descontinuar o uso do Sistema. O CONTRATADO entregará à CONTRATANTE cópia dos dados próprios (Cláusula 5 abaixo) em formato aberto.

---

## 5. Portabilidade de dados

5.1. **Direito de portabilidade.** A CONTRATANTE pode, a qualquer momento durante a vigência do Contrato e por **até 30 (trinta) dias após a rescisão**, solicitar a exportação dos seus próprios dados.

5.2. **Formato de exportação.** O CONTRATADO entregará os dados em formatos legíveis e abertos:

- **Pedidos:** CSV ou JSON, com colunas: id, data/hora, cliente, telefone, itens, endereço, valor total, status;
- **Cadastro de clientes finais:** CSV ou JSON, com nome, telefone, endereço, data de cadastro;
- **Cardápio:** JSON estruturado ou CSV;
- **Configurações de negócio:** JSON.

5.3. **Prazo de entrega:** até **15 (quinze) dias corridos** do recebimento da solicitação escrita.

5.4. A portabilidade é gratuita até **2 (duas) vezes por ano**. Solicitações adicionais podem ser cobradas como horas técnicas, conforme tabela horária vigente.

---

## 6. Domínio e infraestrutura

6.1. **Domínio próprio.** Se a CONTRATANTE registrar domínio próprio (ex.: `pizzariapremiumteresina.com.br`), este será **registrado em nome da CONTRATANTE**, no Registro.br ou registrador equivalente, e permanecerá sob sua titularidade.

6.2. **Domínio de cortesia.** Caso o Sistema seja entregue sob subdomínio de cortesia do CONTRATADO (ex.: `pizzariapremium.exemplo.com`), este subdomínio é de titularidade do CONTRATADO e não acompanha a CONTRATANTE em caso de rescisão.

6.3. **Infraestrutura de hospedagem.** A hospedagem é contratada pelo CONTRATADO em nome próprio, em provedores de mercado (ex.: GitHub Pages, Cloudflare, Vercel ou equivalentes). A CONTRATANTE **não tem direito a transferência das contas** de provedores; tem direito apenas à portabilidade dos seus dados (Cláusula 5) e à transferência do domínio próprio (Cláusula 6.1).

---

## 7. Adendo opcional de buy-out (compra do código-fonte)

> Esta cláusula é **opcional** e só se aplica se as Partes assinarem o aditivo correspondente. Sem o aditivo, vale a regra geral da Cláusula 2 (código permanece com o CONTRATADO).

7.1. **Direito de compra.** A CONTRATANTE poderá, a qualquer momento durante a vigência do Contrato, manifestar interesse em adquirir o Código-fonte completo do Sistema mediante pagamento de **valor de buy-out**.

7.2. **Valor de referência do buy-out:** **`[A DEFINIR PELO CEO]`** — sugestão de faixa de mercado: **18 (dezoito) a 36 (trinta e seis) mensalidades** vigentes, ou um múltiplo do setup pago, a ser combinado caso a caso. `[REVISAR COM ADVOGADO]`

7.3. **Escopo da transferência no buy-out:**

- entrega do Código-fonte completo, com histórico de versionamento (Git);
- entrega da documentação técnica essencial;
- cessão **definitiva, irrevogável e exclusiva** dos direitos patrimoniais sobre o Código-fonte para a CONTRATANTE;
- as bibliotecas e Componentes de Terceiros permanecem sob suas licenças próprias (open source ou comerciais), não cabendo ao CONTRATADO transferir o que não é seu;
- período de suporte de transição de **30 (trinta) dias** para apoiar a migração para outro fornecedor.

7.4. **Efeitos no contrato principal:** com o buy-out, a CONTRATANTE passa a ser titular do código e pode optar por:

- (a) manter o CONTRATADO como prestador de hospedagem e manutenção, com nova precificação a ser acordada; ou
- (b) migrar para outro fornecedor / autohospedagem, encerrando o Contrato sem aplicação de multa rescisória prevista na Cláusula 10.1.

7.5. O buy-out **não retroage** sobre versões anteriores do Sistema já operadas. Atualizações e evoluções feitas após o buy-out, se contratadas com o CONTRATADO, seguirão regime a ser definido em novo instrumento.

7.6. Componentes do CONTRATADO que constituam **know-how reutilizável** (componentes internos de uso em múltiplos clientes, scripts genéricos de build) podem ser licenciados perpetuamente à CONTRATANTE para uso no escopo do Sistema, sem cessão exclusiva. `[REVISAR COM ADVOGADO]`

---

## 8. Componentes de terceiros e software open source

8.1. O Sistema utiliza Componentes de Terceiros, cada um sob sua licença própria. As principais famílias de licença em uso:

- **Licenças permissivas** (MIT, Apache 2.0, BSD): permitem uso comercial, modificação e redistribuição com poucas restrições;
- **Licenças copyleft** (GPL, AGPL): podem impor obrigações de abertura de código — o CONTRATADO se compromete a **não embarcar componentes com licença copyleft incompatível** com a operação comercial fechada do Sistema sem prévia anuência da CONTRATANTE.

8.2. O CONTRATADO manterá, mediante solicitação, uma **lista atualizada dos Componentes de Terceiros** utilizados e suas respectivas licenças.

8.3. A CONTRATANTE reconhece que os Componentes de Terceiros não são propriedade do CONTRATADO e que eventuais limitações deles não constituem inadimplemento.

---

## 9. Sigilo, segredos comerciais e não-concorrência

9.1. O Código-fonte é tratado como **segredo comercial** do CONTRATADO. A CONTRATANTE e seus funcionários se obrigam a não tentar acessar, copiar ou inspecionar o Código-fonte por meios não autorizados.

9.2. Inversamente, o CONTRATADO se obriga a tratar como confidencial todo Conteúdo do Cliente, dados de pedidos e métricas operacionais da CONTRATANTE, conforme Cláusula 9 do Contrato principal.

9.3. **Não-concorrência:** o CONTRATADO **não fica impedido** de prestar serviços a outras pizzarias ou estabelecimentos similares — o modelo de negócio dele depende disso. O CONTRATADO se compromete, contudo, a:

- não reutilizar configurações específicas, dados ou conteúdo da CONTRATANTE em outros projetos;
- não copiar a identidade visual da CONTRATANTE para outros clientes.

`[REVISAR COM ADVOGADO]` — se a CONTRATANTE desejar exclusividade geográfica (ex.: "nenhuma outra pizzaria em Teresina"), isso é um produto à parte, com valor diferenciado, e precisa ser previsto em aditivo específico.

---

## 10. LGPD — papéis e responsabilidades

10.1. Em relação ao tratamento de dados pessoais dos clientes finais da CONTRATANTE coletados via Sistema (nome, telefone, endereço de entrega, histórico de pedidos):

- **CONTROLADORA: CONTRATANTE.** Define as finalidades (operar a pizzaria, entregar pedidos, fazer marketing direto se autorizado pelo titular) e os meios principais.
- **OPERADOR: CONTRATADO.** Trata os dados em nome e por conta da CONTRATANTE, exclusivamente para executar este Contrato.

10.2. Obrigações específicas do CONTRATADO como Operador (em complemento à Cláusula 9 do Contrato principal):

- seguir instruções documentadas da CONTRATANTE quanto ao tratamento;
- garantir que pessoas autorizadas a tratar os dados (próprios funcionários ou subcontratados) tenham compromisso de confidencialidade equivalente;
- adotar medidas técnicas e administrativas de segurança (HTTPS, controle de acesso, backups);
- auxiliar a CONTRATANTE no atendimento de direitos dos titulares (LGPD, art. 18);
- notificar incidentes de segurança em até 48h;
- ao final do tratamento, devolver ou eliminar os dados conforme orientação da CONTRATANTE.

10.3. **Encarregado (DPO).** Se a CONTRATANTE designar um Encarregado de Dados, deverá comunicá-lo ao CONTRATADO. O CONTRATADO indicará canal específico para tratativas de LGPD: `__________`.

10.4. **Marketing direto e consentimento.** O Sistema **não** envia mensagens publicitárias automatizadas em nome da CONTRATANTE. Caso a CONTRATANTE deseje fazê-lo, deverá obter consentimento válido dos titulares, sendo a CONTRATANTE inteiramente responsável por esse tratamento.

---

## 11. Garantias e isenções

11.1. O CONTRATADO garante que:

- é o autor original do Código-fonte ou possui licenças válidas dos componentes utilizados;
- o Sistema, conforme entregue, não infringe direitos de terceiros conhecidos;
- prestará suporte conforme o SLA da Cláusula 7 do Contrato principal.

11.2. **Isenções:** o Sistema é fornecido **"como está"** quanto a:

- adequação a fins específicos não descritos no escopo;
- compatibilidade com versões futuras de navegadores, sistemas operacionais ou aplicativos de terceiros (incluindo WhatsApp);
- comportamento de serviços de terceiros (deliverability de mensagens, alterações de API, indisponibilidades de provedores).

---

## 12. Vigência e disposições finais

12.1. Este Termo vigora pelo mesmo prazo do Contrato principal e segue sua sorte (renovação, rescisão).

12.2. **Sobrevivência.** As Cláusulas 2 (titularidade do código), 3 (titularidade do conteúdo), 8 (terceiros), 9 (sigilo) e 10 (LGPD) **sobrevivem à rescisão** do Contrato.

12.3. Em caso de conflito entre este Termo e o Contrato principal, prevalece o que for mais protetivo da titularidade declarada em cada cláusula (Código com o CONTRATADO; Conteúdo e dados com a CONTRATANTE).

12.4. Foro: o mesmo eleito no Contrato principal (Comarca de Teresina – PI).

---

E, por estarem assim justas e contratadas, as Partes assinam o presente Termo, que integra o Contrato principal para todos os efeitos legais.

Teresina – PI, ____ de ____________ de 20____.

\
\
**______________________________________**
CONTRATADO
`__________` — CPF/CNPJ `__________`

\
\
**______________________________________**
CONTRATANTE
`__________` — CNPJ `__________`
Representante: `__________`
