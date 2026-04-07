import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Briefcase, BarChart3, TrendingUp, ChevronRight, Target, Compass, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/common/PageTransition';
import { useAuth } from '../contexts/AuthContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const OffCampusDashboard: React.FC = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Explorer';

  return (
    <PageTransition>
      <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto relative min-h-screen">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 text-xs font-semibold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
              Off-Campus Professional
            </span>
            <span className="px-3 py-1 text-xs font-semibold bg-pink-500/20 text-pink-300 rounded-full border border-pink-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Independent Mode
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              {firstName}
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            Your personalized command center for independent career progression. Discover
            opportunities, analyze your resume, and simulate your path to success.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* External Jobs Card */}
          <motion.div variants={itemVariants}>
            <Link to="/external-jobs" className="block h-full group">
              <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-900/40 hover:from-purple-900/20 hover:to-indigo-900/20 transition-all duration-500 hover:border-purple-500/30 h-full relative overflow-hidden flex flex-col shadow-xl shadow-black/20 group-hover:shadow-purple-500/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] group-hover:bg-blue-500/20 transition-all" />

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                  <Briefcase className="text-cyan-400 w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  Job Board{' '}
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-slate-400 text-base flex-1">
                  Explore curated off-campus job opportunities tailored for your specific skill set
                  and aspirations.
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Resume Analyzer Card */}
          <motion.div variants={itemVariants}>
            <Link to="/resume-analyzer" className="block h-full group">
              <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-900/40 hover:from-rose-900/20 hover:to-pink-900/20 transition-all duration-500 hover:border-pink-500/30 h-full relative overflow-hidden flex flex-col shadow-xl shadow-black/20 group-hover:shadow-pink-500/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-[40px] group-hover:bg-pink-500/20 transition-all" />

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center mb-6 border border-pink-500/20 group-hover:scale-110 transition-transform duration-500">
                  <BarChart3 className="text-pink-400 w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  Resume AI{' '}
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-slate-400 text-base flex-1">
                  Leverage advanced AI to analyze your resume and discover how well it maps to the
                  real-world jobs you want.
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Career Simulator Card */}
          <motion.div variants={itemVariants}>
            <Link to="/career-simulator" className="block h-full group">
              <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-900/40 hover:from-purple-900/20 hover:to-fuchsia-900/20 transition-all duration-500 hover:border-purple-500/30 h-full relative overflow-hidden flex flex-col shadow-xl shadow-black/20 group-hover:shadow-purple-500/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] group-hover:bg-purple-500/20 transition-all" />

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform duration-500 relative">
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-fuchsia-500 rounded-full animate-ping" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-fuchsia-400 rounded-full" />
                  <TrendingUp className="text-purple-400 w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  Career Simulator{' '}
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-slate-400 text-base flex-1">
                  Test out different career paths, identify missing skills, and build a strategic
                  map for your future.
                </p>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Quick Tips Section */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="mt-12 glass-panel p-8 rounded-3xl border border-white/5 bg-slate-900/60"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
              <Target className="text-emerald-400 w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">Suggested Goals for You</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-4 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-1">
                <span className="text-blue-400 font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Analyze Your Resume</h4>
                <p className="text-slate-400 text-sm">
                  Upload your latest PDF and run it through Resume AI to identify gaps.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-4 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-1">
                <span className="text-purple-400 font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Explore Skill Requirements</h4>
                <p className="text-slate-400 text-sm">
                  Use the board to find jobs matching your skillset and apply off-campus.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default OffCampusDashboard;
