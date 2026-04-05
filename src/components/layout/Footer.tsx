import React from 'react';
import { Link } from 'react-router-dom';
import {
  Github,
  Linkedin,
  Twitter,
  Mail,
  Heart,
  User,
  BarChart3,
  BookOpen,
  Settings,
  HelpCircle,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();

  // Role-specific quick links
  const getQuickLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case UserRole.STUDENT:
        return [
          { label: 'Opportunities', path: '/opportunities' },
          { label: 'Settings', path: '/settings' },
        ];

      case UserRole.PLACEMENT_OFFICER:
        return [{ label: 'Post Opportunity', path: '/placement/post' }];

      default:
        return [];
    }
  };

  const quickLinks = getQuickLinks();

  return (
    <footer className="relative bg-black/50 backdrop-blur-md border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 group mb-4">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-500 p-[2px] shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all group-hover:scale-105">
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
            <p className="text-slate-400 text-sm mb-4 max-w-md">
              Empowering students with AI-driven career insights and personalized guidance to make
              informed decisions about their future.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:scale-105"
              >
                <Github size={18} className="text-slate-400 hover:text-white transition-colors" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:scale-105"
              >
                <Linkedin size={18} className="text-slate-400 hover:text-white transition-colors" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:scale-105"
              >
                <Twitter size={18} className="text-slate-400 hover:text-white transition-colors" />
              </a>
              <a
                href="mailto:contact@whynot.com"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:scale-105"
              >
                <Mail size={18} className="text-slate-400 hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links - Role Specific */}
          {user && quickLinks.length > 0 ? (
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                Quick Access
              </h3>
              <ul className="space-y-2">
                {quickLinks.map(link => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-slate-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/#features"
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#how-it-works"
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#about"
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Resources & Support */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help-center"
                  className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <HelpCircle size={14} />
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <Shield size={14} />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/contact-support"
                  className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <Mail size={14} />
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© {currentYear} WhyNot. All rights reserved.</p>
          <p className="text-slate-500 text-sm flex items-center gap-1">
            Made with <Heart size={14} className="text-red-500 fill-current" /> for students
            everywhere
          </p>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </footer>
  );
};

export default Footer;
