import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Briefcase,
  Settings,
  LogOut,
  Calendar,
  BarChart3,
  Users,
  Sparkles,
  Zap,
  Menu,
  X,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  userRole?: UserRole;
  userName?: string;
  userAvatar?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole, userName = 'Guest', userAvatar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to logout:', error);
    } finally {
      // Always navigate to home page, even if signOut fails
      navigate('/');
    }
  };

  const getNavigationItems = () => {
    switch (userRole) {
      case UserRole.STUDENT:
        return [
          {
            label: 'Dashboard',
            path: '/dashboard',
            icon: Home,
            gradient: 'from-cyan-400 to-blue-500',
          },
          {
            label: 'Opportunities',
            path: '/opportunities',
            icon: Briefcase,
            gradient: 'from-purple-400 to-pink-500',
          },
          {
            label: 'External Jobs',
            path: '/external-jobs',
            icon: ExternalLink,
            gradient: 'from-blue-400 to-cyan-500',
          },
          {
            label: 'Career Simulator',
            path: '/career-simulator',
            icon: TrendingUp,
            gradient: 'from-purple-400 to-indigo-500',
            badge: 'NEW',
          },
          {
            label: 'Calendar',
            path: '/calendar',
            icon: Calendar,
            gradient: 'from-green-400 to-emerald-500',
          },
          {
            label: 'Resume AI',
            path: '/resume-analyzer',
            icon: BarChart3,
            gradient: 'from-yellow-400 to-orange-500',
          },
          {
            label: 'Profile',
            path: '/profile',
            icon: Users,
            gradient: 'from-indigo-400 to-purple-500',
          },
        ];

      case UserRole.PLACEMENT_OFFICER:
        return [
          {
            label: 'Dashboard',
            path: '/placement/dashboard',
            icon: Home,
            gradient: 'from-cyan-400 to-blue-500',
          },
          {
            label: 'Opportunities',
            path: '/placement/opportunities',
            icon: Briefcase,
            gradient: 'from-purple-400 to-pink-500',
          },
          {
            label: 'Calendar',
            path: '/calendar',
            icon: Calendar,
            gradient: 'from-green-400 to-emerald-500',
          },
          {
            label: 'Settings',
            path: '/settings',
            icon: Settings,
            gradient: 'from-indigo-400 to-purple-500',
          },
        ];

      case UserRole.OFF_CAMPUS_STUDENT:
        return [
          {
            label: 'Dashboard',
            path: '/off-campus/dashboard',
            icon: Home,
            gradient: 'from-cyan-400 to-blue-500',
          },
          {
            label: 'External Jobs',
            path: '/external-jobs',
            icon: ExternalLink,
            gradient: 'from-blue-400 to-cyan-500',
          },
          {
            label: 'Career Simulator',
            path: '/career-simulator',
            icon: TrendingUp,
            gradient: 'from-purple-400 to-indigo-500',
            badge: 'NEW',
          },
          {
            label: 'Resume AI',
            path: '/resume-analyzer',
            icon: BarChart3,
            gradient: 'from-yellow-400 to-orange-500',
          },
          {
            label: 'Profile',
            path: '/profile',
            icon: Users,
            gradient: 'from-indigo-400 to-purple-500',
          },
        ];

      default:
        return [];
    }
  };

  const navItems = getNavigationItems();
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Mobile Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-[100] p-3 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all shadow-xl"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </motion.button>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : '-100%',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-screen w-72 z-[70] md:translate-x-0 md:z-50"
      >
        {/* Glass Background with Gradient Border */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-black/95 backdrop-blur-3xl">
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-r-3xl" />
          <div className="absolute inset-[1px] bg-gradient-to-br from-slate-900/98 via-slate-900/95 to-black/98 backdrop-blur-3xl rounded-r-3xl" />

          {/* Animated Glow Effects */}
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]"
          />
        </div>

        <div className="relative z-10 flex flex-col h-full p-6">
          {/* Logo Section */}
          <Link to="/" className="mb-8 group" onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  WhyNot
                </h1>
                <p className="text-xs text-slate-400 font-medium">AI-Powered Placement</p>
              </div>
            </div>
          </Link>

          {/* User Profile Card */}
          <div className="mb-8 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-500 rounded-xl blur-md opacity-0 group-hover:opacity-60 transition-opacity" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-500 rounded-xl flex items-center justify-center font-bold text-white">
                  {initials}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{userName}</p>
                <p className="text-xs text-slate-400 capitalize">
                  {userRole?.toLowerCase().replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="group relative block"
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/20"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    <div
                      className={`relative flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {/* Icon with Gradient */}
                      <div
                        className={`relative w-10 h-10 rounded-lg flex items-center justify-center ${
                          isActive
                            ? `bg-gradient-to-br ${item.gradient}`
                            : 'bg-white/5 group-hover:bg-white/10'
                        } transition-all`}
                      >
                        <Icon
                          className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}
                        />
                      </div>

                      {/* Label */}
                      <span className={`text-sm font-semibold ${isActive ? 'text-white' : ''}`}>
                        {item.label}
                      </span>

                      {/* New Badge */}
                      {(item as any).badge && (
                        <span className="ml-auto px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full font-semibold border border-purple-500/30">
                          {(item as any).badge}
                        </span>
                      )}

                      {/* Hover Glow */}
                      {!isActive && (
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity blur-xl`}
                        />
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="pt-6 border-t border-white/10 space-y-2">
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-all">
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold">Settings</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 flex items-center justify-center transition-all">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </div>

          {/* AI Badge */}
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-400">AI-Powered Platform</span>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Spacer for desktop */}
      <div className="hidden md:block w-72 flex-shrink-0" />
    </>
  );
};

export default Sidebar;
