import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Book, Award, FileText, Edit, MapPin, 
  Save, X, Plus, Trash2, Briefcase, Target, Calendar,
  GraduationCap, Code, Star, TrendingUp, CheckCircle, Building2, Users, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ResumeUpload from '../components/features/ResumeUpload';
import { supabase } from '../services/supabaseClient';

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const isPlacementOfficer = user?.role === 'PLACEMENT_OFFICER';
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    cgpa: user?.cgpa || 0,
    major: user?.major || '',
    year: user?.year || 0,
    semester: user?.semester || 0,
    skills: user?.skills || [],
    placementStatus: user?.placementStatus || 'unplaced' as 'unplaced' | 'placed' | 'in-process',
    preferences: {
      roles: user?.preferences?.roles || [],
      locations: user?.preferences?.locations || [],
      minStipend: user?.preferences?.minStipend || 0
    }
  });
  const [newSkill, setNewSkill] = useState({ name: '', level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced' });
  const [newLocation, setNewLocation] = useState('');
  const [newRole, setNewRole] = useState('');

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        department: user.department || '',
        cgpa: user.cgpa || 0,
        major: user.major || '',
        year: user.year || 0,
        semester: user.semester || 0,
        skills: user.skills || [],
        placementStatus: user.placementStatus || 'unplaced',
        preferences: {
          roles: user.preferences?.roles || [],
          locations: user.preferences?.locations || [],
          minStipend: user.preferences?.minStipend || 0
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          department: formData.department
        })
        .eq('id', user!.id);

      if (profileError) throw profileError;

      // Only update student_profiles if user is a student
      if (!isPlacementOfficer) {
        const { error: studentError } = await supabase
          .from('student_profiles')
          .upsert({
            id: user!.id,
            cgpa: formData.cgpa,
            major: formData.major,
            year: formData.year,
            semester: formData.semester,
            skills: formData.skills,
            preferences: formData.preferences,
            placement_status: formData.placementStatus
          }, { onConflict: 'id' });

        if (studentError) throw studentError;
      }

      await refreshUser();
      showToast('success', 'Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      department: user?.department || '',
      cgpa: user?.cgpa || 0,
      major: user?.major || '',
      year: user?.year || 0,
      semester: user?.semester || 0,
      skills: user?.skills || [],
      placementStatus: user?.placementStatus || 'unplaced',
      preferences: {
        roles: user?.preferences?.roles || [],
        locations: user?.preferences?.locations || [],
        minStipend: user?.preferences?.minStipend || 0
      }
    });
    setEditMode(false);
  };

  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill]
      });
      setNewSkill({ name: '', level: 'Beginner' });
    }
  };

  const handleRemoveSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    });
  };

  const handleAddLocation = () => {
    if (newLocation.trim() && !formData.preferences.locations.includes(newLocation)) {
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          locations: [...formData.preferences.locations, newLocation]
        }
      });
      setNewLocation('');
    }
  };

  const handleRemoveLocation = (location: string) => {
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        locations: formData.preferences.locations.filter(l => l !== location)
      }
    });
  };

  const handleAddRole = () => {
    if (newRole.trim() && !formData.preferences.roles.includes(newRole)) {
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          roles: [...formData.preferences.roles, newRole]
        }
      });
      setNewRole('');
    }
  };

  const handleRemoveRole = (role: string) => {
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        roles: formData.preferences.roles.filter(r => r !== role)
      }
    });
  };

  const handleResumeUpload = async (url: string) => {
    await refreshUser();
  };

  const handleResumeDelete = async () => {
    await refreshUser();
  };

  const profileCompletion = () => {
    let completed = 0;
    const total = 8;
    
    if (user?.name) completed++;
    if (user?.phone) completed++;
    if (user?.department) completed++;
    if (user?.cgpa && user.cgpa > 0) completed++;
    if (user?.skills && user.skills.length > 0) completed++;
    if (user?.preferences?.roles && user.preferences.roles.length > 0) completed++;
    if (user?.preferences?.locations && user.preferences.locations.length > 0) completed++;
    if (user?.resume_url) completed++;
    
    return Math.round((completed / total) * 100);
  };

  if (!user) return null;

  // Placement Officer Profile - Simplified version
  if (isPlacementOfficer) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden pt-28">
        <div className="relative z-10 max-w-[1400px] mx-auto p-4 md:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                Officer Profile
              </h1>
              <p className="text-slate-400 text-lg">Manage your placement officer account</p>
            </div>
            
            {!editMode ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                <Edit className="w-5 h-5" />
                Edit Profile
              </motion.button>
            ) : (
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl glass-panel border border-white/10 hover:border-white/20 text-white font-semibold transition-all"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Profile Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Profile Header Card - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              className="col-span-12"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                
                <div className="relative glass-panel rounded-3xl p-8 border border-white/10 group-hover:border-white/20 transition-all">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar */}
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-xl opacity-60" />
                      <div className="relative w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full p-1">
                        <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-5xl font-bold text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center border-4 border-slate-900">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                    </motion.div>

                    {/* User Info */}
                    <div className="flex-1 text-center md:text-left">
                      {editMode ? (
                        <input 
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="text-3xl md:text-4xl font-black bg-white/5 border border-white/20 rounded-lg px-4 py-2 w-full md:w-auto mb-2"
                        />
                      ) : (
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-2">{user.name}</h2>
                      )}
                      <p className="text-slate-400 text-lg flex items-center justify-center md:justify-start gap-2">
                        <Mail className="w-5 h-5" />
                        {user.email}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <span className="px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-sm font-semibold flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Placement Officer
                        </span>
                        <span className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-sm font-semibold">
                          {user.department || 'All Departments'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              className="col-span-12 md:col-span-6"
            >
              <div className="glass-panel rounded-2xl p-6 border border-white/10 h-full">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <User className="w-6 h-6 text-indigo-400" />
                  Contact Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </span>
                    <span className="font-semibold text-white">{user.email}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </span>
                    {editMode ? (
                      <input 
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="font-semibold bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm w-48 text-right"
                        placeholder="+91 9876543210"
                      />
                    ) : (
                      <span className="font-semibold text-white">{user.phone || 'Not set'}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Department
                    </span>
                    {editMode ? (
                      <input 
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="font-semibold bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm w-48 text-right"
                        placeholder="Computer Science"
                      />
                    ) : (
                      <span className="font-semibold text-white">{user.department || 'Not set'}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <span className="text-slate-400 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Officer ID
                    </span>
                    <span className="font-mono text-white font-semibold">{user.id.substring(0, 8).toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
              className="col-span-12 md:col-span-6"
            >
              <div className="glass-panel rounded-2xl p-6 border border-white/10 h-full">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                  Your Role
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Briefcase className="w-5 h-5 text-indigo-400" />
                      <span className="font-semibold text-white">Post Opportunities</span>
                    </div>
                    <p className="text-sm text-slate-400">Create and manage internship and placement postings for students</p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-purple-400" />
                      <span className="font-semibold text-white">Monitor Students</span>
                    </div>
                    <p className="text-sm text-slate-400">Track student placement status and interview progress</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Student Profile - Original version
  return (
    <div className="min-h-screen bg-black relative overflow-hidden pt-28">
      {/* Pure black background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{display: 'none'}}>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/30 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-500/30 rounded-full blur-[150px]"
        />
      </div>

      <div className="relative z-10 max-w-[1800px] mx-auto p-4 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
              My Profile
            </h1>
            <p className="text-slate-400 text-lg">Manage your personal and academic information</p>
          </div>
          
          {!editMode ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              <Edit className="w-5 h-5" />
              Edit Profile
            </motion.button>
          ) : (
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl glass-panel border border-white/10 hover:border-white/20 text-white font-semibold transition-all"
              >
                <X className="w-5 h-5" />
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Profile Completion Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="mb-8 glass-panel rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              Profile Completion
            </span>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {profileCompletion()}%
            </span>
          </div>
          <div className="relative h-3 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${profileCompletion()}%` }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          </div>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Profile Header Card - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="col-span-12"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              
              <div className="relative glass-panel rounded-3xl p-8 border border-white/10 group-hover:border-white/20 transition-all">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Avatar */}
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-xl opacity-60" />
                    <div className="relative w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full p-1">
                      <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-5xl font-bold text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* User Info */}
                  <div className="flex-1 text-center md:text-left">
                    {editMode ? (
                      <input 
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="text-3xl md:text-4xl font-bold mb-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full md:max-w-md"
                      />
                    ) : (
                      <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                        {user.name}
                      </h2>
                    )}
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      {editMode ? (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <input 
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            placeholder="Phone number"
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm w-40"
                          />
                        </div>
                      ) : user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">{user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm capitalize">{user.role?.toLowerCase().replace('_', ' ')}</span>
                      </div>
                    </div>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                      {user.skills?.slice(0, 5).map((skill: any, index: number) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            skill.level === 'Advanced' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            skill.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-cyan-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {skill.name}
                        </motion.span>
                      ))}
                      {user.skills && user.skills.length > 5 && (
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/5 text-slate-400 border border-white/10">
                          +{user.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div className="text-center glass-panel rounded-xl p-4 border border-indigo-500/20">
                      <div className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        {user.cgpa || 0}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">CGPA</div>
                    </div>
                    <div className="text-center glass-panel rounded-xl p-4 border border-purple-500/20">
                      <div className="text-3xl font-black text-white">
                        {user.skills?.length || 0}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Skills</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Academic Info - 6 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
            className="col-span-12 md:col-span-6"
          >
            <div className="glass-panel rounded-2xl p-6 border border-white/10 h-full">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-indigo-400" />
                Academic Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Book className="w-4 h-4" />
                    Department
                  </span>
                  {editMode ? (
                    <input 
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="font-semibold bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm w-48 text-right"
                    />
                  ) : (
                    <span className="font-semibold text-white">{user.department || 'Not set'}</span>
                  )}
                </div>

                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Year / Semester
                  </span>
                  {editMode ? (
                    <div className="flex gap-2">
                      <input 
                        type="number"
                        min="1"
                        max="5"
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                        className="font-semibold bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm w-20 text-right"
                      />
                      <input 
                        type="number"
                        min="1"
                        max="10"
                        value={formData.semester}
                        onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value)})}
                        className="font-semibold bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm w-20 text-right"
                      />
                    </div>
                  ) : (
                    <span className="font-semibold text-white">Year {user.year}, Sem {user.semester}</span>
                  )}
                </div>

                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-slate-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    CGPA
                  </span>
                  {editMode ? (
                    <input 
                      type="number"
                      min="0"
                      max="10"
                      step="0.01"
                      value={formData.cgpa}
                      onChange={(e) => setFormData({...formData, cgpa: parseFloat(e.target.value)})}
                      className="font-bold text-emerald-400 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm w-24 text-right"
                    />
                  ) : (
                    <span className="font-bold text-emerald-400 text-xl">{user.cgpa || 'Not set'}</span>
                  )}
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="text-slate-400 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Student ID
                  </span>
                  <span className="font-mono text-white font-semibold">{user.id.substring(0, 8).toUpperCase()}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-t border-white/5 mt-2">
                  <span className="text-slate-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Placement Status
                  </span>
                  {editMode ? (
                    <select
                      value={formData.placementStatus || 'unplaced'}
                      onChange={(e) => setFormData({...formData, placementStatus: e.target.value as 'unplaced' | 'placed' | 'in-process'})}
                      className="font-semibold bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="unplaced">Not Placed</option>
                      <option value="in-process">In Process</option>
                      <option value="placed">Placed</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      user.placementStatus === 'placed' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : user.placementStatus === 'in-process'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                    }`}>
                      {user.placementStatus === 'placed' ? '✓ Placed' : 
                       user.placementStatus === 'in-process' ? '⏳ In Process' : 
                       'Not Placed'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Skills - 6 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
            className="col-span-12 md:col-span-6"
          >
            <div className="glass-panel rounded-2xl p-6 border border-white/10 h-full">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Code className="w-6 h-6 text-purple-400" />
                Skills
              </h3>

              {editMode && (
                <div className="mb-4 flex gap-2">
                  <input 
                    type="text"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                    placeholder="Skill name"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  />
                  <select
                    value={newSkill.level}
                    onChange={(e) => setNewSkill({...newSkill, level: e.target.value as any})}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 border border-purple-500/30"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                </div>
              )}

              <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {formData.skills.map((skill: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      skill.level === 'Advanced' ? 'bg-green-500/10 border border-green-500/20' :
                      skill.level === 'Intermediate' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                      'bg-cyan-500/10 border border-rose-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        skill.level === 'Advanced' ? 'bg-green-400' :
                        skill.level === 'Intermediate' ? 'bg-yellow-400' :
                        'bg-cyan-400'
                      }`} />
                      <span className="font-semibold text-white">{skill.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        skill.level === 'Advanced' ? 'text-green-400' :
                        skill.level === 'Intermediate' ? 'text-yellow-400' :
                        'text-rose-400'
                      }`}>
                        {skill.level}
                      </span>
                      {editMode && (
                        <button
                          onClick={() => handleRemoveSkill(index)}
                          className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
                {formData.skills.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <Code className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No skills added yet</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Preferences - 7 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
            className="col-span-12 md:col-span-7"
          >
            <div className="glass-panel rounded-2xl p-6 border border-white/10 h-full">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-pink-400" />
                Career Preferences
              </h3>

              <div className="space-y-6">
                {/* Preferred Roles */}
                <div>
                  <label className="text-slate-400 text-sm mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Preferred Roles
                  </label>
                  {editMode && (
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="e.g., Frontend Developer"
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddRole()}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddRole}
                        className="px-4 py-2 bg-pink-500/20 text-pink-400 rounded-lg hover:bg-pink-500/30 border border-pink-500/30"
                      >
                        <Plus className="w-5 h-5" />
                      </motion.button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {formData.preferences.roles.map((role: string, index: number) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-3 py-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 text-sm font-semibold flex items-center gap-2"
                      >
                        {role}
                        {editMode && (
                          <button onClick={() => handleRemoveRole(role)}>
                            <X className="w-4 h-4 hover:text-red-400" />
                          </button>
                        )}
                      </motion.span>
                    ))}
                    {formData.preferences.roles.length === 0 && !editMode && (
                      <span className="text-slate-500 text-sm">No preferred roles set</span>
                    )}
                  </div>
                </div>

                {/* Preferred Locations */}
                <div>
                  <label className="text-slate-400 text-sm mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Preferred Locations
                  </label>
                  {editMode && (
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="e.g., Bangalore"
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddLocation}
                        className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 border border-indigo-500/30"
                      >
                        <Plus className="w-5 h-5" />
                      </motion.button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {formData.preferences.locations.map((location: string, index: number) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-3 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-sm font-semibold flex items-center gap-2"
                      >
                        {location}
                        {editMode && (
                          <button onClick={() => handleRemoveLocation(location)}>
                            <X className="w-4 h-4 hover:text-red-400" />
                          </button>
                        )}
                      </motion.span>
                    ))}
                    {formData.preferences.locations.length === 0 && !editMode && (
                      <span className="text-slate-500 text-sm">No preferred locations set</span>
                    )}
                  </div>
                </div>

                {/* Expected Stipend */}
                <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Expected Stipend (Min)
                  </span>
                  {editMode ? (
                    <div className="flex items-center gap-2">
                      <span className="text-white">₹</span>
                      <input 
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.preferences.minStipend}
                        onChange={(e) => setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            minStipend: parseInt(e.target.value) || 0
                          }
                        })}
                        className="font-bold bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm w-32 text-right text-white"
                      />
                      <span className="text-white">/ month</span>
                    </div>
                  ) : (
                    <span className="font-bold text-green-400 text-xl">
                      ₹{user.preferences?.minStipend?.toLocaleString() || 0}+
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Resume Upload - 5 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
            className="col-span-12 md:col-span-5"
          >
            <div className="glass-panel rounded-2xl p-6 border border-white/10 h-full">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-orange-400" />
                Resume
              </h3>
              
              <ResumeUpload 
                userId={user.id}
                currentResumeUrl={user.resume_url}
                onUploadComplete={handleResumeUpload}
                onDelete={handleResumeDelete}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
