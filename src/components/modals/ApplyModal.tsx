import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { disableBodyScroll, enableBodyScroll } from '../../utils/mobileOptimization';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  opportunity: any;
}

const ApplyModal: React.FC<ApplyModalProps> = ({ isOpen, onClose, opportunity }) => {
  const { user } = useAuth();
  const { isMobile } = useResponsive();
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const firstInputRef = useRef<HTMLTextAreaElement>(null);

  // Focus management: trap focus inside modal
  useEffect(() => {
    if (isOpen) {
      // Focus the first input when modal opens
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);

      // Use mobile optimization utilities for scroll control
      if (isMobile) {
        disableBodyScroll();
      } else {
        document.body.style.overflow = 'hidden';
      }
    } else {
      if (isMobile) {
        enableBodyScroll();
      } else {
        document.body.style.overflow = 'unset';
      }
    }

    // Handle ESC key to close modal
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      if (isMobile) {
        enableBodyScroll();
      } else {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, onClose, isMobile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !opportunity) return;

    setIsSubmitting(true);
    try {
      await api.applyToOpportunity(opportunity.id, user.id, coverLetter);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setCoverLetter('');
      }, 2000);
    } catch (error: any) {
      console.error('Error applying:', error);
      alert(
        `Failed to apply: ${error?.message || error?.details || 'Unknown error'}. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${isMobile ? 'p-0' : 'p-4'}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="apply-modal-title"
          onClick={e => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: isMobile ? 1 : 0.95, y: isMobile ? '100%' : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: isMobile ? 1 : 0.95, y: isMobile ? '100%' : 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl ${
              isMobile ? 'w-full h-full rounded-none' : 'rounded-xl w-full max-w-lg max-h-[90vh]'
            }`}
            role="document"
          >
            <div
              className={`border-b border-slate-800 flex justify-between items-center ${isMobile ? 'p-4 sticky top-0 bg-slate-900 z-10' : 'p-6'}`}
            >
              <h2
                id="apply-modal-title"
                className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-xl'}`}
              >
                Apply for {opportunity?.title}
              </h2>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-2 -mr-2"
                aria-label="Close modal"
              >
                <X className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} />
              </button>
            </div>

            {isSuccess ? (
              <div
                className={`flex flex-col items-center text-center ${isMobile ? 'p-8' : 'p-12'}`}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4"
                >
                  <CheckCircle className="w-8 h-8" />
                </motion.div>
                <h3 className={`font-bold text-white mb-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                  Application Sent!
                </h3>
                <p className="text-slate-400">
                  Good luck! You can track your status in the dashboard.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className={`space-y-6 ${isMobile ? 'p-4 overflow-y-auto flex-1' : 'p-6'}`}
              >
                <div>
                  <label
                    htmlFor="cover-letter"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Cover Letter (Optional)
                  </label>
                  <textarea
                    id="cover-letter"
                    ref={firstInputRef}
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                    placeholder="Why are you a good fit for this role?"
                    className={`w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none ${
                      isMobile ? 'h-40 text-base' : 'h-32'
                    }`}
                    aria-label="Cover letter"
                  />
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Your Profile Snapshot</h4>
                  <div className="text-sm text-slate-400 space-y-1">
                    <p>Name: {user?.name}</p>
                    <p>CGPA: {user?.cgpa}</p>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <p>Skills: {user?.skills?.map((s: any) => s.name).join(', ')}</p>
                  </div>
                </div>

                <div
                  className={`flex gap-3 ${isMobile ? 'flex-col-reverse sticky bottom-0 bg-slate-900 -mx-4 -mb-4 p-4 border-t border-slate-800' : 'justify-end'}`}
                >
                  <button
                    type="button"
                    onClick={onClose}
                    className={`text-slate-300 hover:text-white transition-colors ${isMobile ? 'px-4 py-3 border border-slate-700 rounded-lg font-medium' : 'px-4 py-2'}`}
                    aria-label="Cancel application"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                      isMobile ? 'px-4 py-3 text-base' : 'px-6 py-2'
                    }`}
                    aria-label={isSubmitting ? 'Submitting application' : 'Submit application'}
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        Submit Application <Send className="w-4 h-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ApplyModal;
