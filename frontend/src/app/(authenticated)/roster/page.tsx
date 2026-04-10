'use client';

import { useMemo } from 'react';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { useCalendarShifts } from '@/hooks/use-shifts';
import { useSupportWorkers } from '@/hooks/use-users';

export default function RosterPage() {
  const { start, end } = useMemo(() => {
    const now = new Date();
    return {
      start: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
      end: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
    };
  }, []);

  const shifts = useCalendarShifts(start, end);
  const workers = useSupportWorkers();

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-medium text-ink-900">Roster</h1>
      <p className="text-sm text-ink-500 mt-1.5">
        Week of {format(new Date(start), 'd MMM')} – {format(new Date(end), 'd MMM yyyy')}
      </p>

      <div className="mt-8 space-y-6">
        <section>
          <h2 className="text-sm font-medium text-ink-700 mb-2">Support workers</h2>
          {workers.isLoading && <p className="text-xs text-ink-400">Loading...</p>}
          {workers.error && <p className="text-xs text-red-600">Error: {String(workers.error)}</p>}
          {workers.data && (
            <pre className="text-xs bg-ink-50 p-3 rounded overflow-auto max-h-64">
              {JSON.stringify(workers.data, null, 2)}
            </pre>
          )}
        </section>

        <section>
          <h2 className="text-sm font-medium text-ink-700 mb-2">This week&apos;s shifts</h2>
          {shifts.isLoading && <p className="text-xs text-ink-400">Loading...</p>}
          {shifts.error && <p className="text-xs text-red-600">Error: {String(shifts.error)}</p>}
          {shifts.data && (
            <p className="text-xs text-ink-500 mb-2">{shifts.data.length} shifts found</p>
          )}
          {shifts.data && (
            <pre className="text-xs bg-ink-50 p-3 rounded overflow-auto max-h-96">
              {JSON.stringify(shifts.data, null, 2)}
            </pre>
          )}
        </section>
      </div>
    </div>
  );
}
