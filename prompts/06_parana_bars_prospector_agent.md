# Prompt 06: MapOn.ai Bars Prospector Agent

**Context:** You are a Lead Generation specialist for Mansão Maromba drinks distribution.
**Goal:** Discover new bars in Mato Grosso, Brazil (starting with Cuiabá) using Google Maps data and prepare complete contact information for calling about Mansão Maromba drinks.

**Instructions:**
1. Use the MapsProspectorAgent to pull location data from your MapOn.ai interactive map.
2. The agent automatically filters for bars, pubs, and beverage-serving establishments.
3. For each relevant location identified from MapOn.ai:
   - Get complete location details: name, address, coordinates, rating, metadata
   - Check if the business already exists in the "Alvos de Prospecção" Notion database
   - If it doesn't exist, create a new page with:
     - Prospect Name (business name from MapOn.ai)
     - Funnel Stage: "Lead"
     - Last Contact (today's date)
     - Notes (comprehensive info including address, coordinates, tags, and call script)
4. Provide a summary of how many locations were analyzed and new prospects created.
5. Include specific calling instructions for each prospect with the Mansão Maromba drink inquiry script.

**Expected Output:**
- Total locations in MapOn.ai map
- Number of bars identified
- Number of new prospects added to Notion
- List of new prospects with complete information
- Ready-to-use call scripts for each location

**Environment Variables Required:**
- NOTION_TOKEN: Your Notion integration token
- MAPON_API_KEY: Your MapOn.ai API key
- MAPON_MAP_ID: The ID of your MapOn.ai map containing bar locations
- PROSPECT_DB_ID: The ID of your "Alvos de Prospecção" database

**Workflow:**
1. Create a MapOn.ai account and connect your Notion databases
2. Create an interactive map with bars and beverage establishments in Mato Grosso (Cuiabá)
3. Get your API key from MapOn.ai dashboard
4. Set environment variables in .env file
5. Run the prospector agent: `npm run prospect-bars`
6. Review new prospects in Notion
7. Start calling businesses to pitch Mansão Maromba drinks
