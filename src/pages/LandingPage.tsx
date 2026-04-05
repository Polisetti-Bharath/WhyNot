import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  BrainCircuit,
  SearchX,
  LineChart,
  Users,
  FileCheck,
  Calendar,
  Award,
  TrendingUp,
  Shield,
  Target,
  Zap,
  CheckCircle2,
  Star,
} from 'lucide-react';
import ThreeScene from '../components/common/ThreeScene';
import Footer from '../components/layout/Footer';
import SEO from '../components/common/SEO';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <div className="relative w-full overflow-hidden bg-black text-white">
      {/* SEO Meta Tags */}
      <SEO
        title="WhyNot - Turn Campus Rejections into Opportunities"
        description="AI-powered campus placement platform. Get personalized rejection analysis, apply with one click, and transform every 'Not Selected' into actionable career insights."
        keywords={[
          'campus placement',
          'internship portal',
          'rejection analysis',
          'AI career coach',
          'student job search',
          'placement tracking',
        ]}
        canonicalUrl="/"
      />

      {/* Branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute top-0 left-0 z-50 px-6 md:px-12 lg:px-24 py-6"
      >
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.4 }}
            className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-500 p-[2px] shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50"
          >
            <div className="w-full h-full rounded-xl bg-black flex items-center justify-center">
              <span className="text-lg font-bold bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                W
              </span>
            </div>
          </motion.div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:from-rose-400 group-hover:to-purple-400 transition-all">
            WhyNot
          </span>
        </Link>
      </motion.div>

      {/* 3D Background Animation Only */}
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <ThreeScene />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col justify-start pt-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ willChange: 'opacity, transform' }}
          >
            <div className="inline-block px-4 py-2 bg-neon-purple/10 border border-neon-purple/20 rounded-full mb-6">
              <span className="text-neon-purple text-sm font-semibold">
                Campus Internship & Placement Platform
              </span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ willChange: 'opacity, transform' }}
              className="text-6xl md:text-8xl font-bold leading-[1.1] tracking-tight mb-8"
            >
              Turning silent <br />
              <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                rejections
              </span>{' '}
              into <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                actionable insight.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ willChange: 'opacity, transform' }}
              className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed font-light"
            >
              Stop wondering why you got rejected. Get AI-powered explanations that reveal skill
              gaps, CGPA mismatches, and improvement priorities. Turn every{' '}
              <span className="text-rose-400 font-medium">"Not Selected"</span> into a
              <span className="text-emerald-400 font-medium"> growth opportunity</span>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ willChange: 'opacity, transform' }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/login">
                <button className="px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 font-bold text-lg hover:scale-105 transition-transform flex items-center gap-3 group shadow-lg shadow-purple-500/50">
                  Login to Explore Features
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Key Features Overview */}
      <section id="features" className="relative z-10 py-32 px-6 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center">
            <h2 className="text-5xl font-bold mb-6">
              Complete Campus Placement{' '}
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Ecosystem
              </span>
            </h2>
            <p className="text-slate-400 max-w-3xl mx-auto text-lg">
              From internship hunting to placement offers, we've digitized every step. No more
              scattered WhatsApp groups, email chains, or manual spreadsheets. Everything in one
              transparent, AI-powered platform.
            </p>
          </div>

          {/* Core Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15, margin: '50px' }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ willChange: 'opacity, transform' }}
              className="relative group p-8 rounded-2xl h-full backdrop-blur-xl bg-white/5 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-3"
            >
              <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold animate-pulse">
                🎯 CORE FEATURE
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 text-white backdrop-blur-sm border border-purple-500/30 shadow-lg shadow-purple-500/50">
                  <BrainCircuit className="w-9 h-9" />
                </div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AI Rejection Coach
                </h3>
                <p className="text-slate-300 mb-4 leading-relaxed">
                  <span className="font-semibold text-white">"Not Selected"</span> is not an answer.
                  Get AI-powered, personalized explanations for{' '}
                  <span className="text-neon-purple">every rejection</span>.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15, margin: '50px' }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
              style={{ willChange: 'opacity, transform' }}
              className="relative group p-8 rounded-2xl h-full  backdrop-blur-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 rounded-xl flex items-center justify-center mb-6 text-indigo-400 backdrop-blur-sm border border-indigo-500/30">
                  <FileCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">One-Click Applications</h3>
                <p className="text-slate-400">
                  Maintain one digital profile with resume, skills, and preferences. Apply to
                  opportunities with a single click. Automated matching shows you the best-fit
                  roles.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15, margin: '50px' }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
              style={{ willChange: 'opacity, transform' }}
              className="relative group p-8 rounded-2xl h-full  backdrop-blur-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 rounded-xl flex items-center justify-center mb-6 text-indigo-400 backdrop-blur-sm border border-indigo-500/30">
                  <LineChart className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Real-Time Tracking</h3>
                <p className="text-slate-400">
                  Monitor application status, interview schedules, and placement updates in
                  real-time. Automated notifications keep students and officers aligned on every
                  step.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15, margin: '50px' }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
              style={{ willChange: 'opacity, transform' }}
              className="relative group p-8 rounded-2xl h-full  backdrop-blur-xl bg-white/5 border border-white/10 hover:border-pink-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500/20 to-rose-500/10 rounded-xl flex items-center justify-center mb-6 text-pink-400 backdrop-blur-sm border border-pink-500/30">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Smart Scheduling</h3>
                <p className="text-slate-400">
                  Interview calendars sync with academic timetables. Automated notifications for all
                  stakeholders. No more email ping-pong or missed deadlines.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative group p-8 rounded-2xl h-full  backdrop-blur-xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500/20 to-yellow-500/10 rounded-xl flex items-center justify-center mb-6 text-orange-400 backdrop-blur-sm border border-orange-500/30">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Auto Certificates</h3>
                <p className="text-slate-400">
                  Training supervisors log feedback directly. System automatically generates
                  completion certificates and updates employability records for future recruiters.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative group p-8 rounded-2xl h-full  backdrop-blur-xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-xl flex items-center justify-center mb-6 text-green-400 backdrop-blur-sm border border-green-500/30">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Real-Time Analytics</h3>
                <p className="text-slate-400">
                  Placement officers see live dashboards: unplaced students, upcoming interviews,
                  skill gap analysis. Data-driven decisions replace manual spreadsheets.
                </p>
              </div>
            </motion.div>
          </div>

          {/* How It Works Section */}
          <div id="how-it-works" className="mb-16">
            <h2 className="text-4xl font-bold mb-16 text-center">
              How It{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Works
              </span>
            </h2>

            <div className="space-y-16 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-2xl shadow-lg shadow-indigo-500/20">
                  1
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Create Your Profile</h3>
                  <p className="text-slate-400 text-lg max-w-2xl">
                    Students maintain one comprehensive profile with skills, resume, CGPA, and
                    preferences. Update once per semester.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold text-2xl shadow-lg shadow-purple-500/20">
                  2
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Browse Smart-Matched Opportunities</h3>
                  <p className="text-slate-400 text-lg max-w-2xl">
                    Placement cell posts verified opportunities. AI recommends best-fit roles based
                    on your skills, CGPA, and preferences.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-500 to-amber-400 flex items-center justify-center font-bold text-2xl shadow-lg shadow-rose-500/20">
                  3
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">One-Click Apply & Track</h3>
                  <p className="text-slate-400 text-lg max-w-2xl">
                    Apply with one click. Track every stage in real-time: applied → interview →
                    offer or rejection.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 flex items-center justify-center font-bold text-2xl shadow-lg shadow-amber-400/20">
                  4
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Learn from Every Rejection</h3>
                  <p className="text-slate-400 text-lg max-w-2xl">
                    Get rejected? Our AI analyzes{' '}
                    <span className="text-purple-400 font-medium">why</span> and tells you{' '}
                    <span className="text-rose-400 font-medium">how to improve</span>. Bulk analysis
                    reveals patterns across multiple rejections, helping you fix the right things
                    first.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose WhyNot Section */}
      <section className="relative z-10 py-24 px-6 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                WhyNot?
              </span>
            </h2>
            <p className="text-slate-400 text-lg">
              Transform your campus placement process with AI-powered insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex gap-4 p-6 rounded-xl backdrop-blur-xl bg-slate-900/40 border border-white/10 hover:border-purple-500/30 transition-all"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">No More Guessing Games</h3>
                <p className="text-slate-400">
                  Stop wondering "Why didn't I get selected?" Our AI explains exactly what went
                  wrong and prioritizes what to fix first.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex gap-4 p-6 rounded-xl backdrop-blur-xl bg-slate-900/40 border border-white/10 hover:border-indigo-500/30 transition-all"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Zap className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">Lightning-Fast Applications</h3>
                <p className="text-slate-400">
                  Apply to internships and placements with one click. No more filling the same forms
                  repeatedly or chasing deadlines.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex gap-4 p-6 rounded-xl backdrop-blur-xl bg-slate-900/40 border border-white/10 hover:border-rose-500/30 transition-all"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center border border-rose-500/30">
                  <CheckCircle2 className="w-6 h-6 text-rose-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">Complete Transparency</h3>
                <p className="text-slate-400">
                  Track every application stage in real-time. Students, placement officers, and
                  recruiters stay aligned automatically.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex gap-4 p-6 rounded-xl backdrop-blur-xl bg-slate-900/40 border border-white/10 hover:border-rose-500/30 transition-all"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center border border-rose-500/30">
                  <Shield className="w-6 h-6 text-rose-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">Secure & Verified</h3>
                <p className="text-slate-400">
                  All opportunities verified by placement cell. Your data is encrypted and secure.
                  No spam, no fake postings.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 py-32 px-6 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-12 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-purple-900/40 via-slate-900/40 to-pink-900/40 border border-purple-500/30 shadow-2xl shadow-purple-500/20"
          >
            <h2 className="text-5xl font-bold mb-6">
              Ready to turn rejections into{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                opportunities
              </span>
              ?
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Join thousands of students who stopped wondering "Why Not?" and started getting
              answers.
            </p>
            <Link to="/login">
              <button className="px-12 py-5 rounded-full bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 font-bold text-xl hover:scale-105 transition-transform flex items-center gap-3 mx-auto group shadow-lg shadow-purple-500/50">
                Get Started Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <p className="text-slate-400 mt-6 text-sm">
              No credit card required • Free for students • Instant access
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
