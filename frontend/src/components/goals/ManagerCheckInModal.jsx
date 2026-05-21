import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Target, TrendingUp, MessageSquare, Save, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

const ManagerCheckInModal = ({ goal, onClose }) => {
  const [history, setHistory] = useState([]);
  const [feedbackInput, setFeedbackInput] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/api/checkins/goal/${goal._id}`);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load check-ins');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [goal._id]);

  const handleFeedbackChange = (id, value) => {
    setFeedbackInput(prev => ({ ...prev, [id]: value }));
  };

  const submitFeedback = async (checkInId) => {
    const managerComment = feedbackInput[checkInId];
    if (!managerComment) {
      toast.error('Feedback cannot be empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.put(`/api/checkins/${checkInId}/feedback`, { managerComment });
      toast.success('Feedback saved successfully!');
      fetchHistory(); // Refresh to show saved feedback
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-700 to-brand-900 p-6 text-white flex justify-between items-start">
            <div>
              <span className="bg-brand-800/50 text-brand-100 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide mb-3 inline-block">Goal Progress Review</span>
              <h2 className="text-xl font-bold leading-tight">{goal.title}</h2>
              <div className="flex items-center space-x-6 mt-3 text-sm text-brand-100">
                <span className="flex items-center font-medium"><Target size={15} className="mr-1.5"/> Target: {goal.target} {goal.uomType}</span>
                <span className="flex items-center font-medium"><TrendingUp size={15} className="mr-1.5"/> Weightage: {goal.weightage}%</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition"><X size={20} /></button>
          </div>

          {/* Content Timeline */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/40">
            {history.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <History className="mx-auto text-slate-400 mb-3" size={36} />
                <h3 className="text-slate-900 dark:text-white font-medium">No check-ins logged yet</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">The employee has not provided any quarterly updates for this goal.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-brand-200 dark:border-brand-800 ml-5 space-y-8 py-2">
                {history.map((log) => (
                  <div key={log._id} className="relative pl-8">
                    <div className="absolute w-5 h-5 bg-brand-500 rounded-full border-4 border-white dark:border-slate-900 -left-[11px] top-1 shadow-sm"></div>
                    
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
                      <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                        <div>
                          <span className="bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-bold px-3 py-1 rounded-md border border-brand-100 dark:border-brand-900/40">{log.quarter} Update</span>
                          <span className="ml-3 text-xs text-slate-500 dark:text-slate-400 font-medium">{new Date(log.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
                          log.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                          log.status === 'On Track' ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' :
                          'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                        }`}>{log.status}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-semibold uppercase">Actual Achieved</p>
                          <p className="font-bold text-slate-900 dark:text-white text-lg">{log.actualValue} <span className="text-sm font-normal text-slate-500 dark:text-slate-450">{goal.uomType}</span></p>
                        </div>
                        <div className="p-3 bg-brand-50/30 dark:bg-brand-900/10 rounded-lg border border-brand-50 dark:border-brand-900/20">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-semibold uppercase">Employee Justification</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{log.comments}"</p>
                        </div>
                      </div>

                      {/* Manager Feedback Section */}
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        {log.managerComment ? (
                          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-100 dark:border-green-900/30">
                            <div className="flex items-center mb-2">
                              <CheckCircle size={16} className="text-green-600 dark:text-green-400 mr-2" />
                              <span className="text-xs font-bold text-green-800 dark:text-green-300 uppercase">Manager Feedback Provided</span>
                              <span className="text-xs text-green-600 dark:text-green-400 ml-auto">{new Date(log.reviewedAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-green-900 dark:text-green-100 font-medium">"{log.managerComment}"</p>
                          </div>
                        ) : (
                          <div>
                            <label className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                              <MessageSquare size={14} className="mr-1.5 text-slate-400" /> Add Quarterly Feedback
                            </label>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <input 
                                type="text"
                                className="input-field flex-1 py-2 px-3"
                                placeholder="E.g., Great progress, keep focusing on pipeline generation..."
                                value={feedbackInput[log._id] || ''}
                                onChange={(e) => handleFeedbackChange(log._id, e.target.value)}
                              />
                              <button 
                                disabled={isSubmitting}
                                onClick={() => submitFeedback(log._id)}
                                className="btn-primary px-5 py-2 flex items-center justify-center"
                              >
                                <Save size={16} className="mr-2"/> Save
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ManagerCheckInModal;
