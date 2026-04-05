import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { motion } from 'framer-motion';
import { UserRole } from '../types';

const ProfileSetupPage: React.FC = () => {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    name: user?.name || '',
    department: user?.department || '',
    major: user?.major || '',
    year: user?.year || 1,
    semester: user?.semester || 1,
    phone: '',

    // Academic
    cgpa: user?.cgpa || 0,

    // Skills
    skills: [] as {
      name: string;
      level: string;
      confidence?: 'Beginner' | 'Intermediate' | 'Advanced';
      evidence?: { type: string; details?: string }[];
    }[],
    newSkill: '',
    newSkillLevel: 'Beginner',
    newSkillConfidence: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    newSkillEvidence: [] as { type: string; details: string }[],

    // Preferences
    preferences: {
      locations: [] as string[],
      stipendMin: 0,
      opportunityTypes: [] as string[],
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (formData.newSkill) {
      setFormData(prev => ({
        ...prev,
        skills: [
          ...prev.skills,
          {
            name: prev.newSkill,
            level: prev.newSkillLevel,
            confidence: prev.newSkillConfidence,
            evidence: prev.newSkillEvidence.length > 0 ? prev.newSkillEvidence : undefined,
          },
        ],
        newSkill: '',
        newSkillLevel: 'Beginner',
        newSkillConfidence: 'Beginner',
        newSkillEvidence: [],
      }));
    }
  };

  const handleRemoveSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    try {
      await api.updateStudentProfile(user.id, {
        name: formData.name,
        department: formData.department,
        phone: formData.phone,
        major: formData.major,
        year: Number(formData.year),
        semester: Number(formData.semester),
        cgpa: Number(formData.cgpa),
        skills: formData.skills,
        preferences: formData.preferences,
      });

      // Wait a moment for database to propagate
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh user data to update context
      await refreshUser();

      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(
        `Failed to update profile: ${error.message || error.error_description || JSON.stringify(error)}`
      );
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-2xl w-full bg-slate-900 p-8 rounded-xl border border-slate-800"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Complete Your Profile</h1>

        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= i ? 'bg-neutral-900' : 'bg-slate-700'}`}
            >
              {i}
            </div>
          ))}
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Major</label>
                <input
                  type="text"
                  name="major"
                  value={formData.major}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Semester</label>
                  <input
                    type="number"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={nextStep}
                className="bg-neutral-900 px-4 py-2 rounded hover:bg-neutral-800"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <h2 className="text-xl font-semibold mb-4">Academic Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={prevStep} className="text-slate-400 hover:text-white">
                Back
              </button>
              <button
                onClick={nextStep}
                className="bg-neutral-900 px-4 py-2 rounded hover:bg-neutral-800"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-xl font-semibold mb-4">Skills & Confidence</h2>
            <p className="text-sm text-slate-400 mb-4">
              Add your skills with honest confidence levels. This helps provide better feedback on
              rejections.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-300">
                    Skill Name
                  </label>
                  <input
                    type="text"
                    name="newSkill"
                    value={formData.newSkill}
                    onChange={handleInputChange}
                    placeholder="e.g., React, Python, SQL"
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-300">
                    Confidence Level <span className="text-purple-400">*</span>
                  </label>
                  <select
                    name="newSkillConfidence"
                    value={formData.newSkillConfidence}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-slate-300">
                  Evidence (Optional) - How did you learn this?
                </label>
                <div className="flex gap-2">
                  <select
                    className="bg-slate-800 border border-slate-700 rounded p-2 text-sm"
                    onChange={e => {
                      if (e.target.value) {
                        const newEvidence = { type: e.target.value, details: '' };
                        setFormData(prev => ({
                          ...prev,
                          newSkillEvidence: [...prev.newSkillEvidence, newEvidence],
                        }));
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Add evidence...</option>
                    <option value="Course">Course</option>
                    <option value="Project">Project</option>
                    <option value="Internship">Internship</option>
                    <option value="Job">Job</option>
                    <option value="Certification">Certification</option>
                    <option value="Self-taught">Self-taught</option>
                  </select>
                </div>
                {formData.newSkillEvidence.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.newSkillEvidence.map((ev, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs bg-slate-800/50 p-2 rounded"
                      >
                        <span className="text-purple-400">{ev.type}</span>
                        <button
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              newSkillEvidence: prev.newSkillEvidence.filter((_, i) => i !== idx),
                            }));
                          }}
                          className="ml-auto text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleAddSkill}
                className="w-full bg-green-600 px-4 py-2 rounded hover:bg-green-700 text-sm font-medium"
              >
                Add Skill
              </button>

              <div className="flex flex-wrap gap-2 mt-4">
                {formData.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-slate-700 px-3 py-2 rounded-lg flex flex-col gap-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{skill.name}</span>
                      <button
                        onClick={() => handleRemoveSkill(index)}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-xs text-slate-300">
                      Confidence:{' '}
                      <span className="text-purple-400">{skill.confidence || skill.level}</span>
                    </div>
                    {skill.evidence && skill.evidence.length > 0 && (
                      <div className="text-xs text-slate-400">
                        Evidence: {skill.evidence.map(e => e.type).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={prevStep} className="text-slate-400 hover:text-white">
                Back
              </button>
              <button
                onClick={nextStep}
                className="bg-neutral-900 px-4 py-2 rounded hover:bg-neutral-800"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Minimum Stipend (₹)</label>
                <input
                  type="number"
                  value={formData.preferences.stipendMin}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, stipendMin: Number(e.target.value) },
                    }))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                />
              </div>
              {/* Add more preference fields as needed */}
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={prevStep} className="text-slate-400 hover:text-white">
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="bg-neutral-900 px-6 py-2 rounded hover:bg-neutral-800 font-bold"
              >
                Complete Profile
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfileSetupPage;
