import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Cpu, AlertTriangle, CheckCircle, ArrowRight, Download, 
  TrendingUp, Target, Lightbulb, BarChart3, FileText, Sparkles 
} from 'lucide-react';
import { Application, StudentProfile } from '../../types';
import { 
  generateRejectionExplanation, 
  generateBulkRejectionAnalysis, 
  formatAnalysisForExport,
  PatternAnalysis,
  RejectionAnalysis
} from '../../services/geminiService';
import { supabase } from '../../services/supabaseClient';

interface RejectionAnalysisHubProps {
  isOpen: boolean;
  onClose: () => void;
  application?: Application | null; // Single application
  applications?: Application[]; // Multiple applications for bulk analysis
  student: StudentProfile;
  mode: 'single' | 'bulk';
}

const RejectionAnalysisHub: React.FC<RejectionAnalysisHubProps> = ({ 
  isOpen, 
  onClose, 
  application, 
  applications = [],
  student,
  mode 
}) => {
  const [explanation, setExplanation] = useState<RejectionAnalysis | null>(null);
  const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'patterns' | 'history'>('analysis');
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);

  // Fetch analysis on open
  useEffect(() => {
    if (isOpen) {
      if (mode === 'single' && application && application.status === 'REJECTED') {
        fetchSingleAnalysis();
      } else if (mode === 'bulk' && applications.length > 0) {
        fetchBulkAnalysis();
      }
      fetchAnalysisHistory();
    } else {
      setExplanation(null);
      setPatternAnalysis(null);
    }
  }, [isOpen, application, applications, mode]);

  const fetchSingleAnalysis = async () => {
    if (!application) return;
    
    setLoading(true);
    try {
      const job = application.job || (application as any).opportunity;
      if (!job) throw new Error('Job details not found');

      // Use snapshot data from application if available (for trust/consistency)
      // Fallback to current profile if snapshot not available (legacy applications)
      const useSnapshot = application.snapshot_cgpa !== undefined;
      const snapshotSkills = application.snapshot_skills || student.skills || [];
      const snapshotCgpa = application.snapshot_cgpa ?? student.cgpa;

      // Prepare skill confidence data from snapshot with better null safety
      const skillConfidenceData = Array.isArray(snapshotSkills) 
        ? snapshotSkills.map((s: any) => ({
            name: s?.name || 'Unknown',
            confidence: s?.confidence || s?.level || 'Beginner',
            evidence: Array.isArray(s?.evidence) ? s.evidence.map((e: any) => e?.type || 'Unknown') : []
          })).filter(s => s.name !== 'Unknown')
        : [];

      // Extract required skills with better error handling
      const jobRequiredSkills = job.requiredSkills || job.required_skills || [];
      const requiredSkillNames = Array.isArray(jobRequiredSkills)
        ? jobRequiredSkills.map((s: any) => typeof s === 'string' ? s : (s?.name || '')).filter(Boolean)
        : [];

      const reqData = {
        studentName: student.name || 'Student',
        studentSkills: Array.isArray(snapshotSkills) 
          ? snapshotSkills.map((s: any) => s?.name || '').filter(Boolean)
          : [],
        studentCgpa: typeof snapshotCgpa === 'number' ? snapshotCgpa : 0,
        jobRole: job.role || job.title || 'Position',
        jobCompany: job.company || job.company_name || 'Company',
        jobRequiredSkills: requiredSkillNames,
        jobMinCgpa: typeof (job.minCgpa || job.min_cgpa) === 'number' ? (job.minCgpa || job.min_cgpa) : 0,
        jobDescription: job.description || '',
        resumeText: student.resume || '',
        skillConfidenceData: skillConfidenceData,
        isSnapshot: useSnapshot // Flag to indicate snapshot data is being used
      };
      
      const result = await generateRejectionExplanation(reqData, student.id);
      setExplanation(result);
      
      // Save to database
      await saveAnalysis(JSON.stringify(result), application.id, 'single');
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Set a user-friendly error explanation
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setExplanation({
        type: 'NON_RULE_BASED',
        coreMismatch: 'Unable to generate AI analysis at this time. Please try again later.',
        keyMissingSkills: [],
        resumeFeedback: ['Analysis service is temporarily unavailable'],
        actionPlan: [
          'Try again in a few moments',
          'Check your internet connection',
          'Contact support if the issue persists'
        ],
        sentiment: `Error: ${errorMessage}. This analysis is based on declared profile data and listed eligibility criteria.`
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBulkAnalysis = async () => {
    setLoading(true);
    try {
      const rejectedApps = applications.filter(a => a.status === 'REJECTED');
      
      if (rejectedApps.length === 0) {
        setPatternAnalysis({
          commonMissingSkills: [],
          cgpaIssues: false,
          improvementPriorities: ['No rejected applications to analyze'],
          industryInsights: 'Keep applying to opportunities to build your application history.'
        });
        setActiveTab('patterns');
        setLoading(false);
        return;
      }
      
      const bulkData = {
        studentName: student.name || 'Student',
        studentSkills: Array.isArray(student.skills) 
          ? student.skills.map(s => s?.name || '').filter(Boolean)
          : [],
        studentCgpa: typeof student.cgpa === 'number' ? student.cgpa : 0,
        rejections: rejectedApps.map(app => {
          const job = app.job || (app as any).opportunity;
          const requiredSkills = job?.requiredSkills || job?.required_skills || [];
          return {
            jobRole: job?.role || job?.title || 'Unknown Role',
            jobCompany: job?.company || job?.company_name || 'Unknown Company',
            jobRequiredSkills: Array.isArray(requiredSkills)
              ? requiredSkills.map((s: any) => typeof s === 'string' ? s : (s?.name || '')).filter(Boolean)
              : [],
            jobMinCgpa: typeof (job?.minCgpa || job?.min_cgpa) === 'number' 
              ? (job.minCgpa || job.min_cgpa) 
              : 0,
            rejectionDate: app.appliedDate || (app as any).created_at
          };
        }).filter(r => r.jobRole !== 'Unknown Role')
      };
      
      const result = await generateBulkRejectionAnalysis(bulkData, student.id);
      setPatternAnalysis(result);
      setActiveTab('patterns');
      
      // Save bulk analysis
      await saveAnalysis(JSON.stringify(result), null, 'bulk', result);
    } catch (error) {
      console.error('Bulk analysis error:', error);
      
      // Set error state for pattern analysis
      setPatternAnalysis({
        commonMissingSkills: [],
        cgpaIssues: false,
        improvementPriorities: ['Analysis service is temporarily unavailable'],
        industryInsights: 'Unable to generate pattern analysis. Please try again later.'
      });
      setActiveTab('patterns');
    } finally {
      setLoading(false);
    }
  };

  const saveAnalysis = async (
    analysisText: string, 
    applicationId: string | null, 
    type: 'single' | 'bulk',
    patternData?: any
  ) => {
    try {
      await supabase.from('rejection_analyses').insert({
        student_id: student.id,
        application_id: applicationId,
        analysis_type: type,
        analysis_text: analysisText,
        pattern_data: patternData || null
      });
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  };

  const fetchAnalysisHistory = async () => {
    try {
      const { data } = await supabase
        .from('rejection_analyses')
        .select('*')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      setAnalysisHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleExport = () => {
    if (!application || !explanation) return;
    
    // Convert object to string for export
    const explanationText = `
Core Mismatch: ${explanation.coreMismatch}

Key Missing Skills:
${explanation.keyMissingSkills.map(s => `- ${s}`).join('\n')}

Improvement Suggestions:
${explanation.improvementSuggestions.map(s => `- ${s}`).join('\n')}

Action Plan:
${explanation.actionPlan.map(s => `- ${s}`).join('\n')}

Sentiment: ${explanation.sentiment}
    `.trim();

    const exportText = formatAnalysisForExport(
      student.name,
      explanationText,
      { role: application.job.role, company: application.job.company }
    );
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rejection-analysis-${application.job.company}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-6xl glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/10 text-white max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-purple flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-mono tracking-tight gradient-text">
                  {mode === 'bulk' ? 'Pattern Analysis Hub' : 'AI Rejection Analysis'}
                </h2>
                <p className="text-sm text-slate-400">
                  {mode === 'bulk' 
                    ? `Analyzing ${applications.filter(a => a.status === 'REJECTED').length} rejections` 
                    : application ? `${application.job.role} @ ${application.job.company}` : ''}
                </p>
                {mode === 'single' && application && (
                  <>
                    <div className="mt-1 flex items-center gap-1 text-xs text-purple-400">
                      <CheckCircle className="w-3 h-3" />
                      <span>Decision-specific analysis (takes precedence over general resume feedback)</span>
                    </div>
                    {application.snapshot_cgpa !== undefined && (
                      <div className="mt-1 flex items-center gap-1 text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded">
                        <Target className="w-3 h-3" />
                        <span>Based on your profile at time of application</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 px-6 pt-4 border-b border-white/10">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === 'analysis' 
                  ? 'bg-white/10 text-white border-b-2 border-neon-purple' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Analysis
              </div>
            </button>
            {mode === 'bulk' && (
              <button
                onClick={() => setActiveTab('patterns')}
                className={`px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === 'patterns' 
                    ? 'bg-white/10 text-white border-b-2 border-neon-purple' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Patterns
                </div>
              </button>
            )}
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === 'history' 
                  ? 'bg-white/10 text-white border-b-2 border-neon-purple' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                History
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Empty State for No Rejections in Bulk Mode */}
            {mode === 'bulk' && applications.filter(a => a.status === 'REJECTED').length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-16 px-8 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Great News!</h3>
                <p className="text-slate-400 max-w-md mb-6">
                  You don&apos;t have any rejections yet. Keep applying to opportunities and we&apos;ll help you analyze patterns if needed.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-purple rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-neon-purple/50 transition-all"
                >
                  Browse Opportunities
                </button>
              </div>
            )}

            {activeTab === 'analysis' && mode === 'single' && application && (
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left: Requirements Match */}
                <div className="p-8 space-y-6 border-r border-white/10 bg-slate-900/50">
                  <h3 className="text-lg font-semibold text-slate-300 mb-4">Requirements Match</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm uppercase tracking-wider text-slate-500 font-mono">
                      <span>Required Skills</span>
                      <span>Your Status</span>
                    </div>
                    {(application.job.requiredSkills || (application.job as any).required_skills || []).map((reqSkill: any) => {
                      const hasSkill = student.skills.find(s => s.name === reqSkill.name);
                      return (
                        <div key={reqSkill.name} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                          <span className="font-medium text-slate-200">{reqSkill.name}</span>
                          {hasSkill ? (
                            <span className="flex items-center gap-2 text-green-400 text-sm">
                              <CheckCircle className="w-4 h-4" /> Match
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 text-red-400 text-sm">
                              <X className="w-4 h-4" /> Missing
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between text-sm uppercase tracking-wider text-slate-500 font-mono mb-2">
                      <span>CGPA Threshold</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                      <div>
                        <span className="text-xs text-slate-400 block">Required</span>
                        <span className="text-lg font-bold text-white">{application.job.minCgpa || (application.job as any).min_cgpa}</span>
                      </div>
                      <ArrowRight className="text-slate-500" />
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Your Score</span>
                        <span className={`text-lg font-bold ${student.cgpa >= (application.job.minCgpa || (application.job as any).min_cgpa) ? 'text-green-400' : 'text-red-400'}`}>
                          {student.cgpa}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: AI Explanation */}
                <div className="p-8 relative overflow-hidden bg-black/40 overflow-y-auto max-h-[600px]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/20 blur-[80px] rounded-full pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-purple/20 blur-[80px] rounded-full pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                      <Cpu className="w-5 h-5 text-neon-purple animate-pulse" />
                      <h3 className="text-lg font-bold gradient-text">Gemini Intelligence</h3>
                    </div>

                    {loading ? (
                      <div className="space-y-4">
                        <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                        <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
                        <div className="h-4 bg-white/10 rounded w-5/6 animate-pulse" />
                      </div>
                    ) : explanation ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                      >
                        {/* Rejection Type Badge */}
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                            explanation.type === 'RULE_BASED' 
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {explanation.type === 'RULE_BASED' ? '⚠️ Rule-Based Rejection' : 'ℹ️ Non-Rule-Based Rejection'}
                          </span>
                        </div>

                        {/* Type Explanation */}
                        {explanation.type === 'NON_RULE_BASED' && (
                          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <h4 className="text-sm font-semibold text-blue-400 mb-2">About this rejection</h4>
                            <p className="text-sm text-slate-300">
                              You met the listed eligibility criteria. The rejection may be due to limited openings, 
                              internal preferences, or company-side screening processes. This is subjective and doesn't 
                              necessarily reflect your qualifications.
                            </p>
                          </div>
                        )}

                        {/* Rule Violations (if any) */}
                        {explanation.violations && explanation.violations.length > 0 && (
                          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              Eligibility Issues
                            </h4>
                            <div className="space-y-2">
                              {explanation.violations.map((violation, idx) => (
                                <div key={idx} className="p-3 bg-black/30 rounded-lg">
                                  <div className="text-xs text-slate-400 mb-1">{violation.category}</div>
                                  <div className="text-sm text-white font-medium mb-1">{violation.description}</div>
                                  <div className="flex items-center gap-4 text-xs">
                                    <span className="text-slate-400">Expected: <span className="text-green-400">{violation.expected}</span></span>
                                    <span className="text-slate-400">Actual: <span className="text-red-400">{violation.actual}</span></span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Skill Gaps with Confidence Levels */}
                        {explanation.skillGaps && explanation.skillGaps.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              Skill Confidence Mismatches
                            </h4>
                            <div className="space-y-2">
                              {explanation.skillGaps.map((gap, idx) => (
                                <div key={idx} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-white">{gap.skill}</span>
                                    <div className="flex items-center gap-2 text-xs">
                                      {gap.studentLevel && (
                                        <span className="px-2 py-1 bg-amber-500/20 rounded">
                                          Your Level: {gap.studentLevel}
                                        </span>
                                      )}
                                      <span className="px-2 py-1 bg-green-500/20 rounded">
                                        Required: {gap.required}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-300">{gap.suggestion}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Core Mismatch */}
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <h4 className="text-sm font-semibold text-slate-300 mb-2">Core Mismatch</h4>
                          <p className="text-white font-medium">{explanation.coreMismatch}</p>
                        </div>

                        {/* Missing Skills */}
                        {explanation.keyMissingSkills.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              Key Missing Skills
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {explanation.keyMissingSkills.map((skill, idx) => (
                                <span key={idx} className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-sm text-red-300">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Resume Feedback */}
                        {explanation.resumeFeedback.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Resume Feedback
                            </h4>
                            <ul className="space-y-2">
                              {explanation.resumeFeedback.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                  <span className="text-amber-400 mt-1">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Action Plan */}
                        {explanation.actionPlan.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              Action Plan
                            </h4>
                            <div className="space-y-3">
                              {explanation.actionPlan.map((step, idx) => (
                                <div key={idx} className="flex gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">
                                    {idx + 1}
                                  </span>
                                  <span className="text-sm text-slate-300">{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sentiment */}
                        <div className="p-4 bg-neon-purple/10 border border-neon-purple/20 rounded-lg">
                          <h4 className="text-xs font-mono uppercase text-neon-purple mb-2 flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            AI Insight
                          </h4>
                          <p className="text-sm text-slate-300 italic">
                            "{explanation.sentiment}"
                          </p>
                        </div>

                        {/* Trust Disclaimer */}
                        <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                          <p className="text-xs text-slate-400 italic text-center">
                            This explanation is based on declared profile data and listed eligibility criteria. Final hiring decisions may include additional factors.
                          </p>
                        </div>

                        {/* Export Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={handleExport}
                            className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2"
                            title="Export as text file"
                          >
                            <Download className="w-4 h-4" />
                            Export TXT
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="text-center py-10 text-slate-500">
                        <p>Unable to generate analysis.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'patterns' && mode === 'bulk' && applications.filter(a => a.status === 'REJECTED').length > 0 && (
              <div className="p-8 space-y-8">
                {loading ? (
                  <div className="space-y-4">
                    <div className="h-6 bg-white/10 rounded w-1/2 animate-pulse" />
                    <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
                  </div>
                ) : patternAnalysis ? (
                  <div className="grid gap-6">
                    {/* Common Missing Skills */}
                    <div className="glass-panel p-6 rounded-xl border border-white/10">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        Most Common Missing Skills
                      </h3>
                      <div className="space-y-3">
                        {patternAnalysis.commonMissingSkills.slice(0, 5).map((skill, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="font-medium text-slate-200">{skill.skill}</span>
                            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                              {skill.frequency} rejections
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Improvement Priorities */}
                    <div className="glass-panel p-6 rounded-xl border border-white/10">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-neon-purple" />
                        Top Improvement Priorities
                      </h3>
                      <ol className="space-y-3">
                        {patternAnalysis.improvementPriorities.map((priority, idx) => (
                          <li key={idx} className="flex gap-3 p-3 bg-white/5 rounded-lg">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center text-sm font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-slate-300">{priority}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Industry Insights */}
                    <div className="glass-panel p-6 rounded-xl border border-white/10">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        Industry Insights
                      </h3>
                      <p className="text-slate-300 leading-relaxed">
                        {patternAnalysis.industryInsights}
                      </p>
                    </div>

                    {patternAnalysis.cgpaIssues && (
                      <div className="glass-panel p-6 rounded-xl border border-yellow-500/30 bg-yellow-500/5">
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-yellow-400">
                          <AlertTriangle className="w-5 h-5" />
                          CGPA Improvement Needed
                        </h3>
                        <p className="text-slate-300">
                          Your CGPA is consistently below the minimum requirements for many opportunities. 
                          Focus on academic improvement alongside skill development.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-400">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Unable to generate pattern analysis.</p>
                    <p className="text-sm mt-2">Please try again later.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="p-8">
                <h3 className="text-lg font-semibold mb-4">Recent Analyses</h3>
                {analysisHistory.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No analysis history yet</p>
                ) : (
                  <div className="space-y-3">
                    {analysisHistory.map((item) => (
                      <div key={item.id} className="glass-panel p-4 rounded-lg border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-mono text-neon-purple">
                            {item.analysis_type.toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2">
                          {item.analysis_text.substring(0, 150)}...
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RejectionAnalysisHub;
