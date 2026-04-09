import React, { useState, useEffect, useMemo } from 'react';
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
  isToday,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Video,
  Clock,
  Briefcase,
  FileText,
  Users,
  X,
  MapPin,
  Tag,
} from 'lucide-react';
import SEO from '../components/common/SEO';
import PageTransition from '../components/common/PageTransition';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

type EventCategory = 'applied' | 'interview' | 'deadline' | 'drive' | 'announcement' | 'other';

interface UnifiedEvent {
  id: string;
  date: Date;
  title: string;
  category: EventCategory;
  time?: string;
  companyName?: string;
  role?: string;
  mode?: string;
  location?: string;
  description?: string;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchAllEvents = async () => {
      try {
        setLoading(true);
        const unified: UnifiedEvent[] = [];

        // 1. Fetch Applications (if student)
        if (user.role === UserRole.STUDENT || user.role === UserRole.OFF_CAMPUS_STUDENT) {
          const { data: apps, error: appsError } = await supabase
            .from('applications')
            .select('*, opportunity:opportunities(*)');
          //.eq('student_id', user.id);

          if (apps) {
            apps
              .filter(app => app.student_id === user.id)
              .forEach(app => {
                if (app.created_at) {
                  unified.push({
                    id: `app-${app.id}`,
                    date: new Date(app.created_at),
                    title: `Applied: ${app.opportunity?.title || 'Role'}`,
                    category: 'applied',
                    companyName: app.opportunity?.company_name,
                    role: app.opportunity?.title,
                  });
                }

                if (app.status === 'INTERVIEW_SCHEDULED' && app.interview_date) {
                  unified.push({
                    id: `int-${app.id}`,
                    date: new Date(app.interview_date),
                    title: `Interview: ${app.opportunity?.company_name || 'Company'}`,
                    category: 'interview',
                    time: app.interview_time || 'TBD',
                    companyName: app.opportunity?.company_name,
                    role: app.opportunity?.title,
                    mode: app.interview_mode,
                    location: app.interview_location,
                  });
                }
              });
          }
        }

        // 2. Fetch Opportunities (for deadlines)
        const oppsQuery = supabase.from('opportunities').select('*').eq('status', 'OPEN');

        const { data: opps } = await oppsQuery;
        if (opps) {
          opps.forEach(opp => {
            if (opp.deadline) {
              // only show deadlines for jobs posted by this PO, or all jobs for students
              if (user.role === UserRole.PLACEMENT_OFFICER && opp.posted_by_id !== user.id) return;

              unified.push({
                id: `dead-${opp.id}`,
                date: new Date(opp.deadline),
                title: `${opp.company_name || 'Company'} Deadline`,
                category: 'deadline',
                companyName: opp.company_name,
                role: opp.title,
              });
            }
          });
        }

        // 3. Fetch Calendar Events
        const { data: calEvents } = await supabase.from('calendar_events').select('*');
        if (calEvents) {
          calEvents.forEach(ce => {
            if (ce.start_date) {
              const eType = String(ce.event_type || '').toLowerCase();
              let cat: EventCategory = 'other';
              if (['deadline', 'interview', 'drive', 'announcement'].includes(eType)) {
                cat = eType as EventCategory;
              }

              unified.push({
                id: `ce-${ce.id}`,
                date: new Date(ce.start_date),
                title: ce.title,
                category: cat,
                time: format(new Date(ce.start_date), 'h:mm a'),
                description: ce.description,
              });
            }
          });
        }

        setEvents(unified);
      } catch (err) {
        console.error('Error fetching calendar events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllEvents();
  }, [user?.id, user?.role]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

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

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter(e => isSameDay(e.date, selectedDate));
  }, [events, selectedDate]);

  const getCategoryStyles = (category: EventCategory) => {
    switch (category) {
      case 'interview':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30';
      case 'deadline':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30';
      case 'applied':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30';
      case 'drive':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30';
      case 'announcement':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30';
    }
  };

  const getCategoryIcon = (category: EventCategory, className: string = 'w-4 h-4') => {
    switch (category) {
      case 'interview':
        return <Video className={className} />;
      case 'deadline':
        return <Clock className={className} />;
      case 'applied':
        return <Briefcase className={className} />;
      case 'drive':
        return <Users className={className} />;
      case 'announcement':
        return <Tag className={className} />;
      default:
        return <CalendarIcon className={className} />;
    }
  };

  return (
    <PageTransition>
      <SEO
        title="Calendar | WhyNot"
        description="View upcoming interviews, deadlines, and drives."
      />
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col h-full min-h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-indigo-500" />
              Calendar Overview
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Track your upcoming interviews, placement drives, and application deadlines
            </p>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            <div className="px-4 py-2 font-semibold text-slate-800 dark:text-slate-200 min-w-[160px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </div>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px] bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Loading your schedule...</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-6 relative flex-col xl:flex-row">
            {/* Main Calendar Grid */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div
                    key={day}
                    className="py-3 text-center text-sm font-semibold text-slate-500 dark:text-slate-400"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 dark:bg-slate-700 gap-px">
                {calendarDays.map((calDay, i) => {
                  const dayEvents = events.filter(e => isSameDay(e.date, calDay));
                  const isCurrentMonth = isSameMonth(calDay, monthStart);
                  const isDaySelected = selectedDate && isSameDay(calDay, selectedDate);

                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedDate(calDay)}
                      className={`
                        min-h-[100px] sm:min-h-[120px] bg-white dark:bg-slate-800 p-1 sm:p-2 cursor-pointer transition-colors relative group
                        ${!isCurrentMonth ? 'opacity-40' : ''}
                        ${isDaySelected ? 'ring-2 ring-inset ring-indigo-500 z-10 bg-indigo-50/30 dark:bg-indigo-500/5' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}
                      `}
                    >
                      <div className="flex justify-between items-start mb-1 sm:mb-2">
                        <span
                          className={`
                          w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium
                          ${isToday(calDay) ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-700 dark:text-slate-300'}
                          ${isDaySelected && !isToday(calDay) ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}
                        `}
                        >
                          {format(calDay, 'd')}
                        </span>

                        {/* Compact indicator for mobile */}
                        {dayEvents.length > 0 && (
                          <div className="sm:hidden flex gap-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            {dayEvents.length > 1 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Desktop Event Chips */}
                      <div className="hidden sm:flex flex-col gap-1 overflow-hidden h-[calc(100%-2rem)]">
                        {dayEvents.slice(0, 3).map((event, idx) => (
                          <div
                            key={idx}
                            title={event.title}
                            className={`
                              text-[10px] sm:text-xs truncate px-1.5 py-0.5 rounded border ${getCategoryStyles(event.category)}
                            `}
                          >
                            {event.time && <span className="mr-1 opacity-70">{event.time}</span>}
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pl-1">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Side Panel for Selected Date */}
            {selectedDate && (
              <div className="w-full xl:w-80 2xl:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-auto xl:h-[auto] max-h-[600px] xl:max-h-none overflow-hidden shrink-0">
                <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE')}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      {format(selectedDate, 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 overflow-y-auto flex-1">
                  {selectedDateEvents.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDateEvents.map((event, idx) => (
                        <div key={idx} className="relative pl-4">
                          {/* Left line indicator */}
                          <div
                            className={`absolute left-0 top-1 bottom-0 w-1 rounded-full ${getCategoryStyles(event.category).split(' ')[0]}`}
                          />

                          <div
                            className={`p-4 rounded-xl border ${getCategoryStyles(event.category).replace('bg-', 'bg-opacity-50 dark:bg-opacity-10 bg-')}`}
                          >
                            <div className="flex gap-2 items-start mb-2">
                              <div className="mt-0.5">{getCategoryIcon(event.category)}</div>
                              <h4 className="font-semibold leading-tight">{event.title}</h4>
                            </div>

                            <div className="space-y-1.5 mt-3 text-sm opacity-90">
                              {event.time && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{event.time}</span>
                                </div>
                              )}

                              {event.companyName && (
                                <div className="flex items-center gap-2">
                                  <Briefcase className="w-3.5 h-3.5" />
                                  <span>
                                    {event.companyName} {event.role ? `- ${event.role}` : ''}
                                  </span>
                                </div>
                              )}

                              {event.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>
                                    {event.location} {event.mode ? `(${event.mode})` : ''}
                                  </span>
                                </div>
                              )}

                              {event.description && (
                                <div className="flex items-start gap-2 mt-2 pt-2 border-t border-current border-opacity-10">
                                  <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                  <span className="text-xs leading-relaxed">
                                    {event.description}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-60">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                        <CalendarIcon className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">
                        No events for this day
                      </p>
                      <p className="text-slate-400 text-sm mt-1">Enjoy your free time!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
