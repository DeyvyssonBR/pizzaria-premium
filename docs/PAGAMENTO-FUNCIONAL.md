# Pagamento o mais funcional possível

## Como rodar (obrigatório para API)

```powershell
cd PaperClip
# .env.local com MP_ACCESS_TOKEN=TEST-... ou APP_USR-...
node server.js
```

Abra **http://localhost:3000** (não o GitHub Pages) para Mercado Pago API.

## O que funciona em cada modo

| Forma | Local (`node server.js` + token) | GitHub Pages / HTML só |
|--------|-----------------------------------|-------------------------|
| **Mercado Pago Checkout** (cartão/Pix no site MP) | ✅ Sandbox com token TEST | ❌ (sem backend) ou link manual no admin |
| **Pix chave da loja** (copia e cola) | ✅ | ✅ |
| **Pix API MP** (confirma sozinho) | ✅ se token produção / se TEST permitir | ❌ sem backend |
| **Dinheiro / cartão na entrega** | ✅ | ✅ |
| **WhatsApp do pedido** | ✅ | ✅ |

## Fluxo real da loja (recomendado)

1. Cliente pede no site  
2. Paga (Pix chave **ou** Mercado Pago)  
3. Clica **Enviar Pedido no WhatsApp**  
4. Atendente confere pagamento e manda pra cozinha  

## Teste sandbox (sem dinheiro real)

1. `node server.js`  
2. Pedido → **Mercado Pago** → botão deve dizer **(TESTE)**  
3. Janela anônima → login **comprador** `TESTUSER…`  
4. Cartão de teste da doc MP  
5. **Não** use conta real no checkout  

## Produção (dinheiro real)

1. No painel MP: **credenciais de produção** `APP_USR-…`  
2. Coloque no `.env.local` / Vercel `MP_ACCESS_TOKEN`  
3. Hospede com backend (Vercel + `api/create-preference.js` ou Level7 só site + Worker)  
4. Complete endereço/billing da conta se o painel pedir (`address_pending`)  

## Admin

- **Chave Pix** da loja (fallback sempre)  
- **Link MP** opcional se não tiver API  
- **WhatsApp** correto  
