import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Building,
  GraduationCap,
  UserPlus,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { UserRole } from '../types';
import PageTransition from '../components/common/PageTransition';
import ParticleBackground from '../components/common/ParticleBackground';
import ThreeScene from '../components/common/ThreeScene';
import {
  validateSignupForm,
  ValidationError,
  getFieldError,
  hasFieldError,
} from '../utils/validation';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.STUDENT,
    department: '',
    customDepartment: '',
    organization: '',
    universityCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (!password) {
      setPasswordStrength({ score: 0, label: '', color: '' });
      return;
    }

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    // Set strength label
    if (score <= 2) {
      setPasswordStrength({ score, label: 'Weak', color: 'bg-red-500' });
    } else if (score <= 4) {
      setPasswordStrength({ score, label: 'Medium', color: 'bg-yellow-500' });
    } else {
      setPasswordStrength({ score, label: 'Strong', color: 'bg-green-500' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear field-specific validation errors
    setValidationErrors(validationErrors.filter(err => err.field !== name));

    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors([]);

    // Validate form
    const validation = validateSignupForm(
      formData.name,
      formData.email,
      formData.password,
      formData.confirmPassword,
      formData.role
    );

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate university code for placement officers
    if (formData.role === UserRole.PLACEMENT_OFFICER) {
      if (!formData.universityCode) {
        setError('University code is required for Placement Officers');
        return;
      }
      // You can add more validation logic here
      // For example, check against a list of valid codes
      const validCodes = ['UNIV2024', 'CAMPUS2024', 'PLACEMENT2024']; // Example codes
      if (!validCodes.includes(formData.universityCode.toUpperCase())) {
        setError('Invalid university code. Please contact your institution.');
        return;
      }
    }

    setLoading(true);

    try {
      // Use custom department if "Other" is selected
      const finalDepartment =
        formData.department === 'Other' ? formData.customDepartment : formData.department;
      const additionalData: any = { department: finalDepartment };

      await signUp(formData.email, formData.password, formData.name, formData.role, additionalData);
      // Don't navigate here - let App.tsx handle routing based on user role
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create account. Please try again.';

      // Check if user already exists
      if (
        errorMessage.toLowerCase().includes('user already registered') ||
        errorMessage.toLowerCase().includes('already registered') ||
        errorMessage.toLowerCase().includes('already exists')
      ) {
        // Attempt to recover account by signing in and creating profile
        try {
          console.log('Attempting to recover account...');
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (!signInError && signInData.user) {
            // Check if profile exists
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', signInData.user.id)
              .maybeSingle();

            if (!profile) {
              console.log('Profile missing, creating new profile...');
              // Create missing profile
              const finalDepartment =
                formData.department === 'Other' ? formData.customDepartment : formData.department;
              const additionalData: any = { department: finalDepartment };

              const { error: insertError } = await supabase.from('profiles').insert({
                id: signInData.user.id,
                email: formData.email,
                name: formData.name,
                role: formData.role,
                ...additionalData,
              });

              if (insertError) {
                console.error('Failed to create profile:', insertError);
                throw insertError;
              }

              console.log('Profile created successfully. Refreshing user...');
              await refreshUser();
              // Navigate based on role
              if (formData.role === UserRole.STUDENT) {
                navigate('/dashboard');
              } else if (formData.role === UserRole.PLACEMENT_OFFICER) {
                navigate('/placement-dashboard');
              } else {
                navigate('/dashboard');
              }
              return;
            }
          }
        } catch (recoveryError) {
          console.error('Account recovery failed', recoveryError);
        }

        // Redirect to login page after a short delay
        setError('This email is already registered. Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      await signInWithGoogle();
      // The redirect will happen automatically via Supabase
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google.');
      setGoogleLoading(false);
    }
  };

  const roleOptions = [
    {
      value: UserRole.STUDENT,
      label: 'Student',
      icon: GraduationCap,
      description: 'Looking for internships and placements',
    },
    {
      value: UserRole.PLACEMENT_OFFICER,
      label: 'Placement Officer',
      icon: Building,
      description: 'Manage campus placements',
    },
  ];

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
          className="relative z-10 w-full max-w-2xl"
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
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-2xl font-bold text-white mt-6 mb-2 flex items-center justify-center gap-3"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-rose-500/20 border border-purple-500/30 shadow-lg shadow-purple-500/20"
              >
                <UserPlus className="w-6 h-6 text-purple-400" />
              </motion.div>
              Create Account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="text-slate-400"
            >
              Join the campus placement platform
            </motion.p>
          </motion.div>

          {/* Signup Form */}
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

              {/* Role Selection */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
              >
                <label className="block text-sm font-medium text-slate-300 mb-3">I am a...</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {roleOptions.map((option, index) => {
                    const Icon = option.icon;
                    return (
                      <motion.label
                        key={option.value}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + index * 0.05, ease: 'easeOut' }}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                          formData.role === option.value
                            ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/20'
                            : 'bg-white/5 border-white/10 hover:border-purple-500/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={option.value}
                          checked={formData.role === option.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <motion.div
                          animate={{
                            scale: formData.role === option.value ? [1, 1.2, 1] : 1,
                            rotate: formData.role === option.value ? [0, 10, -10, 0] : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon
                            className={`w-5 h-5 mt-0.5 ${formData.role === option.value ? 'text-purple-400' : 'text-slate-400'}`}
                          />
                        </motion.div>
                        <div className="ml-3 flex-1">
                          <span
                            className={`block text-sm font-medium ${formData.role === option.value ? 'text-white' : 'text-slate-300'}`}
                          >
                            {option.label}
                          </span>
                          <span className="block text-xs text-slate-500 mt-0.5">
                            {option.description}
                          </span>
                        </div>
                        {formData.role === option.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center"
                          >
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </motion.div>
                        )}
                      </motion.label>
                    );
                  })}
                </div>
              </motion.div>

              {/* University Code - Only for Placement Officers */}
              {formData.role === UserRole.PLACEMENT_OFFICER && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label
                    htmlFor="universityCode"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    University Authorization Code *
                  </label>
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      id="universityCode"
                      name="universityCode"
                      type="text"
                      required={formData.role === UserRole.PLACEMENT_OFFICER}
                      value={formData.universityCode}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all uppercase"
                      placeholder="UNIV2024"
                    />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-slate-500 mt-1 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    Contact your institution to obtain the authorization code
                  </motion.p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Name Input */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.35 }}
                >
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      aria-label="Full Name"
                      aria-invalid={hasFieldError(validationErrors, 'name')}
                      aria-describedby={
                        hasFieldError(validationErrors, 'name') ? 'name-error' : undefined
                      }
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                        hasFieldError(validationErrors, 'name')
                          ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                          : 'border-white/10 focus:ring-purple-500/50 focus:border-purple-500/50'
                      }`}
                      placeholder="John Doe"
                    />
                  </motion.div>
                  {hasFieldError(validationErrors, 'name') && (
                    <motion.p
                      id="name-error"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-xs text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {getFieldError(validationErrors, 'name')}
                    </motion.p>
                  )}
                </motion.div>

                {/* Email Input */}
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
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
                      name="email"
                      type="email"
                      aria-label="Email Address"
                      aria-invalid={hasFieldError(validationErrors, 'email')}
                      aria-describedby={
                        hasFieldError(validationErrors, 'email') ? 'email-error' : undefined
                      }
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                        hasFieldError(validationErrors, 'email')
                          ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                          : 'border-white/10 focus:ring-purple-500/50 focus:border-purple-500/50'
                      }`}
                      placeholder="john@college.edu"
                    />
                  </motion.div>
                  {hasFieldError(validationErrors, 'email') && (
                    <motion.p
                      id="email-error"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-xs text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {getFieldError(validationErrors, 'email')}
                    </motion.p>
                  )}
                </motion.div>
              </motion.div>

              {/* Department - Only for Students */}
              {formData.role === UserRole.STUDENT && (
                <motion.div
                  initial={{ opacity: 0, x: -20, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, delay: 0.45 }}
                >
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Branch/Department
                  </label>
                  <motion.select
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    id="department"
                    name="department"
                    required={formData.role === UserRole.STUDENT}
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all [&>option]:bg-slate-900 [&>option:checked]:bg-purple-500/20"
                  >
                    <option value="" className="bg-slate-900 text-slate-400">
                      Select your branch
                    </option>
                    <option
                      value="Computer Science & Engineering"
                      className="bg-slate-900 text-white"
                    >
                      Computer Science & Engineering
                    </option>
                    <option value="Information Technology" className="bg-slate-900 text-white">
                      Information Technology
                    </option>
                    <option value="Electronics & Communication" className="bg-slate-900 text-white">
                      Electronics & Communication
                    </option>
                    <option value="Electrical Engineering" className="bg-slate-900 text-white">
                      Electrical Engineering
                    </option>
                    <option value="Mechanical Engineering" className="bg-slate-900 text-white">
                      Mechanical Engineering
                    </option>
                    <option value="Civil Engineering" className="bg-slate-900 text-white">
                      Civil Engineering
                    </option>
                    <option value="Chemical Engineering" className="bg-slate-900 text-white">
                      Chemical Engineering
                    </option>
                    <option value="Biotechnology" className="bg-slate-900 text-white">
                      Biotechnology
                    </option>
                    <option value="Aerospace Engineering" className="bg-slate-900 text-white">
                      Aerospace Engineering
                    </option>
                    <option value="Other" className="bg-slate-900 text-white">
                      Other
                    </option>
                  </motion.select>

                  {/* Custom Department Input - Show when Other is selected */}
                  {formData.department === 'Other' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-3"
                    >
                      <label
                        htmlFor="customDepartment"
                        className="block text-sm font-medium text-slate-300 mb-2"
                      >
                        Enter Your Branch/Department
                      </label>
                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          id="customDepartment"
                          name="customDepartment"
                          type="text"
                          required={formData.department === 'Other'}
                          value={formData.customDepartment}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                          placeholder="e.g., Data Science, AI & ML"
                        />
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Password Input */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
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
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      aria-label="Password"
                      aria-invalid={hasFieldError(validationErrors, 'password')}
                      aria-describedby={
                        hasFieldError(validationErrors, 'password') ? 'password-error' : undefined
                      }
                      value={formData.password}
                      onChange={handleChange}
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
                      className="mt-1 text-xs text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {getFieldError(validationErrors, 'password')}
                    </motion.p>
                  )}
                  {formData.password && !hasFieldError(validationErrors, 'password') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">Password Strength:</span>
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`text-xs font-medium ${
                            passwordStrength.label === 'Weak'
                              ? 'text-red-400'
                              : passwordStrength.label === 'Medium'
                                ? 'text-yellow-400'
                                : 'text-green-400'
                          }`}
                        >
                          {passwordStrength.label}
                        </motion.span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 6].map(level => (
                          <motion.div
                            key={level}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.3, delay: level * 0.05 }}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              level <= passwordStrength.score
                                ? passwordStrength.color
                                : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Use 8+ chars, mix of upper/lowercase, numbers & symbols
                      </p>
                    </motion.div>
                  )}
                </motion.div>

                {/* Confirm Password Input */}
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.55 }}
                >
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Confirm Password
                  </label>
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      aria-label="Confirm Password"
                      aria-invalid={hasFieldError(validationErrors, 'confirmPassword')}
                      aria-describedby={
                        hasFieldError(validationErrors, 'confirmPassword')
                          ? 'confirmPassword-error'
                          : undefined
                      }
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-12 py-3 bg-white/5 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                        hasFieldError(validationErrors, 'confirmPassword')
                          ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                          : 'border-white/10 focus:ring-purple-500/50 focus:border-purple-500/50'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={
                        showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </motion.div>
                  {hasFieldError(validationErrors, 'confirmPassword') && (
                    <motion.p
                      id="confirmPassword-error"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-xs text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {getFieldError(validationErrors, 'confirmPassword')}
                    </motion.p>
                  )}
                </motion.div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6, type: 'spring', bounce: 0.4 }}
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
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
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
                transition={{ duration: 0.3, delay: 0.65 }}
                className="relative flex items-center justify-center my-6"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative px-4 text-sm text-slate-500 bg-slate-900/80">
                  Or continue with
                </div>
              </motion.div>

              {/* Google Sign-Up Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                whileHover={{ scale: googleLoading ? 1 : 1.02 }}
                whileTap={{ scale: googleLoading ? 1 : 0.98 }}
                type="button"
                onClick={handleGoogleSignUp}
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
                    <span>Signing up with Google...</span>
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
                    <span>Sign up with Google</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Sign In Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.75 }}
              className="mt-6"
            >
              <motion.div
                whileHover={{ scale: 1.02, borderColor: 'rgba(168, 85, 247, 0.3)' }}
                className="bg-black/30 border border-white/10 rounded-lg p-4 text-center transition-colors"
              >
                <p className="text-slate-400 text-sm">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-purple-400 hover:text-rose-400 transition-colors font-semibold inline-flex items-center gap-1 group"
                  >
                    Sign in
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

export default SignupPage;
