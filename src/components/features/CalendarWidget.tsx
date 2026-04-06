import React, { useState, useMemo } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Video } from 'lucide-react';
import { Application } from '../../types';

interface CalendarWidgetProps {
  applications: Application[];
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ applications }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Extract application events (applied, interviews)
  const events = useMemo(() => {
    const list: Array<{ date: Date; type: string; title: string; app: Application }> = [];
    applications.forEach(app => {
      // Applied date
      list.push({
        date: new Date(app.created_at),
        type: 'applied',
        title: `Applied: ${app.opportunity?.company_name || 'Company'}`,
        app,
      });

      // Interview date
      if (app.status === 'INTERVIEW_SCHEDULED' && app.interview_date) {
        list.push({
          date: new Date(app.interview_date),
          type: 'interview',
          title: `Interview: ${app.opportunity?.company_name || 'Company'}`,
          app,
        });
      }
    });
    return list;
  }, [applications]);

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = [];
  let day = startDate;
  while (day <= endDate) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  // Find events for selected date
  const selectedDateEvents = events.filter(e => selectedDate && isSameDay(e.date, selectedDate));

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden h-full flex flex-col">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
            Calendar
          </h3>
          <p className="text-sm text-slate-400 mt-1">Track your schedule</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 rounded-full p-1 border border-white/10">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-300" />
          </button>
          <span className="text-white font-medium min-w-[100px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2 relative z-10">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 relative z-10 mb-6">
        {calendarDays.map((calDay, i) => {
          const dayEvents = events.filter(e => isSameDay(e.date, calDay));
          const hasInterview = dayEvents.some(e => e.type === 'interview');
          const hasApplied = dayEvents.some(e => e.type === 'applied');

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(calDay)}
              className={`
                aspect-square p-1 relative flex flex-col items-center justify-start rounded-lg transition-all
                ${!isSameMonth(calDay, monthStart) ? 'text-slate-600' : 'text-slate-200'}
                ${isSameDay(calDay, new Date()) ? 'bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30' : 'hover:bg-white/5'}
                ${selectedDate && isSameDay(calDay, selectedDate) ? 'bg-white/10 border border-white/20' : ''}
              `}
            >
              <span className="text-sm mt-1">{format(calDay, 'd')}</span>
              <div className="flex gap-1 mt-auto mb-1">
                {hasInterview && <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                {hasApplied && !hasInterview && (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex-1 relative z-10 border-t border-white/10 pt-4 overflow-y-auto">
        <h4 className="text-sm font-semibold text-white mb-3">
          {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
        </h4>

        {selectedDateEvents.length > 0 ? (
          <div className="space-y-3">
            {selectedDateEvents.map((event, idx) => (
              <div
                key={idx}
                className="flex gap-3 items-start p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div
                  className={`p-2 rounded-lg ${event.type === 'interview' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-500/20 text-slate-400'}`}
                >
                  {event.type === 'interview' ? (
                    <Video className="w-4 h-4" />
                  ) : (
                    <CalendarIcon className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{event.title}</p>
                  <p className="text-xs text-slate-400 mt-1 capitalize text-purple-200">
                    {event.type === 'interview'
                      ? event.app.interview_time || 'Time TBD'
                      : 'Application Submitted'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 text-sm py-8">No events on this day.</div>
        )}
      </div>
    </div>
  );
};

export default CalendarWidget;
