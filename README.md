# Mansão Maromba Distribution Radar

**Live Notion Dashboard:** [Radar de Distribuição Mansão Maromba](https://deeply-nutria-27e.notion.site/Radar-de-Distribui-o-Mans-o-Maromba-a7db58ed8f3b4e5db7d7c1c1f70bb2cf)
**Alternate View:** [Distribution Radar Dashboard](https://hackatoon.notion.site/?v=31c0ecb3df6180bd981b000c6ae8c235)

The Mansão Maromba Distribution Radar is an opinionated reference project that turns Notion into the **source of truth** for distribution mapping, prospecting, and messaging workflows, powered by Notion MCP, Visual Code, a mapping service, and WhatsApp bots. It is designed as a portfolio‑grade repo that you can fork, adapt to your own brand, or use as a template for agentic distribution operations.

The core idea: model everything in Notion (`Mapa de Distribuição`, `Alvos de Prospecção`, `Backlog Radar Mansão Maromba`), expose it via the official Notion MCP server, and orchestrate agents (schema/backlog, maps prospector, messaging assistant) from an MCP client

## Notion AI Agents

To automate and enhance the distribution operations, we utilize specialized agents designed to interact with the Notion ecosystem:

1.  **Mansão Maromba — Navigator:** The lead agent responsible for operating the Distribution Map as a complete prospecting and CRM system. It discovers new points of sale (PDVs) via Google Maps API/MCP, automatically enriches records, maintains the sales funnel, and generates weekly executive summaries with key KPIs.
2.  **Master UI Agent:** Focuses on user experience and data visualization. It transforms complex, data-heavy pages into minimalist, highly functional dashboards using custom Notion layouts, callouts, synced navigation, and curated database views.
3.  **Amplitude Data Analyst:** Bridges the gap between product usage and CRM. It analyzes Amplitude data and creates visual product usage reports directly within Notion to help prioritize high-potential leads.
4.  **Email Assistant:** Streamlines daily communication. During daily workflows, it integrates with all connected inboxes to ensure all incoming leads and responses are loaded, tracked, and ready for the next action.

## High‑level flows

### 1. Distribution Map + Dashboard (Notion‑centric)

- Notion databases model:
  - Current distribution presence by city/region and channel.
  - Prospect targets with geo and business metadata.
  - Backlog of experiments, campaigns, and ops tasks.
- The **Schema/Backlog/PRD agent** runs inside Antigravity (or another MCP client) and:
  - Validates that the Notion schema matches the spec.
  - Creates/updates views and dashboards (funnels, regional overviews).
  - Maintains a living PRD/backlog inside Notion pages.

### 2. Maps Prospecting Agent with MapOn.ai (Mapping Service → Notion)

- A specialized **MapsProspector agent** that integrates with MapOn.ai:
  - Pulls location data from interactive MapOn.ai maps
  - Automatically identifies and filters bars and beverage establishments in Paraná
  - Creates prospects in Notion with ready-to-use call scripts for Mansão Maromba drinks
  - Filters out existing prospects to avoid duplicates
- This agent can be triggered from an MCP client, scheduled, or run via npm script.
- MapOn.ai provides visual context for prospecting and helps you plan routes and territories.

### 3. Messaging Assistant (WhatsApp Bot) - *Future Integration*

The system is designed to integrate a **WhatsApp Messaging Assistant** that bridges the gap between prospecting and conversion. This component will:

- **Automated Outreach:** Connect to WhatsApp Business API (via providers like Twilio or Meta) to initiate contact with prospects identified in the Notion `Alvos de Prospecção` database.
- **Dynamic Context:** Use AI to generate personalized messages based on the prospect's profile (type of establishment, location, and potential volume) stored in Notion.
- **Two-Way Synchronization:** 
    - **Inbound:** When a bar owner replies, the bot uses LLMs to categorize the response (Interested, Not Interested, Needs Follow-up) and updates the status directly in Notion.
    - **Outbound:** Triggers follow-up sequences or sends product catalogs automatically based on status changes in the Notion Kanban board.
- **Agentic Collaboration:** Operates as an extension of the MCP client, allowing a human operator to "take the wheel" for complex negotiations while the bot handles the bulk of the initial filtering and scheduling.

This repo ships **prompts**, **config templates**, and **code skeletons**, not production‑ready bots. You are expected to plug in your own API keys, security, hosting, and CI/CD.

## Architecture overview

At a glance, the system looks like this:

```txt
             +-------------------------+
             |   MCP Client / Cockpit |
             |  (Visual Code, CLI,…)  |
             +-----------+-------------+
                         |
                         | MCP protocol
                         v
              +------------------------+
              |  Notion MCP Server     |
              | (@notionhq/notion-mcp) |
              +----+--------------+----+
                   |              |
         Notion API|              |HTTP/Webhooks
                   v              v
        +----------------+   +-------------------+
        |  Notion DBs    |   | External Services |
        | - Mapa Dist.   |   | - MapOn.ai        |
        | - Alvos Pros.  |   | - WhatsApp API    |
        | - Backlog      |   +---------+---------+
        +--------+-------+             ^
                 ^                     |
                 |                     |
        +--------+----------+   +------+----------------+
        | Paraná Bars        |   | Messaging Assistant   |
        | Prospector         |   | (WhatsApp bot)        |
        | (MapOn.ai API)     |   +-----------------------+
        +-------------------+
```
