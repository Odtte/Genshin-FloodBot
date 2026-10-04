import { Bot } from 'grammy';
import { config } from '../config.js';
import { handleChatMessage } from './handlers/messages.js';
import { registerCommands } from './handlers/commands.js';
import { registerCallbacks } from './handlers/callbacks.js';

let botInstance = null;

/**
 * Get or create single grammY bot instance
 */
export function getBot() {
  if (botInstance) return botInstance;

  if (!config.botToken) {
    throw new Error('BOT_TOKEN is not defined in environment variables.');
  }

  const bot = new Bot(config.botToken);

  // Error handling middleware
  bot.catch((err) => {
    console.error('grammY bot error caught:', err);
  });

  // 1. Message activity tracker
  bot.use(handleChatMessage);

  // 2. Register commands (/start, /stats, /rest, etc.)
  registerCommands(bot);

  // 3. Register callback queries (Approve/Reject rest buttons)
  registerCallbacks(bot);

  botInstance = bot;
  return bot;
}
