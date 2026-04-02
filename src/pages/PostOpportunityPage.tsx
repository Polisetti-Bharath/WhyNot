import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import PageTransition from '../components/common/PageTransition';

const PostOpportunityPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'INTERNSHIP',
    company_name: '',
    application_url: '',
    department: '',
    required_skills: '',
    min_cgpa: '',
    stipend_min: '',
    stipend_max: '',
    location: '',
    duration: '',
    deadline: '',
  });

  useEffect(() => {
    if (isEditMode && user) {
      fetchOpportunity();
    }
  }, [id, user]);

  const fetchOpportunity = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          title: data.title,
          description: data.description,
          type: data.type,
          company_name: data.company_name,
          application_url: data.application_url || '',
          department: data.department || '',
          required_skills: data.required_skills?.map((s: any) => s.name).join(', ') || '',
          min_cgpa: data.min_cgpa?.toString() || '',
          stipend_min: data.stipend_min?.toString() || '',
          stipend_max: data.stipend_max?.toString() || '',
          location: data.location || '',
          duration: data.duration || '',
          deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '',
        });
      }
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      setMessage({ type: 'error', text: 'Failed to load opportunity details' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validate required fields
      if (!formData.title || !formData.company_name || !formData.description) {
        throw new Error('Please fill in all required fields (Title, Company, Description)');
      }

      // Parse skills
      const skills = formData.required_skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(name => ({ name, level: 'Intermediate' }));

      const opportunityData: any = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        company_name: formData.company_name,
        posted_by: user!.id,
        department: formData.department,
        required_skills: skills,
        min_cgpa: formData.min_cgpa ? parseFloat(formData.min_cgpa) : null,
        stipend_min: formData.stipend_min ? parseInt(formData.stipend_min) : null,
        stipend_max: formData.stipend_max ? parseInt(formData.stipend_max) : null,
        location: formData.location,
        duration: formData.duration,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        status: 'active',
      };

      // Only include application_url if the column exists and value is provided
      if (formData.application_url) {
        opportunityData.application_url = formData.application_url;
      }

      let error;
      if (isEditMode) {
        const { error: updateError } = await supabase
          .from('opportunities')
          .update(opportunityData)
          .eq('id', id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('opportunities').insert(opportunityData);
        error = insertError;
      }

      if (error) throw error;

      setMessage({
        type: 'success',
        text: `Opportunity ${isEditMode ? 'updated' : 'posted'} successfully!`,
      });
      setTimeout(() => {
        navigate('/placement/opportunities');
      }, 2000);
    } catch (error: any) {
      console.error('Error saving opportunity:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save opportunity' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-black relative overflow-hidden pt-28 pb-12">
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

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-white">
              <Briefcase className="text-purple-400" />
              {isEditMode ? 'Edit Opportunity' : 'Post New Opportunity'}
            </h1>
            <p className="text-slate-400">
              {isEditMode
                ? 'Update the details of your job listing'
                : 'Add external roles from companies like Microsoft or Google. Students will be redirected to the official application link you provide.'}
            </p>
          </motion.div>

          <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-100 text-sm">
            These postings are external. Please paste the official application URL so students can
            apply on the company site.
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {message.text}
            </motion.div>
          )}

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            onSubmit={handleSubmit}
            className="glass-panel rounded-2xl p-8 border border-white/10 bg-slate-900/60 space-y-6"
          >
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Job Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Frontend Developer Intern"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Opportunity Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-purple focus:outline-none"
                >
                  <option value="INTERNSHIP">Internship</option>
                  <option value="PLACEMENT">Placement</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-purple focus:outline-none resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Microsoft, Google"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Official Application Link *
                </label>
                <input
                  type="url"
                  name="application_url"
                  value={formData.application_url}
                  onChange={handleChange}
                  required
                  placeholder="https://careers.microsoft.com/..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-purple focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g., Computer Science"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-purple focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Required Skills (comma-separated)
              </label>
              <input
                type="text"
                name="required_skills"
                value={formData.required_skills}
                onChange={handleChange}
                placeholder="e.g., React, TypeScript, Node.js"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-purple focus:outline-none"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Min CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  name="min_cgpa"
                  value={formData.min_cgpa}
                  onChange={handleChange}
                  placeholder="e.g., 7.5"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Min Stipend (₹)
                </label>
                <input
                  type="number"
                  name="stipend_min"
                  value={formData.stipend_min}
                  onChange={handleChange}
                  placeholder="e.g., 15000"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Max Stipend (₹)
                </label>
                <input
                  type="number"
                  name="stipend_max"
                  value={formData.stipend_max}
                  onChange={handleChange}
                  placeholder="e.g., 25000"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-purple focus:outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Bangalore"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 6 Months"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-purple focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-purple rounded-lg font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Post Opportunity
                  </>
                )}
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </PageTransition>
  );
};

export default PostOpportunityPage;
