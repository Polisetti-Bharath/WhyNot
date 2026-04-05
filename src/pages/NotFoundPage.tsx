import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-2xl w-full text-center"
      >
        {/* 404 Animation */}
        <motion.div
          className="text-[180px] font-bold leading-none mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <span className="bg-gradient-to-r from-neon-purple via-neon-purple to-neon-pink bg-clip-text text-transparent">
            404
          </span>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        >
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-slate-400 text-lg mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
              Go Back
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-purple rounded-lg hover:scale-105 transition-transform"
            >
              <Home size={20} />
              Home
            </button>
          </div>

          {/* Helpful Links */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
              <Search size={20} />
              Quick Links
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/opportunities')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
              >
                Opportunities
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
              >
                Profile
              </button>
              <button
                onClick={() => navigate('/mentor/dashboard')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
              >
                Mentor
              </button>
              <button
                onClick={() => navigate('/placement/dashboard')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
              >
                Placement
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
