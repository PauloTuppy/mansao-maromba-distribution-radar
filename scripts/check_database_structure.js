const { Client } = require('@notionhq/client');
require('dotenv').config();

async function checkDatabase() {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  const databaseId = process.env.MAP_DB_ID;

  try {
    console.log(`🔍 Lendo estrutura da base: ${databaseId}\n`);
    const response = await notion.databases.retrieve({ database_id: databaseId });
    
    console.log('📋 Propriedades Reais Encontradas:');
    console.log('--------------------------------');
    Object.keys(response.properties).forEach(prop => {
      const type = response.properties[prop].type;
      console.log(`• [${prop}] - Tipo: ${type}`);
    });

  } catch (error) {
    console.error('❌ Erro ao ler base:', error.message);
  }
}

checkDatabase();
