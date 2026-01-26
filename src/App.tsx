import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-purple overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple opacity-20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-pink opacity-20 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
      </div>

      {/* Glass card container */}
      <div className="relative z-10 text-center p-12 max-w-2xl mx-4">
        <div className="backdrop-blur-xl bg-glass-200 border border-glass-100 rounded-3xl p-12 shadow-2xl">
          {/* Glowing title */}
          <h1 className="text-7xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-neon-pink via-neon-purple to-brand-indigo-400 bg-clip-text text-transparent animate-pulse-slow font-sans">
            WhyNot
          </h1>
          
          {/* Coming soon text */}
          <div className="mb-8">
            <p className="text-3xl md:text-4xl font-semibold text-white mb-4 font-mono tracking-wider">
              COMING SOON
            </p>
            <p className="text-lg text-gray-300">
              Something amazing is on the way
            </p>
          </div>

          {/* Decorative elements */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-3 h-3 rounded-full bg-neon-pink animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-neon-purple animate-pulse animation-delay-200"></div>
            <div className="w-3 h-3 rounded-full bg-brand-indigo-400 animate-pulse animation-delay-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
