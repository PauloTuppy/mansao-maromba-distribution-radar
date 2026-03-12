import * as dotenv from 'dotenv';
import { NotionOAuthHandler } from '../services/notion-setup/oauth-handler';

dotenv.config();

async function handleOAuthFlow() {
    const clientId = process.env.OAUTH_CLIENT_ID;
    const clientSecret = process.env.OAUTH_CLIENT_SECRET;
    const redirectUri = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/oauth-callback';

    if (!clientId || !clientSecret) {
        console.error('❌ Missing OAuth credentials in .env');
        console.error('   Required: OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET');
        console.error('\nGet these from: https://www.notion.so/my-integrations');
        process.exit(1);
    }

    const handler = new NotionOAuthHandler(clientId, clientSecret, redirectUri);

    const command = process.argv[2];
    const arg = process.argv[3];

    if (!command) {
        showHelp(handler);
        return;
    }

    switch (command) {
        case 'authorize':
        case 'auth':
            showAuthorizationUrl(handler);
            break;

        case 'exchange':
            if (!arg) {
                console.error('❌ Authorization code required');
                console.error('\nUsage: npm run oauth-exchange -- <code>');
                process.exit(1);
            }
            await exchangeCode(handler, arg);
            break;

        case 'refresh':
            if (!arg) {
                console.error('❌ Refresh token required');
                console.error('\nUsage: npm run oauth-refresh -- <refresh-token>');
                process.exit(1);
            }
            await refreshToken(handler, arg);
            break;

        case 'list':
            listSavedWorkspaces(handler);
            break;

        case 'remove':
            if (!arg) {
                console.error('❌ Workspace ID required');
                console.error('\nUsage: npm run oauth-remove -- <workspace-id>');
                process.exit(1);
            }
            removeWorkspace(handler, arg);
            break;

        default:
            console.error(`❌ Unknown command: ${command}`);
            showHelp(handler);
            process.exit(1);
    }
}

function showHelp(handler: NotionOAuthHandler) {
    console.log('🔐 Notion OAuth Manager');
    console.log('=======================\n');

    console.log('Commands:\n');

    console.log('  authorize (or auth)');
    console.log('    Generate authorization URL for user to approve');
    console.log('    Usage: npm run oauth-authorize\n');

    console.log('  exchange <code>');
    console.log('    Exchange authorization code for tokens');
    console.log('    Usage: npm run oauth-exchange -- abc123code\n');

    console.log('  refresh <refresh-token>');
    console.log('    Refresh access token using refresh token');
    console.log('    Usage: npm run oauth-refresh -- your-refresh-token\n');

    console.log('  list');
    console.log('    List all saved workspaces');
    console.log('    Usage: npm run oauth-list\n');

    console.log('  remove <workspace-id>');
    console.log('    Remove saved tokens for a workspace');
    console.log('    Usage: npm run oauth-remove -- workspace-id\n');

    const workspaces = handler.getSavedWorkspaces();
    if (workspaces.length > 0) {
        console.log('📋 Saved Workspaces:');
        workspaces.forEach(ws => {
            const tokens = handler.loadTokens(ws);
            console.log(`   • ${tokens.workspace_name} (${ws})`);
        });
    }
}

function showAuthorizationUrl(handler: NotionOAuthHandler) {
    const authUrl = handler.generateAuthorizationUrl();

    console.log('🔐 Notion OAuth Authorization\n');
    console.log('1. Open this URL in your browser:\n');
    console.log(`   ${authUrl}\n`);
    console.log('2. Click "Select a workspace" and choose one');
    console.log('3. Click "Allow" to authorize');
    console.log('4. You will be redirected to a URL like:');
    console.log('   https://YOUR_REDIRECT_URI/?code=YOUR_CODE&state=XXX\n');
    console.log('5. Copy the "code" value');
    console.log('6. Run: npm run oauth-exchange -- YOUR_CODE\n');
}

async function exchangeCode(handler: NotionOAuthHandler, code: string) {
    try {
        console.log('🔄 Exchanging authorization code...\n');

        const tokens = await handler.exchangeCodeForTokens(code);

        handler.saveTokens(tokens.workspace_id, tokens);

        console.log('\n✅ OAuth Exchange Complete!');
        console.log('================================');
        console.log(`   Workspace: ${tokens.workspace_name}`);
        console.log(`   Owner: ${tokens.owner.user?.name || 'Unknown'}`);
        console.log(`   Bot ID: ${tokens.bot_id}`);
        console.log(`\n💾 Tokens saved locally for future use`);
        console.log(`\n🚀 You can now use this workspace:`);
        console.log(`   npm run prospect-bars Paraná`);

    } catch (error) {
        console.error('\n❌ Failed to exchange code');
        process.exit(1);
    }
}

async function refreshToken(handler: NotionOAuthHandler, refreshTokenValue: string) {
    try {
        console.log('🔄 Refreshing access token...\n');

        const newTokens = await handler.refreshAccessToken(refreshTokenValue);

        console.log('\n✅ Token Refreshed!');
        console.log('   New Access Token: ' + newTokens.access_token.substring(0, 20) + '...');

        if (newTokens.refresh_token) {
            console.log('   New Refresh Token: ' + newTokens.refresh_token.substring(0, 20) + '...');
        }

    } catch (error) {
        console.error('\n❌ Failed to refresh token');
        process.exit(1);
    }
}

function listSavedWorkspaces(handler: NotionOAuthHandler) {
    const workspaces = handler.getSavedWorkspaces();

    console.log('📋 Saved Workspaces');
    console.log('===================\n');

    if (workspaces.length === 0) {
        console.log('No saved workspaces. Run: npm run oauth-authorize');
        return;
    }

    workspaces.forEach(ws => {
        const tokens = handler.loadTokens(ws);
        console.log(`📦 ${tokens.workspace_name}`);
        console.log(`   ID: ${ws}`);
        console.log(`   Owner: ${tokens.owner.user?.name || 'Unknown'}`);
        console.log(`   Saved: ${new Date(tokens.saved_at).toLocaleString()}`);
        console.log('');
    });
}

function removeWorkspace(handler: NotionOAuthHandler, workspaceId: string) {
    const tokens = handler.loadTokens(workspaceId);

    if (!tokens) {
        console.error(`❌ No saved tokens for workspace: ${workspaceId}`);
        return;
    }

    handler.removeTokens(workspaceId);
    console.log(`✅ Removed tokens for: ${tokens.workspace_name}`);
}

handleOAuthFlow().catch(console.error);
