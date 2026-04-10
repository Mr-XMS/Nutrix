import { startOfWeek, addDays, addWeeks, format, isSameDay, differenceInMinutes, startOfDay } from 'date-fns';
import type { CalendarShift } from '@/types/shift';

// Calendar display config
export const CALENDAR_START_HOUR = 6;
export const CALENDAR_END_HOUR = 22;
export const HOURS_DISPLAYED = CALENDAR_END_HOUR - CALENDAR_START_HOUR;
export const MINUTES_PER_HOUR = 60;
export const PIXELS_PER_HOUR = 56;
export const PIXELS_PER_MINUTE = PIXELS_PER_HOUR / MINUTES_PER_HOUR;
export const TOTAL_GRID_HEIGHT = HOURS_DISPLAYED * PIXELS_PER_HOUR;

/** Returns the Monday of the week containing `date`, at 00:00 local time. */
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

/** Returns the 7 day-Date objects for the week starting at `weekStart`. */
export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

/** ISO range bounds for fetching shifts: Monday 00:00 to Sunday 23:59:59. */
export function getWeekRange(weekStart: Date): { startISO: string; endISO: string } {
  const start = startOfDay(weekStart);
  const end = addDays(start, 7);
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

/** Display label for the current week, e.g. "6 – 12 Apr 2026" or "30 Mar – 5 Apr 2026". */
export function formatWeekRange(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === end.getMonth();
  const sameYear = weekStart.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return `${format(weekStart, 'd')} – ${format(end, 'd MMM yyyy')}`;
  }
  if (sameYear) {
    return `${format(weekStart, 'd MMM')} – ${format(end, 'd MMM yyyy')}`;
  }
  return `${format(weekStart, 'd MMM yyyy')} – ${format(end, 'd MMM yyyy')}`;
}

export function shiftWeek(weekStart: Date, delta: number): Date {
  return addWeeks(weekStart, delta);
}

/** Group shifts by day-of-week index (0=Mon, 6=Sun). */
export function groupShiftsByDay(
  shifts: CalendarShift[],
  weekDays: Date[],
): Map<number, CalendarShift[]> {
  const map = new Map<number, CalendarShift[]>();
  for (let i = 0; i < 7; i++) map.set(i, []);

  for (const shift of shifts) {
    const start = new Date(shift.scheduledStart);
    const dayIndex = weekDays.findIndex((d) => isSameDay(d, start));
    if (dayIndex >= 0) {
      map.get(dayIndex)!.push(shift);
    }
  }

  // Sort each day's shifts by start time
  for (const [, dayShifts] of map) {
    dayShifts.sort(
      (a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime(),
    );
  }

  return map;
}

/**
 * Layout algorithm for overlapping shifts within a single day column.
 * Returns each shift with a column index and a total column count for that overlap group.
 *
 * Algorithm: greedy column assignment.
 * 1. Sort shifts by start time (already done).
 * 2. For each shift, find the first column with no conflict (existing shift in that column whose end > this shift's start).
 * 3. If no column is free, add a new one.
 * 4. After all shifts placed, compute the max column count for each "overlap group"
 *    (a connected component of shifts that overlap transitively).
 */
export interface PositionedShift {
  shift: CalendarShift;
  column: number;
  columnCount: number;
  topPx: number;
  heightPx: number;
}

export function layoutShiftsForDay(
  dayShifts: CalendarShift[],
  dayDate: Date,
): PositionedShift[] {
  if (dayShifts.length === 0) return [];

  // Step 1: assign each shift to a column
  type Placed = { shift: CalendarShift; column: number; start: number; end: number };
  const placed: Placed[] = [];
  const columnEnds: number[] = []; // columnEnds[i] = latest end-time-ms in column i

  for (const shift of dayShifts) {
    const start = new Date(shift.scheduledStart).getTime();
    const end = new Date(shift.scheduledEnd).getTime();

    let assignedColumn = -1;
    for (let i = 0; i < columnEnds.length; i++) {
      if (columnEnds[i] <= start) {
        assignedColumn = i;
        break;
      }
    }
    if (assignedColumn === -1) {
      assignedColumn = columnEnds.length;
      columnEnds.push(end);
    } else {
      columnEnds[assignedColumn] = end;
    }

    placed.push({ shift, column: assignedColumn, start, end });
  }

  // Step 2: compute overlap groups (connected components by time-overlap)
  // For each shift, find the max column count across all shifts it overlaps with.
  const result: PositionedShift[] = placed.map((p) => {
    let maxColumns = p.column + 1;
    for (const other of placed) {
      if (other === p) continue;
      const overlaps = other.start < p.end && other.end > p.start;
      if (overlaps) {
        maxColumns = Math.max(maxColumns, other.column + 1);
      }
    }

    const dayStart = startOfDay(dayDate).getTime();
    const calendarStartMs = dayStart + CALENDAR_START_HOUR * 60 * 60 * 1000;
    const startOffsetMin = (p.start - calendarStartMs) / 60000;
    const durationMin = (p.end - p.start) / 60000;

    return {
      shift: p.shift,
      column: p.column,
      columnCount: maxColumns,
      topPx: Math.max(0, startOffsetMin * PIXELS_PER_MINUTE),
      heightPx: Math.max(20, durationMin * PIXELS_PER_MINUTE),
    };
  });

  return result;
}

/** Format a shift's time range for display, e.g. "9:00 – 1:00 PM". */
export function formatShiftTime(shift: CalendarShift): string {
  const start = new Date(shift.scheduledStart);
  const end = new Date(shift.scheduledEnd);
  const startStr = format(start, 'h:mm');
  const endStr = format(end, 'h:mm a');
  return `${startStr} – ${endStr}`;
}

/** Hours rendered down the left axis: [6, 7, 8, ..., 21]. */
export function getCalendarHours(): number[] {
  return Array.from({ length: HOURS_DISPLAYED }, (_, i) => CALENDAR_START_HOUR + i);
}

/** Format an hour as "6 AM", "12 PM", "9 PM". */
export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}
