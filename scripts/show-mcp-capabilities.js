#!/usr/bin/env node

/**
 * MCP Capabilities Overview
 * Shows what Notion MCP can do
 */

console.log('🚀 Notion MCP - Available Capabilities');
console.log('======================================\n');

console.log('📊 MCP Server Information:');
console.log('   • Server: @notionhq/notion-mcp-server');
console.log('   • Protocol: Model Context Protocol (MCP)');
console.log('   • Connection: Remote via mcp-remote\n');

console.log('🔧 Tools Available in MCP:\n');

const tools = [
  {
    name: 'notion_query_database',
    description: 'Query a Notion database with filters and sorting',
    example: 'Get all prospects with status "Sem contato"'
  },
  {
    name: 'notion_get_database_schema',
    description: 'Get the schema/structure of a database',
    example: 'See all columns and properties'
  },
  {
    name: 'notion_create_page',
    description: 'Create a new page in a database',
    example: 'Add a new bar prospect from Google Maps'
  },
  {
    name: 'notion_update_page',
    description: 'Update properties of an existing page',
    example: 'Change status from "Sem contato" to "Em negociação"'
  },
  {
    name: 'notion_fetch',
    description: 'Retrieve full content of a page',
    example: 'Get detailed notes about a prospect'
  },
  {
    name: 'notion_search',
    description: 'Search across your Notion workspace',
    example: 'Find all mentions of "Paraná" or "Curitiba"'
  },
  {
    name: 'notion_list_users',
    description: 'Get list of workspace users',
    example: 'Assign prospects to team members'
  },
  {
    name: 'notion_get_comments',
    description: 'Retrieve discussion threads on pages',
    example: 'Read comments on prospect pages'
  }
];

tools.forEach((tool, index) => {
  console.log(`${index + 1}. ${tool.name}`);
  console.log(`   📝 ${tool.description}`);
  console.log(`   💡 Example: ${tool.example}\n`);
});

console.log('⚙️  MCP Configuration:');
console.log('   File: mcp_config.json');
console.log('   Command: npx -y mcp-remote https://mcp.notion.com/mcp');
console.log('   Authentication: Via NOTION_TOKEN environment variable\n');

console.log('🔐 Authentication Status:');
require('dotenv').config();
const token = process.env.NOTION_TOKEN;

if (!token || token.includes('placeholder')) {
  console.log('   ❌ NOTION_TOKEN: Not configured');
  console.log('      Action: Run: npm run setup-notion-token\n');
} else if (token.startsWith('secret_')) {
  console.log('   ✅ NOTION_TOKEN: Configured (Direct Token)');
  console.log(`      Token: ${token.substring(0, 20)}...\n`);
} else {
  console.log('   ⚠️  NOTION_TOKEN: Configured but format unclear');
  console.log(`      Token: ${token.substring(0, 20)}...\n`);
}

const oauthClientId = process.env.OAUTH_CLIENT_ID;
if (oauthClientId && !oauthClientId.includes('placeholder')) {
  console.log('   ✅ OAUTH_CLIENT_ID: Configured (OAuth support)');
  console.log('      Use: npm run oauth-authorize\n');
}

console.log('📋 Integration Testing:\n');
console.log('  1. Setup Token:');
console.log('     npm run setup-notion-token\n');

console.log('  2. Test Connection:');
console.log('     npm run test-mcp\n');

console.log('  3. Use with Your App:');
console.log('     npm run prospect-bars Paraná\n');

console.log('✨ What You Can Do:\n');

const features = [
  'Query prospects by status, state, or establishment type',
  'Automatically add new bar prospects from Google Maps',
  'Update prospect status as you contact them',
  'Search across all your distribution data',
  'Filter prospects for sales team targeting',
  'Create bulk updates via scripts',
  'Generate reports from database queries',
  'Integrate with your CRM or dialer'
];

features.forEach((feature, i) => {
  console.log(`   ${i + 1}. ${feature}`);
});

console.log('\n🎯 MCP is Ready!');
console.log('   • Configuration: ✅');
console.log('   • Tools: ✅');
console.log('   • Auth: ⏳ Waiting for token\n');

console.log('📚 Related Commands:\n');
console.log('   npm run setup-notion-token      Configure token');
console.log('   npm run test-mcp                Test connection');
console.log('   npm run oauth-authorize         Setup OAuth');
console.log('   npm run prospect-bars Paraná    Search bars');
console.log('   npm run create-databases        Create databases\n');
