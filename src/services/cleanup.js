import { getAllUsers, getSettings, resetWeeklyMessages, updateUser } from '../db/sheets.js';
import { t } from '../bot/i18n.js';
import { formatDateReadable } from './rest.js';

/**
 * Execute weekly cleanup process
 * @param {import('grammy').Bot} bot - grammY bot instance
 * @returns {Promise<{ success: boolean, report: Object }>}
 */
export async function runCleanup(bot) {
  const settings = await getSettings(true);
  const lang = settings.language || 'ua';
  const chatId = settings.chat_id;
  const minMessages = parseInt(settings.min_messages, 10) || 50;
  const maxWarns = parseInt(settings.max_warns, 10) || 3;

  if (!chatId) {
    return {
      success: false,
      error: 'Bot is not bound to any chat yet.'
    };
  }

  // Announce starting cleanup in chat
  try {
    await bot.api.sendMessage(chatId, t(lang, 'clean_starting', { min: minMessages }), {
      parse_mode: 'Markdown'
    });
  } catch (err) {
    console.error('Failed to send clean announcement:', err.message);
  }

  const allUsers = await getAllUsers();
  const now = new Date();

  const safeUsers = [];
  const restUsers = [];
  const warnedUsers = [];
  const kickedUsers = [];

  for (const user of allUsers) {
    // Skip already kicked users
    if (user.status === 'kicked') continue;

    const weekly = parseInt(user.weekly_messages, 10) || 0;
    const warns = parseInt(user.warns, 10) || 0;
    const restUntilStr = user.rest_until;
    const isResting = restUntilStr && new Date(restUntilStr) > now;

    // Check rest immunity
    if (isResting) {
      restUsers.push({
        ...user,
        restDate: formatDateReadable(new Date(restUntilStr))
      });
      continue;
    }

    // Check quota
    if (weekly >= minMessages) {
      safeUsers.push(user);
    } else {
      // Failed quota
      const newWarns = warns + 1;
      const mention = user.username ? user.username : (user.first_name || `UID:${user.uid}`);

      if (newWarns >= maxWarns || settings.clean_action === 'kick') {
        // Kick participant
        let kickedOk = false;
        try {
          // banChatMember & immediately unbanChatMember acts as a Kick in Telegram groups
          await bot.api.banChatMember(chatId, Number(user.telegram_id));
          await bot.api.unbanChatMember(chatId, Number(user.telegram_id));
          kickedOk = true;
        } catch (kickErr) {
          console.error(`Failed to kick member ${user.telegram_id}:`, kickErr.message);
        }

        await updateUser(user.telegram_id, {
          warns: String(newWarns),
          status: 'kicked'
        });

        kickedUsers.push({ ...user, kickedOk });

        try {
          await bot.api.sendMessage(
            chatId,
            t(lang, 'clean_user_kicked', {
              mention,
              weekly,
              min: minMessages
            }),
            { parse_mode: 'Markdown' }
          );
        } catch (e) {
          console.error('Error sending kick notice:', e.message);
        }
      } else {
        // Issue warn
        await updateUser(user.telegram_id, {
          warns: String(newWarns),
          status: 'warned'
        });

        warnedUsers.push({ ...user, warns: newWarns });

        try {
          await bot.api.sendMessage(
            chatId,
            t(lang, 'clean_user_warned', {
              mention,
              warns: newWarns,
              maxWarns,
              weekly,
              min: minMessages
            }),
            { parse_mode: 'Markdown' }
          );
        } catch (e) {
          console.error('Error sending warn notice:', e.message);
        }
      }
    }
  }

  // Reset weekly message counters in Google Sheets
  await resetWeeklyMessages();

  // Send summary report to chat
  const summaryReport =
    t(lang, 'clean_report_title') +
    t(lang, 'clean_report_safe', { count: safeUsers.length }) + '\n' +
    t(lang, 'clean_report_rest', { count: restUsers.length }) + '\n' +
    t(lang, 'clean_report_warned', { count: warnedUsers.length }) + '\n' +
    t(lang, 'clean_report_kicked', { count: kickedUsers.length }) +
    t(lang, 'clean_report_footer');

  try {
    await bot.api.sendMessage(chatId, summaryReport, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Failed to send clean summary:', err.message);
  }

  return {
    success: true,
    report: {
      totalProcessed: allUsers.length,
      safe: safeUsers.length,
      resting: restUsers.length,
      warned: warnedUsers.length,
      kicked: kickedUsers.length,
      executedAt: new Date().toISOString()
    }
  };
}
