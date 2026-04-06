import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Users,
  TrendingUp,
  PlusCircle,
  Award,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import PageTransition from '../components/common/PageTransition';
import CalendarWidget from '../components/features/CalendarWidget';
import { Link } from 'react-router-dom';
import { Application } from '../types';

const PlacementDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    activeOpportunities: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalStudents: 0,
    placedStudents: 0,
  });
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch opportunities stats
      const { data: opportunities } = await supabase
        .from('opportunities')
        .select('id, status')
        .eq('posted_by', user!.id);

      // Fetch applications for my opportunities
      const myOpportunityIds = opportunities?.map(o => o.id) || [];

      const { data: applications } =
        myOpportunityIds.length > 0
          ? await supabase
              .from('applications')
              .select(
                `
              *,
              opportunity:opportunities(title, posted_by),
              student:profiles!applications_student_id_fkey(name, email, avatar)
            `
              )
              .in('opportunity_id', myOpportunityIds)
              .order('created_at', { ascending: false })
          : { data: [] };

      // Fetch student stats
      const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'STUDENT');

      const { count: placedCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACCEPTED');

      setApplications(applications as Application[]);

      setStats({
        totalOpportunities: opportunities?.length || 0,
        activeOpportunities: opportunities?.filter(o => o.status === 'active').length || 0,
        totalApplications: applications?.length || 0,
        pendingApplications: applications?.filter(a => a.status === 'PENDING').length || 0,
        totalStudents: studentCount || 0,
        placedStudents: placedCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id, fetchDashboardData]);

  const statCards = [
    {
      label: 'Active Jobs',
      value: stats.activeOpportunities,
      icon: Briefcase,
      color: 'text-purple-400',
      gradient: 'from-purple-500 to-indigo-500',
      change: `${stats.totalOpportunities} Total`,
    },
    {
      label: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-indigo-400',
      gradient: 'from-indigo-500 to-purple-500',
      change: 'Registered',
    },
    {
      label: 'Students Placed',
      value: stats.placedStudents,
      icon: Award,
      color: 'text-emerald-400',
      gradient: 'from-emerald-500 to-teal-500',
      change: 'This Season',
    },
    {
      label: 'Placement Rate',
      value: `${stats.totalStudents > 0 ? Math.round((stats.placedStudents / stats.totalStudents) * 100) : 0}%`,
      icon: TrendingUp,
      color: 'text-rose-400',
      gradient: 'from-rose-500 to-pink-500',
      change: 'Success Rate',
    },
  ];

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

        <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-8">
          {/* Hero Section */}
          <div className="grid grid-cols-12 gap-6">
            {/* Welcome Card - spans 8 columns */}
            <div className="col-span-12 md:col-span-8">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-transparent rounded-3xl blur-2xl" />
                <div className="relative glass-panel rounded-3xl p-8 border border-white/10">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full mb-3"
                      >
                        <Activity className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-semibold text-purple-300">
                          Placement Officer
                        </span>
                      </motion.div>

                      <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                        Welcome back, {user?.name || 'Officer'}!
                      </h1>
                      <p className="text-slate-400 text-lg mb-6">
                        Manage opportunities and drive successful placements
                      </p>

                      {/* Quick Stats Inline */}
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                          <Briefcase className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-white font-semibold">
                            {stats.activeOpportunities} Active Jobs
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                          <Award className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm text-white font-semibold">
                            {stats.placedStudents} Placed
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                          <Users className="w-4 h-4 text-indigo-400" />
                          <span className="text-sm text-white font-semibold">
                            {stats.totalStudents} Students
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Post Opportunity CTA - spans 4 columns */}
            <div className="col-span-12 md:col-span-4">
              <motion.div whileHover={{ scale: 1.02 }} className="relative h-full group">
                <div className="absolute -inset-[1px] bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl opacity-30 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                <Link
                  to="/placement/post"
                  className="relative w-full h-full glass-panel rounded-3xl p-6 hover:border-transparent hover:bg-purple-500/5 transition-all overflow-hidden flex flex-col items-center justify-center text-center gap-4"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 p-[1px] rounded-2xl"
                  >
                    <div className="w-full h-full bg-black rounded-[15px] flex items-center justify-center">
                      <PlusCircle className="w-8 h-8 text-purple-400" />
                    </div>
                  </motion.div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Post Opportunity</h3>
                    <p className="text-sm text-slate-400">Create new job listing</p>
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-12 gap-6">
            {statCards.map((stat, index) => (
              <div key={index} className="col-span-12 md:col-span-3">
                <div className="relative group h-full">
                  <div
                    className={`absolute -inset-[1px] bg-gradient-to-br ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="relative glass-panel rounded-2xl p-6 h-full hover:-translate-y-1 transition-transform duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} p-[1px]`}
                      >
                        <div className="w-full h-full rounded-[11px] bg-black flex items-center justify-center">
                          <stat.icon className={`w-7 h-7 ${stat.color}`} />
                        </div>
                      </div>
                      {stat.change && (
                        <span
                          className={`px-3 py-1 bg-black/40 border border-white/5 rounded-full text-xs font-semibold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                        >
                          {stat.change}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mb-2 font-medium uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-black text-white">
                      {typeof stat.value === 'number' ? stat.value : stat.value}
                    </p>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Manage Opportunities */}
            <div className="col-span-12 md:col-span-7 lg:col-span-8 flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Link to="/placement/opportunities" className="flex-1">
                  <motion.div whileHover={{ y: -4 }} className="relative group h-full">
                    <div className="absolute -inset-[1px] bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-300 blur" />
                    <div className="relative glass-panel rounded-2xl p-6 h-full border border-white/10 hover:border-purple-500/30 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 p-[1px] flex-shrink-0">
                          <div className="w-full h-full rounded-[11px] bg-black flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-purple-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1">
                            Manage Opportunities
                          </h3>
                          <p className="text-sm text-slate-400 mb-3">
                            View, edit and track all job postings
                          </p>
                          <div className="flex items-center text-sm text-purple-400 font-semibold">
                            View All{' '}
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>

                <Link to="/placement/applications" className="flex-1">
                  <motion.div whileHover={{ y: -4 }} className="relative group h-full">
                    <div className="absolute -inset-[1px] bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-300 blur" />
                    <div className="relative glass-panel rounded-2xl p-6 h-full border border-white/10 hover:border-purple-500/30 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 p-[1px] flex-shrink-0">
                          <div className="w-full h-full rounded-[11px] bg-black flex items-center justify-center">
                            <Users className="w-6 h-6 text-indigo-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1">Manage Applications</h3>
                          <p className="text-sm text-slate-400 mb-3">
                            Review candidates and update statuses
                          </p>
                          <div className="flex items-center text-sm text-indigo-400 font-semibold">
                            Review Now{' '}
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </div>

            {/* Calendar Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7, ease: 'easeOut' }}
              className="col-span-12 md:col-span-5 lg:col-span-4"
            >
              <CalendarWidget applications={applications} />
            </motion.div>
          </div>

          {loading && (
            <div className="flex justify-center py-20 pb-0">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default PlacementDashboard;
