import { getSettings, incrementUserMessage } from '../../db/sheets.js';

/**
 * Handle incoming chat messages to track user activity
 * @param {import('grammy').Context} ctx
 * @param {Function} next
 */
export async function handleChatMessage(ctx, next) {
  // If it's a command, let command handlers process it first
  if (ctx.message && ctx.message.text && ctx.message.text.startsWith('/')) {
    return next();
  }

  // Check if message is from a group / supergroup
  const chatType = ctx.chat?.type;
  if (chatType !== 'group' && chatType !== 'supergroup') {
    return next();
  }

  if (!ctx.from || ctx.from.is_bot) {
    return next();
  }

  try {
    const settings = await getSettings();

    // If chat is not bound yet, don't count messages
    if (!settings.chat_id) {
      return next();
    }

    // Strictly enforce 1-group exclusivity
    if (String(ctx.chat.id) !== String(settings.chat_id)) {
      return next();
    }

    // Increment message count for this user
    await incrementUserMessage(ctx.from);
  } catch (err) {
    console.error('Error handling chat message counter:', err.message);
  }

  return next();
}
