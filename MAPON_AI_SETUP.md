# MapOn.ai Setup Guide for Mansão Maromba Distribution Radar

## 🎯 **Complete Setup Instructions**

This guide walks you through setting up MapOn.ai to power your bar prospecting agent.

## **Step 1: Sign Up for MapOn.ai**

1. Go to [MapOn.ai](https://mapon.ai) (or MapOn's official website)
2. Click "Sign Up" and create your account
3. Verify your email address
4. Log in to the MapOn.ai dashboard

## **Step 2: Connect Notion to MapOn.ai**

1. In MapOn.ai dashboard, go to **Integrations** or **Data Sources**
2. Click **"Connect Data Source"** → **"Notion"**
3. You'll be prompted to authorize MapOn.ai to access your Notion workspace
4. Select your Notion workspace and authorize access
5. Grant access to the following databases:
   - **Mapa de Distribuição Mansão Maromba** (current distribution network)
   - **Alvos de Prospecção** (prospect pipeline)

## **Step 3: Create Your Bar Locations Map**

### **Create a New Map:**
1. In MapOn.ai dashboard, click **"Create Map"** or **"New Map"**
2. Name it: `Paraná Bars - Mansão Maromba`
3. Select your region: **Paraná, Brazil**
4. Click **"Create"**

### **Load Data from Notion (if available):**
1. After creating the map, go to **"Data Sources"**
2. Select **"Notion"** and choose the appropriate database
3. MapOn.ai will load existing location data if available

### **Add Bar Locations Manually (if needed):**
1. Click **"Add Location"** or **"Add Marker"**
2. For each bar location:
   - **Name**: Bar name (e.g., "Bar do João")
   - **Address**: Full address (e.g., "Rua das Flores 123, Curitiba, PR")
   - **Tags**: Add tags like "bar", "pub", "drinks", "nightlife"
   - **Rating**: If you have rating data (1-5 stars)
   - **Custom Fields**: Any additional metadata
3. Save each location

### **Alternative: Import CSV/Spreadsheet:**
1. If you have bar data in Excel or CSV format:
   - Go to **"Import"** in MapOn.ai
   - Select your file
   - Map columns (Name → Address, Tags, Ratings, etc.)
   - Click **"Import"**

## **Step 4: Get Your MapOn.ai API Credentials**

### **Find Your API Key:**
1. Go to MapOn.ai dashboard **"Account"** or **"Settings"**
2. Click **"API Keys"** or **"Developer"**
3. Either use existing key or click **"Generate New Key"**
4. Copy the API key (save it somewhere safe)

### **Find Your Map ID:**
1. Open your map: `Paraná Bars - Mansão Maromba`
2. Look at the URL: `https://app.mapon.ai/maps/YOUR_MAP_ID` or check map settings
3. Copy the Map ID

## **Step 5: Update Your .env File**

Edit your `.env` file with the credentials:

```env
NOTION_TOKEN=secret_your_notion_token_here
MAPON_API_KEY=your_mapon_api_key_here
MAPON_MAP_ID=your_map_id_here
PROSPECT_DB_ID=your_database_id_here
```

### **To get NOTION_TOKEN:**
1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Create a new integration or use existing:
   - Name: "Mansão Maromba Distribution Radar"
   - Click "Create"
3. Copy the "Internal Integration Token" (starts with `secret_`)
4. Go to your Notion databases and add this integration:
   - Open a database → `...` menu → "Add connections"
   - Select your integration

### **To get PROSPECT_DB_ID:**
1. Open your "Alvos de Prospecção" database in Notion
2. Copy the database ID from URL:
   - Example: `https://notion.so/workspace/12345678-90ab-cdef?v=...`
   - ID: `12345678-90ab-cdef` (remove dashes for a cleaner format)

## **Step 6: Test the Integration**

Run the agent to test everything:

```bash
npm run prospect-bars
```

### **Expected Output:**
```
🚀 Starting MapOn.ai Bar Prospector for Mansão Maromba
================================================
✓ Total locations in map: 250
✓ Bars and beverage locations identified: 45
✓ Prospect already exists: 5
✓ Created prospect: Bar do João
✓ Created prospect: Pub Central
...
✅ Orchestration Complete!
📊 Total locations: 250
🍺 Bars found: 45
🆕 New prospects added: 40
```

If you see success messages, your integration is working! ✅

## **Step 7: View Results in Notion**

1. Open your Notion workspace
2. Go to **"Alvos de Prospecção"** database
3. You should see new prospect entries with:
   - Bar name
   - Complete address
   - Coordinates
   - Call script notes
   - "Lead" funnel stage

## **Step 8: Use MapOn.ai for Strategic Planning**

Now you can use MapOn.ai to:

1. **Visualize Your Prospects:**
   - See all bar locations on an interactive map
   - Color-code by funnel stage (Lead, Contacted, Won, etc.)
   - Filter by city or region

2. **Analyze Coverage:**
   - Identify geographic gaps
   - Find market saturation in certain areas
   - Plan efficient prospecting routes

3. **Create Reports:**
   - Export map visualizations
   - Share with team for collaboration
   - Track expansion progress

4. **Plan Next Phase:**
   - Layer competitor locations on the map
   - Visualize distribution expansion strategy
   - Optimize territory assignment

## **Troubleshooting**

### **No locations found error:**
- Verify your MAPON_MAP_ID is correct
- Ensure your map has location data
- Check if API key is valid and not expired

### **Permission denied:**
- Verify NOTION_TOKEN is correct and starts with `secret_`
- Ensure the integration has access to your databases
- Check that PROSPECT_DB_ID is the correct database

### **Connection timeout:**
- Check your internet connection
- Verify MapOn.ai API is up (check status page)
- Try running again after a few minutes

## **Next Steps**

1. ✅ Set up MapOn.ai and create your bar map
2. ✅ Get your API credentials
3. ✅ Update .env file
4. ✅ Run `npm run prospect-bars`
5. ✅ Review prospects in Notion
6. 📞 Start calling bars about Mansão Maromba drinks!
7. 📊 Use MapOn.ai visualizations for team strategy meetings

**You're all set to start scaling Mansão Maromba distribution with data-driven prospecting!** 🎉
