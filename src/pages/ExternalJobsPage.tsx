import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, MapPin, Clock, Search, Briefcase, ExternalLink, Filter, TrendingUp
} from 'lucide-react';
import PageTransition from '../components/common/PageTransition';
import { useDebounce } from '../hooks/useDebounce';
import { LoadingGrid } from '../components/common/LoadingSkeleton';
import { fetchExternalJobs, ExternalJob } from '../services/externalJobsService';

const ExternalJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<ExternalJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('All');
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  const sources = ['All', 'LinkedIn', 'Naukri', 'Indeed'];

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const fetchedJobs = await fetchExternalJobs(debouncedSearch, selectedSource);
        setJobs(fetchedJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [debouncedSearch, selectedSource]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-white dark:bg-black pt-28 pb-12 relative overflow-hidden">
        {/* Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] mix-blend-screen" />
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-600 dark:text-neon-purple" />
                External Job Listings
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
                Discover opportunities aggregated from LinkedIn, Naukri, and Indeed.
              </p>
            </div>
            
            <div className="flex gap-4 items-center">
              <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 no-scrollbar">
                {sources.map(source => (
                  <button
                    key={source}
                    onClick={() => setSelectedSource(source)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedSource === source 
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 mb-8 shadow-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search job title, company, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {loading ? (
             <LoadingGrid count={6} />
          ) : (
            <AnimatePresence>
              {jobs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center"
                >
                  <Filter className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No jobs found</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    We couldn't find any external jobs matching your criteria. Try adjusting your search or filters.
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {jobs.map((job) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -4 }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl dark:shadow-none hover:border-purple-500/30 dark:hover:border-neon-purple/30 transition-all group flex flex-col h-full"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                          <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {job.logoUrl ? (
                              <img src={job.logoUrl} alt={job.company} className="w-10 h-10 object-contain" />
                            ) : (
                              <Building2 className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-neon-purple transition-colors">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                              <span>{job.company}</span>
                              <span className="text-slate-300 dark:text-slate-600">•</span>
                              <span className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                                {job.source}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-y-2 gap-x-4 mb-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          <MapPin className="w-4 h-4 text-purple-500" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          <Briefcase className="w-4 h-4 text-indigo-500" />
                          <span>{job.type}</span>
                        </div>
                        {job.salary && (
                          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-green-600 dark:text-emerald-400">
                            <span className="font-medium">{job.salary}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span>{job.postedAt}</span>
                        </div>
                      </div>

                      <div className="text-slate-600 dark:text-slate-300 text-sm flex-grow mb-6 line-clamp-3 overflow-hidden text-ellipsis">
                        {job.description}
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Imported from {job.source}
                        </div>
                        <a
                          href={job.applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-purple-500/25 transition-all w-full sm:w-auto"
                        >
                          Apply Now
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ExternalJobsPage;