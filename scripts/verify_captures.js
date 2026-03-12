const { Client } = require('@notionhq/client');
require('dotenv').config();

async function verify() {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  const databaseId = process.env.MAP_DB_ID;

  try {
    console.log('🔍 Verificando capturas no Notion...\n');
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 10,
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'descending',
        },
      ],
    });

    if (response.results.length === 0) {
      console.log('⚠️ Nenhuma captura encontrada na base de dados.');
      return;
    }

    console.log(`✅ Encontradas ${response.results.length} entradas recentes:\n`);
    
    response.results.forEach((page, i) => {
      const name = page.properties['Establishment Name']?.title[0]?.plain_text || 'Sem nome';
      const city = page.properties['City']?.rich_text[0]?.plain_text || 'Sem cidade';
      const type = page.properties['Establishment Type']?.select?.name || 'Sem tipo';
      const created = new Date(page.created_time).toLocaleString();
      
      console.log(`${i + 1}. 🏢 ${name}`);
      console.log(`   📍 Cidade: ${city}`);
      console.log(`   🏷️ Tipo: ${type}`);
      console.log(`   📅 Criado em: ${created}\n`);
    });

  } catch (error) {
    console.error('❌ Erro ao verificar Notion:', error.message);
  }
}

verify();
