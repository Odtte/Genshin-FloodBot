import { InlineKeyboard, InputFile } from 'grammy';
import {
  getSettings,
  updateSetting,
  getUser,
  getOrCreateUser,
  getAllUsers,
  createRestRequest,
  updateUser,
  getUserByUid,
  getAllRestRequests
} from '../../db/sheets.js';
import { t } from '../i18n.js';
import { parseRestDuration, formatDurationText, formatDateReadable } from '../../services/rest.js';
import { runCleanup } from '../../services/cleanup.js';
import { renderCardPng } from '../../services/card.js';
import { config } from '../../config.js';

/**
 * Check if the user is an administrator in the current chat
 */
export async function isChatAdmin(ctx) {
  if (ctx.chat?.type === 'private') return false;
  try {
    const member = await ctx.getChatMember(ctx.from.id);
    return ['creator', 'administrator'].includes(member.status);
  } catch (err) {
    console.error('Error checking admin status:', err.message);
    return false;
  }
}

/**
 * Register command handlers on the bot
 * @param {import('grammy').Bot} bot
 */
export function registerCommands(bot) {
  // --- /start ---
  bot.command('start', async (ctx) => {
    const settings = await getSettings();
    const lang = settings.language || 'ua';
    const dashUrl = config.appUrl ? `${config.appUrl}` : 'https://your-domain.vercel.app';

    await ctx.reply(t(lang, 'welcome', { url: dashUrl }), {
      parse_mode: 'Markdown',
      disable_web_page_preview: false
    });
  });

  // --- /help ---
  bot.command('help', async (ctx) => {
    const settings = await getSettings();
    const lang = settings.language || 'ua';
    await ctx.reply(t(lang, 'help'), { parse_mode: 'Markdown' });
  });

  // --- /setup ---
  bot.command('setup', async (ctx) => {
    if (ctx.chat.type === 'private') {
      return ctx.reply(t('ua', 'only_group'));
    }

    const admin = await isChatAdmin(ctx);
    if (!admin) {
      const settings = await getSettings();
      return ctx.reply(t(settings.language || 'ua', 'only_admins'));
    }

    const settings = await getSettings(true);
    const lang = settings.language || 'ua';

    // Check if already bound
    if (settings.chat_id && String(settings.chat_id) !== String(ctx.chat.id)) {
      return ctx.reply(t(lang, 'already_bound_other'));
    }

    if (String(settings.chat_id) === String(ctx.chat.id)) {
      return ctx.reply(t(lang, 'already_bound_here'));
    }

    // Bind bot to this chat
    await updateSetting('chat_id', ctx.chat.id);
    await updateSetting('owner_id', ctx.from.id);

    const dashUrl = config.appUrl || 'https://your-domain.vercel.app';
    await ctx.reply(
      t(lang, 'bound_success', {
        chatId: ctx.chat.id,
        min: settings.min_messages,
        hour: settings.clean_hour,
        url: dashUrl
      }),
      { parse_mode: 'Markdown' }
    );
  });

  // --- /whoiam /whoami (Genshin Traveler Passport with Image & Metrics) ---
  bot.command(['whoiam', 'whoami'], async (ctx) => {
    const settings = await getSettings();
    const lang = settings.language || 'ua';

    let targetTelegramId = ctx.from.id;
    let targetTgUser = ctx.from;

    // Check if replied to another message
    if (ctx.message?.reply_to_message?.from && !ctx.message.reply_to_message.from.is_bot) {
      targetTelegramId = ctx.message.reply_to_message.from.id;
      targetTgUser = ctx.message.reply_to_message.from;
    }

    // Check if passed argument like @username or UID
    const arg = (ctx.match || '').trim();
    let user = null;

    if (arg) {
      const all = await getAllUsers();
      if (arg.startsWith('@')) {
        const cleanName = arg.toLowerCase();
        user = all.find((u) => (u.username || '').toLowerCase() === cleanName);
      } else if (!isNaN(Number(arg))) {
        user = all.find((u) => String(u.uid) === arg || String(u.telegram_id) === arg);
      }
    }

    if (!user) {
      user = await getUser(targetTelegramId);
    }
    if (!user && targetTgUser) {
      user = await getOrCreateUser(targetTgUser);
    }

    if (!user) {
      return ctx.reply(t(lang, 'user_not_found'));
    }

    // Calculate ranking in chat
    const allUsers = await getAllUsers();
    const activeSorted = allUsers
      .filter((u) => u.status !== 'kicked')
      .sort((a, b) => (parseInt(b.weekly_messages, 10) || 0) - (parseInt(a.weekly_messages, 10) || 0));

    const rankIndex = activeSorted.findIndex((u) => String(u.telegram_id) === String(user.telegram_id));
    const rank = rankIndex >= 0 ? rankIndex + 1 : activeSorted.length;

    const min = settings.min_messages || 50;
    const daily = parseInt(user.daily_messages, 10) || 0;
    const weekly = parseInt(user.weekly_messages, 10) || 0;
    const monthly = parseInt(user.monthly_messages, 10) || 0;
    const total = parseInt(user.total_messages, 10) || 0;
    const percent = Math.min(100, Math.round((weekly / min) * 100));

    let statusText = t(lang, 'status_active');
    const now = new Date();
    if (user.rest_until && new Date(user.rest_until) > now) {
      statusText = t(lang, 'status_rest', {
        date: formatDateReadable(user.rest_until),
        reason: user.rest_reason || '—'
      });
    } else if (user.status === 'warned') {
      statusText = t(lang, 'status_warned');
    } else if (user.status === 'kicked') {
      statusText = t(lang, 'status_kicked');
    }

    const quotaStatus = weekly >= min ? t(lang, 'quota_met') : t(lang, 'quota_needed');
    const dashUrl = config.appUrl ? `${config.appUrl}/?id=${user.telegram_id}` : '#';

    const caption = t(lang, 'whoiam_caption', {
      name: user.first_name || 'Мандрівник',
      username: user.username || '—',
      uid: user.uid,
      rank,
      daily,
      weekly,
      min,
      percent,
      quotaStatus,
      monthly,
      total,
      warns: user.warns || '0',
      maxWarns: settings.max_warns || 3,
      statusText,
      url: dashUrl
    });

    try {
      // Generate Traveler Passport PNG image
      const pngBuffer = await renderCardPng({
        name: user.first_name || 'Traveler',
        username: user.username || '',
        uid: user.uid,
        daily,
        weekly,
        monthly,
        total,
        quotaMin: min,
        quotaPercent: percent,
        warns: parseInt(user.warns, 10) || 0,
        maxWarns: settings.max_warns || 3,
        status: (user.rest_until && new Date(user.rest_until) > now) ? 'rest' : user.status,
        restUntil: user.rest_until,
        rank
      });

      await ctx.replyWithPhoto(new InputFile(pngBuffer, `traveler_${user.uid}.png`), {
        caption,
        parse_mode: 'Markdown'
      });
    } catch (err) {
      console.error('Error generating card image:', err);
      // Fallback to text if image generation fails
      await ctx.reply(caption, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });
    }
  });

  // --- /stats /profile ---
  bot.command(['stats', 'profile'], async (ctx) => {
    const settings = await getSettings();
    const lang = settings.language || 'ua';

    let targetTelegramId = ctx.from.id;
    let targetTgUser = ctx.from;

    // Check if replied to another message
    if (ctx.message?.reply_to_message?.from && !ctx.message.reply_to_message.from.is_bot) {
      targetTelegramId = ctx.message.reply_to_message.from.id;
      targetTgUser = ctx.message.reply_to_message.from;
    }

    let user = await getUser(targetTelegramId);
    if (!user && targetTgUser) {
      user = await getOrCreateUser(targetTgUser);
    }

    if (!user) {
      return ctx.reply(t(lang, 'user_not_found'));
    }

    const min = settings.min_messages || 50;
    const weekly = parseInt(user.weekly_messages, 10) || 0;
    const percent = Math.min(100, Math.round((weekly / min) * 100));

    let statusText = t(lang, 'status_active');
    const now = new Date();
    if (user.rest_until && new Date(user.rest_until) > now) {
      statusText = t(lang, 'status_rest', {
        date: formatDateReadable(user.rest_until),
        reason: user.rest_reason || '—'
      });
    } else if (user.status === 'warned') {
      statusText = t(lang, 'status_warned');
    } else if (user.status === 'kicked') {
      statusText = t(lang, 'status_kicked');
    }

    const dashUrl = config.appUrl ? `${config.appUrl}/?id=${user.telegram_id}` : '#';

    const text = t(lang, 'stats_card', {
      name: user.first_name || '—',
      username: user.username || '—',
      uid: user.uid,
      weekly,
      min,
      percent,
      total: user.total_messages || '0',
      warns: user.warns || '0',
      maxWarns: settings.max_warns || 3,
      statusText,
      url: dashUrl
    });

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  });

  // --- /rest <duration><d/w/m> <reason> ---
  bot.command('rest', async (ctx) => {
    const settings = await getSettings();
    const lang = settings.language || 'ua';

    if (ctx.chat.type === 'private') {
      return ctx.reply(t(lang, 'only_group'));
    }

    const parts = (ctx.match || '').trim().split(/\s+/);
    const durationInput = parts[0];
    const reason = parts.slice(1).join(' ').trim();

    if (!durationInput || !reason) {
      return ctx.reply(t(lang, 'rest_usage'), { parse_mode: 'Markdown' });
    }

    const parsed = parseRestDuration(durationInput);
    if (!parsed) {
      return ctx.reply(t(lang, 'rest_usage'), { parse_mode: 'Markdown' });
    }

    const user = await getOrCreateUser(ctx.from);

    // Check if already on active rest
    if (user.rest_until && new Date(user.rest_until) > new Date()) {
      return ctx.reply(
        t(lang, 'rest_already_active', {
          date: formatDateReadable(user.rest_until)
        }),
        { parse_mode: 'Markdown' }
      );
    }

    // Check if already has pending rest request
    const allRequests = await getAllRestRequests();
    const existingPending = allRequests.find(
      (r) => String(r.telegram_id) === String(ctx.from.id) && r.status === 'pending'
    );

    if (existingPending) {
      return ctx.reply(t(lang, 'rest_pending_exists'));
    }

    // Create rest request in database
    const req = await createRestRequest({
      telegramId: ctx.from.id,
      username: ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name,
      duration: durationInput,
      reason,
      weeklyMsgAtRequest: user.weekly_messages
    });

    const durationText = formatDurationText(lang, parsed.count, parsed.unit);
    const untilDateStr = formatDateReadable(parsed.untilDate);
    const mention = ctx.from.username ? `@${ctx.from.username}` : `[${ctx.from.first_name}](tg://user?id=${ctx.from.id})`;

    const alertText = t(lang, 'rest_admin_alert', {
      mention,
      uid: user.uid,
      durationText,
      date: untilDateStr,
      weekly: user.weekly_messages || '0',
      min: settings.min_messages || 50,
      warns: user.warns || '0',
      maxWarns: settings.max_warns || 3,
      reason
    });

    // Create interactive inline buttons
    const keyboard = new InlineKeyboard()
      .text(t(lang, 'rest_btn_approve'), `rest_app:${req.id}`)
      .text(t(lang, 'rest_btn_reject'), `rest_rej:${req.id}`);

    await ctx.reply(alertText, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  });

  // --- /top ---
  bot.command('top', async (ctx) => {
    const settings = await getSettings();
    const lang = settings.language || 'ua';
    const allUsers = await getAllUsers();

    // Filter active users and sort by weekly messages descending
    const sorted = allUsers
      .filter((u) => u.status !== 'kicked')
      .sort((a, b) => (parseInt(b.weekly_messages, 10) || 0) - (parseInt(a.weekly_messages, 10) || 0))
      .slice(0, 10);

    if (sorted.length === 0) {
      return ctx.reply(t(lang, 'top_empty'));
    }

    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    let text = t(lang, 'top_title');

    sorted.forEach((u, i) => {
      const medal = medals[i] || `${i + 1}.`;
      const name = u.username ? u.username : (u.first_name || `UID:${u.uid}`);
      const weekly = u.weekly_messages || 0;
      const total = u.total_messages || 0;
      text += `${medal} **${name}** — **${weekly}** пов. *(загалом: ${total})*\n`;
    });

    const dashUrl = config.appUrl || '#';
    text += t(lang, 'top_footer', { url: dashUrl });

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  });

  // --- /clean (Manual cleanup by admins) ---
  bot.command('clean', async (ctx) => {
    const settings = await getSettings();
    const lang = settings.language || 'ua';

    const admin = await isChatAdmin(ctx);
    if (!admin && String(ctx.from.id) !== String(settings.owner_id)) {
      return ctx.reply(t(lang, 'only_admins'));
    }

    await runCleanup(bot);
  });

  // --- /setmin <number> ---
  bot.command('setmin', async (ctx) => {
    const settings = await getSettings();
    const lang = settings.language || 'ua';

    const admin = await isChatAdmin(ctx);
    if (!admin && String(ctx.from.id) !== String(settings.owner_id)) {
      return ctx.reply(t(lang, 'only_admins'));
    }

    const val = parseInt(ctx.match?.trim(), 10);
    if (isNaN(val) || val <= 0) {
      return ctx.reply(t(lang, 'invalid_number'), { parse_mode: 'Markdown' });
    }

    await updateSetting('min_messages', val);
    await ctx.reply(t(lang, 'min_changed', { min: val }), { parse_mode: 'Markdown' });
  });

  // --- /setlang <ua|eng|ru> ---
  bot.command('setlang', async (ctx) => {
    const settings = await getSettings();
    let currentLang = settings.language || 'ua';

    const admin = await isChatAdmin(ctx);
    if (!admin && String(ctx.from.id) !== String(settings.owner_id)) {
      return ctx.reply(t(currentLang, 'only_admins'));
    }

    const langArg = ctx.match?.trim().toLowerCase();
    if (!['ua', 'eng', 'ru'].includes(langArg)) {
      return ctx.reply('⚠️ Оберіть / Choose / Выберите: `/setlang ua`, `/setlang eng`, `/setlang ru`', {
        parse_mode: 'Markdown'
      });
    }

    await updateSetting('language', langArg);
    await ctx.reply(t(langArg, 'lang_changed'), { parse_mode: 'Markdown' });
  });

  // --- /dashboard ---
  bot.command('dashboard', async (ctx) => {
    const settings = await getSettings();
    const lang = settings.language || 'ua';
    const user = await getOrCreateUser(ctx.from);
    const dashUrl = config.appUrl ? `${config.appUrl}/?id=${user.telegram_id}` : 'https://your-domain.vercel.app';

    await ctx.reply(t(lang, 'dashboard_link', { url: dashUrl }), {
      parse_mode: 'Markdown',
      disable_web_page_preview: false
    });
  });

  // --- /warn <@user|id> [reason] ---
  bot.command('warn', async (ctx) => {
    const settings = await getSettings();
    const lang = settings.language || 'ua';

    const admin = await isChatAdmin(ctx);
    if (!admin && String(ctx.from.id) !== String(settings.owner_id)) {
      return ctx.reply(t(lang, 'only_admins'));
    }

    let targetTelegramId = null;
    let targetName = '';

    if (ctx.message?.reply_to_message?.from && !ctx.message.reply_to_message.from.is_bot) {
      targetTelegramId = ctx.message.reply_to_message.from.id;
      targetName = ctx.message.reply_to_message.from.username
        ? `@${ctx.message.reply_to_message.from.username}`
        : ctx.message.reply_to_message.from.first_name;
    }

    if (!targetTelegramId) {
      return ctx.reply('⚠️ Дайте відповідь на повідомлення користувача командою: `/warn [причина]`', {
        parse_mode: 'Markdown'
      });
    }

    const reason = ctx.match?.trim() || 'Порушення правил флуду';
    const targetUser = await getUser(targetTelegramId);
    const currentWarns = (parseInt(targetUser?.warns, 10) || 0) + 1;
    const maxWarns = settings.max_warns || 3;

    await updateUser(targetTelegramId, {
      warns: currentWarns,
      status: currentWarns >= maxWarns ? 'kicked' : 'warned'
    });

    const adminMention = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

    await ctx.reply(
      t(lang, 'warn_given', {
        admin: adminMention,
        mention: targetName,
        warns: currentWarns,
        maxWarns,
        reason
      }),
      { parse_mode: 'Markdown' }
    );

    if (currentWarns >= maxWarns) {
      try {
        await ctx.banChatMember(Number(targetTelegramId));
        await ctx.unbanChatMember(Number(targetTelegramId));
      } catch (err) {
        console.error('Failed to kick after max warns:', err.message);
      }
    }
  });

  // --- /unwarn <reply> ---
  bot.command('unwarn', async (ctx) => {
    const settings = await getSettings();
    const lang = settings.language || 'ua';

    const admin = await isChatAdmin(ctx);
    if (!admin && String(ctx.from.id) !== String(settings.owner_id)) {
      return ctx.reply(t(lang, 'only_admins'));
    }

    let targetTelegramId = ctx.message?.reply_to_message?.from?.id;
    let targetName = ctx.message?.reply_to_message?.from?.username
      ? `@${ctx.message.reply_to_message.from.username}`
      : ctx.message?.reply_to_message?.from?.first_name;

    if (!targetTelegramId) {
      return ctx.reply('⚠️ Дайте відповідь на повідомлення користувача командою: `/unwarn`', {
        parse_mode: 'Markdown'
      });
    }

    const targetUser = await getUser(targetTelegramId);
    const currentWarns = Math.max(0, (parseInt(targetUser?.warns, 10) || 0) - 1);

    await updateUser(targetTelegramId, {
      warns: currentWarns,
      status: currentWarns === 0 ? 'active' : 'warned'
    });

    const adminMention = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

    await ctx.reply(
      t(lang, 'warn_removed', {
        admin: adminMention,
        mention: targetName,
        warns: currentWarns,
        maxWarns: settings.max_warns || 3
      }),
      { parse_mode: 'Markdown' }
    );
  });

  // --- /kick <reply> ---
  bot.command('kick', async (ctx) => {
    const settings = await getSettings();
    const lang = settings.language || 'ua';

    const admin = await isChatAdmin(ctx);
    if (!admin && String(ctx.from.id) !== String(settings.owner_id)) {
      return ctx.reply(t(lang, 'only_admins'));
    }

    let targetTelegramId = ctx.message?.reply_to_message?.from?.id;
    let targetName = ctx.message?.reply_to_message?.from?.username
      ? `@${ctx.message.reply_to_message.from.username}`
      : ctx.message?.reply_to_message?.from?.first_name;

    if (!targetTelegramId) {
      return ctx.reply('⚠️ Дайте відповідь на повідомлення користувача командою: `/kick`', {
        parse_mode: 'Markdown'
      });
    }

    try {
      await ctx.banChatMember(Number(targetTelegramId));
      await ctx.unbanChatMember(Number(targetTelegramId));
      await updateUser(targetTelegramId, { status: 'kicked' });

      const adminMention = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
      await ctx.reply(
        t(lang, 'user_kicked_admin', {
          admin: adminMention,
          mention: targetName
        }),
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      await ctx.reply(`⚠️ Помилка виключення: ${err.message}`);
    }
  });
}
