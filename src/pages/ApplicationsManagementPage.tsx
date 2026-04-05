import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Filter } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { notifyApplicationStatusChange } from '../services/notificationService';
import PageTransition from '../components/common/PageTransition';

const ApplicationsManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      // First get opportunities posted by this user
      const { data: myOpportunities } = await supabase
        .from('opportunities')
        .select('id')
        .eq('posted_by', user!.id);

      const opportunityIds = myOpportunities?.map(o => o.id) || [];

      if (opportunityIds.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('applications')
        .select(
          `
          *,
          opportunity:opportunities(title, company_name, posted_by),
          student:profiles(name, email, department)
        `
        )
        .in('opportunity_id', opportunityIds)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'ALL') {
        query = query.eq('status', statusFilter);
      }

      const { data } = await query;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      // Find the application to get student details
      const application = applications.find(app => app.id === appId);

      await supabase.from('applications').update({ status: newStatus }).eq('id', appId);

      // Send notification to student
      if (application) {
        await notifyApplicationStatusChange(
          application.student_id,
          application.opportunity.title,
          newStatus,
          appId
        );
        showToast('success', 'Status updated and notification sent');
      }

      fetchApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('error', 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      PENDING: 'bg-cyan-500/10 text-rose-400 border-rose-500/20',
      SHORTLISTED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      INTERVIEW_SCHEDULED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      ACCEPTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
    return colors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const filteredApps = applications.filter(
    app =>
      app.student?.name.toLowerCase().includes(search.toLowerCase()) ||
      app.opportunity?.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-black relative overflow-hidden pt-28 pb-12">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15],
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-500/30 rounded-full blur-[150px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.25, 0.15],
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-500/30 rounded-full blur-[150px]"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Applications Management</h1>
            <p className="text-slate-400">Review and manage student applications</p>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by student name or opportunity..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-neon-purple focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {['ALL', 'PENDING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'ACCEPTED', 'REJECTED'].map(
                status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                      statusFilter === status
                        ? 'bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 text-white font-medium'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                )
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-purple"></div>
            </div>
          ) : filteredApps.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="text-center py-20 glass-panel rounded-xl"
            >
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Applications Found</h3>
              <p className="text-slate-400">No applications match your filters.</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredApps.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
                  className="glass-panel p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{app.student?.name}</h3>
                      <p className="text-slate-400 text-sm">{app.student?.email}</p>
                      <p className="text-slate-500 text-sm">{app.student?.department}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-slate-400 mb-1">Applied for:</p>
                    <p className="font-medium">
                      {app.opportunity?.title} at {app.opportunity?.company_name}
                    </p>
                  </div>

                  {app.cover_letter && (
                    <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-sm text-slate-400 mb-1">Cover Letter:</p>
                      <p className="text-sm">{app.cover_letter}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-xs text-slate-500">
                      Applied on {new Date(app.created_at).toLocaleDateString()}
                    </span>

                    <div className="flex gap-2">
                      {app.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(app.id, 'SHORTLISTED')}
                            className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-sm font-semibold transition-colors border border-purple-500/20"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => handleStatusChange(app.id, 'REJECTED')}
                            className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-sm font-semibold transition-colors border border-rose-500/20"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {app.status === 'SHORTLISTED' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(app.id, 'INTERVIEW_SCHEDULED')}
                            className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-sm font-semibold transition-colors border border-amber-500/20"
                          >
                            Schedule Interview
                          </button>
                          <button
                            onClick={() => handleStatusChange(app.id, 'REJECTED')}
                            className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-sm font-semibold transition-colors border border-rose-500/20"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {app.status === 'INTERVIEW_SCHEDULED' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(app.id, 'ACCEPTED')}
                            className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-semibold transition-colors border border-emerald-500/20"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusChange(app.id, 'REJECTED')}
                            className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-sm font-semibold transition-colors border border-rose-500/20"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ApplicationsManagementPage;
