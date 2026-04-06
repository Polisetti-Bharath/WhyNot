import React from 'react';
import CalendarWidget from '../components/features/CalendarWidget';
import SEO from '../components/common/SEO';
import PageTransition from '../components/common/PageTransition';

export default function CalendarPage() {
  return (
    <PageTransition>
      <SEO title="Calendar | WhyNot" description="View your upcoming events and deadlines." />
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Calendar</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <CalendarWidget />
        </div>
      </div>
    </PageTransition>
  );
}
