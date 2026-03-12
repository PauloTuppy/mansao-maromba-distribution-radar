# 🔐 Notion OAuth 2.0 Implementation

This guide covers the complete OAuth 2.0 implementation for secure Notion API access.

## 📋 Overview

Your code snippet showed how to exchange an authorization code for tokens:

```typescript
const response = await notion.oauth.token({
  client_id: process.env.OAUTH_CLIENT_ID,
  client_secret: process.env.OAUTH_CLIENT_SECRET,
  grant_type: "authorization_code",
  code: "abc123-authorization-code",
  redirect_uri: "https://example.com/callback"
})
```

**We've implemented a complete system that handles:**
- ✅ Authorization URL generation
- ✅ Token exchange
- ✅ Token refresh
- ✅ Secure token storage
- ✅ Multiple workspace support

---

## 🚀 Quick Start

### Option 1: Direct Integration Token (Development)
```dotenv
NOTION_TOKEN=secret_XXXXXXXXXXXXXXXXXXXX
```

### Option 2: OAuth 2.0 (Recommended for Production)

#### Step 1: Get OAuth Credentials

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "Create new integration"
3. Fill in integration details:
   - **Name**: "Mansão Maromba Distribution"
   - **Associated workspace**: Select your workspace
4. Check capabilities:
   - ✅ `Read`
   - ✅ `Update`
   - ✅ `Insert`
   - ✅ `Create`
5. Click "Submit"
6. In "Secrets" tab, copy:
   - `Client ID`
   - `Client Secret`

#### Step 2: Configure Redirect URI

In the integration settings:
- Set **Redirect URIs** to:
  ```
  http://localhost:3000/oauth-callback
  ```

#### Step 3: Update `.env`

```dotenv
OAUTH_CLIENT_ID=your_client_id_here
OAUTH_CLIENT_SECRET=your_client_secret_here
OAUTH_REDIRECT_URI=http://localhost:3000/oauth-callback
```

#### Step 4: Authorize Your Workspace

```bash
npm run oauth-authorize
```

This will:
1. Generate authorization URL
2. Display it in console
3. You open it in browser
4. Notion asks you to authorize
5. You get redirected with a `code` parameter

#### Step 5: Exchange Code for Tokens

Copy the authorization code from the redirect URL and run:

```bash
npm run oauth-exchange -- abc123code
```

**What happens:**
- 🔄 Exchanges code for `access_token` and `refresh_token`
- 💾 Saves tokens locally in `.notion-tokens/workspace-id.json`
- ✅ Ready to use!

---

## 📊 Service Architecture

### 1. **NotionOAuthHandler** (`services/notion-setup/oauth-handler.ts`)

Core OAuth logic:

```typescript
const handler = new NotionOAuthHandler(clientId, clientSecret, redirectUri);

// Generate auth URL
const authUrl = handler.generateAuthorizationUrl();

// Exchange code for tokens
const tokens = await handler.exchangeCodeForTokens(code);

// Save for later use
handler.saveTokens(tokens.workspace_id, tokens);

// Get valid access token
const token = await handler.getValidAccessToken(workspaceId);
```

### 2. **NotionOAuthClientFactory** (`services/notion-setup/oauth-client-factory.ts`)

Easy Notion client creation:

```typescript
const factory = new NotionOAuthClientFactory(clientId, clientSecret);

// Get client for saved workspace
const client = await factory.getClientForWorkspace(workspaceId);

// Or use specific token
const client = factory.getClientWithToken(accessToken);
```

### 3. **OAuth Flow CLI** (`scripts/oauth-flow.js`)

Command-line interface for OAuth management:

```bash
npm run oauth-authorize      # Get authorization URL
npm run oauth-exchange -- CODE   # Exchange code for tokens
npm run oauth-refresh -- TOKEN   # Refresh access token
npm run oauth-list          # List saved workspaces
npm run oauth-remove -- ID  # Remove saved tokens
```

---

## 🔄 OAuth Flow Diagram

```
┌─────────────────┐
│  User Clicks    │
│  "Authorize"    │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  1. Launch Browser to Authorization  │
│  https://api.notion.com/v1/oauth/    │
│  authorize?client_id=XXX&...         │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  2. User Opens & Authorizes          │
│  (Selects workspace, clicks Allow)   │
└────────┬─────────────────────────────┘
         │
         ▼ Redirect with code
┌──────────────────────────────────────┐
│  3. Callback URL with code           │
│  http://localhost:3000/callback?     │
│  code=abc123def456...                │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  4. Exchange Code via Backend        │
│  POST /v1/oauth/token                │
│  {code, client_id, client_secret}    │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  5. Receive Tokens                   │
│  {                                   │
│    access_token,                     │
│    refresh_token,                    │
│    bot_id,                           │
│    workspace_id                      │
│  }                                   │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  6. Use Access Token                 │
│  Authorization: Bearer <token>       │
│  GET /v1/databases/...               │
└──────────────────────────────────────┘
```

---

## 📁 Token Storage

Tokens are saved locally in `.notion-tokens/` directory:

```
.notion-tokens/
├── workspace-id-1.json
├── workspace-id-2.json
└── workspace-id-3.json
```

Each file contains:
```json
{
  "access_token": "Bearer token for API requests",
  "refresh_token": "For renewing access token",
  "bot_id": "ID of the OAuth app bot",
  "workspace_id": "Notion workspace ID",
  "workspace_name": "Display name",
  "owner": { "user": { "name": "...", "email": "..." } },
  "saved_at": "2026-03-08T10:30:00Z"
}
```

---

## 🔐 Security Best Practices

### ✅ Do:
- Store tokens in `.notion-tokens/` (local, encrypted if possible)
- Use environment variables for client credentials
- Rotate tokens periodically
- Use refresh tokens to get new access tokens
- Never commit `.env` or `.notion-tokens/` to git

### ❌ Don't:
- Hardcode tokens in code
- Commit `.env` file to version control
- Share client secret publicly
- Use the same token across multiple services

### Git Configuration
```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo ".notion-tokens/" >> .gitignore

git add .gitignore
git commit -m "Add secrets to gitignore"
```

---

## 💻 Code Examples

### Example 1: Get Authorization URL

```typescript
import { NotionOAuthHandler } from './services/notion-setup/oauth-handler'

const handler = new NotionOAuthHandler(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET
)

const authUrl = handler.generateAuthorizationUrl()
console.log(`Visit: ${authUrl}`)
```

### Example 2: Exchange Code for Tokens

```typescript
const code = 'abc123-from-redirect-url'
const tokens = await handler.exchangeCodeForTokens(code)

// Save for later
handler.saveTokens(tokens.workspace_id, tokens)
```

### Example 3: Use OAuth Client Factory

```typescript
import { NotionOAuthClientFactory } from './services/notion-setup/oauth-client-factory'

const factory = new NotionOAuthClientFactory(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET
)

// List available workspaces
const workspaces = factory.getAvailableWorkspaces()
workspaces.forEach(ws => {
  console.log(`${ws.name} (${ws.id})`)
})

// Get client for specific workspace
const client = await factory.getClientForWorkspace(workspaceId)
const dbs = await client.databases.list()
```

### Example 4: Refresh Access Token

```typescript
const tokens = handler.loadTokens(workspaceId)
const newTokens = await handler.refreshAccessToken(tokens.refresh_token)

// Update saved tokens
handler.saveTokens(workspaceId, newTokens)
```

---

## 🧪 Testing OAuth Flow

### Manual Test Steps

1. **Generate Auth URL:**
   ```bash
   npm run oauth-authorize
   ```
   Output:
   ```
   🔐 Notion OAuth Authorization

   1. Open this URL in your browser:
      https://api.notion.com/v1/oauth/authorize?client_id=...

   2. Click "Select a workspace"
   3. Click "Allow"
   4. Copy the "code" from redirect URL
   5. Run: npm run oauth-exchange -- CODE
   ```

2. **Open URL in Browser:**
   - Click the URL from terminal
   - Select workspace
   - Click "Allow"
   - You're redirected to: `http://localhost:3000/oauth-callback?code=abc123`

3. **Exchange Code:**
   ```bash
   npm run oauth-exchange -- abc123
   ```
   Output:
   ```
   ✅ OAuth Exchange Complete!
   ================================
      Workspace: My Workspace
      Owner: John Doe
      Bot ID: 3c90c3cc...

   💾 Tokens saved locally for future use
   ```

4. **List Saved Workspaces:**
   ```bash
   npm run oauth-list
   ```

5. **Use in Your App:**
   ```bash
   npm run prospect-bars Paraná
   ```

---

## 🔄 Token Refresh

Access tokens expire. When they do, use refresh token to get new access token:

```typescript
// Load old tokens
const tokens = handler.loadTokens(workspaceId)

// Refresh
const newTokens = await handler.refreshAccessToken(tokens.refresh_token)

// Save new tokens
handler.saveTokens(workspaceId, newTokens)

// Now use new access token
const client = factory.getClientWithToken(newTokens.access_token)
```

---

## 🎯 Integration with MCP

Your MCP configuration now supports OAuth:

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "access_token_from_oauth"
      }
    }
  }
}
```

---

## 📞 Troubleshooting

### "invalid_client"
**Problem:** Client ID or secret is wrong
**Solution:** Double-check credentials in `https://www.notion.so/my-integrations`

### "invalid_grant"
**Problem:** Authorization code expired or already used
**Solution:** Generate new authorization code with `npm run oauth-authorize`

### "redirect_uri_mismatch"
**Problem:** Redirect URI doesn't match configuration
**Solution:** Update in Notion integration settings and `.env`

### "unauthorized"
**Problem:** Access token is invalid or expired
**Solution:** Refresh token: `npm run oauth-refresh -- your_refresh_token`

---

## 🚀 Next Steps

1. ✅ Get OAuth credentials from Notion
2. ✅ Configure `.env` with OAuth details
3. ✅ Run `npm run oauth-authorize`
4. ✅ Authorize in browser
5. ✅ Run `npm run oauth-exchange -- CODE`
6. ✅ Start using: `npm run prospect-bars Paraná`

Your Mansão Maromba system is now fully integrated with Notion OAuth! 🎉
