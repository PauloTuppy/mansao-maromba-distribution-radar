# Guia de Integração: Notion + Antigravity (MCP)

Este documento explica como conectar o Antigravity ao seu Workspace da Notion utilizando o protocolo MCP.

## 1. Pré-requisitos
- **Notion API Token**: Crie uma integração em [notion.so/my-integrations](https://www.notion.so/my-integrations).
- **Node.js instalado**: Necessário para rodar o servidor MCP oficial da Notion via `npx`.
- **Antigravity**: O cliente MCP onde os agentes serão executados.

## 2. Configurando o Notion
1. Obtenha seu `Internal Integration Token` (começa com `secret_`).
2. Vá até as bases de dados da Mansão Maromba no Notion.
3. Clique nos `...` da página superior e escolha **Add Connections**.
4. Procure e selecione a integração que você criou. *Sem este passo, a IA não verá as tabelas.*

## 3. Configurando o Antigravity
O Antigravity precisa saber como "chamar" o servidor do Notion.

1. Localize o arquivo de configuração de MCP do seu Antigravity (geralmente em `mcp_config.json` nas configurações do app).
2. Adicione a seguinte configuração (veja o exemplo em `/mcp/mcp_config.example.json`):

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "SUA_SECRET_AQUI"
      }
    }
  }
}
```

## 4. Como os Agentes Usam a Integração
Uma vez conectado, o Antigravity ganha "superpoderes" (tools). Quando você rodar um prompt da pasta `/prompts`, a IA fará o seguinte:

- **Busca**: "Quais os novos alvos de prospecção?" -> Chama `notion_query_database`.
- **Escrita**: "Adicione a Academia X ao mapa." -> Chama `notion_create_page`.
- **Schema**: "Quais as colunas desta tabela?" -> Chama `notion_get_database_schema`.

## 6. Setting up the Paraná Bars Prospector Agent

### Google Places API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Places API: Go to "APIs & Services" > "Library" > Search for "Places API" > Enable
4. Create credentials: "APIs & Services" > "Credentials" > "Create Credentials" > "API Key"
5. (Optional) Restrict the API key to Places API only for security

### Environment Variables
Copy `.env.example` to `.env` and fill in:
```bash
NOTION_TOKEN=your_notion_integration_token
GOOGLE_PLACES_API_KEY=your_google_places_api_key
PROSPECT_DB_ID=your_alvos_de_prospeccao_database_id
```

### Running the Agent
```bash
npm install
npm run prospect-bars
```

The agent will:
- Search for bars across 10 major Paraná cities
- Get complete business details for each
- Create new prospects in Notion with call scripts
- Provide a summary of findings
