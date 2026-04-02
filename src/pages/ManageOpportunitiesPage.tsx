import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit, Trash2, Plus, Building, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../services/supabaseClient';
import PageTransition from '../components/common/PageTransition';
import { UserRole } from '../types';

interface Opportunity {
  id: string;
  title: string;
  company_name: string;
  location: string;
  type: string;
  status: 'active' | 'closed' | 'draft';
  posted_by: string;
  created_at: string;
  deadline: string;
  application_url?: string; // Optional field
}

const ManageOpportunitiesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.role !== UserRole.PLACEMENT_OFFICER) {
        navigate('/');
        return;
      }
      fetchOpportunities();
    }
  }, [user, navigate]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('posted_by', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error: any) {
      console.error('Error fetching opportunities:', error);
      setError(error.message || 'Failed to load opportunities');
      showToast('error', 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this opportunity? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(id);
      const { error } = await supabase.from('opportunities').delete().eq('id', id);

      if (error) throw error;

      setOpportunities(prev => prev.filter(op => op.id !== id));
      showToast('success', 'Opportunity deleted successfully');
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      showToast('error', 'Failed to delete opportunity');
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredOpportunities = opportunities.filter(
    op =>
      op.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'closed':
        return 'text-red-600 bg-red-100';
      case 'draft':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-black relative overflow-hidden pt-28 pb-12">
        <div className="relative z-10 max-w-[1800px] mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                Manage Opportunities
              </h1>
              <p className="text-slate-400 text-lg">View and manage your posted job listings</p>
            </div>
            <Link
              to="/placement/post"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Post New Opportunity
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="glass-panel p-4 rounded-2xl mb-8 border border-white/10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title or company..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-purple-500/50 focus:outline-none placeholder:text-slate-500 transition-colors"
              />
            </div>
          </div>

          {/* Opportunities List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-2xl border border-white/10">
              <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <Building className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No opportunities found</h3>
              <p className="text-slate-400">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Get started by posting your first opportunity'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredOpportunities.map(opportunity => (
                <motion.div
                  key={opportunity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-white">{opportunity.title}</h3>
                          <div className="flex items-center text-slate-400 mt-1">
                            <Building className="w-4 h-4 mr-1 text-purple-400" />
                            <span className="mr-4">{opportunity.company_name}</span>
                            <MapPin className="w-4 h-4 mr-1 text-slate-500" />
                            <span>{opportunity.location}</span>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            opportunity.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : opportunity.status === 'closed'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {opportunity.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Posted: {new Date(opportunity.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Deadline:{' '}
                          {opportunity.deadline
                            ? new Date(opportunity.deadline).toLocaleDateString()
                            : 'No deadline'}
                        </div>
                        <div className="flex items-center">
                          <span className="capitalize bg-white/5 px-2 py-0.5 rounded text-slate-400 border border-white/10">
                            {opportunity.type.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                      <Link
                        to={`/placement/edit/${opportunity.id}`}
                        className="flex items-center px-4 py-2 text-sm font-bold text-white bg-white/5 rounded-xl hover:bg-white/10 border border-white/10 transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(opportunity.id)}
                        disabled={deleteLoading === opportunity.id}
                        className="flex items-center px-4 py-2 text-sm font-bold text-rose-400 bg-rose-500/10 rounded-xl hover:bg-rose-500/20 border border-rose-500/20 transition-colors disabled:opacity-50"
                      >
                        {deleteLoading === opportunity.id ? (
                          <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ManageOpportunitiesPage;
