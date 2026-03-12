import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Notion Database Creator Service
 * Creates and configures Notion databases for the Mansão Maromba Distribution Radar
 */
export class NotionDatabaseCreator {
  private notion: Client;

  constructor(notionToken: string) {
    this.notion = new Client({ auth: notionToken });
  }

  /**
   * Create the Prospect Database (Alvos de Prospecção)
   */
  async createProspectDatabase(parentPageId: string): Promise<string> {
    try {
      console.log('🔨 Criando banco de dados: Alvos de Prospecção');

      const response = await this.notion.databases.create({
        parent: {
          type: 'page_id',
          page_id: parentPageId,
        },
        title: [
          {
            text: {
              content: 'Alvos de Prospecção',
            },
          },
        ],
        properties: {
          'Prospect Name': {
            title: {},
          },
          'Phone': {
            phone_number: {},
          },
          'Email': {
            email: {},
          },
          'Funnel Stage': {
            select: {
              options: [
                { name: 'Lead', color: 'blue' },
                { name: 'Contacted', color: 'yellow' },
                { name: 'Negotiating', color: 'purple' },
                { name: 'Won', color: 'green' },
                { name: 'Lost', color: 'red' },
              ],
            },
          },
          'Last Contact': {
            date: {},
          },
          'Notes': {
            rich_text: {},
          },
        },
      });

      console.log(`✅ Banco criado: ${response.id}`);
      return response.id;
    } catch (error) {
      console.error('❌ Erro ao criar banco:', error);
      throw error;
    }
  }

  /**
   * Create the Distribution Map Database (Mapa de Distribuição)
   */
  async createDistributionMapDatabase(parentPageId: string): Promise<string> {
    try {
      console.log('🔨 Criando banco de dados: Mapa de Distribuição');

      const response = await this.notion.databases.create({
        parent: {
          type: 'page_id',
          page_id: parentPageId,
        },
        title: [
          {
            text: {
              content: 'Mapa de Distribuição',
            },
          },
        ],
        properties: {
          'Establishment Name': {
            title: {},
          },
          'State': {
            select: {
              options: [
                { name: 'PR', color: 'blue' },
                { name: 'SP', color: 'purple' },
                { name: 'RJ', color: 'green' },
                { name: 'MG', color: 'yellow' },
                { name: 'SC', color: 'pink' },
                { name: 'RS', color: 'gray' },
              ],
            },
          },
          'City': {
            rich_text: {},
          },
          'Establishment Type': {
            select: {
              options: [
                { name: 'Bar', color: 'yellow' },
                { name: 'Distributor', color: 'blue' },
                { name: 'Market', color: 'green' },
                { name: 'Wholesale', color: 'purple' },
              ],
            },
          },
          'Contact Status': {
            select: {
              options: [
                { name: 'No Contact', color: 'orange' },
                { name: 'In Negotiation', color: 'purple' },
                { name: 'Sells', color: 'blue' },
              ],
            },
          },
          'Phone': {
            phone_number: {},
          },
          'Website': {
            url: {},
          },
          'Google Maps Link': {
            url: {},
          },
          'Last Contact': {
            date: {},
          },
          'Notes': {
            rich_text: {},
          },
        },
      });

      console.log(`✅ Banco criado: ${response.id}`);
      return response.id;
    } catch (error) {
      console.error('❌ Erro ao criar banco:', error);
      throw error;
    }
  }

  /**
   * Create the Backlog Database
   */
  async createBacklogDatabase(parentPageId: string): Promise<string> {
    try {
      console.log('🔨 Criando banco de dados: Backlog');

      const response = await this.notion.databases.create({
        parent: {
          type: 'page_id',
          page_id: parentPageId,
        },
        title: [
          {
            text: {
              content: 'Backlog Radar Mansão Maromba',
            },
          },
        ],
        properties: {
          'Task': {
            title: {},
          },
          'Status': {
            select: {
              options: [
                { name: 'To Do', color: 'gray' },
                { name: 'In Progress', color: 'blue' },
                { name: 'Done', color: 'green' },
              ],
            },
          },
          'Priority': {
            select: {
              options: [
                { name: 'Low', color: 'green' },
                { name: 'Medium', color: 'yellow' },
                { name: 'High', color: 'red' },
              ],
            },
          },
          'Assigned To': {
            people: {},
          },
          'Due Date': {
            date: {},
          },
          'Description': {
            rich_text: {},
          },
        },
      });

      console.log(`✅ Banco criado: ${response.id}`);
      return response.id;
    } catch (error) {
      console.error('❌ Erro ao criar banco:', error);
      throw error;
    }
  }
}

// CLI runner
async function main() {
  const notionToken = process.env.NOTION_TOKEN;
  const parentPageId = process.env.PARENT_PAGE_ID;

  if (!notionToken) {
    console.error('❌ NOTION_TOKEN não configurado');
    process.exit(1);
  }

  if (!parentPageId) {
    console.error('❌ PARENT_PAGE_ID não configurado');
    console.log('💡 Adicione seu page_id no .env para criar os bancos em uma página específica');
    process.exit(1);
  }

  const creator = new NotionDatabaseCreator(notionToken);

  try {
    console.log('🚀 Iniciando criação de bancos de dados...\n');

    const prospectDbId = await creator.createProspectDatabase(parentPageId);
    console.log(`   ID: ${prospectDbId}\n`);

    const distributionDbId = await creator.createDistributionMapDatabase(parentPageId);
    console.log(`   ID: ${distributionDbId}\n`);

    const backlogDbId = await creator.createBacklogDatabase(parentPageId);
    console.log(`   ID: ${backlogDbId}\n`);

    console.log('✅ Todos os bancos foram criados com sucesso!');
    console.log('\n📋 Salve esses IDs no seu .env:');
    console.log(`   PROSPECT_DB_ID=${prospectDbId}`);
    console.log(`   MAP_DB_ID=${distributionDbId}`);
    console.log(`   BACKLOG_DB_ID=${backlogDbId}`);
  } catch (error) {
    console.error('❌ Erro durante a criação:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
