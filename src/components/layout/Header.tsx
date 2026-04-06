import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Briefcase,
  Users,
  Settings,
  LogOut,
  Bell,
  BarChart3,
  UserCheck,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  userRole?: UserRole;
  userName?: string;
  userAvatar?: string;
  notifications?: number;
}

const Header: React.FC<HeaderProps> = ({
  userRole,
  userName = 'Guest',
  userAvatar,
  notifications = 0,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const isLoggedIn = !!userRole;

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

  // Get navigation items based on user role
  const getNavigationItems = () => {
    switch (userRole) {
      case UserRole.STUDENT:
        return [
          { label: 'Dashboard', path: '/dashboard', icon: Home },
          { label: 'Opportunities', path: '/opportunities', icon: Briefcase },
          { label: 'External Jobs', path: '/external-jobs', icon: ExternalLink },
          { label: 'Resume AI', path: '/resume-analyzer', icon: BarChart3 },
        ];

      case UserRole.PLACEMENT_OFFICER:
        return [
          { label: 'Dashboard', path: '/placement/dashboard', icon: Home },
          { label: 'Opportunities', path: '/placement/opportunities', icon: Briefcase },
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
    .toUpperCase();

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 transition-all duration-300 glass-panel shadow-lg shadow-black/20"
      role="banner"
    >
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      <div className="max-w-[1800px] mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left Section: Logo + Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group" aria-label="WhyNot Home">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-500 p-[2px] shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all group-hover:scale-105">
                <div className="w-full h-full rounded-xl bg-black flex items-center justify-center">
                  <span
                    className="text-lg font-bold bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent"
                    aria-hidden="true"
                  >
                    W
                  </span>
                </div>
              </div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:from-rose-400 group-hover:to-purple-400 transition-all">
                WhyNot
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav
              className="hidden md:flex items-center gap-1"
              role="navigation"
              aria-label="Main navigation"
            >
              {isLoggedIn &&
                navItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      location.pathname === item.path
                        ? 'bg-white/10 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    aria-current={location.pathname === item.path ? 'page' : undefined}
                    aria-label={item.label}
                  >
                    <item.icon size={16} aria-hidden="true" />
                    {item.label}
                  </Link>
                ))}
            </nav>
          </div>

          {/* Right Side Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                {/* Removed Features, How It Works, About links as requested */}
                <Link
                  to="/login"
                  className="px-6 py-2.5 rounded-full border border-white/30 backdrop-blur-sm bg-white/5 text-sm font-semibold tracking-wide text-white hover:bg-white/15 hover:border-white/50 hover:shadow-lg hover:shadow-white/20 transition-all hover:scale-105"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-black to-dark-purple-900 text-white text-sm font-semibold tracking-wide shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                {/* User Profile Dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-black to-dark-purple-900 p-[2px] cursor-pointer hover:scale-105 transition-transform">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-sm font-bold">
                          {initials}
                        </div>
                      </div>
                    )}
                    <div className="text-left hidden lg:block">
                      <p className="text-sm font-medium text-white">{userName}</p>
                      <p className="text-xs text-slate-400">{userRole?.replace('_', ' ')}</p>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-black/95 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Users size={16} />
                        My Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Settings size={16} />
                        Settings
                      </Link>
                      <hr className="my-2 border-white/10" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-white/5">
          <div className="px-6 py-4 space-y-2">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/#features"
                  className="block text-sm text-slate-300 hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  to="/#how-it-works"
                  className="block text-sm text-slate-300 hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link
                  to="/#about"
                  className="block text-sm text-slate-300 hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/login"
                  className="block w-full px-6 py-2.5 text-center rounded-full border border-white/30 backdrop-blur-sm bg-white/5 text-sm font-semibold tracking-wide text-white hover:bg-white/15 hover:border-white/50 hover:shadow-lg hover:shadow-white/20 transition-all mt-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block w-full px-6 py-2.5 text-center rounded-full bg-gradient-to-r from-black to-dark-purple-900 text-white text-sm font-semibold tracking-wide shadow-lg hover:shadow-xl transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                {/* User Info */}
                <div className="flex items-center gap-3 py-3 border-b border-white/10">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-black to-dark-purple-900 p-[2px]">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-sm font-bold">
                        {initials}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{userName}</p>
                    <p className="text-xs text-slate-400">{userRole?.replace('_', ' ')}</p>
                  </div>
                </div>

                {/* Navigation Items */}
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-3 text-sm text-slate-300 hover:text-white transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                ))}

                <hr className="my-2 border-white/10" />

                <Link
                  to="/settings"
                  className="flex items-center gap-3 text-sm text-slate-300 hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings size={16} />
                  Settings
                </Link>

                <button
                  className="flex items-center gap-3 text-sm text-red-400 hover:text-red-300 transition-colors py-2 w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
