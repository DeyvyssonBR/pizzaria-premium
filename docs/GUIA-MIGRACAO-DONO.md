# 🔄 GUIA DE MIGRAÇÃO — Trocar de dispositivo

> **Para:** Dono da Pizzaria Premium Teresina
> **Tempo estimado:** 10 minutos

A Pizzaria Premium usa **localStorage** — seus dados de cardápio, horários, pedidos e configurações ficam **só no dispositivo atual**. Ao trocar de celular ou limpar o navegador, os dados se perdem.

Este guia ensina como **fazer backup** e **restaurar** os dados.

---

## 📤 Como fazer backup (dispositivo antigo)

### Opção A: Backup completo (recomendado)

1. Abra o painel admin: `admin.html`
2. Faça login como admin.
3. Vá em **Backup** (aba lateral).
4. Clique em **"Exportar tudo (JSON)"**.
5. Salve o arquivo `pizzaria-premium-backup-AAAA-MM-DD.json` em local seguro.

### Opção B: Exportar dados da conta (LGPD)

Se quiser só seus dados pessoais (não o cardápio):

1. Abra o site.
2. Clique no ícone de conta (canto superior).
3. **Exportar meus dados** → baixa JSON com seus pedidos, pontos e endereços.

---

## 📥 Como restaurar (dispositivo novo)

### 1. Abra o painel admin no novo dispositivo

- URL: `admin.html`
- Faça login com a senha de admin.

### 2. Restaurar backup

1. Vá em **Backup** → **"Importar (JSON)"**.
2. Selecione o arquivo `pizzaria-premium-backup-AAAA-MM-DD.json`.
3. Clique **"Restaurar"**.
4. **Recarregue a página** (F5).

### 3. Recriar conta de cliente (se necessário)

- O backup inclui contas, mas senhas podem precisar ser redefinidas.
- Se esqueceu a senha: use "Esqueci minha senha" no modal de login.

---

## ⚠️ O que MIGRA vs o que NÃO migra

### ✅ Migra (no backup JSON)
- Cardápio completo (pizzas, preços, categorias)
- Horários de funcionamento
- Mensagens automáticas
- Promoções
- Configurações (WhatsApp, Pix, taxa de entrega)
- Pedidos salvos
- Contas de cliente (sem senhas)
- Pontos de fidelidade

### ❌ NÃO migra
- **Senhas de cliente** — precisam ser redefinidas (armazenadas com hash PBKDF2)
- **Sessão ativa** — refaça login após restaurar
- **Cache do navegador** — imagens recarregam automaticamente

---

## 🔐 Segurança do backup

- **NÃO compartilhe** o arquivo JSON — ele contém dados de clientes.
- Guarde em local seguro (Google Drive privado, pendrive criptografado).
- Após restaurar, **delete** o arquivo do dispositivo temporário.

---

## 📅 Frequência recomendada

| Frequência | Quando |
|---|---|
| **Semanal** | Toda segunda-feira (rotina) |
| **Antes de atualizações** | Antes de mudar código ou configurar algo novo |
| **Antes de trocar de dispositivo** | Obrigatório |
| **Após grandes mudanças** | Editou muito o cardápio? Faça backup |

---

## 🤖 Backup automático (opcional)

Se quiser backup automático, ative no admin:
1. **Configurações** → **Backup automático**
2. Frequência: **Semanal**
3. O site vai gerar e baixar um JSON todo domingo às 03:00.

> **Nota:** O navegador precisa estar aberto para o backup automático funcionar.

---

## 🆘 Troubleshooting

### "Arquivo inválido" ao importar
- Verifique se é um JSON válido (abre no bloco de notas, deve começar com `{`).
- Se corrompeu, refaça o backup no dispositivo antigo.

### Dados não apareceram após restaurar
- **Recarregue a página** (Ctrl+F5 para forçar).
- Se persistir, feche e abra o navegador.

### Senha de admin não funciona no novo dispositivo
- A senha de admin é **local** — redefina seguindo o wizard de primeiro acesso.

---

*Dúvidas? Contate o desenvolvedor. Última atualização: 19/06/2026.*
