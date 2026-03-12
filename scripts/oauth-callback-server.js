#!/usr/bin/env node

/**
 * OAuth Callback Server
 * Runs a simple HTTP server to capture the authorization code from Notion redirect
 */

const http = require('http');
const url = require('url');

const PORT = 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const query = parsedUrl.query;

  if (parsedUrl.pathname === '/oauth-callback') {
    const code = query.code;
    const state = query.state;
    const error = query.error;
    const error_description = query.error_description;

    if (error) {
      console.error('\n❌ OAuth Error:');
      console.error(`   Error: ${error}`);
      if (error_description) {
        console.error(`   Description: ${error_description}`);
      }
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>OAuth Error</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>❌ Authorization Failed</h1>
          <p><strong>Error:</strong> ${error}</p>
          ${error_description ? `<p><strong>Details:</strong> ${error_description}</p>` : ''}
          <p>You can close this window and try again.</p>
        </body>
        </html>
      `);
    } else if (code) {
      console.log('\n✅ Authorization Code Captured!');
      console.log('==================================');
      console.log(`\n📋 Your Authorization Code:\n`);
      console.log(`   ${code}\n`);
      console.log('📝 Next step: Run this command in your terminal:\n');
      console.log(`   npm run oauth-exchange -- ${code}\n`);
      console.log('This will exchange the code for access tokens and save them locally.\n');

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>Authorization Successful</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>✅ Authorization Successful!</h1>
          <p>Your authorization code has been captured.</p>
          <p style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; font-family: monospace;">
            ${code}
          </p>
          <p><strong>Next:</strong> Run the following command in your terminal:</p>
          <p style="background-color: #e8f5e9; padding: 15px; border-radius: 5px;">
            <code>npm run oauth-exchange -- ${code}</code>
          </p>
          <p>You can close this window now.</p>
        </body>
        </html>
      `);

      // Keep server running for a few seconds, then exit
      setTimeout(() => {
        console.log('👋 Shutting down callback server...\n');
        process.exit(0);
      }, 3000);
    } else {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>Missing Code</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>⚠️ No Authorization Code</h1>
          <p>The callback was received but no authorization code was found.</p>
          <p>Please try the authorization process again.</p>
        </body>
        </html>
      `);
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head><title>Not Found</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1>404 - Not Found</h1>
        <p>This endpoint is not found.</p>
      </body>
      </html>
    `);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('\n🚀 OAuth Callback Server Started');
  console.log('==================================');
  console.log(`\n✅ Server listening at: http://localhost:${PORT}`);
  console.log(`✅ Callback endpoint: http://localhost:${PORT}/oauth-callback`);
  console.log('\n📋 Instructions:\n');
  console.log('1. Make sure .env has: OAUTH_REDIRECT_URI=http://localhost:3000/oauth-callback');
  console.log('2. Update your Notion integration settings: https://www.notion.so/my-integrations');
  console.log('3. Set the Redirect URI to: http://localhost:3000/oauth-callback');
  console.log('4. Run: npm run oauth-authorize');
  console.log('5. Click the link and authorize');
  console.log('6. The authorization code will appear here');
  console.log('7. Then run: npm run oauth-exchange -- YOUR_CODE\n');
  console.log('⏳ Waiting for callback...\n');
});

process.on('SIGINT', () => {
  console.log('\n\n👋 Server stopped');
  process.exit(0);
});
