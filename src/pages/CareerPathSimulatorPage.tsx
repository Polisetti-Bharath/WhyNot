import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  Star,
  Zap,
  Award,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Building2,
  Users,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../services/supabaseClient';
import PageTransition from '../components/common/PageTransition';
import Button from '../components/common/Button';
import SEO from '../components/common/SEO';
import { Skill } from '../types';

interface SimulationChange {
  type: 'skill' | 'cgpa' | 'certification';
  value: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface SimulationResult {
  currentOpportunities: number;
  newOpportunities: number;
  matchScoreImprovements: Array<{
    company: string;
    before: number;
    after: number;
  }>;
  unlockedFeatures: string[];
  recommendedPath: Array<{
    priority: number;
    action: string;
    effort: string;
    impact: string;
    immediateOpportunities?: number;
    longTermOpportunities?: number;
  }>;
  timeline: Array<{
    week: string;
    action: string;
    probability?: string;
  }>;
}

const CareerPathSimulatorPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentProfile, setCurrentProfile] = useState({
    cgpa: 0,
    skills: [] as Skill[],
    eligibleOpportunities: 0,
  });

  const [simulationChanges, setSimulationChanges] = useState<SimulationChange[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    'Beginner'
  );
  const [targetCgpa, setTargetCgpa] = useState('');
  const [certification, setCertification] = useState('');

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadCurrentProfile();
    }
  }, [user]);

  const loadCurrentProfile = async () => {
    try {
      setInitialLoading(true);

      // Fetch student profile
      const { data: profile, error: profileError } = await supabase
        .from('student_profiles')
        .select('cgpa, skills')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      // Count eligible opportunities
      const { count, error: countError } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .lte('min_cgpa', profile?.cgpa || 0);

      if (countError) throw countError;

      setCurrentProfile({
        cgpa: profile?.cgpa || 0,
        skills: profile?.skills || [],
        eligibleOpportunities: count || 0,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      showToast('error', 'Failed to load your profile');
    } finally {
      setInitialLoading(false);
    }
  };

  const addSkillChange = () => {
    if (!newSkill.trim()) {
      showToast('error', 'Please enter a skill name');
      return;
    }

    const skillExists = simulationChanges.some(
      change => change.type === 'skill' && change.value.toLowerCase() === newSkill.toLowerCase()
    );

    if (skillExists) {
      showToast('error', 'This skill is already added');
      return;
    }

    setSimulationChanges([
      ...simulationChanges,
      { type: 'skill', value: newSkill, level: newSkillLevel },
    ]);
    setNewSkill('');
    setNewSkillLevel('Beginner');
  };

  const addCgpaChange = () => {
    const cgpaValue = parseFloat(targetCgpa);
    if (!targetCgpa || isNaN(cgpaValue) || cgpaValue < 0 || cgpaValue > 10) {
      showToast('error', 'Please enter a valid CGPA between 0 and 10');
      return;
    }

    if (cgpaValue <= currentProfile.cgpa) {
      showToast('error', 'Target CGPA must be higher than your current CGPA');
      return;
    }

    // Remove existing CGPA change if any
    const filteredChanges = simulationChanges.filter(change => change.type !== 'cgpa');
    setSimulationChanges([...filteredChanges, { type: 'cgpa', value: targetCgpa }]);
    setTargetCgpa('');
  };

  const addCertificationChange = () => {
    if (!certification.trim()) {
      showToast('error', 'Please enter a certification name');
      return;
    }

    const certExists = simulationChanges.some(
      change =>
        change.type === 'certification' &&
        change.value.toLowerCase() === certification.toLowerCase()
    );

    if (certExists) {
      showToast('error', 'This certification is already added');
      return;
    }

    setSimulationChanges([...simulationChanges, { type: 'certification', value: certification }]);
    setCertification('');
  };

  const removeChange = (index: number) => {
    setSimulationChanges(simulationChanges.filter((_, i) => i !== index));
  };

  const runSimulation = async () => {
    if (simulationChanges.length === 0) {
      showToast('error', 'Please add at least one change to simulate');
      return;
    }

    setLoading(true);
    try {
      // Simulate the changes
      const simulatedSkills = [...currentProfile.skills];
      let simulatedCgpa = currentProfile.cgpa;
      const certifications: string[] = [];

      simulationChanges.forEach(change => {
        if (change.type === 'skill') {
          simulatedSkills.push({
            name: change.value,
            level: change.level || 'Beginner',
          });
        } else if (change.type === 'cgpa') {
          simulatedCgpa = parseFloat(change.value);
        } else if (change.type === 'certification') {
          certifications.push(change.value);
        }
      });

      // Fetch all active opportunities
      const { data: opportunities, error } = await supabase
        .from('opportunities')
        .select('*, required_skills')
        .eq('status', 'active');

      if (error) throw error;

      // Calculate current eligibility
      const currentEligible =
        opportunities?.filter(opp => opp.min_cgpa <= currentProfile.cgpa).length || 0;

      // Calculate new eligibility
      const newEligible = opportunities?.filter(opp => opp.min_cgpa <= simulatedCgpa).length || 0;

      // Calculate match score improvements for top companies
      const topCompanies = [
        'TCS',
        'Infosys',
        'Wipro',
        'Cognizant',
        'Google',
        'Amazon',
        'Microsoft',
      ];
      const matchScoreImprovements = topCompanies
        .map(company => {
          const companyOpps = opportunities?.filter(opp =>
            opp.company.toLowerCase().includes(company.toLowerCase())
          );

          if (!companyOpps || companyOpps.length === 0) return null;

          const opp = companyOpps[0];
          const requiredSkills = opp.required_skills || [];

          // Calculate before match score
          const beforeMatchingSkills = currentProfile.skills.filter(skill =>
            requiredSkills.some((rs: any) => rs.name?.toLowerCase() === skill.name.toLowerCase())
          ).length;
          const beforeScore =
            requiredSkills.length > 0
              ? Math.round((beforeMatchingSkills / requiredSkills.length) * 100)
              : 0;

          // Calculate after match score
          const afterMatchingSkills = simulatedSkills.filter(skill =>
            requiredSkills.some((rs: any) => rs.name?.toLowerCase() === skill.name.toLowerCase())
          ).length;
          const afterScore =
            requiredSkills.length > 0
              ? Math.round((afterMatchingSkills / requiredSkills.length) * 100)
              : 0;

          if (beforeScore === afterScore) return null;

          return {
            company,
            before: beforeScore,
            after: afterScore,
          };
        })
        .filter(Boolean) as Array<{ company: string; before: number; after: number }>;

      // Determine unlocked features
      const unlockedFeatures: string[] = [];
      if (simulatedCgpa >= 7.5) {
        unlockedFeatures.push('Unlocks premium companies (FAANG)');
      }
      if (simulatedCgpa >= 7.0) {
        unlockedFeatures.push('Eligible for top-tier companies');
      }
      if (certifications.length > 0) {
        unlockedFeatures.push(`Certification: ${certifications.join(', ')}`);
      }

      // Build recommended path
      const recommendedPath = [];
      const skillChanges = simulationChanges.filter(c => c.type === 'skill');
      const cgpaChange = simulationChanges.find(c => c.type === 'cgpa');

      if (skillChanges.length > 0) {
        const topSkill = skillChanges[0];
        const skillImpact =
          opportunities?.filter(opp => {
            const requiredSkills = opp.required_skills || [];
            return (
              requiredSkills.some(
                (rs: any) => rs.name?.toLowerCase() === topSkill.value.toLowerCase()
              ) && opp.min_cgpa <= currentProfile.cgpa
            );
          }).length || 0;

        recommendedPath.push({
          priority: 1,
          action: `Add ${topSkill.value} (${topSkill.level})`,
          effort: '4 weeks effort',
          impact: `Unlocks ${skillImpact} immediate opportunities`,
          immediateOpportunities: skillImpact,
        });
      }

      if (cgpaChange) {
        const cgpaImpact = newEligible - currentEligible;
        recommendedPath.push({
          priority: 2,
          action: `Raise CGPA to ${cgpaChange.value}`,
          effort: '1 semester',
          impact: `Unlocks ${cgpaImpact} more (long-term)`,
          longTermOpportunities: cgpaImpact,
        });
      }

      // Build timeline
      const timeline = [];
      if (skillChanges.length > 0) {
        timeline.push({
          week: 'Week 1-4',
          action: `${skillChanges[0].value} course + project`,
        });
        timeline.push({
          week: 'Week 5',
          action: 'Apply to 8 newly matched roles',
          probability: 'Interview probability: 65% → 80%',
        });
      }

      const result: SimulationResult = {
        currentOpportunities: currentEligible,
        newOpportunities: newEligible - currentEligible,
        matchScoreImprovements: matchScoreImprovements.slice(0, 3),
        unlockedFeatures,
        recommendedPath,
        timeline,
      };

      setSimulationResult(result);
      showToast('success', 'Simulation completed successfully!');
    } catch (error) {
      console.error('Error running simulation:', error);
      showToast('error', 'Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = () => {
    setSimulationChanges([]);
    setSimulationResult(null);
    setNewSkill('');
    setTargetCgpa('');
    setCertification('');
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
        </div>
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <SEO
        title="Career Path Simulator"
        description="Simulate what-if scenarios before making career decisions"
      />

      <div className="min-h-screen bg-black relative overflow-hidden pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-indigo-500/30 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-rose-500/20 rounded-full blur-[100px]"
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-6"
            >
              <Sparkles className="w-6 h-6 text-purple-400" />
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
                AI-Powered Career Planning
              </span>
            </motion.div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
              Career Path{' '}
              <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
                Simulator
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Simulate "What if?" scenarios before making career decisions and see real-time impact
              on your opportunities
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel - Current Profile & Simulation Controls */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Current Profile */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-xl font-bold text-white">Your Current Profile</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-slate-400">CGPA:</span>
                    <span className="text-white font-semibold">
                      {currentProfile.cgpa.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-slate-400 block mb-2">Skills:</span>
                    <div className="flex flex-wrap gap-2">
                      {currentProfile.skills.length > 0 ? (
                        currentProfile.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm border border-indigo-500/30"
                          >
                            {skill.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 text-sm">No skills added yet</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-slate-400">Eligible for:</span>
                    <span className="text-green-400 font-semibold">
                      {currentProfile.eligibleOpportunities} opportunities
                    </span>
                  </div>
                </div>
              </div>

              {/* Simulate Changes */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                <div className="flex items-center gap-2 mb-6">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-bold text-white">Simulate Changes</h2>
                </div>

                <div className="space-y-6">
                  {/* Add Skill */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Add Skill
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={e => setNewSkill(e.target.value)}
                        placeholder="e.g., SQL, React, AWS"
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        onKeyPress={e => e.key === 'Enter' && addSkillChange()}
                      />
                      <select
                        value={newSkillLevel}
                        onChange={e => setNewSkillLevel(e.target.value as any)}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <Button
                      onClick={addSkillChange}
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                    >
                      Add Skill
                    </Button>
                  </div>

                  {/* Raise CGPA */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Raise CGPA to
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={targetCgpa}
                      onChange={e => setTargetCgpa(e.target.value)}
                      placeholder="e.g., 7.5"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      onKeyPress={e => e.key === 'Enter' && addCgpaChange()}
                    />
                    <Button
                      onClick={addCgpaChange}
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                    >
                      Set Target CGPA
                    </Button>
                  </div>

                  {/* Complete Certification */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Complete Certification
                    </label>
                    <input
                      type="text"
                      value={certification}
                      onChange={e => setCertification(e.target.value)}
                      placeholder="e.g., AWS Certified Developer"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      onKeyPress={e => e.key === 'Enter' && addCertificationChange()}
                    />
                    <Button
                      onClick={addCertificationChange}
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                    >
                      Add Certification
                    </Button>
                  </div>

                  {/* Selected Changes */}
                  {simulationChanges.length > 0 && (
                    <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                      <h3 className="text-sm font-semibold text-slate-300 mb-3">
                        Selected Changes:
                      </h3>
                      <div className="space-y-2">
                        {simulationChanges.map((change, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5"
                          >
                            <span className="text-white text-sm">
                              {change.type === 'skill' &&
                                `Add skill: ${change.value} (${change.level})`}
                              {change.type === 'cgpa' && `Raise CGPA to: ${change.value}`}
                              {change.type === 'certification' && `Complete: ${change.value}`}
                            </span>
                            <button
                              onClick={() => removeChange(idx)}
                              className="text-rose-400 hover:text-rose-300 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={runSimulation}
                      loading={loading}
                      variant="primary"
                      fullWidth
                      rightIcon={<Sparkles className="w-5 h-5" />}
                    >
                      Run Simulation
                    </Button>
                    {simulationResult && (
                      <Button onClick={resetSimulation} variant="outline" className="px-6">
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Panel - Simulation Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {!simulationResult ? (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center hover:border-white/20 transition-all">
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20"
                  >
                    <TrendingUp className="w-10 h-10 text-purple-400" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-3">No Simulation Yet</h3>
                  <p className="text-slate-400">
                    Add changes on the left and click "Run Simulation" to see the results
                  </p>
                </div>
              ) : (
                <>
                  {/* Simulation Results Header */}
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="w-6 h-6 text-purple-400" />
                      <h2 className="text-xl font-bold text-white">Simulation Results</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-slate-400 text-sm mb-1">New Opportunities</p>
                        <p className="text-3xl font-bold text-green-400">
                          +{simulationResult.newOpportunities}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">unlocked</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-slate-400 text-sm mb-1">Total Eligible</p>
                        <p className="text-3xl font-bold text-indigo-400">
                          {simulationResult.currentOpportunities +
                            simulationResult.newOpportunities}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">opportunities</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Match Score Improvements */}
                  {simulationResult.matchScoreImprovements.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        Match Score Improvements
                      </h3>
                      <div className="space-y-3">
                        {simulationResult.matchScoreImprovements.map((improvement, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-white/5 rounded-lg border border-white/5"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-white">
                                {improvement.company}
                              </span>
                              <span className="text-green-400 text-sm font-medium">
                                +{improvement.after - improvement.before}%
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-rose-500 rounded-full"
                                    style={{ width: `${improvement.before}%` }}
                                  />
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-500" />
                              <div className="flex-1">
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: `${improvement.after}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between mt-1 text-xs">
                              <span className="text-rose-400">{improvement.before}%</span>
                              <span className="text-green-400">{improvement.after}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unlocked Features */}
                  {simulationResult.unlockedFeatures.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        Unlocked Features
                      </h3>
                      <div className="space-y-2">
                        {simulationResult.unlockedFeatures.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5"
                          >
                            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Path */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      Recommended Path
                    </h3>
                    <div className="space-y-4">
                      {simulationResult.recommendedPath.map((step, idx) => (
                        <div key={idx} className="relative pl-8">
                          <div className="absolute left-0 top-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-500/50">
                            {step.priority}
                          </div>
                          <div className="p-4 bg-white/5 rounded-lg border-l-4 border-purple-500">
                            <h4 className="font-semibold text-white mb-2">{step.action}</h4>
                            <p className="text-sm text-slate-400 mb-2">
                              {step.effort} → {step.impact}
                            </p>
                            {step.immediateOpportunities && (
                              <div className="flex items-center gap-2 text-xs text-green-400">
                                <ArrowRight className="w-3 h-3" />
                                Unlocks {step.immediateOpportunities} immediate opportunities
                              </div>
                            )}
                            {step.longTermOpportunities && (
                              <div className="flex items-center gap-2 text-xs text-indigo-400">
                                <ArrowRight className="w-3 h-3" />
                                Unlocks {step.longTermOpportunities} more (long-term)
                              </div>
                            )}
                          </div>
                          {idx < simulationResult.recommendedPath.length - 1 && (
                            <div className="absolute left-3 top-8 w-0.5 h-8 bg-purple-500/30" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Timeline */}
                  {simulationResult.timeline.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-400" />
                        Estimated Timeline
                      </h3>
                      <div className="space-y-3">
                        {simulationResult.timeline.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-white/5 rounded-lg border border-white/5"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-indigo-400">{item.week}</span>
                            </div>
                            <p className="text-slate-300 text-sm">{item.action}</p>
                            {item.probability && (
                              <p className="text-slate-500 text-xs mt-1">{item.probability}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default CareerPathSimulatorPage;
