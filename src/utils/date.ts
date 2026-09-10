import { format, subDays, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';

/**
 * Returns today's business date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Returns previous date formatted as YYYY-MM-DD
 */
export function getPreviousDate(dateStr: string): string {
  try {
    const d = dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr + 'T00:00:00');
    return format(subDays(d, 1), 'yyyy-MM-dd');
  } catch {
    return dateStr;
  }
}

/**
 * Returns next date formatted as YYYY-MM-DD
 */
export function getNextDate(dateStr: string): string {
  try {
    const d = dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr + 'T00:00:00');
    return format(addDays(d, 1), 'yyyy-MM-dd');
  } catch {
    return dateStr;
  }
}

/**
 * Checks if a date string is today
 */
export function isTodayDate(dateStr: string): boolean {
  if (!dateStr) return false;
  return dateStr === getTodayDateString();
}

/**
 * Returns relative human label (e.g. "Today", "Yesterday", or "08 Sep 2026")
 */
export function getRelativeDateLabel(dateStr: string): string {
  if (!dateStr) return '';
  const todayStr = getTodayDateString();
  if (dateStr === todayStr) return 'Today';
  const yestStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  if (dateStr === yestStr) return 'Yesterday';
  return formatDisplayDate(dateStr);
}

/**
 * Returns recent 7 past business dates for quick selection
 */
export function getRecentBusinessDates(count = 7): { dateStr: string; label: string; dayName: string }[] {
  const list = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = subDays(today, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    let label = format(d, 'dd MMM');
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Yesterday';
    list.push({
      dateStr,
      label,
      dayName: format(d, 'EEE'),
    });
  }
  return list;
}

/**
 * Formats a date string YYYY-MM-DD or ISO timestamp into human readable format (e.g. "08 Sep 2026")
 */
export function formatDisplayDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  try {
    const d = dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr + 'T00:00:00');
    return format(d, 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

/**
 * Formats a date string into voucher format e.g. "07.09.2026 (Monday)"
 */
export function formatVoucherDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  try {
    const d = dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr + 'T00:00:00');
    return `${format(d, 'dd.MM.yyyy')} (${format(d, 'EEEE')})`;
  } catch {
    return dateStr;
  }
}

/**
 * Formats time string (e.g. "10:32 AM")
 */
export function formatDisplayTime(dateOrTimeStr: string | undefined | null): string {
  if (!dateOrTimeStr) return '';
  try {
    if (dateOrTimeStr.includes('T')) {
      return format(parseISO(dateOrTimeStr), 'hh:mm a');
    }
    return dateOrTimeStr;
  } catch {
    return dateOrTimeStr;
  }
}

export type DatePreset = 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'CUSTOM';

export function getDateRangeFromPreset(preset: DatePreset): { dateFrom: string; dateTo: string } {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  switch (preset) {
    case 'TODAY':
      return { dateFrom: todayStr, dateTo: todayStr };
    case 'YESTERDAY': {
      const yest = subDays(today, 1);
      const yestStr = format(yest, 'yyyy-MM-dd');
      return { dateFrom: yestStr, dateTo: yestStr };
    }
    case 'THIS_WEEK': {
      const start = startOfWeek(today, { weekStartsOn: 1 });
      const end = endOfWeek(today, { weekStartsOn: 1 });
      return { dateFrom: format(start, 'yyyy-MM-dd'), dateTo: format(end, 'yyyy-MM-dd') };
    }
    case 'THIS_MONTH': {
      const start = startOfMonth(today);
      const end = endOfMonth(today);
      return { dateFrom: format(start, 'yyyy-MM-dd'), dateTo: format(end, 'yyyy-MM-dd') };
    }
    case 'CUSTOM':
    default:
      return { dateFrom: todayStr, dateTo: todayStr };
  }
}
