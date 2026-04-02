import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Calendar,
  Brain,
  TrendingUp,
  Sparkles,
  Target,
  Award,
  Zap,
  BarChart2,
  Activity,
  CheckCircle,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  Eye,
  ThumbsUp,
  Users,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { Application, JobOpportunity } from '../types';
import RejectionAnalysisHub from '../components/features/RejectionAnalysisHub';
import PageTransition from '../components/common/PageTransition';
import { useToast } from '../contexts/ToastContext';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showAnalysisHub, setShowAnalysisHub] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | undefined>();
  const [analysisMode, setAnalysisMode] = useState<'single' | 'bulk'>('bulk');

  useEffect(() => {
    if (user?.id) {
      fetchData();
      calculateProfileCompletion();
    }

    // Subscribe to realtime opportunities updates
    const channel = supabase
      .channel('public:dashboard_opportunities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, () => {
        supabase
          .from('opportunities')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(6)
          .then(res => {
            if (res.data) setOpportunities(res.data);
          });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [appsResult, oppsResult] = await Promise.all([
        supabase
          .from('applications')
          .select('*, opportunity:opportunities(*)')
          .eq('student_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('opportunities')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(6),
      ]);

      if (appsResult.data) setApplications(appsResult.data);
      if (oppsResult.data) setOpportunities(oppsResult.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = () => {
    if (!user) return 0;

    let completedFields = 0;
    const totalFields = 10;

    if (user.name) completedFields++;
    if (user.email) completedFields++;
    if (user.phone) completedFields++;
    if (user.major) completedFields++;
    if (user.year) completedFields++;
    if (user.semester) completedFields++;
    if (user.cgpa) completedFields++;
    if (user.department) completedFields++;
    if (user.skills && user.skills.length > 0) completedFields++;
    if (user.resume_url) completedFields++;

    const completion = Math.round((completedFields / totalFields) * 100);
    setProfileCompletion(completion);
  };

  const stats = [
    {
      label: 'Applications',
      value: applications.length,
      icon: FileText,
      color: 'text-rose-400',
      gradient: 'from-rose-500 to-purple-500',
      change: 'Total',
    },
    {
      label: 'Interviews',
      value: applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length,
      icon: Users,
      color: 'text-purple-400',
      gradient: 'from-purple-500 to-indigo-500',
      change: 'Scheduled',
    },
    {
      label: 'Offers',
      value: applications.filter(a => a.status === 'ACCEPTED').length,
      icon: Award,
      color: 'text-indigo-400',
      gradient: 'from-indigo-500 to-purple-500',
      change: 'Received',
    },
    {
      label: 'Opportunities',
      value: opportunities.length,
      icon: Briefcase,
      color: 'text-pink-400',
      gradient: 'from-pink-500 to-rose-500',
      change: 'Available',
    },
  ];

  const recentActivity = applications.slice(0, 4).map(app => {
    let action = 'Applied to';
    let icon = FileText;

    if (app.status === 'INTERVIEW_SCHEDULED') {
      action = 'Interview scheduled with';
      icon = Calendar;
    } else if (app.status === 'ACCEPTED') {
      action = 'Offer received from';
      icon = Award;
    } else if (app.status === 'REJECTED') {
      action = 'Application update from';
      icon = Activity;
    }

    return {
      action,
      company: app.opportunity?.company_name || 'Unknown Company',
      time: new Date(app.created_at).toLocaleDateString(),
      icon,
    };
  });

  const upcomingInterviews = applications
    .filter(a => a.status === 'INTERVIEW_SCHEDULED')
    .slice(0, 3)
    .map(app => ({
      company: app.opportunity?.company_name || 'Unknown Company',
      date: app.interview_date
        ? new Date(app.interview_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
        : 'TBD',
      time: app.interview_time || 'TBD',
      type: app.opportunity?.type === 'INTERNSHIP' ? 'Internship Interview' : 'Job Interview',
    }));

  return (
    <PageTransition>
      <div className="min-h-screen bg-black relative overflow-hidden pt-28">
        {/* Pure black background */}
        <div
          className="fixed inset-0 pointer-events-none overflow-hidden"
          style={{ display: 'none' }}
        >
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
            className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-500/30 rounded-full blur-[150px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[150px]"
          />
        </div>

        <div className="relative z-10 max-w-[1800px] mx-auto p-4 md:p-8">
          {/* Hero Welcome Section */}
          <div className="mb-8">
            <div className="grid md:grid-cols-12 gap-6 items-stretch">
              {/* Welcome Card - spans 8 columns */}
              <div className="md:col-span-8">
                <div className="relative group h-full">
                  {/* Gradient Border Effect */}
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 rounded-3xl opacity-30 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

                  <div className="relative glass-panel rounded-3xl p-8 h-full flex flex-col justify-between overflow-hidden">
                    {/* Background Gradient Blob */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex-1">
                        <motion.div
                          className="flex items-start gap-3 mb-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <motion.div
                            animate={{
                              rotate: [0, 10, -10, 10, 0],
                              scale: [1, 1.1, 1, 1.1, 1],
                            }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            className="-mt-1"
                          >
                            <Sparkles className="w-8 h-8 text-rose-400" />
                          </motion.div>
                          <div>
                            <h1 className="text-4xl md:text-5xl font-black text-white">
                              Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
                            </h1>
                            <p className="text-slate-400 text-lg mt-1">
                              Ready to take the next step in your career?
                            </p>
                          </div>
                        </motion.div>

                        {/* Profile completion inline */}
                        <div className="mt-6 max-w-2xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white font-semibold flex items-center gap-2">
                              <Target className="w-4 h-4 text-rose-400" />
                              Profile Strength
                            </span>
                            <span className="text-lg font-bold bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                              {profileCompletion}%
                            </span>
                          </div>
                          <div className="relative h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${profileCompletion}%` }}
                              transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                            />
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent"
                              animate={{ x: ['-100%', '100%'] }}
                              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                            />
                          </div>
                          {profileCompletion < 100 && (
                            <Link
                              to="/profile"
                              className="inline-flex items-center gap-1 mt-2 text-sm text-rose-400 hover:text-purple-400 transition-colors"
                            >
                              <span>Complete your profile to increase visibility</span>
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Quick Action - spans 4 columns */}
              <div className="md:col-span-4">
                <motion.div whileHover={{ scale: 1.02 }} className="relative h-full group">
                  <div className="absolute -inset-[1px] bg-gradient-to-br from-rose-500 to-purple-500 rounded-3xl opacity-30 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                  <button
                    onClick={() => setShowAnalysisHub(true)}
                    className="relative w-full h-full glass-panel rounded-3xl p-8 hover:border-transparent hover:bg-rose-500/5 transition-all overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 flex flex-col items-center justify-center h-full text-center gap-4">
                      <motion.div
                        animate={{
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.1, 1, 1.1, 1],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-20 h-20 bg-gradient-to-br from-rose-500 to-purple-500 p-[1px] rounded-2xl"
                      >
                        <div className="w-full h-full bg-black rounded-[15px] flex items-center justify-center">
                          <Brain className="w-10 h-10 text-rose-400" />
                        </div>
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">AI Rejection Coach</h3>
                        <p className="text-sm text-slate-400">Turn rejections into opportunities</p>
                      </div>
                      {applications.filter(a => a.status === 'REJECTED').length > 0 && (
                        <span className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-full text-sm font-semibold">
                          {applications.filter(a => a.status === 'REJECTED').length} rejections to
                          analyze
                        </span>
                      )}
                    </div>
                  </button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Career Path Simulator Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <Link to="/career-simulator" className="block group">
              <div className="relative">
                {/* Animated Gradient Border */}
                <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 blur-sm animate-pulse" />

                <div className="relative glass-panel rounded-3xl p-8 overflow-hidden">
                  {/* Background Effects */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 10, 0],
                          scale: [1, 1.1, 1, 1.1, 1],
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 p-[2px] rounded-2xl"
                      >
                        <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                          <Sparkles className="w-10 h-10 text-purple-400" />
                        </div>
                      </motion.div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                          Career Path Simulator
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full font-semibold border border-purple-500/30">
                            NEW
                          </span>
                        </h3>
                        <p className="text-slate-400 text-base">
                          Simulate &quot;What if?&quot; scenarios before making career decisions
                        </p>
                        <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-purple-400" />
                          See how skills, CGPA, and certifications impact your opportunities
                        </p>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-purple-400 group-hover:text-purple-300 transition-colors">
                      <span className="font-semibold">Try Now</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* Stats Row - Dynamic sizes for visual interest */}
            {stats.map((stat, index) => (
              <div key={index} className="col-span-12 md:col-span-3">
                <div className="relative group h-full">
                  {/* Gradient Border Effect */}
                  <div
                    className={`absolute -inset-[1px] bg-gradient-to-br ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`}
                  />

                  <div className="relative glass-panel rounded-2xl p-6 h-full hover:-translate-y-1 transition-transform duration-300">
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
                    <p className="text-slate-400 text-sm mb-1 font-medium uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p className="text-4xl font-black text-white">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Activity Feed - Full Width Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6, ease: 'easeOut' }}
              className="col-span-12"
            >
              <div className="relative glass-panel rounded-2xl p-6 h-full overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex items-center gap-2 mb-6">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2 relative z-10">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-purple-500/10 transition-all border border-white/5 hover:border-purple-500/50 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/10 to-indigo-500/10 flex items-center justify-center flex-shrink-0 group-hover:from-purple-500/20 group-hover:to-indigo-500/20 transition-colors">
                        <activity.icon className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          {activity.action}{' '}
                          <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">
                            {activity.company}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Upcoming Interviews - Tall Card */}
            <div className="col-span-12 md:col-span-5">
              <div className="relative glass-panel rounded-2xl p-6 h-full overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex items-center gap-2 mb-6">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-xl font-bold text-white">Upcoming Interviews</h2>
                </div>
                <div className="space-y-4 relative z-10">
                  {upcomingInterviews.map((interview, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="relative group"
                    >
                      <div className="relative bg-white/5 rounded-xl p-4 border border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-white font-semibold text-lg">{interview.company}</h3>
                          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full font-semibold border border-indigo-500/20">
                            {interview.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-400" />
                            <span>{interview.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-400" />
                            <span>{interview.time}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {upcomingInterviews.length === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm">No upcoming interviews</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* New Opportunities - Grid */}
            <div className="col-span-12 md:col-span-7">
              <div className="relative glass-panel rounded-2xl p-6 h-full overflow-hidden">
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-rose-400" />
                    New Opportunities
                  </h2>
                  <Link
                    to="/opportunities"
                    className="flex items-center gap-1 text-rose-400 hover:text-purple-400 transition-colors text-sm font-semibold group"
                  >
                    View All{' '}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {loading ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-32 bg-slate-800/50 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : opportunities.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400">No opportunities available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    {opportunities.map((opp, index) => (
                      <motion.div
                        key={opp.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-rose-500/30 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-white font-semibold text-sm line-clamp-2 flex-1 group-hover:text-rose-400 transition-colors">
                            {opp.role}
                          </h3>
                          <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 ml-2" />
                        </div>
                        <p className="text-slate-400 text-xs mb-3 line-clamp-1">{opp.company}</p>
                        <div className="space-y-1">
                          {opp.location && (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <MapPin className="w-3 h-3" />
                              <span className="line-clamp-1">{opp.location}</span>
                            </div>
                          )}
                          {opp.stipendRange?.max && (
                            <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold">
                              <Zap className="w-3 h-3" />
                              <span>₹{opp.stipendRange.max}/month</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rejection Analysis Modal */}
        {user && showAnalysisHub && (
          <RejectionAnalysisHub
            isOpen={showAnalysisHub}
            onClose={() => setShowAnalysisHub(false)}
            application={selectedApplication}
            applications={applications}
            student={user as any}
            mode={analysisMode}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default StudentDashboard;
