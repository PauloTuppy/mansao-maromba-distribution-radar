#!/usr/bin/env node

/**
 * Notion Token Setup - Interactive Guide
 * Helps you get and configure your Notion token for MCP integration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function setupNotionToken() {
  console.log('🔐 Notion Token Setup for MCP Integration');
  console.log('=========================================\n');

  console.log('📚 Step-by-Step Guide:\n');

  console.log('1️⃣  Go to Notion Integration Page');
  console.log('   URL: https://www.notion.so/my-integrations\n');

  console.log('2️⃣  Create or Select Integration');
  console.log('   • Click "Create new integration"');
  console.log('   • Name: "Mansão Maromba MCP"');
  console.log('   • Associated workspace: Select your workspace\n');

  console.log('3️⃣  Copy Your Token');
  console.log('   • In the integration page, find "Secrets"');
  console.log('   • Under "Token", click "Show" or "Copy token"');
  console.log('   • Token starts with: secret_XXXXXXXXXXXXXXX\n');

  console.log('4️⃣  Add Database Connection');
  console.log('   • Go to your Notion page with databases');
  console.log('   • Click "..." at top right → "Add connections"');
  console.log('   • Select "Mansão Maromba MCP" integration');
  console.log('   • Grant access to databases\n');

  const token = await question('📝 Paste your Notion token here: ');

  if (!token || !token.startsWith('secret_')) {
    console.log('\n❌ Invalid token format. Should start with "secret_"');
    const retry = await question('Try again? (y/n): ');
    if (retry.toLowerCase() === 'y') {
      await setupNotionToken();
    }
    return;
  }

  // Update .env file
  const envPath = path.join(__dirname, '../.env');
  let envContent = fs.readFileSync(envPath, 'utf-8');

  // Replace or add NOTION_TOKEN
  if (envContent.includes('NOTION_TOKEN=')) {
    envContent = envContent.replace(
      /NOTION_TOKEN=.*/,
      `NOTION_TOKEN=${token}`
    );
  } else {
    envContent = `NOTION_TOKEN=${token}\n` + envContent;
  }

  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Token saved to .env file!');
  console.log(`   Token: ${token.substring(0, 20)}...\n`);

  console.log('🎯 Next Steps:');
  console.log('   1. npm run test-mcp       → Verify connection');
  console.log('   2. npm run prospect-bars Paraná → Add prospects');
  console.log('   3. Check Notion for new records!\n');

  rl.close();
}

async function verifyExistingToken() {
  const envPath = path.join(__dirname, '../.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');

  const tokenMatch = envContent.match(/NOTION_TOKEN=(.+)/);

  if (tokenMatch && tokenMatch[1] && !tokenMatch[1].includes('placeholder')) {
    return tokenMatch[1].trim();
  }

  return null;
}

async function main() {
  const existingToken = await verifyExistingToken();

  if (existingToken) {
    console.log('✅ Token already configured\n');
    const verify = await question('Would you like to update it? (y/n): ');

    if (verify.toLowerCase() !== 'y') {
      console.log('\n📝 To test: npm run test-mcp');
      rl.close();
      return;
    }
  }

  await setupNotionToken();
}

main().catch(error => {
  console.error('❌ Error:', error);
  rl.close();
  process.exit(1);
});
