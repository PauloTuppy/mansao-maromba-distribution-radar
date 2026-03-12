# Project Architecture: Distribution Radar

## 1. Notion as the Source of Truth

Rather than a dedicated SQL database, we use Notion for its flexibility and native UI. 
The three core databases are:
- **Mapa de Distribuição**: Existing points of sale.
- **Alvos de Prospecção**: Cold and warm leads.
- **Backlog Radar**: Project tasks and PRDs.

## 2. Notion MCP Server

The connector between our AI agents and the Notion API. It allows agents to:
- `list_databases`
- `query_database`
- `create_page`
- `update_page_properties`

## 3. The Agent Squad

### A. Schema & Backlog Agent
Responsible for maintaining the integrity of the Notion workspace. It validates if properties are correct and manages the project's own development backlog.

### B. MapsProspector Agent
- **Input**: Geographic area and keywords (e.g., "Academia em São Paulo").
- **Action**: Queries a mapping service.
- **Output**: Populates the `Alvos de Prospecção` database in Notion with name, address, rating, and phone number.

### C. Messaging Assistant
- **Input**: A prospect from Notion.
- **Action**: Generates a personalized "Mansão Maromba" pitch.
- **Output**: Prepares a message for the WhatsApp bot to send.

## 4. External Integrations

- **Mapping Service**: Used for data mining.
- **WhatsApp API/Provider**: Used for the final conversion step.
- **Antigravity**: The execution environment that hosts the LLM and manages the MCP tool calls.
