import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import PageTransition from '../components/common/PageTransition';
import ThreeScene from '../components/common/ThreeScene';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen flex items-center justify-center px-6 gradient-bg-purple overflow-hidden">
        {/* 3D Background Container */}
        <div className="fixed inset-0 z-0">
          <ThreeScene />
        </div>

        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-purple/10 via-transparent to-transparent -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8 glass-panel rounded-2xl p-6">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-500 p-[2px] shadow-lg shadow-purple-500/50">
                <div className="w-full h-full rounded-xl bg-black flex items-center justify-center">
                  <span className="text-xl font-bold bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    W
                  </span>
                </div>
              </div>
              <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:from-rose-400 group-hover:to-purple-400 transition-all">
                WhyNot
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-white mt-6 mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              Forgot Password?
            </h1>
            <p className="text-slate-300 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">
              {success ? 'Check your email' : "We'll send you a reset link"}
            </p>
          </div>

          {/* Reset Password Form */}
          <div className="glass-panel rounded-2xl p-8">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Email Sent!</h3>
                <p className="text-slate-300 mb-6">
                  We've sent a password reset link to{' '}
                  <span className="font-semibold text-neon-purple">{email}</span>
                </p>
                <p className="text-sm text-slate-400 mb-6">
                  Click the link in the email to reset your password. The link will expire in 1
                  hour.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-neon-purple hover:text-neon-purple transition-colors font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </motion.div>
                )}

                <p className="text-sm text-slate-400">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 glass-panel rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 focus:border-neon-purple/50 transition-all"
                      placeholder="student@college.edu"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-4 px-6 rounded-xl bg-gradient-to-r from-neon-purple to-neon-purple font-bold text-white text-lg
                    hover:scale-[1.02] hover:shadow-2xl hover:shadow-neon-purple/50 
                    active:scale-[0.98]
                    transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                    overflow-hidden
                    shadow-lg shadow-neon-purple/30"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </span>
                </button>

                {/* Back to Login */}
                <div className="text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-neon-purple transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default ForgotPasswordPage;
