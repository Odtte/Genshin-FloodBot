export const translations = {
  ua: {
    welcome: `✨ **Вітаємо у системі контролю флуду!**\n\nЦей бот допомагає керувати чистками за неактивність та заявками на рест (відпустку).\n\n🔹 **Норма повідомлень:** кожної неділі проводиться чистка серед тих, хто не набрав мінімум.\n🔹 **Рести:** якщо ви зайняті навчанням/роботою, беріть рест командою \`/rest\`.\n\n🌐 **Веб-дашборд чату:** {url}`,
    not_bound: `⚠️ Бот ще не прив'язаний до жодної групи.\nДодайте бота в групу флуду і надішліть команду /setup з правами адміністратора!`,
    bound_success: `🎉 **Бот успішно закріплений за цією групою!**\n\n📌 ID групи: \`{chatId}\`\n💬 Поточна норма: **{min} пов/тиждень**\n⏰ День чистки: **Неділя, {hour}:00 (GMT+3)**\n🌐 Дашборд: {url}`,
    already_bound_other: `⛔ Цей бот вже закріплений за іншим флудом і працює в ексклюзивному режимі!`,
    already_bound_here: `ℹ️ Бот уже закріплений за цією групою.`,
    only_admins: `⛔ Ця дія доступна лише адміністраторам групи!`,
    only_group: `⚠️ Ця команда працює лише всередині групи флуду.`,
    
    // Help
    help: `📜 **Список команд флуд-бота:**\n\n` +
          `👤 **Для учасників:**\n` +
          `• \`/stats\` (або \`/profile\`) — подивитись свою картку активності\n` +
          `• \`/rest <кількість><d/w/m> <причина>\` — подати заявку на рест (напр. \`/rest 7d екзамени\`)\n` +
          `• \`/top\` — таблиця лідерів флуду\n` +
          `• \`/dashboard\` — посилання на веб-дашборд\n\n` +
          `👑 **Для адміністрації:**\n` +
          `• \`/setup\` — прив'язати бота до цієї групи\n` +
          `• \`/clean\` — провести позачергову ручну чистку\n` +
          `• \`/setmin <число>\` — встановити тижневу норму (напр. \`/setmin 100\`)\n` +
          `• \`/setlang <ua|eng|ru>\` — змінити мову бота\n` +
          `• \`/warn <@юзер|ID> [причина]\` — видати попередження\n` +
          `• \`/unwarn <@юзер|ID>\` — зняти попередження\n` +
          `• \`/kick <@юзер|ID>\` — виключити з флуду`,

    // Profile / Stats
    stats_card: `📇 **Картка учасника | Флуд**\n\n` +
                `👤 **Користувач:** {name} ({username})\n` +
                `🆔 **UID:** \`{uid}\`\n` +
                `💬 **Повідомлень цього тижня:** {weekly} / {min} ({percent}%)\n` +
                `🏆 **Всього повідомлень:** {total}\n` +
                `⚠️ **Варни:** {warns}/{maxWarns}\n` +
                `🛡️ **Статус:** {statusText}\n\n` +
                `🔗 [Відкрити у веб-дашборді]({url})`,

    status_active: `🟢 В строю`,
    status_rest: `🏖️ На ресті до {date} (Причина: {reason})`,
    status_warned: `🟡 Під загрозою чистки`,
    status_kicked: `🔴 Виключений`,

    // Rest
    rest_usage: `⚠️ **Невірний формат!**\nВикористовуйте: \`/rest <час><d|w|m> <причина>\`\nПриклади:\n• \`/rest 3d захворів\` (3 дні)\n• \`/rest 2w сесія та курсач\` (2 тижні)\n• \`/rest 1m відпустка без інтернету\` (1 місяць)`,
    rest_already_active: `🏖️ У вас вже є активний рест до **{date}**!`,
    rest_pending_exists: `⏳ У вас вже є активна заявка на рест, яка очікує розгляду адміністрацією!`,
    rest_request_sent: `📨 **Запит на рест надіслано адміністраторам!**\nОчікуйте рішення.`,
    
    rest_admin_alert: `📋 **Нова заявка на рест!**\n\n` +
                      `👤 **Хто:** {mention} (UID: \`{uid}\`)\n` +
                      `⏳ **Термін:** {durationText} (до **{date}**)\n` +
                      `💬 **Активність за тиждень:** {weekly} / {min} пов.\n` +
                      `⚠️ **Варни:** {warns}/{maxWarns}\n` +
                      `📝 **Причина:** {reason}\n\n` +
                      `⚖️ *Адміністратори, ухваліть рішення:*`,

    rest_approved: `✅ **Рест схвалено!**\n👤 {mention} тепер має імунітет від чисток до **{date}**.\n👨‍⚖️ Схвалив(ла): {admin}`,
    rest_rejected: `❌ **Запит на рест відхилено!**\n👤 {mention}, адміністрація відхилила вашу заявку на відпочинок. Потрібно добрати норму!\n👨‍⚖️ Відхилив(ла): {admin}`,
    rest_btn_approve: `✅ Схвалити`,
    rest_btn_reject: `❌ Відхилити`,
    rest_processed: `ℹ️ Цей запит уже розглянуто ({status}).`,

    // Top
    top_title: `🏆 **Топ найактивніших мандрівників флуду:**\n\n`,
    top_empty: `Тут поки що порожньо. Почніть спілкування!`,
    top_footer: `\n\n🌐 Повний рейтинг дивіться на [веб-дашборді]({url})`,

    // Clean
    clean_starting: `🧹 **Починається тижнева чистка флуду!**\nНорма: **{min}** повідомлень. Перевірка учасників...`,
    clean_report_title: `📊 **Підсумки щотижневої чистки:**\n\n`,
    clean_report_safe: `✅ Виконали норму: {count} чол.`,
    clean_report_rest: `🛡️ Мають імунітет (рест): {count} чол.`,
    clean_report_warned: `⚠️ Отримали варни: {count} чол.`,
    clean_report_kicked: `🚪 Кікнуто з флуду: {count} чол.`,
    clean_report_footer: `\n🔄 Лічильники повідомлень скинуто на новий тиждень! Усім успіху! ✨`,
    clean_user_warned: `⚠️ Учасник {mention} отримує варн ({warns}/{maxWarns}) за недобір норми ({weekly}/{min}).`,
    clean_user_kicked: `🚪 Учасника {mention} кікнуто з групи за перевищення ліміту варнів або критичну неактивність ({weekly}/{min}).`,

    // Settings
    lang_changed: `🌐 Мову бота успішно змінено на **Українську**!`,
    min_changed: `⚙️ Тижневу норму повідомлень змінено на: **{min}** пов.`,
    invalid_number: `⚠️ Вкажіть коректне число! Наприклад: \`/setmin 100\``,
    dashboard_link: `🌐 **Веб-дашборд флуду:**\n{url}\n\nТут ви можете дивитись свій прогрес, топ учасників та статус рестів.`,
    user_not_found: `⚠️ Користувача не знайдено в базі даних.`,
    warn_given: `⚠️ Адміністратор {admin} видав варн користувачу {mention} ({warns}/{maxWarns}).\nПричина: {reason}`,
    warn_removed: `🟢 Адміністратор {admin} зняв варн з користувача {mention} (зараз: {warns}/{maxWarns}).`,
    user_kicked_admin: `🚪 Користувача {mention} виключено з чату адміністратором {admin}.`
  },

  eng: {
    welcome: `✨ **Welcome to the Flood Chat Management System!**\n\nThis bot manages inactivity cleanups and rest/vacation requests.\n\n🔹 **Message Quota:** Cleanups are held every Sunday for those who don't reach the quota.\n🔹 **Rests:** If you're busy with exams or work, take a rest via \`/rest\`.\n\n🌐 **Chat Web Dashboard:** {url}`,
    not_bound: `⚠️ The bot is not bound to any group yet.\nAdd the bot to your flood group and send /setup with administrator privileges!`,
    bound_success: `🎉 **Bot successfully bound to this group!**\n\n📌 Group ID: \`{chatId}\`\n💬 Quota: **{min} msgs/week**\n⏰ Cleanup Day: **Sunday, {hour}:00 (GMT+3)**\n🌐 Dashboard: {url}`,
    already_bound_other: `⛔ This bot is already bound to another group and operates exclusively!`,
    already_bound_here: `ℹ️ Bot is already bound to this group.`,
    only_admins: `⛔ This action is only available to group administrators!`,
    only_group: `⚠️ This command only works inside the flood group.`,

    // Help
    help: `📜 **Flood Bot Command List:**\n\n` +
          `👤 **For Members:**\n` +
          `• \`/stats\` (or \`/profile\`) — view your activity card\n` +
          `• \`/rest <duration><d/w/m> <reason>\` — request a rest (e.g. \`/rest 7d exams\`)\n` +
          `• \`/top\` — chat leaderboard\n` +
          `• \`/dashboard\` — web dashboard link\n\n` +
          `👑 **For Administrators:**\n` +
          `• \`/setup\` — bind bot to this group\n` +
          `• \`/clean\` — trigger manual cleanup\n` +
          `• \`/setmin <number>\` — set weekly message quota (e.g. \`/setmin 100\`)\n` +
          `• \`/setlang <ua|eng|ru>\` — change bot language\n` +
          `• \`/warn <@user|ID> [reason]\` — issue a warning\n` +
          `• \`/unwarn <@user|ID>\` — remove a warning\n` +
          `• \`/kick <@user|ID>\` — kick from chat`,

    // Profile / Stats
    stats_card: `📇 **Member Card | Flood**\n\n` +
                `👤 **User:** {name} ({username})\n` +
                `🆔 **UID:** \`{uid}\`\n` +
                `💬 **Weekly Messages:** {weekly} / {min} ({percent}%)\n` +
                `🏆 **Total Messages:** {total}\n` +
                `⚠️ **Warns:** {warns}/{maxWarns}\n` +
                `🛡️ **Status:** {statusText}\n\n` +
                `🔗 [Open Web Dashboard]({url})`,

    status_active: `🟢 Active`,
    status_rest: `🏖️ On rest until {date} (Reason: {reason})`,
    status_warned: `🟡 At risk of cleanup`,
    status_kicked: `🔴 Kicked`,

    // Rest
    rest_usage: `⚠️ **Invalid format!**\nUse: \`/rest <time><d|w|m> <reason>\`\nExamples:\n• \`/rest 3d sick\` (3 days)\n• \`/rest 2w exam week\` (2 weeks)\n• \`/rest 1m vacation without internet\` (1 month)`,
    rest_already_active: `🏖️ You already have an active rest until **{date}**!`,
    rest_pending_exists: `⏳ You already have a pending rest request waiting for admin review!`,
    rest_request_sent: `📨 **Rest request submitted to administrators!**\nPlease wait for their decision.`,
    
    rest_admin_alert: `📋 **New Rest Request!**\n\n` +
                      `👤 **From:** {mention} (UID: \`{uid}\`)\n` +
                      `⏳ **Duration:** {durationText} (until **{date}**)\n` +
                      `💬 **Weekly Activity:** {weekly} / {min} msgs.\n` +
                      `⚠️ **Warns:** {warns}/{maxWarns}\n` +
                      `📝 **Reason:** {reason}\n\n` +
                      `⚖️ *Admins, decide:*`,

    rest_approved: `✅ **Rest Approved!**\n👤 {mention} now has immunity from cleanups until **{date}**.\n👨‍⚖️ Decided by: {admin}`,
    rest_rejected: `❌ **Rest Rejected!**\n👤 {mention}, the administration rejected your rest request. Reach the quota!\n👨‍⚖️ Decided by: {admin}`,
    rest_btn_approve: `✅ Approve`,
    rest_btn_reject: `❌ Reject`,
    rest_processed: `ℹ️ This request has already been processed ({status}).`,

    // Top
    top_title: `🏆 **Top Most Active Travelers:**\n\n`,
    top_empty: `It's quiet here. Start chatting!`,
    top_footer: `\n\n🌐 View full leaderboard on the [web dashboard]({url})`,

    // Clean
    clean_starting: `🧹 **Weekly cleanup is starting!**\nQuota: **{min}** messages. Checking participants...`,
    clean_report_title: `📊 **Weekly Cleanup Results:**\n\n`,
    clean_report_safe: `✅ Met quota: {count} users`,
    clean_report_rest: `🛡️ Have immunity (rest): {count} users`,
    clean_report_warned: `⚠️ Warned: {count} users`,
    clean_report_kicked: `🚪 Kicked from flood: {count} users`,
    clean_report_footer: `\n🔄 Weekly message counters have been reset! Good luck! ✨`,
    clean_user_warned: `⚠️ Member {mention} receives a warning ({warns}/{maxWarns}) for missing quota ({weekly}/{min}).`,
    clean_user_kicked: `🚪 Member {mention} kicked for exceeding warning limit or zero activity ({weekly}/{min}).`,

    // Settings
    lang_changed: `🌐 Bot language successfully changed to **English**!`,
    min_changed: `⚙️ Weekly message quota updated to: **{min}** msgs.`,
    invalid_number: `⚠️ Please specify a valid number! Example: \`/setmin 100\``,
    dashboard_link: `🌐 **Flood Web Dashboard:**\n{url}\n\nCheck your progress, leaderboard, and rest status.`,
    user_not_found: `⚠️ User not found in database.`,
    warn_given: `⚠️ Admin {admin} warned user {mention} ({warns}/{maxWarns}).\nReason: {reason}`,
    warn_removed: `🟢 Admin {admin} removed warning from user {mention} (now: {warns}/{maxWarns}).`,
    user_kicked_admin: `🚪 User {mention} kicked by admin {admin}.`
  },

  ru: {
    welcome: `✨ **Добро пожаловать в систему контроля флуда!**\n\nЭтот бот помогает управлять чистками за неактив и заявками на рест (отпуск).\n\n🔹 **Норма сообщений:** каждое воскресенье проходит чистка для тех, кто не набрал минимум.\n🔹 **Ресты:** если вы заняты учебой или делами, берите рест командой \`/rest\`.\n\n🌐 **Веб-дашборд чата:** {url}`,
    not_bound: `⚠️ Бот еще не привязан ни к одной группе.\nДобавьте бота в группу флуда и отправьте команду /setup с правами администратора!`,
    bound_success: `🎉 **Бот успешно закреплен за этой группой!**\n\n📌 ID группы: \`{chatId}\`\n💬 Норма: **{min} сообщ/неделя**\n⏰ День чистки: **Воскресенье, {hour}:00 (GMT+3)**\n🌐 Дашборд: {url}`,
    already_bound_other: `⛔ Этот бот уже привязан к другой группе и работает эксклюзивно!`,
    already_bound_here: `ℹ️ Бот уже привязан к этой группе.`,
    only_admins: `⛔ Это действие доступно только администраторам группы!`,
    only_group: `⚠️ Эта команда работает только внутри группы флуда.`,

    // Help
    help: `📜 **Список команд флуд-бота:**\n\n` +
          `👤 **Для участников:**\n` +
          `• \`/stats\` (или \`/profile\`) — посмотреть свою карточку активности\n` +
          `• \`/rest <срок><d/w/m> <причина>\` — подать заявку на рест (напр. \`/rest 7d сессия\`)\n` +
          `• \`/top\` — таблица лидеров флуда\n` +
          `• \`/dashboard\` — ссылка на веб-дашборд\n\n` +
          `👑 **Для администрации:**\n` +
          `• \`/setup\` — привязать бота к этой группе\n` +
          `• \`/clean\` — запустить ручную чистку\n` +
          `• \`/setmin <число>\` — установить недельную норму (напр. \`/setmin 100\`)\n` +
          `• \`/setlang <ua|eng|ru>\` — сменить язык бота\n` +
          `• \`/warn <@юзер|ID> [причина]\` — выдать варн\n` +
          `• \`/unwarn <@юзер|ID>\` — снять варн\n` +
          `• \`/kick <@юзер|ID>\` — исключить из чата`,

    // Profile / Stats
    stats_card: `📇 **Карточка участника | Флуд**\n\n` +
                `👤 **Пользователь:** {name} ({username})\n` +
                `🆔 **UID:** \`{uid}\`\n` +
                `💬 **Сообщений за неделю:** {weekly} / {min} ({percent}%)\n` +
                `🏆 **Всего сообщений:** {total}\n` +
                `⚠️ **Варны:** {warns}/{maxWarns}\n` +
                `🛡️ **Статус:** {statusText}\n\n` +
                `🔗 [Открыть в веб-дашборде]({url})`,

    status_active: `🟢 В строю`,
    status_rest: `🏖️ На ресте до {date} (Причина: {reason})`,
    status_warned: `🟡 Под угрозой чистки`,
    status_kicked: `🔴 Исключен`,

    // Rest
    rest_usage: `⚠️ **Неверный формат!**\nИспользуйте: \`/rest <срок><d|w|m> <причина>\`\nПримеры:\n• \`/rest 3d заболел\` (3 дня)\n• \`/rest 2w сессия\` (2 недели)\n• \`/rest 1m отпуск без интернета\` (1 месяц)`,
    rest_already_active: `🏖️ У вас уже активен рест до **{date}**!`,
    rest_pending_exists: `⏳ У вас уже есть активная заявка на рест, ожидающая рассмотрения!`,
    rest_request_sent: `📨 **Запрос на рест отправлен администрации!**\nОжидайте решения.`,
    
    rest_admin_alert: `📋 **Новая заявка на рест!**\n\n` +
                      `👤 **Кто:** {mention} (UID: \`{uid}\`)\n` +
                      `⏳ **Срок:** {durationText} (до **{date}**)\n` +
                      `💬 **Активность за неделю:** {weekly} / {min} сообщ.\n` +
                      `⚠️ **Варны:** {warns}/{maxWarns}\n` +
                      `📝 **Причина:** {reason}\n\n` +
                      `⚖️ *Администрация, примите решение:*`,

    rest_approved: `✅ **Рест одобрен!**\n👤 {mention} получает иммунитет от чисток до **{date}**.\n👨‍⚖️ Одобрил(а): {admin}`,
    rest_rejected: `❌ **Запрос на рест отклонен!**\n👤 {mention}, администрация отклонила вашу заявку. Добирайте норму!\n👨‍⚖️ Отклонил(а): {admin}`,
    rest_btn_approve: `✅ Одобрить`,
    rest_btn_reject: `❌ Отклонить`,
    rest_processed: `ℹ️ Этот запрос уже обработан ({status}).`,

    // Top
    top_title: `🏆 **Топ самых активных путешественников флуда:**\n\n`,
    top_empty: `Здесь пока пусто. Начните общение!`,
    top_footer: `\n\n🌐 Полный рейтинг смотрите в [веб-дашборде]({url})`,

    // Clean
    clean_starting: `🧹 **Начинается еженедельная чистка флуда!**\nНорма: **{min}** сообщений. Проверка участников...`,
    clean_report_title: `📊 **Итоги еженедельной чистки:**\n\n`,
    clean_report_safe: `✅ Выполнили норму: {count} чел.`,
    clean_report_rest: `🛡️ Иммунитет (рест): {count} чел.`,
    clean_report_warned: `⚠️ Получили варны: {count} чел.`,
    clean_report_kicked: `🚪 Исключено из флуда: {count} чел.`,
    clean_report_footer: `\n🔄 Счетчики сообщений сброшены на новую неделю! Всем удачи! ✨`,
    clean_user_warned: `⚠️ Участник {mention} получает варн ({warns}/{maxWarns}) за невыполнение нормы ({weekly}/{min}).`,
    clean_user_kicked: `🚪 Участник {mention} исключен из чата за превышение лимита варнов или нулевой актив ({weekly}/{min}).`,

    // Settings
    lang_changed: `🌐 Язык бота успешно изменен на **Русский**!`,
    min_changed: `⚙️ Недельная норма сообщений изменена на: **{min}** сообщ.`,
    invalid_number: `⚠️ Укажите корректное число! Например: \`/setmin 100\``,
    dashboard_link: `🌐 **Веб-дашборд флуда:**\n{url}\n\nЗдесь можно смотреть свой прогресс, топ участников и статус рестов.`,
    user_not_found: `⚠️ Пользователь не найден в базе данных.`,
    warn_given: `⚠️ Администратор {admin} выдал варн пользователю {mention} ({warns}/{maxWarns}).\nПричина: {reason}`,
    warn_removed: `🟢 Администратор {admin} снял варн с пользователя {mention} (сейчас: {warns}/{maxWarns}).`,
    user_kicked_admin: `🚪 Пользователь {mention} исключен из чата администратором {admin}.`
  }
};

/**
 * Get translated text with variable substitution
 * @param {string} lang - 'ua' | 'eng' | 'ru'
 * @param {string} key - translation key
 * @param {Object} params - placeholder parameters
 * @returns {string}
 */
export function t(lang = 'ua', key, params = {}) {
  const currentLang = translations[lang] ? lang : 'ua';
  let text = translations[currentLang][key] || translations['ua'][key] || key;

  for (const [paramKey, value] of Object.entries(params)) {
    text = text.replaceAll(`{${paramKey}}`, String(value));
  }

  return text;
}
