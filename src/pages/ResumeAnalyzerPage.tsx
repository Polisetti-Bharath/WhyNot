import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  Sparkles,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  XCircle,
  Loader,
} from 'lucide-react';
import PageTransition from '../components/common/PageTransition';
import ResumeAnalysisCard from '../components/features/ResumeAnalysisCard';
import { ResumeAnalysis } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  analyzeAndSaveResume,
  getUserResumeAnalyses,
  deleteResumeAnalysis,
  compareResumeAnalyses,
} from '../services/resumeAnalyzerService';

const ResumeAnalyzerPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [analyses, setAnalyses] = useState<ResumeAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadAnalyses();
    }
  }, [user?.id]);

  const loadAnalyses = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await getUserResumeAnalyses(user.id);
      setAnalyses(data);
    } catch (error) {
      console.error('Error loading analyses:', error);
      showToast('error', 'Failed to load resume analyses');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const fileName = file.name.toLowerCase();
    const isValidType =
      validTypes.includes(file.type) || validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidType) {
      showToast('error', 'Please upload a PDF, DOCX, or TXT file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !user?.id) return;

    try {
      setAnalyzing(true);
      const analysis = await analyzeAndSaveResume(selectedFile, user.id, targetRole || 'General');

      showToast('success', 'Resume analyzed successfully!');
      setAnalyses([analysis, ...analyses]);
      setSelectedFile(null);
      setTargetRole('');
    } catch (error: any) {
      console.error('Error analyzing resume:', error);
      showToast('error', error.message || 'Failed to analyze resume');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;

    try {
      await deleteResumeAnalysis(id);
      setAnalyses(analyses.filter(a => a.id !== id));
      showToast('success', 'Analysis deleted successfully');
    } catch (error) {
      console.error('Error deleting analysis:', error);
      showToast('error', 'Failed to delete analysis');
    }
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-purple mx-auto mb-4"></div>
          <p className="text-slate-400">Loading analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-black relative overflow-hidden pt-28">
        <div className="relative z-10 max-w-[1800px] mx-auto p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                AI Resume Analyzer
              </h1>
            </div>
            <p className="text-slate-300 text-lg mb-4">
              Upload your resume and get instant AI-powered feedback to improve your chances of
              passing ATS systems
            </p>
            <div className="flex items-center gap-2 mt-3 px-4 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl inline-flex">
              <AlertCircle className="w-4 h-4 text-purple-400" />
              <p className="text-sm text-slate-300">
                <strong className="text-white">General Guidance:</strong> This provides broad
                improvement suggestions. For specific job rejection analysis, use the Rejection
                Coach (it takes precedence).
              </p>
            </div>
          </div>

          {/* Upload Section */}
          <div className="mb-8 p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl hover:border-purple-500/30 transition-all">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <Upload className="w-5 h-5 text-purple-400" />
              </div>
              Upload Resume
            </h2>

            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  dragActive
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/20 hover:border-purple-500/50 hover:bg-white/5'
                }`}
              >
                <Upload className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-semibold mb-2 text-white">
                  Drag & drop your resume here, or click to browse
                </p>
                <p className="text-sm text-slate-400 mb-4">
                  Supports PDF, DOCX, and TXT files (max 10MB)
                </p>
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.docx,.txt"
                  onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <label
                  htmlFor="resume-upload"
                  className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-rose-500 to-purple-500 cursor-pointer hover:scale-105 transition-transform font-semibold text-white shadow-lg shadow-purple-500/30"
                >
                  Choose File
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected File */}
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-purple-400" />
                    <div>
                      <div className="font-semibold text-white">{selectedFile.name}</div>
                      <div className="text-sm text-slate-400">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-red-400" />
                  </button>
                </div>

                {/* Target Role (Optional) */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">
                    Target Role <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    placeholder="e.g., Software Engineer, Data Analyst"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 transition-colors text-white placeholder:text-slate-600"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Specify a role to get more targeted keyword recommendations
                  </p>
                </div>

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full px-8 py-4 rounded-lg bg-gradient-to-r from-rose-500 to-purple-500 font-bold text-lg text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-purple-500/30"
                >
                  {analyzing ? (
                    <>
                      <Loader className="w-6 h-6 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      Analyze Resume
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Info Banner */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 border border-purple-500/30 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30">
                <AlertCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
              </div>
              <div className="text-sm text-slate-300">
                <span className="font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Powered by Google Gemini AI
                </span>
                <br />
                Your resume will be analyzed for ATS compatibility, keyword optimization, formatting
                issues, and actionable improvements. The analysis typically takes 10-20 seconds.
              </div>
            </div>
          </div>

          {/* Previous Analyses */}
          {analyses.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  Your Analyses
                  <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 text-sm font-semibold">
                    {analyses.length}
                  </span>
                </h2>

                {analyses.length >= 2 && (
                  <button
                    onClick={() => setShowComparison(!showComparison)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/30 transition-all text-sm font-medium text-white"
                  >
                    {showComparison ? 'Hide' : 'Show'} Comparison
                  </button>
                )}
              </div>

              {/* Comparison View */}
              {showComparison && analyses.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="mb-6 p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 border-2 border-purple-500/30 shadow-lg"
                >
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-white">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Progress Comparison
                  </h3>
                  {(() => {
                    const comparison = compareResumeAnalyses(analyses[1], analyses[0]);
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3 text-green-400">✓ Improvements</h4>
                          {comparison.improvements.length > 0 ? (
                            <ul className="space-y-2">
                              {comparison.improvements.map((imp, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                  <span>{imp}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-slate-400">No improvements detected</p>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3 text-amber-400">⚠ Areas to Work On</h4>
                          {comparison.remainingIssues.length > 0 ? (
                            <ul className="space-y-2">
                              {comparison.remainingIssues.map((issue, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                  <span>{issue}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-slate-400">All sections look good!</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              )}

              {/* Analysis Cards */}
              <div className="space-y-6">
                {analyses.map((analysis, idx) => (
                  <ResumeAnalysisCard
                    key={analysis.id}
                    analysis={analysis}
                    onDelete={handleDelete}
                    onDownload={handleDownload}
                    showComparison={showComparison && idx < analyses.length - 1}
                    previousAnalysis={idx < analyses.length - 1 ? analyses[idx + 1] : undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!analyzing && analyses.length === 0 && (
            <div className="text-center py-20">
              <FileText className="w-24 h-24 text-slate-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-3">No Analyses Yet</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                Upload your first resume to get started with AI-powered analysis and improve your
                chances of landing your dream job!
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ResumeAnalyzerPage;
