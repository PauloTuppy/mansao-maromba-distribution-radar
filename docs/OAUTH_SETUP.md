# OAuth Setup - Passo a Passo

## Problema
O redirect URI anterior (`https://hackatoon.notion.site`) não é controlável, dificultando capturar o `code` de autorização.

## Solução
Usar um servidor local na porta 3000 para capturar o code automaticamente.

## ✅ Passos para Configurar

### 1️⃣ Atualizar Integração no Notion

```
Acesse: https://www.notion.so/my-integrations
```

- Encontre a integração `mansao-maromba-distribution-radar`
- Localize a seção "Redirect URIs"
- Remova: `https://hackatoon.notion.site`
- Adicione: `http://localhost:3000/oauth-callback`
- Click "SAVE" (Salvar)
- Copie e salve seu OAuth Secret se ele foi regenerado

### 2️⃣ Abrir o Servidor de Callback (Terminal 1)

```powershell
npm run oauth-callback
```

Saída esperada:
```
🚀 OAuth Callback Server Started
==================================
✅ Server listening at: http://localhost:3000
✅ Callback endpoint: http://localhost:3000/oauth-callback
⏳ Waiting for callback...
```

**Deixe este terminal rodando!**

### 3️⃣ Gerar Link de Autorização (Terminal 2)

Em outro terminal:

```powershell
npm run oauth-authorize
```

Saída esperada:
```
🔐 Notion OAuth Authorization

1. Open this URL in your browser:
   https://api.notion.com/v1/oauth/authorize?client_id=31fd872b-...
```

Copie a URL e abra no seu navegador.

### 4️⃣ Autorizar no Navegador

- Clique em "Select a workspace"
- Escolha seu workspace
- Clique em "Allow"
- Será redirecionado para: `http://localhost:3000/oauth-callback?code=...`

### 5️⃣ Copiar o Code

O servidor local vai exibir automaticamente no Terminal 1:

```
✅ Authorization Code Captured!
==================================
📋 Your Authorization Code:
   xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Também aparecerá no navegador.

### 6️⃣ Trocar o Code por Tokens

No Terminal 2, execute (substitua pela UUID real):

```powershell
npm run oauth-exchange -- xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Saída esperada:
```
🔄 Exchanging authorization code...
✅ OAuth Exchange Complete!
   Workspace: Seu Workspace
   Owner: Seu Nome
   💾 Tokens saved locally for future use
```

### 7️⃣ Verificar os Tokens

```powershell
npm run oauth-list
```

Saída:
```
📋 Saved Workspaces:
   • Seu Workspace (workspace-id)
```

## ✨ Pronto!

Agora pode usar o bar prospector:

```powershell
npm run prospect-bars
```

Os 251 bares encontrados serão salvos no Notion! ✅

## 🔧 Troubleshooting

### "Connection refused on localhost:3000"
- Certifique-se de rodar `npm run oauth-callback` antes de abrir a URL
- A porta 3000 pode estar em uso por outro programa

### "Invalid redirectUri"
- Verifique se adicionou `http://localhost:3000/oauth-callback` nas configurações da integração no Notion
- Pode levar alguns minutos para sincronizar

### "API token is invalid"
- Após salvar os tokens com sucesso, rode novamente o prospector
- Se continuar dando erro, limpe os tokens: `npm run oauth-remove -- workspace-id`

## 📝 Alternativa: Token de Integração Simples

Se preferir não usar OAuth agora, pode usar um token de integração interna:

1. Acesse: https://www.notion.so/my-integrations
2. Crie uma nova Integração (Internal Integration)
3. Copie o token
4. Coloque no `.env`:
   ```
   NOTION_TOKEN=secret_seu_token_aqui
   ```

Isso é mais simples mas recomenda-se OAuth para produção.
