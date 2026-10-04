import {
  getSettings,
  updateSetting,
  getRestRequest,
  updateRestRequest,
  updateUser,
  getUser
} from '../../db/sheets.js';
import { t } from '../i18n.js';
import { parseRestDuration, formatDateReadable } from '../../services/rest.js';
import { isChatAdmin } from './commands.js';

/**
 * Register callback query handlers
 * @param {import('grammy').Bot} bot
 */
export function registerCallbacks(bot) {
  bot.on('callback_query:data', async (ctx) => {
    const data = ctx.callbackQuery.data;

    // Check if it's a quota setting button callback
    if (data.startsWith('set_quota:')) {
      const settings = await getSettings();
      const lang = settings.language || 'ua';

      const admin = await isChatAdmin(ctx);
      if (!admin && String(ctx.from.id) !== String(settings.owner_id)) {
        return ctx.answerCallbackQuery({
          text: t(lang, 'only_admins'),
          show_alert: true
        });
      }

      const val = parseInt(data.split(':')[1], 10);
      if (val && val > 0) {
        await updateSetting('min_messages', val);
        await ctx.answerCallbackQuery({ text: `✅ Норму встановлено: ${val}` });

        const adminName = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
        try {
          await ctx.editMessageText(
            `${t(lang, 'min_changed', { min: val })}\n👤 Встановив(ла): ${adminName}`,
            { parse_mode: 'Markdown' }
          );
        } catch (err) {
          console.error('Error editing quota message:', err.message);
        }
      }
      return;
    }

    // Check if it's a rest approval/rejection callback
    if (!data.startsWith('rest_app:') && !data.startsWith('rest_rej:')) {
      return;
    }

    const settings = await getSettings();
    const lang = settings.language || 'ua';

    // Verify admin privileges
    const admin = await isChatAdmin(ctx);
    if (!admin && String(ctx.from.id) !== String(settings.owner_id)) {
      return ctx.answerCallbackQuery({
        text: t(lang, 'only_admins'),
        show_alert: true
      });
    }

    const isApprove = data.startsWith('rest_app:');
    const requestId = data.split(':')[1];

    const request = await getRestRequest(requestId);
    if (!request) {
      return ctx.answerCallbackQuery({
        text: '⚠️ Запит не знайдено або видалено.',
        show_alert: true
      });
    }

    if (request.status !== 'pending') {
      return ctx.answerCallbackQuery({
        text: t(lang, 'rest_processed', { status: request.status }),
        show_alert: true
      });
    }

    const adminName = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
    const targetMention = request.username.startsWith('@')
      ? request.username
      : `[${request.username}](tg://user?id=${request.telegram_id})`;

    if (isApprove) {
      // Calculate expiration date
      const parsed = parseRestDuration(request.duration);
      const restUntil = parsed ? parsed.untilDate.toISOString() : new Date().toISOString();
      const readableDate = formatDateReadable(restUntil);

      // Update request record
      await updateRestRequest(requestId, {
        status: 'approved',
        processedBy: adminName
      });

      // Update user state
      await updateUser(request.telegram_id, {
        status: 'rest',
        rest_until: restUntil,
        rest_reason: request.reason
      });

      await ctx.answerCallbackQuery({ text: '✅ Рест успішно схвалено!' });

      const approvedText = t(lang, 'rest_approved', {
        mention: targetMention,
        date: readableDate,
        admin: adminName
      });

      // Edit original message removing buttons
      try {
        await ctx.editMessageText(approvedText, {
          parse_mode: 'Markdown',
          reply_markup: undefined
        });
      } catch (err) {
        console.error('Error editing message on approve:', err.message);
      }
    } else {
      // Reject rest
      await updateRestRequest(requestId, {
        status: 'rejected',
        processedBy: adminName
      });

      await ctx.answerCallbackQuery({ text: '❌ Рест відхилено.' });

      const rejectedText = t(lang, 'rest_rejected', {
        mention: targetMention,
        admin: adminName
      });

      try {
        await ctx.editMessageText(rejectedText, {
          parse_mode: 'Markdown',
          reply_markup: undefined
        });
      } catch (err) {
        console.error('Error editing message on reject:', err.message);
      }
    }
  });
}
