# Contrato de Prestação de Serviços de Desenvolvimento, Hospedagem e Manutenção de Software

> **Modelo editável.** Campos `__________` devem ser preenchidos antes do envio.
> Marcações `[REVISAR COM ADVOGADO]` indicam pontos que pedem revisão jurídica antes de assinar.

---

## 1. Identificação das partes

**CONTRATADO (Prestador):**

- Nome / Razão social: `__________`
- CPF / CNPJ: `__________`
- Endereço: `__________`
- E-mail: `__________`
- Telefone / WhatsApp: `__________`

**CONTRATANTE (Cliente):**

- Razão social: Pizzaria Premium Teresina (nome fantasia) — `__________` (razão social oficial)
- CNPJ: `__________`
- Endereço: `__________`, Teresina – PI
- Representante legal: Sr. `__________` ("Takamura"), CPF `__________`
- E-mail: `__________`
- Telefone / WhatsApp: `__________`

As partes acima, doravante denominadas em conjunto "Partes" e individualmente "Parte", têm entre si justo e contratado o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas a seguir.

---

## 2. Objeto

2.1. O CONTRATADO se obriga a prestar à CONTRATANTE serviços de:

- **(a) Desenvolvimento** de site/sistema web próprio da CONTRATANTE para venda e gestão de pedidos de pizzaria, em arquitetura SPA (Single Page Application) HTML/CSS/JavaScript, doravante "**Sistema**";
- **(b) Hospedagem** do Sistema em infraestrutura contratada pelo CONTRATADO em nome próprio;
- **(c) Manutenção** corretiva e evolutiva do Sistema, conforme o tier contratado (Cláusula 3);
- **(d) Suporte técnico** pelos canais previstos na Cláusula 7.

2.2. O Sistema inclui, conforme o tier:

- Vitrine/cardápio digital;
- Carrinho e checkout com envio do pedido por WhatsApp;
- Painel administrativo (operador) para gestão de pedidos, cardápio e zonas de entrega;
- Cálculo de frete por distância/CEP;
- Demais funcionalidades discriminadas no **Anexo I — Escopo Técnico do Tier**.

2.3. Não estão incluídos no objeto, salvo contratação à parte e por aditivo:

- Criação de identidade visual (logo, ensaio fotográfico, copywriting);
- Integração com gateways de pagamento online (cartão/PIX automatizado);
- Aplicativo nativo iOS/Android (lojas oficiais);
- Campanhas pagas de marketing, gestão de redes sociais;
- Conteúdo (textos, fotos do cardápio, descrição dos produtos) — fornecido pela CONTRATANTE.

---

## 3. Escopo por tier

A CONTRATANTE contrata o tier: **( ) Básico   ( ) Premium   ( ) Enterprise**.

| Item                                       | Básico | Premium | Enterprise |
| ------------------------------------------ | :----: | :-----: | :--------: |
| Site responsivo (mobile-first)             |   ✓    |    ✓    |     ✓      |
| Cardápio digital                           |   ✓    |    ✓    |     ✓      |
| Carrinho + checkout via WhatsApp           |   ✓    |    ✓    |     ✓      |
| Painel admin (operador)                    |   ✓    |    ✓    |     ✓      |
| Zonas de entrega por bairro                |   ✓    |    ✓    |     ✓      |
| Cálculo de frete por distância/CEP         |   —    |    ✓    |     ✓      |
| Cupons e promoções                         |   —    |    ✓    |     ✓      |
| PWA (instalável no celular)                |   —    |    ✓    |     ✓      |
| Domínio próprio configurado                |   —    |    ✓    |     ✓      |
| Múltiplos operadores no painel             |   —    |    —    |     ✓      |
| Relatórios de vendas                       |   —    |    —    |     ✓      |
| Integração com impressora de pedidos       |   —    |    —    |     ✓      |
| Personalização visual completa             |   —    |    —    |     ✓      |
| Manutenção evolutiva mensal (horas-banco)  | 1h/mês | 3h/mês  |   6h/mês   |
| SLA de resposta (Cláusula 7)               |  48h   |   24h   |     8h     |

O detalhamento técnico, lista de funcionalidades e critérios de aceite estão no **Anexo I**.

---

## 4. Valores e forma de pagamento

4.1. **Setup (implantação) — pagamento único:**

| Tier        | Valor (R\$)       |
| ----------- | ----------------- |
| Básico      | 1.500,00          |
| Premium     | 2.800,00          |
| Enterprise  | 4.500,00          |

Tier contratado: **`__________`** — Valor de setup: **R\$ `__________`**.

4.2. **Mensalidade (hospedagem + manutenção):**

| Tier        | Mensalidade sugerida (R\$/mês) |
| ----------- | ------------------------------ |
| Básico      | `__________`                   |
| Premium     | `__________`                   |
| Enterprise  | `__________`                   |

> `[REVISAR COM ADVOGADO]` e `[A DEFINIR PELO CEO]` — os valores de mensalidade devem ser preenchidos antes do envio. Sugestão de faixa de mercado para hospedagem + manutenção de SPA: R\$ 149 – R\$ 499/mês, escalando por tier.

Mensalidade contratada: **R\$ `__________` /mês**.

4.3. **Forma de pagamento do setup:**
50% (cinquenta por cento) na assinatura deste contrato, a título de sinal e início imediato dos trabalhos; 50% (cinquenta por cento) na entrega do Sistema em produção (homologação aceita pela CONTRATANTE conforme Cláusula 5.3).

4.4. **Forma de pagamento da mensalidade:**
Mensal, com vencimento todo dia **`____`** de cada mês, mediante PIX para a chave **`__________`** ou boleto bancário. O primeiro mês começa a contar da data da entrada em produção do Sistema.

4.5. **Reajuste anual:**
Os valores da mensalidade serão reajustados anualmente, na data de aniversário deste contrato, pela variação acumulada do **IPCA/IBGE** dos últimos 12 (doze) meses. Caso o IPCA seja extinto ou tenha sua publicação suspensa, será utilizado o índice que o substituir, ou, na falta deste, o **INPC/IBGE**.

4.6. **Inadimplência:**
Em caso de atraso no pagamento de qualquer parcela, incidirão sobre o valor devido:

- Multa moratória de 2% (dois por cento);
- Juros de mora de 1% (um por cento) ao mês, pro rata die;
- Correção monetária pelo IPCA/IBGE.

4.7. **Suspensão por inadimplência:**
Após **15 (quinze) dias** de atraso, e mediante aviso prévio com antecedência mínima de 5 (cinco) dias, o CONTRATADO poderá suspender o acesso ao Sistema (página fora do ar, painel admin bloqueado) até a regularização. A suspensão não afasta as demais consequências da inadimplência, inclusive a possibilidade de rescisão (Cláusula 10).

---

## 5. Prazo de implantação e aceite

5.1. **Prazo de implantação:** **1 (uma) a 2 (duas) semanas** corridas, contadas do recebimento, pelo CONTRATADO, de:

- (i) sinal de 50% do setup pago;
- (ii) conteúdo mínimo entregue pela CONTRATANTE (cardápio, fotos, logo, contato do WhatsApp, dados da pizzaria).

5.2. O atraso da CONTRATANTE na entrega do conteúdo da Cláusula 5.1(ii) suspende automaticamente o prazo de implantação.

5.3. **Aceite:** Concluído o desenvolvimento, o CONTRATADO disponibilizará o Sistema em ambiente de homologação. A CONTRATANTE terá **7 (sete) dias corridos** para testar e reportar não-conformidades em relação ao escopo do Anexo I. Decorrido esse prazo sem manifestação por escrito, o Sistema será considerado aceito.

---

## 6. Vigência e renovação

6.1. Este contrato tem vigência mínima de **12 (doze) meses**, contados da data de entrada em produção.

6.2. Findo o prazo mínimo, o contrato se renova **automaticamente por períodos sucessivos de 12 (doze) meses**, salvo manifestação contrária de qualquer das Partes, por escrito, com antecedência mínima de **30 (trinta) dias** do término do período em curso.

6.3. A rescisão antecipada durante o prazo mínimo segue o regime da Cláusula 10.

---

## 7. SLA, suporte e janela de atendimento

7.1. **Uptime (disponibilidade) alvo:** **99,5% mensal** (equivale a até ~3h40min de indisponibilidade por mês), excluídas:

- janelas de manutenção programada, comunicadas com no mínimo 24h de antecedência;
- indisponibilidades de terceiros (provedor de hospedagem, registro de domínio, WhatsApp, provedor de DNS) — sobre as quais o CONTRATADO atuará em best-effort;
- caso fortuito ou força maior.

7.2. **Canal oficial de suporte:** WhatsApp **`__________`** e/ou e-mail **`__________`**.

7.3. **Janela de atendimento:**
Segunda a sábado, das **09h às 19h** (horário de Teresina). Fora desta janela, mensagens são respondidas no próximo dia útil. Plantão fora da janela apenas para incidentes críticos (Sistema totalmente fora do ar).

7.4. **SLA de primeira resposta** (a partir do recebimento do chamado dentro da janela):

| Severidade                                        | Básico | Premium | Enterprise |
| ------------------------------------------------- | :----: | :-----: | :--------: |
| Crítica (site fora do ar / não recebe pedidos)    |  4h    |   2h    |    1h      |
| Alta (funcionalidade essencial quebrada)          | 24h    |   8h    |    4h      |
| Média (bug não bloqueante)                        | 48h    |  24h    |    8h      |
| Baixa (dúvida, ajuste cosmético)                  | 72h    |  48h    |   24h      |

SLA de resposta ≠ SLA de resolução. O CONTRATADO atuará com diligência para resolver o incidente no menor tempo possível.

7.5. **Banco de horas mensal de evolução** (criar novas funcionalidades, alterações fora de bug): conforme a Cláusula 3. Horas não consumidas no mês **não são cumulativas**, salvo acordo prévio por escrito. Horas excedentes são cobradas a **R\$ `__________` /hora** (`[A DEFINIR PELO CEO]`), com aprovação prévia da CONTRATANTE.

---

## 8. Propriedade intelectual

O regime de propriedade intelectual está disciplinado no **Termo de Propriedade Intelectual** anexo a este contrato (Anexo II), que faz parte integrante e indissociável deste instrumento.

Em síntese, sem prejuízo do disposto no Anexo II:

- O **código-fonte** do Sistema permanece de **propriedade do CONTRATADO**;
- A CONTRATANTE recebe **licença de uso** do Sistema enquanto vigente este contrato;
- **Dados de clientes da CONTRATANTE, marca, logo, fotos e conteúdo** são e permanecem de propriedade da CONTRATANTE.

---

## 9. Confidencialidade e LGPD

9.1. **Confidencialidade.** As Partes se obrigam a manter sigilo sobre todas as informações comerciais, técnicas, financeiras e operacionais a que tiverem acesso em razão deste contrato, durante a sua vigência e por **2 (dois) anos** após o término, sob pena de responsabilização por perdas e danos.

9.2. **LGPD (Lei nº 13.709/2018).**

(a) A **CONTRATANTE atua como Controladora** dos dados pessoais de seus clientes finais (nome, telefone, endereço de entrega, histórico de pedidos), definindo as finalidades e os meios de tratamento;

(b) O **CONTRATADO atua como Operador** desses dados, tratando-os exclusivamente conforme as instruções da CONTRATANTE e para a finalidade de execução deste contrato (hospedar o Sistema, exibir dados no painel admin, armazenar pedidos);

(c) O CONTRATADO se compromete a:
   - adotar medidas técnicas e administrativas razoáveis para proteger os dados (criptografia em trânsito via HTTPS, controle de acesso ao painel, backups);
   - não compartilhar dados pessoais dos clientes finais da CONTRATANTE com terceiros, exceto subcontratados estritamente necessários à operação (provedor de hospedagem, DNS) ou por ordem legal;
   - comunicar à CONTRATANTE qualquer incidente de segurança com dados pessoais em até **48 (quarenta e oito) horas** da sua ciência;
   - apoiar a CONTRATANTE no atendimento de requisições de titulares (acesso, correção, exclusão) em prazo razoável.

(d) Ao término do contrato, o CONTRATADO devolverá à CONTRATANTE, em formato legível (CSV/JSON), os dados pessoais armazenados, e os eliminará dos sistemas em até **30 (trinta) dias**, salvo obrigação legal de retenção.

9.3. **Sigilo dos dados de pedidos.** Pedidos, valores faturados e relação de clientes da pizzaria são informações **confidenciais** da CONTRATANTE. O CONTRATADO não os utilizará para fins próprios, comerciais ou estatísticos identificáveis, e não os compartilhará com concorrentes.

> `[REVISAR COM ADVOGADO]` — em caso de uso de subprocessadores cloud fora do Brasil (ex.: Vercel, Cloudflare), avaliar cláusula expressa de transferência internacional de dados conforme arts. 33 a 36 da LGPD.

---

## 10. Rescisão

10.1. **Rescisão sem justa causa (por qualquer das Partes) durante o prazo mínimo de 12 meses:**
A Parte que rescindir o contrato antes do término do prazo mínimo pagará multa rescisória equivalente a **3 (três) mensalidades** vigentes, sem prejuízo dos valores já vencidos.

10.2. **Rescisão sem justa causa após o prazo mínimo:**
Qualquer das Partes pode rescindir mediante aviso prévio escrito de **30 (trinta) dias**, sem multa.

10.3. **Rescisão com justa causa pelo CONTRATADO:**

- Inadimplência superior a **30 (trinta) dias** de qualquer parcela;
- Uso do Sistema para fins ilícitos pela CONTRATANTE;
- Quebra grave de obrigação contratual não sanada em 15 dias após notificação.

10.4. **Rescisão com justa causa pela CONTRATANTE:**

- Indisponibilidade do Sistema por mais de **72 (setenta e duas) horas consecutivas** sem justificativa de força maior;
- Descumprimento reiterado do SLA da Cláusula 7 por **3 (três) meses consecutivos**;
- Quebra grave de obrigação contratual pelo CONTRATADO não sanada em 15 dias após notificação.

10.5. **Efeitos da rescisão.** Em qualquer hipótese de rescisão, o CONTRATADO:

- entregará à CONTRATANTE, em até 30 dias, uma cópia dos **dados** da CONTRATANTE (pedidos, clientes, cardápio) em formato aberto (CSV/JSON);
- transferirá o **domínio** registrado em nome do cliente, se aplicável;
- **não é obrigado a entregar o código-fonte**, salvo se acionado o adendo de buy-out (Anexo II);
- prestará suporte de descontinuação ("offboarding") por até 15 dias, em regime best-effort.

---

## 11. Limitação de responsabilidade

11.1. A responsabilidade total do CONTRATADO, por qualquer causa relacionada a este contrato, fica limitada ao valor efetivamente pago pela CONTRATANTE nos **12 (doze) meses anteriores** ao evento que originou a responsabilização (setup + mensalidades). `[REVISAR COM ADVOGADO]`

11.2. O CONTRATADO não responde por:

- lucros cessantes da CONTRATANTE;
- indisponibilidades causadas por terceiros (provedor de hospedagem, WhatsApp, DNS, energia elétrica);
- caso fortuito ou força maior;
- uso indevido do painel admin por funcionários da CONTRATANTE.

11.3. Esta cláusula não exclui a responsabilidade por dolo ou culpa grave.

---

## 12. Disposições gerais

12.1. **Alteração contratual.** Qualquer alteração deste contrato deverá ser feita por escrito, por aditivo assinado por ambas as Partes.

12.2. **Não-vínculo trabalhista.** O presente contrato é de natureza civil. Não há entre as Partes qualquer vínculo trabalhista, previdenciário ou societário.

12.3. **Cessão.** A CONTRATANTE não poderá ceder este contrato a terceiros sem prévia anuência escrita do CONTRATADO. O CONTRATADO poderá ceder a posição contratual a empresa do mesmo grupo econômico mediante comunicação prévia.

12.4. **Notificações.** Comunicações relativas ao contrato devem ser feitas por escrito, via e-mail aos endereços indicados na Cláusula 1, com confirmação de leitura ou resposta. WhatsApp é canal de suporte (Cláusula 7), não substitui notificação formal.

12.5. **Tolerância.** A eventual tolerância de uma Parte ao descumprimento da outra não constitui novação, renúncia ou alteração contratual.

12.6. **Independência das cláusulas.** A invalidade de qualquer cláusula não afeta as demais.

---

## 13. Foro

Fica eleito o foro da Comarca de **Teresina – PI** para dirimir quaisquer dúvidas oriundas deste contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

---

E, por estarem assim justas e contratadas, as Partes assinam o presente em 2 (duas) vias de igual teor e forma.

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

\
\
**Testemunhas:**

1. Nome: `__________` — CPF: `__________`
2. Nome: `__________` — CPF: `__________`

---

## Anexo I — Escopo técnico do tier contratado

`[PREENCHER COM A LISTA DETALHADA DO TIER ESCOLHIDO — copiar do PDF da proposta TAKA-21]`

## Anexo II — Termo de Propriedade Intelectual

Ver documento `termo-propriedade-intelectual.md`, que integra este contrato para todos os efeitos.
