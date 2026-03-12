#!/usr/bin/env node

/**
 * Teste rápido - Adicionar apenas alguns prospects ao Notion
 */

require('dotenv').config();

const { MapsProspectorAgent } = require('../services/maps-prospector/bar-prospector.ts');

async function quickTest() {
  console.log('🚀 Teste Rápido - Adicionando 3 prospects ao Notion');
  console.log('==================================================');

  const notionToken = process.env.NOTION_TOKEN;
  const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
  const prospectDbId = process.env.PROSPECT_DB_ID;

  if (!notionToken || !googleApiKey || !prospectDbId) {
    console.log('❌ Configuração incompleta');
    process.exit(1);
  }

  try {
    const agent = new MapsProspectorAgent(notionToken, googleApiKey, prospectDbId);

    // Buscar apenas alguns resultados
    const bars = await agent.searchBarsInStates(['Paraná'], ['bar']);
    const sampleBars = bars.slice(0, 3); // Apenas os primeiros 3

    console.log(`📊 Testando com ${sampleBars.length} estabelecimentos...`);

    let added = 0;
    for (const bar of sampleBars) {
      try {
        // Verificar se já existe
        const exists = await agent.checkExistingProspect(bar.name, bar.formatted_address);
        if (exists) {
          console.log(`  ⊘ Já existe: ${bar.name}`);
          continue;
        }

        // Obter detalhes completos
        const details = await agent.getPlaceDetails(bar.place_id);
        if (!details) continue;

        // Adicionar ao Notion
        await agent.createProspect(details);
        added++;
        console.log(`  ✅ Adicionado: ${details.name}`);

        // Pequena pausa
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`  ❌ Erro com ${bar.name}:`, error.message);
      }
    }

    console.log(`\n🎉 Teste concluído! ${added} novos prospects adicionados com status "Sem contato"`);

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

quickTest();
