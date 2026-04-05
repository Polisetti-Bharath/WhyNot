import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Application, StudentProfile } from '../../types';
import { generateRejectionExplanation, RejectionAnalysis } from '../../services/geminiService';
import { FileText, Target, Sparkles } from 'lucide-react';

interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  student: StudentProfile;
}

const ExplanationModal: React.FC<ExplanationModalProps> = ({
  isOpen,
  onClose,
  application,
  student,
}) => {
  const [explanation, setExplanation] = useState<RejectionAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Keyboard support and body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEsc);
      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && application && application.status === 'REJECTED') {
      const fetchExplanation = async () => {
        setLoading(true);
        try {
          const job = application.job || (application as any).opportunity;

          if (!job) {
            throw new Error('Job details not found');
          }

          // Safely extract skills
          const studentSkills = Array.isArray(student.skills)
            ? student.skills.map(s => s?.name || '').filter(Boolean)
            : [];

          const jobRequiredSkills = job.requiredSkills || job.required_skills || [];
          const requiredSkillNames = Array.isArray(jobRequiredSkills)
            ? jobRequiredSkills
                .map((s: any) => (typeof s === 'string' ? s : s?.name || ''))
                .filter(Boolean)
            : [];

          const reqData = {
            studentName: student.name || 'Student',
            studentSkills: studentSkills,
            studentCgpa: typeof student.cgpa === 'number' ? student.cgpa : 0,
            jobRole: job.role || job.title || 'Position',
            jobCompany: job.company || job.company_name || 'Company',
            jobRequiredSkills: requiredSkillNames,
            jobMinCgpa:
              typeof (job.minCgpa || job.min_cgpa) === 'number' ? job.minCgpa || job.min_cgpa : 0,
          };

          const result = await generateRejectionExplanation(reqData, student.id);
          setExplanation(result);
        } catch (error) {
          console.error('Explanation fetch error:', error);
          // Set error state
          setExplanation({
            type: 'NON_RULE_BASED',
            coreMismatch: 'Unable to generate analysis',
            keyMissingSkills: [],
            resumeFeedback: ['Analysis temporarily unavailable'],
            actionPlan: ['Try again later'],
            sentiment: 'Service error occurred',
          });
        } finally {
          setLoading(false);
        }
      };

      fetchExplanation();
    } else {
      setExplanation(null);
    }
  }, [isOpen, application, student]);

  if (!isOpen || !application) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="explanation-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/10 text-white"
            role="document"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50">
                  <AlertTriangle className="w-5 h-5 text-red-400" aria-hidden="true" />
                </div>
                <div>
                  <h2
                    id="explanation-modal-title"
                    className="text-xl font-bold font-mono tracking-tight"
                  >
                    Application Analysis
                  </h2>
                  <p className="text-sm text-slate-400">
                    {application.job.role} @ {application.job.company}
                  </p>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6 text-slate-400" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Col: Data Comparison */}
              <div className="p-8 space-y-8 border-r border-white/10 bg-slate-900/50">
                <h3 className="text-lg font-semibold text-slate-300 mb-4">Requirements Match</h3>

                {/* Skills Comparison */}
                <div className="space-y-4">
                  <div className="flex justify-between text-sm uppercase tracking-wider text-slate-500 font-mono">
                    <span>Required Skills</span>
                    <span>Your Status</span>
                  </div>
                  {application.job.requiredSkills.map(reqSkill => {
                    const hasSkill = student.skills.find(s => s.name === reqSkill.name);
                    return (
                      <div
                        key={reqSkill.name}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5"
                      >
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

                {/* CGPA Comparison */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm uppercase tracking-wider text-slate-500 font-mono mb-2">
                    <span>CGPA Threshold</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                    <div>
                      <span className="text-xs text-slate-400 block">Minimum Required</span>
                      <span className="text-lg font-bold text-white">
                        {application.job.minCgpa}
                      </span>
                    </div>
                    <ArrowRight className="text-slate-500" />
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Your Score</span>
                      <span
                        className={`text-lg font-bold ${student.cgpa >= application.job.minCgpa ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {student.cgpa}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Col: AI Explanation */}
              <div className="p-8 relative overflow-hidden bg-black/40 flex flex-col justify-center overflow-y-auto max-h-[600px]">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/20 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-purple/20 blur-[80px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <Cpu className="w-5 h-5 text-neon-purple animate-pulse" />
                    <h3 className="text-lg font-bold gradient-text">Gemini Intelligence Engine</h3>
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
                              <span
                                key={idx}
                                className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-sm text-red-300"
                              >
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
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-sm text-slate-300"
                              >
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
                              <div
                                key={idx}
                                className="flex gap-3 p-3 bg-white/5 rounded-lg border border-white/5"
                              >
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
                        <p className="text-sm text-slate-300 italic">"{explanation.sentiment}"</p>
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ExplanationModal;
