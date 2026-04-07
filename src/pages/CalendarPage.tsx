import React, { useState, useEffect } from 'react';
import CalendarWidget from '../components/features/CalendarWidget';
import SEO from '../components/common/SEO';
import PageTransition from '../components/common/PageTransition';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Application } from '../types';

export default function CalendarPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchApplications = async () => {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select(`*, opportunity:opportunities(*)`)
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setApplications(data as unknown as Application[]);
      } catch (err) {
        console.error('Error fetching calendar applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user?.id]);

  return (
    <PageTransition>
      <SEO title="Calendar | WhyNot" description="View your upcoming events and deadlines." />
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Calendar</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading events...</div>
          ) : (
            <CalendarWidget applications={applications} />
          )}
        </div>
      </div>
    </PageTransition>
  );
}
