/**
 * ArchitectAI Backend Server
 * Handles GitHub OAuth App Device Flow authentication
 * 
 * IMPORTANT: This uses an OAuth App, NOT a GitHub App.
 * OAuth Apps support the device flow AND scopes like 'repo' for creating repositories.
 * GitHub Apps ignore the scope parameter and cannot create user repositories.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080; // Cloud Run expects 8080 by default

// OAuth App Client ID (NOT GitHub App!)
// Create at: https://github.com/settings/developers > OAuth Apps > New OAuth App
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Validate required env vars
if (!GITHUB_CLIENT_ID) {
    console.error('❌ Missing GITHUB_CLIENT_ID environment variable');
    console.error('   Please create an OAuth App (not GitHub App) at:');
    console.error('   https://github.com/settings/developers');
    console.error('');
    console.error('   Then copy .env.example to .env and add the Client ID');
    process.exit(1);
}

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? true : FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Get the OAuth App Client ID
 */
app.get('/auth/client-id', (req, res) => {
    res.json({ clientId: GITHUB_CLIENT_ID });
});

/**
 * Step 1: Request a device code from GitHub
 * This initiates the device flow for OAuth Apps
 * 
 * For OAuth Apps (not GitHub Apps), the scope parameter IS used!
 * We request 'repo' scope to allow creating/accessing repositories.
 */
app.post('/auth/device/code', async (req, res) => {
    try {
        const response = await fetch('https://github.com/login/device/code', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: GITHUB_CLIENT_ID,
                scope: 'repo', // This scope allows creating and accessing repositories
            }).toString(),
        });

        const data = await response.json();

        if (data.error) {
            console.error('GitHub device code error:', data);
            return res.status(400).json({
                error: data.error,
                message: data.error_description || 'Failed to get device code',
            });
        }

        // Return the device code info to the frontend
        res.json({
            deviceCode: data.device_code,
            userCode: data.user_code,
            verificationUri: data.verification_uri,
            expiresIn: data.expires_in,
            interval: data.interval,
        });
    } catch (error) {
        console.error('Device code request error:', error);
        res.status(500).json({ error: 'Failed to request device code' });
    }
});

/**
 * Step 2: Poll for the access token
 * The frontend calls this repeatedly until the user authorizes
 */
app.post('/auth/device/token', async (req, res) => {
    const { deviceCode } = req.body;

    if (!deviceCode) {
        return res.status(400).json({ error: 'Missing device code' });
    }

    try {
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: GITHUB_CLIENT_ID,
                device_code: deviceCode,
                grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            }).toString(),
        });

        const data = await response.json();

        // Log the scope we received (for debugging)
        if (data.scope) {
            console.log('   Token scope granted:', data.scope);
        }

        // Check for pending states
        if (data.error === 'authorization_pending') {
            return res.json({ status: 'pending' });
        }

        if (data.error === 'slow_down') {
            return res.json({ status: 'slow_down', interval: data.interval });
        }

        if (data.error === 'expired_token') {
            return res.status(400).json({ error: 'expired', message: 'Device code expired. Please try again.' });
        }

        if (data.error === 'access_denied') {
            return res.status(400).json({ error: 'denied', message: 'Access was denied by the user.' });
        }

        if (data.error) {
            console.error('Token exchange error:', data);
            return res.status(400).json({
                error: data.error,
                message: data.error_description || 'Failed to get access token',
            });
        }

        // Success! Return the access token and scope
        res.json({
            status: 'complete',
            accessToken: data.access_token,
            tokenType: data.token_type,
            scope: data.scope, // Should include 'repo' for OAuth Apps
        });
    } catch (error) {
        console.error('Token polling error:', error);
        res.status(500).json({ error: 'Failed to poll for token' });
    }
});

// Serve static frontend files in production
// This must come after API routes to avoid intercepting API calls, 
// using 'dist' directory which will be created in the container or build process
app.use(express.static(path.join(__dirname, '../dist')));

// Handle client-side routing by returning index.html for all non-API routes
// This must be the LAST route handler
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 ArchitectAI Backend Server`);
    console.log(`   Running on http://localhost:${PORT}`);
    console.log(`   Frontend URL: ${FRONTEND_URL}`);
    console.log(`   GET  /health            - Health check`);
    console.log(`   GET  /auth/client-id    - Get OAuth App Client ID`);
    console.log(`   POST /auth/device/code  - Request device code (scope: repo)`);
    console.log(`   POST /auth/device/token - Poll for access token\n`);
});


