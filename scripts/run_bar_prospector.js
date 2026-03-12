#!/usr/bin/env node

/**
 * Paraná Bars Prospector Runner
 * Orchestrates the complete bar prospecting workflow for Mansão Maromba
 */

const { MapsProspectorAgent } = require('../services/maps-prospector/bar-prospector.ts');

async function runBarProspecting() {
  console.log('🚀 Starting Paraná Bars Prospector for Mansão Maromba Drinks');
  console.log('==========================================================');

  // Load environment variables
  require('dotenv').config();

  const notionToken = process.env.NOTION_TOKEN;
  const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
  const prospectDbId = process.env.PROSPECT_DB_ID;

  if (!notionToken || !googleApiKey || !prospectDbId) {
    console.error('❌ Missing required environment variables:');
    console.error('   - NOTION_TOKEN');
    console.error('   - GOOGLE_PLACES_API_KEY');
    console.error('   - PROSPECT_DB_ID');
    console.error('\nPlease set these in your .env file or environment.');
    process.exit(1);
  }

  try {
    const agent = new MapsProspectorAgent(notionToken, googleApiKey, prospectDbId);
    const result = await agent.orchestrateBarProspecting();

    console.log('\n✅ Orchestration Complete!');
    console.log('==========================');
    console.log(`📊 Total bars found: ${result.totalFound}`);
    console.log(`🆕 New prospects added: ${result.newProspects}`);

    if (result.prospects.length > 0) {
      console.log('\n📞 New Prospects Ready for Calling:');
      console.log('=====================================');
      result.prospects.forEach((prospect, index) => {
        console.log(`${index + 1}. ${prospect.name}`);
        console.log(`   📍 ${prospect.formatted_address}`);
        console.log(`   📞 ${prospect.formatted_phone_number || 'No phone number'}`);
        if (prospect.website) console.log(`   🌐 ${prospect.website}`);
        if (prospect.rating) console.log(`   ⭐ ${prospect.rating}/5 (${prospect.user_ratings_total || 0} reviews)`);
        console.log(`   📝 Call Script: "Olá, sou representante da Mansão Maromba. Gostaria de saber se vocês têm interesse em oferecer nossos drinks energéticos no estabelecimento?"`);
        console.log('');
      });
    }

    console.log('🎯 Next Steps:');
    console.log('   1. Review the new prospects in your Notion "Alvos de Prospecção" database');
    console.log('   2. Start calling the businesses using the provided scripts');
    console.log('   3. Update funnel stages in Notion as you make contact');

  } catch (error) {
    console.error('❌ Error during orchestration:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runBarProspecting();
}
