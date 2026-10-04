import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getBot } from './bot/instance.js';
import { config } from './config.js';
import statsHandler from '../api/stats.js';
import adminHandler from '../api/admin.js';
import cleanupHandler from '../api/cron/cleanup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

/**
 * Minimal static & API server for local testing
 */
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // Emulate req.query
  req.query = Object.fromEntries(parsedUrl.searchParams.entries());

  // Collect request body if POST
  if (req.method === 'POST') {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    try {
      req.body = JSON.parse(body);
    } catch {
      req.body = {};
    }
  }

  // Mock res.status & res.json with chaining
  res.status = (code) => {
    res.statusCode = code;
    return {
      json: (data) => res.json(data),
      end: (data) => res.end(data)
    };
  };
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
  };

  // Route: /api/stats
  if (pathname === '/api/stats') {
    try {
      return await statsHandler(req, res);
    } catch (err) {
      console.error('Error handling /api/stats:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // Route: /api/admin
  if (pathname === '/api/admin') {
    try {
      return await adminHandler(req, res);
    } catch (err) {
      console.error('Error handling /api/admin:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // Route: /api/cron/cleanup
  if (pathname === '/api/cron/cleanup') {
    try {
      return await cleanupHandler(req, res);
    } catch (err) {
      console.error('Error handling /api/cron/cleanup:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // Static files from /public
  let filePath = path.join(publicDir, pathname === '/' ? 'index.html' : pathname);
  if (pathname === '/admin') filePath = path.join(publicDir, 'admin.html');

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.svg': 'image/svg+xml'
    };
    res.setHeader('Content-Type', mimeTypes[ext] || 'text/plain');
    return fs.createReadStream(filePath).pipe(res);
  }

  res.statusCode = 404;
  res.end('Not Found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`🌐 Dashboard running locally at http://localhost:${PORT}`);
  console.log(`👑 Admin panel at http://localhost:${PORT}/admin`);

  // Start polling in local mode if BOT_TOKEN is present
  if (config.botToken) {
    try {
      const bot = getBot();
      console.log('🤖 Starting Telegram Bot via Long Polling...');
      await bot.start({
        onStart: (info) => {
          console.log(`✅ Bot @${info.username} successfully started in polling mode!`);
        }
      });
    } catch (err) {
      console.error('Bot polling error:', err.message);
    }
  } else {
    console.log('⚠️ BOT_TOKEN is not set. Fill .env file to enable Telegram Bot.');
  }
});
