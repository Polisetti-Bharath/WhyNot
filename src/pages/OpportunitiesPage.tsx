import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Briefcase,
  Building,
  Clock,
  ChevronRight,
  Zap,
  Star,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/common/PageTransition';
import { useDebounce } from '../hooks/useDebounce';
import { LoadingGrid } from '../components/common/LoadingSkeleton';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../services/supabaseClient';

const OpportunitiesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    location: '',
    minStipend: 0,
  });

  const debouncedSearch = useDebounce(filters.search, 300);

  useEffect(() => {
    if (user?.id) {
      fetchOpportunities();
    }

    // Subscribe to realtime opportunities updates
    const channel = supabase
      .channel('public:opportunities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, () => {
        fetchOpportunities();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, debouncedSearch, filters.type, filters.location, filters.minStipend]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const data = await api.getOpportunities({
        search: debouncedSearch,
        type: filters.type as any,
        location: filters.location,
        minStipend: filters.minStipend,
      });
      setOpportunities(data || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      showToast('error', 'Failed to load opportunities. Please check your connection.');
      setOpportunities([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = async (opp: any) => {
    if (!user?.id) {
      showToast('error', 'Please login to apply');
      return;
    }

    try {
      // Apply internally through the system
      await api.applyToOpportunity(opp.id, user.id);
      showToast('success', 'Application submitted successfully!');

      // If external URL exists, optionally open it
      if (opp?.application_url) {
        const shouldOpenExternal = window.confirm(
          'Application submitted! Would you also like to visit the external application page?'
        );
        if (shouldOpenExternal) {
          window.open(opp.application_url, '_blank', 'noopener,noreferrer');
        }
      }
    } catch (error: any) {
      console.error('Failed to submit application:', error);
      if (error.message?.includes('duplicate')) {
        showToast('error', 'You have already applied to this opportunity');
      } else {
        showToast('error', 'Failed to submit application. Please try again.');
      }
    }
  };

  const calculateMatch = (opp: any) => {
    if (!user || !user.skills) return 0;
    const requiredSkills = opp.required_skills || [];
    if (requiredSkills.length === 0) return 100;

    const userSkillNames = user.skills
      .filter((s: any) => s && s.name)
      .map((s: any) => s.name.toLowerCase());
    const matchCount = requiredSkills.filter(
      (s: any) => s && s.name && userSkillNames.includes(s.name.toLowerCase())
    ).length;

    return Math.round((matchCount / requiredSkills.length) * 100);
  };

  // Analyze why no jobs are matching based on user profile
  const analyzeNoMatchReasons = () => {
    if (!user || opportunities.length > 0) return null;

    const reasons: string[] = [];
    const suggestions: string[] = [];

    // Check CGPA
    const avgCgpaRequired = 7.0; // You might want to calculate this from actual opportunities
    if (user.cgpa && user.cgpa < avgCgpaRequired) {
      reasons.push(
        `Your CGPA (${user.cgpa}) may be below typical requirements (≥ ${avgCgpaRequired})`
      );
      suggestions.push('Focus on improving your academic performance');
    }

    // Check skills
    if (!user.skills || user.skills.length < 3) {
      reasons.push('Limited skills listed in your profile');
      suggestions.push('Add more relevant technical and soft skills to your profile');
    }

    // Check filters
    if (filters.minStipend > 0) {
      reasons.push(`Minimum stipend filter set to ₹${filters.minStipend.toLocaleString()}`);
      suggestions.push('Try lowering your minimum stipend expectation');
    }

    if (filters.location) {
      reasons.push(`Location filter active: "${filters.location}"`);
      suggestions.push('Try searching for remote opportunities or different locations');
    }

    if (filters.type) {
      reasons.push(`Opportunity type filter: ${filters.type}`);
      suggestions.push('Consider both internships and placements');
    }

    // If no specific reason found
    if (reasons.length === 0) {
      reasons.push('No opportunities currently match your profile and preferences');
      suggestions.push('Check back later for new opportunities');
      suggestions.push('Consider broadening your search criteria');
    }

    return { reasons, suggestions };
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-black relative overflow-hidden pt-28">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
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
            className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-500/30 rounded-full blur-[150px]"
          />
        </div>

        <div className="relative z-10 max-w-[1800px] mx-auto p-4 md:p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                Find Opportunities
              </h1>
              <p className="text-slate-400 text-lg">
                Discover internships and placements tailored for you
              </p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="glass-panel p-4 rounded-2xl mb-8 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search */}
              <div className="md:col-span-5 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by role, company, or skills..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-purple-500/50 focus:outline-none placeholder:text-slate-500 transition-colors"
                  value={filters.search}
                  onChange={e => setFilters({ ...filters, search: e.target.value })}
                />
              </div>

              {/* Type Filter */}
              <div className="md:col-span-2">
                <select
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-purple-500/50 focus:outline-none appearance-none cursor-pointer"
                  value={filters.type}
                  onChange={e => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="">All Types</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="PLACEMENT">Placement</option>
                </select>
              </div>

              {/* Location Filter */}
              <div className="md:col-span-3 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-purple-500/50 focus:outline-none placeholder:text-slate-500 transition-colors"
                  value={filters.location}
                  onChange={e => setFilters({ ...filters, location: e.target.value })}
                />
              </div>

              {/* Min Stipend */}
              <div className="md:col-span-2 relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="number"
                  placeholder="Min Stipend"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-purple-500/50 focus:outline-none placeholder:text-slate-500 transition-colors"
                  value={filters.minStipend || ''}
                  onChange={e => setFilters({ ...filters, minStipend: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Opportunities Grid */}
          {loading ? (
            <LoadingGrid count={6} type="card" />
          ) : opportunities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 glass-panel rounded-2xl border border-white/10"
            >
              <div className="max-w-2xl mx-auto px-6">
                <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="w-10 h-10 text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No Opportunities Found</h3>

                {(() => {
                  const analysis = analyzeNoMatchReasons();
                  return analysis ? (
                    <div className="text-left mt-8 space-y-6">
                      {/* Why no matches */}
                      <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <h4 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Possible Reasons
                        </h4>
                        <ul className="space-y-2">
                          {analysis.reasons.map((reason, idx) => (
                            <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                              <span className="text-red-400 mt-1">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Suggestions */}
                      <div className="p-5 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          What You Can Do
                        </h4>
                        <ul className="space-y-2">
                          {analysis.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                              <span className="text-green-400 mt-1">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 justify-center mt-6">
                        <button
                          onClick={() =>
                            setFilters({ search: '', type: '', location: '', minStipend: 0 })
                          }
                          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition-colors"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400">
                      Try adjusting your filters to find what you&apos;re looking for.
                    </p>
                  );
                })()}
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {opportunities.map((opp, index) => {
                  const matchScore = calculateMatch(opp);
                  return (
                    <motion.div
                      key={opp.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group relative"
                    >
                      <div className="absolute -inset-[1px] bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                      <div className="relative glass-panel p-6 rounded-2xl h-full flex flex-col border border-white/10 hover:border-purple-500/30 transition-colors">
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                              <Building className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-lg leading-tight group-hover:text-purple-400 transition-colors">
                                {opp.title}
                              </h3>
                              <p className="text-slate-400 text-sm">{opp.company_name}</p>
                            </div>
                          </div>
                          {matchScore > 0 && (
                            <div
                              className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                                matchScore >= 80
                                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                  : matchScore >= 50
                                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}
                            >
                              {matchScore}% Match
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                              opp.type === 'INTERNSHIP'
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            }`}
                          >
                            {opp.type}
                          </span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-slate-300 border border-white/10 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {opp.location || 'Remote'}
                          </span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-slate-300 border border-white/10 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-yellow-400" />₹
                            {opp.stipend_min?.toLocaleString()} -{' '}
                            {opp.stipend_max?.toLocaleString()}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-grow">
                          {opp.description}
                        </p>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Posted {new Date(opp.created_at).toLocaleDateString()}
                          </div>
                          <button
                            onClick={() => handleApplyClick(opp)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-bold text-sm hover:bg-purple-50 transition-colors"
                          >
                            Apply Now
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default OpportunitiesPage;
