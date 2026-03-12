const { Client } = require('@notionhq/client');
require('dotenv').config();

async function testInsert() {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  const databaseId = process.env.MAP_DB_ID;

  console.log(`🚀 Testando inserção no Notion com campos em PORTUGUÊS: ${databaseId}\n`);

  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        'Nome do Estabelecimento': {
          title: [{ text: { content: '✅ TESTE OK - Mansão Maromba Bar' } }]
        },
        'Estado': {
          select: { name: 'PR' }
        },
        'Cidade': {
          rich_text: [{ text: { content: 'Curitiba' } }]
        },
        'Tipo de Estabelecimento': {
          select: { name: 'Bar' }
        },
        'Status de Venda': {
          select: { name: 'Sem contato' }
        },
        'Bairro': {
          rich_text: [{ text: { content: 'Centro' } }]
        },
        'Link Google Maps': {
          url: 'https://www.google.com/maps/place/Curitiba,+State+of+Paraná,+Brazil'
        },
        'Telefone / WhatsApp': {
          phone_number: '(41) 99999-8888'
        },
        'Observações': {
          rich_text: [{ text: { content: 'Este teste confirma que o robô agora consegue escrever na sua base de dados!' } }]
        }
      }
    });

    console.log(`✅ SUCESSO ABSOLUTO! Página criada com ID: ${response.id}`);
    console.log(`🔗 Verifique no seu Notion agora!`);

  } catch (error) {
    console.error(`❌ Erro no Notion: ${error.message}`);
    if (error.body) {
      console.error(`📦 Detalhes: ${error.body}`);
    }
  }
}

testInsert();
