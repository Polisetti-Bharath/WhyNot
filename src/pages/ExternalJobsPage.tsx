import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  Clock,
  Search,
  Briefcase,
  ExternalLink,
  Tag,
  Globe2,
  ChevronRight,
  Filter,
} from 'lucide-react';
import PageTransition from '../components/common/PageTransition';
import { useDebounce } from '../hooks/useDebounce';
import { fetchExternalJobs, ExternalJob } from '../services/externalJobsService';

const CATEGORIES = [
  'All Roles',
  'Frontend',
  'Backend',
  'Full Stack',
  'Data & AI',
  'Mobile',
  'DevOps & Cloud',
  'Other Software',
];

const ExternalJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<ExternalJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Roles');

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const fetchedJobs = await fetchExternalJobs(debouncedSearch);
        setJobs(fetchedJobs || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [debouncedSearch]);

  const filteredJobs = useMemo(() => {
    if (selectedCategory === 'All Roles') {
      return jobs;
    }
    return jobs.filter(job => job.roleCategory === selectedCategory);
  }, [jobs, selectedCategory]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pt-28 pb-12 relative overflow-hidden">
        {/* Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] min-w-[300px] bg-purple-600/5 dark:bg-purple-600/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-70 animate-blob" />
          <div className="absolute bottom-[20%] left-[10%] w-[35vw] h-[35vw] min-w-[350px] bg-indigo-600/5 dark:bg-indigo-600/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-70 animate-blob animation-delay-2000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Real-World{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">
                  Opportunities
                </span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-outfit max-w-2xl">
                Explore thousands of active job postings curated directly from the web, matching
                your career aspirations.
              </p>
            </div>

            <div className="w-full md:w-96">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search jobs, skills, companies..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-outfit shadow-sm group-hover:border-purple-300 dark:group-hover:border-purple-500/30"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="w-full lg:w-64 shrink-0">
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sticky top-28 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-purple-500" />
                  Categories
                </h3>
                <div className="space-y-1">
                  {CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-md shadow-purple-500/20'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {category}
                      </span>
                      {selectedCategory === category && <ChevronRight className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="animate-pulse flex p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl h-48"
                    >
                      <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-xl mr-6"></div>
                      <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredJobs.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Showing {filteredJobs.length} active{' '}
                      {filteredJobs.length === 1 ? 'result' : 'results'}
                    </span>
                  </div>

                  <AnimatePresence mode="popLayout">
                    {filteredJobs.map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/5 relative overflow-hidden"
                      >
                        <div className="flex flex-col lg:flex-row gap-6 items-start">
                          {/* Left Side: Detail & Description */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                              <div className="flex items-start gap-4">
                                <div className="w-14 h-14 shrink-0 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-100 dark:border-purple-500/20 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                                  <Building2 className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    {job.title}
                                  </h2>
                                  <div className="text-base font-medium text-slate-700 dark:text-slate-300">
                                    {job.company}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium mb-5">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/10 rounded-lg">
                                <Briefcase className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                {job.type}
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/10 rounded-lg">
                                <MapPin className="w-4 h-4 text-purple-500" />
                                {job.location}
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/10 rounded-lg">
                                <Globe2 className="w-4 h-4 text-blue-500" />
                                {job.source}
                              </span>
                            </div>

                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">
                              {job.description}
                            </p>
                          </div>

                          {/* Right Side: CTA & Status */}
                          <div className="w-full lg:w-48 shrink-0 flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-white/10 pt-4 lg:pt-0 lg:pl-6">
                            <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                              <Clock className="w-4 h-4" />
                              {job.postedAt}
                            </div>

                            <a
                              href={job.applyLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full sm:w-auto lg:w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white transition-all shadow-md group/btn"
                            >
                              Apply Now
                              <ExternalLink className="w-4 h-4 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                    <Search className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    No jobs found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                    We could not find any opportunities matching your criteria. Please try adjusting
                    your filters or search query.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All Roles');
                    }}
                    className="mt-6 px-6 py-2.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold rounded-xl hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ExternalJobsPage;
