import { Client } from '@notionhq/client';
import { NotionOAuthHandler } from './oauth-handler';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Notion OAuth Client Factory
 * Creates Notion clients using OAuth tokens
 */
export class NotionOAuthClientFactory {
  private oauthHandler: NotionOAuthHandler;

  constructor(
    clientId: string,
    clientSecret: string,
    redirectUri: string = 'http://localhost:3000/oauth-callback',
    tokenStoragePath: string = '.notion-tokens'
  ) {
    this.oauthHandler = new NotionOAuthHandler(clientId, clientSecret, redirectUri, tokenStoragePath);
  }

  /**
   * Get Notion client for a specific workspace using saved OAuth tokens
   */
  async getClientForWorkspace(workspaceId: string): Promise<Client | null> {
    const accessToken = await this.oauthHandler.getValidAccessToken(workspaceId);

    if (!accessToken) {
      console.error(`❌ No valid access token for workspace: ${workspaceId}`);
      return null;
    }

    return new Client({ auth: accessToken });
  }

  /**
   * Get Notion client using a specific access token
   */
  getClientWithToken(accessToken: string): Client {
    return new Client({ auth: accessToken });
  }

  /**
   * Get the OAuth handler instance
   */
  getOAuthHandler(): NotionOAuthHandler {
    return this.oauthHandler;
  }

  /**
   * Get list of all available workspaces
   */
  getAvailableWorkspaces(): Array<{ id: string; name: string; owner: string }> {
    const savedWorkspaces = this.oauthHandler.getSavedWorkspaces();

    return savedWorkspaces.map(ws => {
      const tokens = this.oauthHandler.loadTokens(ws);
      return {
        id: ws,
        name: tokens.workspace_name,
        owner: tokens.owner.user?.name || 'Unknown',
      };
    });
  }
}

// Example usage
async function demonstrateOAuthFlow() {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing OAUTH_CLIENT_ID or OAUTH_CLIENT_SECRET');
    return;
  }

  const factory = new NotionOAuthClientFactory(clientId, clientSecret);

  // Step 1: Get authorization URL
  const oauthHandler = factory.getOAuthHandler();
  const authUrl = oauthHandler.generateAuthorizationUrl();

  console.log('1. Visit this URL to authorize:');
  console.log(authUrl);

  // After user authorizes and you get the code:
  // const code = 'authorization-code-from-callback';
  // const tokens = await oauthHandler.exchangeCodeForTokens(code);
  // oauthHandler.saveTokens(tokens.workspace_id, tokens);

  // Step 2: Use the client
  // const client = await factory.getClientForWorkspace(tokens.workspace_id);
  // const response = await client.databases.query({ database_id: 'xxx' });
}
