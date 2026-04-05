import React, { useState } from 'react';
import { Upload, X, FileText, Download, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadResume, deleteResume, downloadResume } from '../../services/storageService';
import { useToast } from '../../contexts/ToastContext';

interface ResumeUploadProps {
  userId: string;
  currentResumeUrl?: string;
  onUploadComplete: (url: string) => void;
  onDelete: () => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({
  userId,
  currentResumeUrl,
  onUploadComplete,
  onDelete,
}) => {
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      showToast('error', 'Only PDF files are allowed');
      return;
    }

    if (file.size > 10485760) {
      showToast('error', 'File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadResume(userId, file);
      if (url) {
        showToast('success', 'Resume uploaded successfully');
        onUploadComplete(url);
      } else {
        showToast('error', 'Failed to upload resume');
      }
    } catch (error) {
      showToast('error', 'An error occurred while uploading');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentResumeUrl) return;

    setDeleting(true);
    try {
      const success = await deleteResume(userId, currentResumeUrl);
      if (success) {
        showToast('success', 'Resume deleted successfully');
        onDelete();
      } else {
        showToast('error', 'Failed to delete resume');
      }
    } catch (error) {
      showToast('error', 'An error occurred while deleting');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async () => {
    if (!currentResumeUrl) return;

    try {
      await downloadResume(currentResumeUrl, `resume-${userId}.pdf`);
      showToast('success', 'Resume downloaded');
    } catch (error) {
      showToast('error', 'Failed to download resume');
    }
  };

  return (
    <div className="space-y-4">
      {currentResumeUrl ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neon-purple/10 rounded-lg">
                <FileText className="text-neon-purple" size={24} />
              </div>
              <div>
                <p className="font-medium">Resume Uploaded</p>
                <p className="text-sm text-slate-400">PDF Document</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title="Download"
              >
                <Download size={20} />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 hover:bg-rose-500/10 text-rose-400 rounded-lg transition-colors disabled:opacity-50"
                title="Delete"
              >
                {deleting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-rose-400"></div>
                ) : (
                  <Trash2 size={20} />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
            dragActive
              ? 'border-neon-purple bg-neon-purple/5'
              : 'border-slate-700 hover:border-slate-600'
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            id="resume-upload"
          />

          <div className="text-center">
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-purple"></div>
                <p className="text-sm text-slate-400">Uploading resume...</p>
              </div>
            ) : (
              <>
                <Upload className="mx-auto mb-4 text-slate-400" size={48} />
                <p className="text-lg font-medium mb-2">Upload Resume</p>
                <p className="text-sm text-slate-400 mb-4">
                  Drag and drop your PDF here, or click to browse
                </p>
                <p className="text-xs text-slate-500">Maximum file size: 10MB • Format: PDF only</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
