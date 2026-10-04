/**
 * Rest duration parser and date calculator
 */

/**
 * Parse string like "7d", "2w", "1m" into days and untilDate
 * @param {string} input - Duration input string
 * @returns {{ days: number, untilDate: Date, unit: string, count: number } | null}
 */
export function parseRestDuration(input) {
  if (!input) return null;

  const match = input.trim().match(/^(\d+)([dwm])$/i);
  if (!match) return null;

  const count = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  if (count <= 0 || count > 365) return null;

  let days = 0;
  if (unit === 'd') {
    days = count;
  } else if (unit === 'w') {
    days = count * 7;
  } else if (unit === 'm') {
    days = count * 30;
  }

  // Calculate future date at 23:59:59
  const untilDate = new Date();
  untilDate.setDate(untilDate.getDate() + days);
  untilDate.setHours(23, 59, 59, 999);

  return {
    days,
    untilDate,
    unit,
    count
  };
}

/**
 * Format duration for user message depending on language
 */
export function formatDurationText(lang = 'ua', count, unit) {
  const u = unit.toLowerCase();
  if (lang === 'ua') {
    if (u === 'd') {
      if (count % 10 === 1 && count % 100 !== 11) return `${count} день`;
      if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return `${count} дні`;
      return `${count} днів`;
    }
    if (u === 'w') {
      if (count % 10 === 1 && count % 100 !== 11) return `${count} тиждень`;
      if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return `${count} тижні`;
      return `${count} тижнів`;
    }
    if (u === 'm') {
      if (count % 10 === 1 && count % 100 !== 11) return `${count} місяць`;
      if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return `${count} місяці`;
      return `${count} місяців`;
    }
  } else if (lang === 'ru') {
    if (u === 'd') {
      if (count % 10 === 1 && count % 100 !== 11) return `${count} день`;
      if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return `${count} дня`;
      return `${count} дней`;
    }
    if (u === 'w') {
      if (count % 10 === 1 && count % 100 !== 11) return `${count} неделя`;
      if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return `${count} недели`;
      return `${count} недель`;
    }
    if (u === 'm') {
      if (count % 10 === 1 && count % 100 !== 11) return `${count} месяц`;
      if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return `${count} месяца`;
      return `${count} месяцев`;
    }
  } else {
    // English
    if (u === 'd') return `${count} day${count > 1 ? 's' : ''}`;
    if (u === 'w') return `${count} week${count > 1 ? 's' : ''}`;
    if (u === 'm') return `${count} month${count > 1 ? 's' : ''}`;
  }
  return `${count}${unit}`;
}

/**
 * Format date to readable DD.MM.YYYY
 */
export function formatDateReadable(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}
