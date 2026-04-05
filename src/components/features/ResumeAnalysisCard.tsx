import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Target,
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
  Calendar,
} from 'lucide-react';
import { ResumeAnalysis, SectionScore } from '../../types';

interface ResumeAnalysisCardProps {
  analysis: ResumeAnalysis;
  onDelete?: (id: string) => void;
  onDownload?: (url: string, fileName: string) => void;
  onExportPDF?: (analysis: ResumeAnalysis) => void;
  showComparison?: boolean;
  previousAnalysis?: ResumeAnalysis;
}

const ResumeAnalysisCard: React.FC<ResumeAnalysisCardProps> = ({
  analysis,
  onDelete,
  onDownload,
  onExportPDF,
  showComparison: _showComparison,
  previousAnalysis: _previousAnalysis,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const _getScoreGradient = (score: number): string => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-amber-500';
    return 'from-red-500 to-rose-500';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  const renderScoreCircle = (score: number, size: 'small' | 'large' = 'large') => {
    const radius = size === 'large' ? 45 : 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="relative">
        <svg className={size === 'large' ? 'w-32 h-32' : 'w-20 h-20'} viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-white/10"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            className="transition-all duration-1000"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                className={
                  score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500'
                }
                stopColor="currentColor"
              />
              <stop
                offset="100%"
                className={
                  score >= 80
                    ? 'text-emerald-500'
                    : score >= 60
                      ? 'text-amber-500'
                      : 'text-rose-500'
                }
                stopColor="currentColor"
              />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div
              className={`font-bold ${size === 'large' ? 'text-2xl' : 'text-lg'} ${getScoreColor(score)}`}
            >
              {score}
            </div>
            {size === 'large' && <div className="text-xs text-slate-400">/ 100</div>}
          </div>
        </div>
      </div>
    );
  };

  const renderSectionScore = (section: SectionScore) => (
    <div key={section.name} className="p-4 rounded-lg bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm">{section.name}</h4>
        <div className="flex items-center gap-2">{renderScoreCircle(section.score, 'small')}</div>
      </div>
      <p className="text-xs text-slate-400 mb-2">{section.feedback}</p>

      {section.strengths.length > 0 && (
        <div className="mb-2">
          <div className="text-xs font-semibold text-green-400 mb-1">✓ Strengths:</div>
          <ul className="text-xs text-slate-300 space-y-1">
            {section.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {section.improvements.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-amber-400 mb-1">→ Improvements:</div>
          <ul className="text-xs text-slate-300 space-y-1">
            {section.improvements.map((i, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <AlertCircle className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-gradient-to-br from-purple-900/20 via-black/40 to-pink-900/20 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 overflow-hidden shadow-2xl transition-all"
    >
      {/* Header */}
      <div className="p-6 border-b border-purple-500/10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">{analysis.file_name}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <Calendar className="w-3 h-3" />
                {new Date(analysis.analyzed_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {onDownload && (
              <button
                onClick={() => onDownload(analysis.resume_url, analysis.file_name)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                title="Download Resume"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            {onExportPDF && (
              <button
                onClick={() => onExportPDF(analysis)}
                className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 transition-colors"
                title="Export Analysis as PDF"
              >
                <FileText className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(analysis.id)}
                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-colors"
                title="Delete Analysis"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Score Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Overall Score */}
          <div className="flex flex-col items-center p-4 rounded-xl backdrop-blur-sm bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            {renderScoreCircle(analysis.overall_score)}
            <div className="text-center mt-2">
              <div className="text-sm font-semibold">Overall Score</div>
              <div className="text-xs text-slate-400">Resume Quality</div>
            </div>
          </div>

          {/* ATS Score */}
          <div className="flex flex-col items-center p-4 rounded-xl backdrop-blur-sm bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            {renderScoreCircle(analysis.ats_score)}
            <div className="text-center mt-2">
              <div className="text-sm font-semibold">ATS Score</div>
              <div className="text-xs text-slate-400">System Compatibility</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-col justify-center p-4 rounded-xl backdrop-blur-sm bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-sm">
                {analysis.analysis_data.sectionScores.filter(s => s.score >= 80).length} /{' '}
                {analysis.analysis_data.sectionScores.length} sections strong
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-sm">{analysis.suggestions.length} suggestions</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm">
                {analysis.analysis_data.atsAnalysis.isATSFriendly
                  ? 'ATS Friendly'
                  : 'Needs ATS Work'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Suggestions */}
      <div className="p-6 border-b border-purple-500/10 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-rose-500/5">
        <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          Top Suggestions
        </h4>
        <div className="space-y-2">
          {analysis.suggestions.slice(0, 3).map((suggestion, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg backdrop-blur-sm bg-white/5 border border-purple-500/20 text-sm text-slate-300 hover:border-purple-500/40 transition-all"
            >
              <span className="text-amber-400 mr-2">●</span>
              {suggestion}
            </div>
          ))}
        </div>
        {analysis.suggestions.length > 3 && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 font-medium"
          >
            View all {analysis.suggestions.length} suggestions
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="p-6 space-y-6"
        >
          {/* All Suggestions */}
          {analysis.suggestions.length > 3 && (
            <div>
              <h4 className="font-semibold mb-3">All Suggestions</h4>
              <div className="space-y-2">
                {analysis.suggestions.slice(3).map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section Scores */}
          <div>
            <h4 className="font-semibold mb-3">Section Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysis.analysis_data.sectionScores.map(renderSectionScore)}
            </div>
          </div>

          {/* ATS Analysis */}
          <div className={`p-4 rounded-lg border-2 ${getScoreBg(analysis.ats_score)}`}>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              ATS Compatibility Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-2">DETECTED SECTIONS</div>
                <div className="flex flex-wrap gap-2">
                  {analysis.analysis_data.atsAnalysis.detectedSections.map((section, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs border border-green-500/30"
                    >
                      ✓ {section}
                    </span>
                  ))}
                </div>
              </div>
              {analysis.analysis_data.atsAnalysis.missingSections.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2">MISSING SECTIONS</div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.analysis_data.atsAnalysis.missingSections.map((section, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs border border-amber-500/30"
                      >
                        ⚠ {section}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {analysis.analysis_data.atsAnalysis.recommendations.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-slate-400 mb-2">RECOMMENDATIONS</div>
                <ul className="space-y-1">
                  {analysis.analysis_data.atsAnalysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-neon-purple">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Keyword Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <h5 className="text-sm font-semibold text-green-400 mb-2">✓ Keywords Found</h5>
              <div className="flex flex-wrap gap-2">
                {analysis.analysis_data.keywordAnalysis.found.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded bg-green-500/20 text-green-300 text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <h5 className="text-sm font-semibold text-amber-400 mb-2">⚠ Missing Keywords</h5>
              <div className="flex flex-wrap gap-2">
                {analysis.analysis_data.keywordAnalysis.missing.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(false)}
            className="w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-2"
          >
            Show Less
            <ChevronUp className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ResumeAnalysisCard;
