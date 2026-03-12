# Notion Schema Definition

## 1. Mapa de Distribuição Mansão Maromba
Stores the current active distribution points.

| Property | Type | Description |
| :--- | :--- | :--- |
| **Nome do Ponto** | Title | Business name |
| **Status** | Select | [Ativo, Inativo, Suspenso] |
| **Tipo** | Multi-select | [Academia, Loja de Suplementos, Mercado, Outro] |
| **Endereço** | Rich Text | Full physical address |
| **Volume Mensal** | Number | Units sold per month |
| **Cidade/Estado** | Select | Region identifier |

## 2. Alvos de Prospecção
The CRM for new partners discovered by the MapsProspector.

| Property | Type | Description |
| :--- | :--- | :--- |
| **Prospect Name** | Title | Name of the lead |
| **Funnel Stage** | Select | [Lead, Contacted, Negotiating, Won, Lost] |
| **Phone** | Phone | Contact number |
| **Last Contact** | Date | Last time the bot reached out |
| **Notes** | Rich Text | AI-generated summary of the prospect |

## 3. Backlog Radar Mansao Maromba
Project management database for development tasks.

| Property | Type | Description |
| :--- | :--- | :--- |
| **Task** | Title | Feature or bug name |
| **Priority** | Select | [P0 - Critical, P1 - High, P2 - Normal] |
| **Status** | Status | [Not Started, In Progress, Blocked, Done] |
| **Assignee** | People | Responsible developer/agent |

---

### Example Record (Prospects)
- **Prospect Name**: Ironberg CT
- **Funnel Stage**: Negotiating
- **Notes**: High volume potential, located in São Caetano.
