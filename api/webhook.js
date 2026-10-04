import { webhookCallback } from 'grammy';
import { getBot } from '../src/bot/instance.js';
import { config } from '../src/config.js';

export default async function handler(req, res) {
  // Allow health check / webhook registration helper via GET
  if (req.method === 'GET') {
    const { setup } = req.query;
    if (setup === 'true' && config.appUrl) {
      try {
        const bot = getBot();
        const webhookUrl = `${config.appUrl}/api/webhook`;
        await bot.api.setWebhook(webhookUrl);
        return res.status(200).json({
          status: 'ok',
          message: `Webhook successfully set to ${webhookUrl}`
        });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    return res.status(200).json({
      status: 'active',
      service: 'Genshin Flood Bot Telegram Webhook',
      time: new Date().toISOString()
    });
  }

  if (req.method === 'POST') {
    try {
      const bot = getBot();
      const cb = webhookCallback(bot, 'node:http');
      return cb(req, res);
    } catch (err) {
      console.error('Error in webhook handler:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
