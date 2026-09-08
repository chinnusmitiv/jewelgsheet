import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';

/**
 * Returns today's business date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
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
