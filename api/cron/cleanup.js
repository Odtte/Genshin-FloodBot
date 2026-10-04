import { getBot } from '../../src/bot/instance.js';
import { runCleanup } from '../../src/services/cleanup.js';
import { config } from '../../src/config.js';

export default async function handler(req, res) {
  // Authorization check (Vercel Cron Header or secret key)
  const authHeader = req.headers['authorization'];
  const querySecret = req.query.secret;

  if (config.cronSecret) {
    const isValidHeader = authHeader === `Bearer ${config.cronSecret}`;
    const isValidQuery = querySecret === config.cronSecret;
    if (!isValidHeader && !isValidQuery) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Cron Secret' });
    }
  }

  try {
    const bot = getBot();
    const result = await runCleanup(bot);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error executing cron cleanup:', err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
