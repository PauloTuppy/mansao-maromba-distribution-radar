#!/usr/bin/env node

/**
 * Notion Database Creator CLI
 * Creates Notion databases for Mansão Maromba Distribution Radar
 */

const fs = require('fs');
const path = require('path');

require('dotenv').config();

const { NotionDatabaseCreator } = require('../services/notion-setup/database-creator.ts');

async function createDatabases() {
  console.log('='.repeat(60));
  console.log('🚀 Notion Database Creator - Mansão Maromba');
  console.log('='.repeat(60));

  const notionToken = process.env.NOTION_TOKEN;
  const parentPageId = process.env.PARENT_PAGE_ID;

  // Validate configuration
  if (!notionToken || notionToken.includes('placeholder')) {
    console.error('\n❌ NOTION_TOKEN não configurado corretamente');
    console.log('\n📋 Passos para configurar:');
    console.log('1. Acesse https://www.notion.so/my-integrations');
    console.log('2. Crie ou selecione uma integração');
    console.log('3. Copie o "Internal Integration Token"');
    console.log('4. Cole no .env como NOTION_TOKEN=secret_XXXX\n');
    process.exit(1);
  }

  if (!parentPageId || parentPageId.includes('placeholder')) {
    console.error('\n❌ PARENT_PAGE_ID não configurado');
    console.log('\n📋 Como encontrar:');
    console.log('1. Abra uma página no Notion');
    console.log('2. Copie a URL: https://www.notion.so/XXXXXXXXXXXXXXXX');
    console.log('3. O ID é: XXXXXXXXXXXXXXXX');
    console.log('4. Cole no .env como PARENT_PAGE_ID=XXXX\n');
    process.exit(1);
  }

  try {
    const creator = new NotionDatabaseCreator(notionToken);

    console.log('\n📍 Criando bancos de dados na página:', parentPageId.slice(0, 8) + '...\n');

    const prospectDbId = await creator.createProspectDatabase(parentPageId);
    const distributionDbId = await creator.createDistributionMapDatabase(parentPageId);
    const backlogDbId = await creator.createBacklogDatabase(parentPageId);

    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCESSO! Bancos de dados criados!');
    console.log('='.repeat(60));

    // Update .env with new IDs
    console.log('\n📝 Atualizando .env com os novos IDs...');

    let envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');

    // Replace database IDs in .env
    envContent = envContent.replace(
      /PROSPECT_DB_ID=.*/,
      `PROSPECT_DB_ID=${prospectDbId}`
    );
    envContent = envContent.replace(
      /MAP_DB_ID=.*/,
      `MAP_DB_ID=${distributionDbId}`
    );
    envContent = envContent.replace(
      /BACKLOG_DB_ID=.*/,
      `BACKLOG_DB_ID=${backlogDbId}`
    );

    fs.writeFileSync(path.join(__dirname, '../.env'), envContent);

    console.log('✅ .env atualizado!\n');

    console.log('📋 Banco de Dados Criados:');
    console.log('-'.repeat(60));
    console.log(`  📊 Alvos de Prospecção`);
    console.log(`     ID: ${prospectDbId}\n`);
    console.log(`  🗺️  Mapa de Distribuição`);
    console.log(`     ID: ${distributionDbId}\n`);
    console.log(`  📝 Backlog`);
    console.log(`     ID: ${backlogDbId}\n`);

    console.log('🎯 Próximos passos:');
    console.log('1. Acesse o Notion: https://www.notion.so/');
    console.log('2. Verifique os novos bancos na página');
    console.log('3. Execute: npm run prospect-bars Paraná');
    console.log('4. Veja os leads sendo adicionados automaticamente!');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    if (error.code === 'unauthorized') {
      console.log('\n💡 Dica: Verifique se seu NOTION_TOKEN está correto');
    }
    process.exit(1);
  }
}

createDatabases();
