# Admin "no ponto" — Passo-a-passo do Dono

**Issue:** [TAA-23](/TAA/issues/TAA-23)
**Agente:** AdminPanelEngineer (08c05721-62af-4add-a419-71370ada74b2)
**Data:** 2026-06-12
**Stack:** `admin.html` (vanilla, sem build) + novo `assets/js/admin.js` (modular)

> Arquivo privado, listado no `.gitignore` (`docs-local/`, `*.local.md`). NÃO enviar ao GitHub.

---

## O que o dono ganhou nesta entrega

1. **Onboarding automático em 1 página** — tour guiado de 6 passos que aparece no primeiro login. Pode ser reaberto em "Onboarding" no menu lateral.
2. **Aba "Horários"** — edita os 7 dias da semana (faixa de horário + flag "Fechado"). A home page lê em tempo real e mostra a pílula "Aberto · Fecha às 22:00" / "Abre amanhã às 18:00" / "Fechado".
3. **Aba "Mensagens"** — 4 templates prontos (boas-vindas, saiu para entrega, pronto para retirada, fora do horário). Dono edita, copia com 1 clique, salva automaticamente. Placeholders: `{{nome}}`, `{{pedido}}`, `{{eta}}`, `{{horario}}`.
4. **Aba "Backup"** — exporta TODAS as chaves `premium_pizzaria_*` em 1 JSON; importa de volta para restaurar em outro dispositivo. Botão "Apagar tudo" com dupla confirmação.
5. **Não-duplicação** — login/dashboard/auth continuam cobertos por [TAA-13](/TAA/issues/TAA-13) e [TAA-2](/TAA/issues/TAA-2). Esta entrega só ADICIONA abas.

---

## Passo-a-passo (dono, sem suporte)

### 1. Abrir o painel
- No navegador do PC/notebook/celular em que você opera a pizzaria, abra o link do `admin.html`.
- **Login:** use a senha que você definiu (TAA-13). Senha padrão nova: você define no primeiro acesso.
- **Cache do navegador:** se a tela ficar com cara antiga, faça `Ctrl+Shift+R` (ou `Cmd+Shift+R` no Mac) para forçar reload do Service Worker `pizzaria-premium-v14-owner-self-service`.

### 2. Onboarding
- No primeiro login, o tour abre sozinho (overlay preto com 6 passos).
- Para cada passo:
  1. **Horário de funcionamento** → clique "Abrir" → marque os dias e horários reais → "Salvar horários".
  2. **WhatsApp de atendimento** → "Abrir" → confirme o número (55 + DDD + número).
  3. **Pix para receber** → "Abrir" → chave Pix + nome (até 25 letras) + cidade (até 15 letras) → "Gerar QR Teste" para conferir.
  4. **Cardápio** → revise pizzas, bebidas, combos. Botão "Nova Pizza" para criar, lápis para editar.
  5. **Zonas e taxa de entrega** → CEP da pizzaria + raio máximo + regras de frete. Use o simulador.
  6. **Backup do seu trabalho** → clique "Baixar backup" → guarde o JSON no Drive/HD.
- "Marcar onboarding concluído" quando terminar. O tour só aparece de novo se você clicar "Onboarding" no menu.

### 3. Backup periódico (a cada 1-2 semanas)
- Vá em **Backup** no menu lateral.
- Clique **"Baixar backup"** — o arquivo baixa como `pizzaria-premium-backup-AAAA-MM-DDTHH-MM-SS.json`.
- Guarde em local seguro (Drive, e-mail para você mesmo, HD externo).
- Se o navegador for limpo ou você trocar de aparelho: clique **"Importar arquivo…"** e selecione o JSON. Tudo volta como estava.

### 4. Mensagens para o WhatsApp Business
- Vá em **Mensagens**.
- As 4 mensagens padrão servem para 90% dos casos. Edite o texto à vontade — o preview mostra como o cliente vai ler.
- Botão **"Copiar"** copia para a área de transferência. Cole em **WhatsApp Business → Configurações → Ferramentas comerciais → Respostas rápidas**.
- **"Nova mensagem"** cria mais (ex: "Pedido cancelado", "Saiu para entrega em outro horário").
- **"Restaurar padrão"** volta aos 4 templates originais.

### 5. Horários
- Vá em **Horários**.
- Para cada dia:
  - **Fechado** = folga semanal (ex: segunda).
  - **Aberto das 18:00 às 22:00** = horário normal.
- A pílula da home page (Aberto / Fecha às / Abre amanhã) atualiza sozinha a cada 60 segundos.

### 6. Quando algo dá errado
- Tela em branco no admin → `Ctrl+Shift+R` para recarregar sem cache.
- Esqueceu a senha do admin → [TAA-13](/TAA/issues/TAA-13) cobre o reset (limpar `pp_admin_*` no DevTools).
- Perdeu o cardápio depois de limpar dados → import o último backup JSON que você guardou.
- Mensagem automática "fechada" mesmo com horário OK → confira a aba "Horários" do admin; pode ter desmarcado o dia.

---

## Onde está no código (referência técnica)

| Arquivo | O que mudou |
|---|---|
| `assets/js/admin.js` (novo, 651 linhas) | `window.PP_ADMIN` com 4 features (backup, horas, mensagens, onboarding). Bootstrap deferido. |
| `admin.html` (linhas 2096-2108, 2774-2871, 3354-3455, 6622-6624) | +4 nav items (`Horários`, `Mensagens`, `Backup`, `Onboarding`), +4 abas com mesmo `.tab-content` style, +overlay de onboarding, +CSS escopado `.pp-*`, +`<script src="assets/js/admin.js" defer>` |
| `assets/js/script.js:3713-3746` | `SCHEDULE` agora lê `premium_pizzaria_store_hours` do `localStorage`. Fallback preserva o padrão Teresina 18:00–23:30 (Seg até 22:00). |
| `assets/js/script.js:3777-3786` | Lista de horários da pílula da home re-renderiza com os valores editados e marca "Fechado" para dias com `closed:true`. |
| `sw.js:1,5` | `CACHE_NAME` bumpado para `pizzaria-premium-v14-owner-self-service`; `assets/js/admin.js` adicionado à lista de precache. |

---

## Limitações honestas

- **Sem backend**: tudo vive no `localStorage` do navegador. Trocar de navegador/dispositivo = perder tudo a menos que tenha feito backup.
- **Sem sync entre abas**: as edições salvam em `localStorage` (escutado pelo `storage` event do navegador, então 2 abas abertas do admin sincronizam). Mas a home page só lê no carregamento ou no `setInterval` de 60s.
- **Mensagens não disparam sozinhas**: a aba Mensagens é uma biblioteca de templates. A integração com WhatsApp Business / resposta rápida é manual (copiar/colar). Automatizar isso exigiria WhatsApp Business API paga — fora do escopo.
- **Horários não bloqueiam pedidos**: mesmo fechado, o cliente pode mandar pedido pelo WhatsApp. Cabe ao dono recusar. O próximo nível (TAA-34 ou similar) seria integrar com o `script.js` para esconder o botão "Pedir" fora do horário.
- **Backup inclui tudo** (até o analytics log com 500 eventos). É útil para migrar, mas o arquivo pode ficar grande (~5 MB no pior caso).

---

## Próximos passos (fora do escopo desta entrega)

- **Mover admin auth para TAA-13** (rewrite de auth com pepper + lockout). Depois que o dono perder a senha, ele só reseta via DevTools.
- **Sync entre dispositivos via Firebase / KV** (próximo nível, exige backend).
- **Integração WhatsApp Business API** para disparar mensagens automáticas (templates) sem copiar/colar.
- **Bloqueio de checkout fora do horário** no `script.js` com base na chave `premium_pizzaria_store_hours`.
