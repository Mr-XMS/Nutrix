'use client';

import { useMemo } from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/cn';
import type { CalendarShift } from '@/types/shift';
import {
  getCalendarHours,
  formatHour,
  groupShiftsByDay,
  layoutShiftsForDay,
  formatShiftTime,
  TOTAL_GRID_HEIGHT,
  PIXELS_PER_HOUR,
} from '@/lib/calendar-utils';

interface WeekCalendarProps {
  weekDays: Date[];
  shifts: CalendarShift[];
  onShiftClick?: (shift: CalendarShift) => void;
  onSlotClick?: (date: Date, hour: number) => void;
}

export function WeekCalendar({ weekDays, shifts, onShiftClick, onSlotClick }: WeekCalendarProps) {
  const hours = getCalendarHours();

  const layoutByDay = useMemo(() => {
    const grouped = groupShiftsByDay(shifts, weekDays);
    const layout = new Map<number, ReturnType<typeof layoutShiftsForDay>>();
    for (let i = 0; i < 7; i++) {
      layout.set(i, layoutShiftsForDay(grouped.get(i) ?? [], weekDays[i]));
    }
    return layout;
  }, [shifts, weekDays]);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        {/* Header row: day names */}
        <div className="sticky top-0 z-10 grid grid-cols-[60px_repeat(7,1fr)] border-b border-ink-200 bg-white">
          <div className="border-r border-ink-100" />
          {weekDays.map((day, i) => {
            const today = isToday(day);
            return (
              <div
                key={i}
                className={cn(
                  'border-r border-ink-100 px-3 py-2 last:border-r-0',
                  today && 'bg-accent-50',
                )}
              >
                <p
                  className={cn(
                    'text-xs font-medium uppercase tracking-wide',
                    today ? 'text-accent-700' : 'text-ink-500',
                  )}
                >
                  {format(day, 'EEE')}
                </p>
                <p
                  className={cn(
                    'mt-0.5 text-lg font-semibold tabular-nums',
                    today ? 'text-accent-700' : 'text-ink-900',
                  )}
                >
                  {format(day, 'd')}
                </p>
              </div>
            );
          })}
        </div>

        {/* Body: time column + 7 day columns */}
        <div
          className="relative grid grid-cols-[60px_repeat(7,1fr)]"
          style={{ height: TOTAL_GRID_HEIGHT }}
        >
          {/* Time column */}
          <div className="relative border-r border-ink-100">
            {hours.map((h) => (
              <div
                key={h}
                className="absolute right-2 -translate-y-2 text-[10px] font-medium tabular-nums text-ink-400"
                style={{ top: (h - hours[0]) * PIXELS_PER_HOUR }}
              >
                {formatHour(h)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            const today = isToday(day);
            const positionedShifts = layoutByDay.get(dayIndex) ?? [];

            return (
              <div
                key={dayIndex}
                className={cn(
                  'relative border-r border-ink-100 last:border-r-0',
                  today && 'bg-accent-50/30',
                )}
              >
                {/* Hour grid lines + click targets */}
                {hours.map((h, hi) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => onSlotClick?.(day, h)}
                    className={cn(
                      'absolute left-0 right-0 border-t border-ink-100 transition-colors hover:bg-ink-50/60',
                      hi === 0 && 'border-t-0',
                    )}
                    style={{
                      top: hi * PIXELS_PER_HOUR,
                      height: PIXELS_PER_HOUR,
                    }}
                    aria-label={`Create shift at ${formatHour(h)} on ${format(day, 'EEE d MMM')}`}
                  />
                ))}

                {/* Positioned shift cards */}
                {positionedShifts.map((p) => {
                  const widthPct = 100 / p.columnCount;
                  const leftPct = widthPct * p.column;
                  return (
                    <button
                      key={p.shift.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShiftClick?.(p.shift);
                      }}
                      className="absolute z-10 overflow-hidden rounded border border-accent-300 bg-accent-50 px-1.5 py-1 text-left shadow-subtle transition-all hover:border-accent-500 hover:bg-accent-100 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                      style={{
                        top: p.topPx,
                        height: p.heightPx,
                        left: `calc(${leftPct}% + 2px)`,
                        width: `calc(${widthPct}% - 4px)`,
                      }}
                    >
                      <p className="truncate text-[11px] font-semibold leading-tight text-accent-900">
                        {p.shift.user.firstName} {p.shift.user.lastName[0]}.
                      </p>
                      <p className="truncate text-[10px] leading-tight text-accent-700">
                        {p.shift.participant.firstName} {p.shift.participant.lastName[0]}.
                      </p>
                      {p.heightPx >= 50 && (
                        <p className="mt-0.5 truncate text-[10px] tabular-nums text-accent-600">
                          {formatShiftTime(p.shift)}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
