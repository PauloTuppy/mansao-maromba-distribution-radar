# Mansão Maromba Distribution Radar

The Mansão Maromba Distribution Radar is an opinionated reference project that turns Notion into the **source of truth** for distribution mapping, prospecting, and messaging workflows, powered by Notion MCP, Visual Code, a mapping service, and WhatsApp bots. It is designed as a portfolio‑grade repo that you can fork, adapt to your own brand, or use as a template for agentic distribution operations.

The core idea: model everything in Notion (`Mapa de Distribuição`, `Alvos de Prospecção`, `Backlog Radar Mansão Maromba`), expose it via the official Notion MCP server, and orchestrate agents (schema/backlog, maps prospector, messaging assistant) from an MCP client

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

### 3. Messaging Assistant (iMessage / WhatsApp)

- A **Messaging assistant** bot connects to a WhatsApp provider (e.g., Twilio, Gupshup, or Meta Cloud API) and:
  - Reads the prioritized outreach queue from Notion (`Backlog` + `Alvos de Prospecção`).
  - Sends structured outreach messages, tracks replies, and updates statuses in Notion.
  - Can be assisted by an MCP‑based agent prompt to generate or adapt conversational flows.

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
