#!/usr/bin/env node

/**
 * Teste rápido da integração Notion + Google Maps
 */

require('dotenv').config();

const { MapsProspectorAgent } = require('../services/maps-prospector/bar-prospector.ts');

async function testIntegration() {
  console.log('🚀 Teste da Integração Notion + Google Maps');
  console.log('==========================================');

  const notionToken = process.env.NOTION_TOKEN;
  const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
  const prospectDbId = process.env.PROSPECT_DB_ID;

  console.log('📋 Configurações:');
  console.log(`   Notion Token: ${notionToken ? '✅ Configurado' : '❌ Faltando'}`);
  console.log(`   Google API Key: ${googleApiKey ? '✅ Configurado' : '❌ Faltando'}`);
  console.log(`   Prospect DB ID: ${prospectDbId ? '✅ Configurado' : '❌ Faltando'}`);

  if (!notionToken || !googleApiKey || !prospectDbId) {
    console.log('\n❌ Configuração incompleta. Verifique o arquivo .env');
    process.exit(1);
  }

  try {
    const agent = new MapsProspectorAgent(notionToken, googleApiKey, prospectDbId);

    console.log('\n🔍 Testando busca no Google Maps...');
    const results = await agent.searchBarsInStates(['Paraná'], ['bar']);

    console.log(`✅ Sucesso! Encontrados ${results.length} estabelecimentos`);
    console.log('\n📍 Primeiros 3 resultados:');

    results.slice(0, 3).forEach((place, index) => {
      console.log(`${index + 1}. ${place.name}`);
      console.log(`   📍 ${place.formatted_address}`);
      console.log(`   ⭐ ${place.rating || 'N/A'}/5 (${place.user_ratings_total || 0} reviews)`);
      console.log('');
    });

    console.log('🎉 Integração funcionando perfeitamente!');
    console.log('💡 Agora você pode executar: npm run prospect-bars Paraná');

  } catch (error) {
    console.error('❌ Erro na integração:', error.message);
    process.exit(1);
  }
}

testIntegration();
