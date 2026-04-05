import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/common/PageTransition';
import ParticleBackground from '../components/common/ParticleBackground';
import ThreeScene from '../components/common/ThreeScene';
import {
  validateLoginForm,
  ValidationError,
  getFieldError,
  hasFieldError,
} from '../utils/validation';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors([]);

    // Validate form
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
      // Don't navigate here - let App.tsx handle routing based on user role
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      await signInWithGoogle();
      // The redirect will happen automatically via Supabase
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
      setGoogleLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen flex items-center justify-center px-6 py-20 bg-black overflow-hidden">
        {/* Particle Background with Balls Effect */}
        <ParticleBackground />
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

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            className="text-center mb-8 glass-panel rounded-2xl p-6 border border-white/10 backdrop-blur-xl bg-slate-900/80 shadow-2xl shadow-purple-500/10"
          >
            <Link to="/" className="inline-flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.4 }}
                className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-500 p-[2px] shadow-lg shadow-purple-500/50"
              >
                <div className="w-full h-full rounded-xl bg-black flex items-center justify-center">
                  <span className="text-xl font-bold bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    W
                  </span>
                </div>
              </motion.div>
              <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:from-rose-400 group-hover:to-purple-400 transition-all">
                WhyNot
              </span>
            </Link>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-semibold bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent mt-3"
            >
              Welcome Back
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-slate-400 text-sm mt-1"
            >
              Sign in to your account
            </motion.p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            className="glass-panel rounded-2xl p-8 border border-white/10 backdrop-blur-xl bg-slate-900/80 shadow-2xl shadow-purple-500/10"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}

              {/* Email Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    id="email"
                    type="email"
                    aria-label="Email Address"
                    aria-invalid={hasFieldError(validationErrors, 'email')}
                    aria-describedby={
                      hasFieldError(validationErrors, 'email') ? 'email-error' : undefined
                    }
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      setValidationErrors(validationErrors.filter(e => e.field !== 'email'));
                    }}
                    className={`w-full pl-11 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                      hasFieldError(validationErrors, 'email')
                        ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                        : 'border-white/10 focus:ring-purple-500/50 focus:border-purple-500/50'
                    }`}
                    placeholder="student@college.edu"
                  />
                </motion.div>
                {hasFieldError(validationErrors, 'email') && (
                  <motion.p
                    id="email-error"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {getFieldError(validationErrors, 'email')}
                  </motion.p>
                )}
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35, ease: 'easeOut' }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    aria-label="Password"
                    aria-invalid={hasFieldError(validationErrors, 'password')}
                    aria-describedby={
                      hasFieldError(validationErrors, 'password') ? 'password-error' : undefined
                    }
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      setValidationErrors(validationErrors.filter(e => e.field !== 'password'));
                    }}
                    className={`w-full pl-11 pr-12 py-3 bg-white/5 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                      hasFieldError(validationErrors, 'password')
                        ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                        : 'border-white/10 focus:ring-purple-500/50 focus:border-purple-500/50'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </motion.div>
                {hasFieldError(validationErrors, 'password') && (
                  <motion.p
                    id="password-error"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {getFieldError(validationErrors, 'password')}
                  </motion.p>
                )}
              </motion.div>

              {/* Forgot Password Link */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="flex items-center justify-between"
              >
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/10 bg-black/50 text-purple-500 focus:ring-purple-500/50 transition-all"
                  />
                  <span className="ml-2 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-rose-400 hover:text-purple-400 transition-colors relative group"
                >
                  Forgot password?
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.45, type: 'spring', bounce: 0.4 }}
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                type="submit"
                disabled={loading}
                className="relative w-full py-4 px-6 rounded-xl bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 font-bold text-white text-lg
                hover:shadow-2xl hover:shadow-purple-500/50 
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                overflow-hidden
                shadow-lg shadow-purple-500/30"
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-rose-500 opacity-0"
                  whileHover={{ opacity: loading ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </>
                  )}
                </span>
              </motion.button>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="relative flex items-center justify-center my-6"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative px-4 text-sm text-slate-500 bg-slate-900/80">
                  Or continue with
                </div>
              </motion.div>

              {/* Google Sign-In Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.55 }}
                whileHover={{ scale: googleLoading ? 1 : 1.02 }}
                whileTap={{ scale: googleLoading ? 1 : 0.98 }}
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="relative w-full py-3 px-6 rounded-xl bg-white/5 border border-white/10 font-medium text-white
                hover:bg-white/10 hover:border-white/20
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-3"
              >
                {googleLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in with Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Sign Up Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="mt-6"
            >
              <motion.div
                whileHover={{ scale: 1.02, borderColor: 'rgba(168, 85, 247, 0.3)' }}
                className="bg-black/30 border border-white/10 rounded-lg p-4 text-center transition-colors"
              >
                <p className="text-slate-400 text-sm">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="text-rose-400 hover:text-purple-400 transition-colors font-semibold inline-flex items-center gap-1 group"
                  >
                    Sign up
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </Link>
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default LoginPage;
