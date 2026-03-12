const { Client } = require('@notionhq/client');
const axios = require('axios');
require('dotenv').config();

async function testRealFlow() {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  const googleKey = process.env.GOOGLE_PLACES_API_KEY;
  const databaseId = process.env.MAP_DB_ID;

  console.log('🔎 Buscando um Bar REAL em Carlópolis, PR...\n');

  try {
    // 1. Busca no Google Maps
    const searchRes = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: { 
        query: 'melhores bares em Carlópolis, PR, Brasil', 
        key: googleKey, 
        language: 'pt-BR',
        region: 'br'
      }
    });

    if (!searchRes.data.results.length) {
      console.log('❌ Nenhum bar encontrado no Google.');
      return;
    }

    const bar = searchRes.data.results[0];
    console.log(`✅ Encontrado: ${bar.name}`);
    console.log(`📍 Endereço: ${bar.formatted_address}`);

    // 2. Tenta extrair Bairro e Cidade
    const parts = bar.formatted_address.split(', ');
    let neighborhood = 'Desconhecido';
    let city = 'Carlópolis';
    
    // Lógica simples de extração
    for(let p of parts) {
      if(p.includes(' - ')) {
        const sub = p.split(' - ');
        city = sub[0].trim();
        neighborhood = sub[1]?.trim() || 'Desconhecido';
      }
    }

    // 3. Envia para o Notion
    console.log('\n🚀 Enviando para o Notion...');
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        'Nome do Estabelecimento': {
          title: [{ text: { content: `🔥 REAL: ${bar.name}` } }]
        },
        'Estado': {
          select: { name: 'PR' }
        },
        'Cidade': {
          rich_text: [{ text: { content: city } }]
        },
        'Bairro': {
          rich_text: [{ text: { content: neighborhood } }]
        },
        'Tipo de Estabelecimento': {
          select: { name: 'Bar' }
        },
        'Status de Venda': {
          select: { name: 'Sem contato' }
        },
        'Link Google Maps': {
          url: `https://www.google.com/maps/place/?q=place_id:${bar.place_id}`
        },
        'Observações': {
          rich_text: [{ text: { content: `📍 Endereço Real: ${bar.formatted_address}\n⭐ Avaliação: ${bar.rating || 'N/A'}` } }]
        }
      }
    });

    console.log(`✅ SUCESSO! Lead real criado: ${bar.name}`);
    console.log(`🔗 Verifique o Link do Google Maps agora no seu Notion!`);

  } catch (error) {
    console.error('❌ Falha:', error.message);
  }
}

testRealFlow();
