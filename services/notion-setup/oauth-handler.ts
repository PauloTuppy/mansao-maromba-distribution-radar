import axios from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

/**
 * Notion OAuth Handler
 * Manages OAuth 2.0 authentication flow with Notion
 */
export class NotionOAuthHandler {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private tokenStoragePath: string;

  constructor(
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    tokenStoragePath: string = '.notion-tokens'
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.tokenStoragePath = tokenStoragePath;

    // Create token storage directory if it doesn't exist
    if (!fs.existsSync(this.tokenStoragePath)) {
      fs.mkdirSync(this.tokenStoragePath, { recursive: true });
    }
  }

  /**
   * Generate authorization URL for user to approve
   */
  generateAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      owner: 'user',
      state: state || Math.random().toString(36).substring(7),
    });

    return `https://api.notion.com/v1/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access and refresh tokens
   */
  async exchangeCodeForTokens(authorizationCode: string): Promise<{
    access_token: string;
    token_type: string;
    refresh_token: string | null;
    bot_id: string;
    workspace_icon: string;
    workspace_name: string;
    workspace_id: string;
    owner: any;
  }> {
    try {
      console.log('🔄 Exchanging authorization code for tokens...');

      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const response = await axios.post(
        'https://api.notion.com/v1/oauth/token',
        {
          grant_type: 'authorization_code',
          code: authorizationCode,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        },
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Notion-Version': '2025-09-03',
          },
        }
      );

      const tokenData = response.data;

      console.log('✅ Tokens received successfully');
      console.log(`   Workspace: ${tokenData.workspace_name}`);
      console.log(`   Owner: ${tokenData.owner.user?.name || 'Unknown'}`);

      return tokenData;
    } catch (error: any) {
      console.error('❌ Error exchanging code for tokens:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    token_type: string;
    refresh_token: string | null;
  }> {
    try {
      console.log('🔄 Refreshing access token...');

      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const response = await axios.post(
        'https://api.notion.com/v1/oauth/token',
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        },
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Notion-Version': '2025-09-03',
          },
        }
      );

      console.log('✅ Access token refreshed');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error refreshing token:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Save tokens to storage
   */
  saveTokens(workspaceId: string, tokens: any): void {
    const tokenFile = path.join(this.tokenStoragePath, `${workspaceId}.json`);

    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      bot_id: tokens.bot_id,
      workspace_id: tokens.workspace_id,
      workspace_name: tokens.workspace_name,
      owner: tokens.owner,
      saved_at: new Date().toISOString(),
    };

    fs.writeFileSync(tokenFile, JSON.stringify(tokenData, null, 2));
    console.log(`💾 Tokens saved for workspace: ${workspaceId}`);
  }

  /**
   * Load tokens from storage
   */
  loadTokens(workspaceId: string): any | null {
    const tokenFile = path.join(this.tokenStoragePath, `${workspaceId}.json`);

    if (!fs.existsSync(tokenFile)) {
      return null;
    }

    return JSON.parse(fs.readFileSync(tokenFile, 'utf-8'));
  }

  /**
   * Get list of saved workspaces
   */
  getSavedWorkspaces(): string[] {
    if (!fs.existsSync(this.tokenStoragePath)) {
      return [];
    }

    return fs.readdirSync(this.tokenStoragePath)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  }

  /**
   * Remove saved tokens for a workspace
   */
  removeTokens(workspaceId: string): void {
    const tokenFile = path.join(this.tokenStoragePath, `${workspaceId}.json`);

    if (fs.existsSync(tokenFile)) {
      fs.unlinkSync(tokenFile);
      console.log(`🗑️  Tokens removed for workspace: ${workspaceId}`);
    }
  }

  /**
   * Get current access token, refreshing if necessary
   */
  async getValidAccessToken(workspaceId: string): Promise<string | null> {
    const savedTokens = this.loadTokens(workspaceId);

    if (!savedTokens) {
      console.log('❌ No tokens found for this workspace');
      return null;
    }

    try {
      // For now, just return the access token
      // In production, you'd check expiration and refresh if needed
      return savedTokens.access_token;
    } catch (error) {
      console.error('❌ Error getting valid access token:', error);
      return null;
    }
  }
}


