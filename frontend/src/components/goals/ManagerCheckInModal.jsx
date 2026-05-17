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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-6 text-white flex justify-between items-start">
            <div>
              <span className="bg-blue-800/50 text-blue-100 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide mb-3 inline-block">Goal Progress Review</span>
              <h2 className="text-xl font-bold leading-tight">{goal.title}</h2>
              <div className="flex items-center space-x-6 mt-3 text-sm text-blue-100">
                <span className="flex items-center font-medium"><Target size={15} className="mr-1.5"/> Target: {goal.target} {goal.uomType}</span>
                <span className="flex items-center font-medium"><TrendingUp size={15} className="mr-1.5"/> Weightage: {goal.weightage}%</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition"><X size={20} /></button>
          </div>

          {/* Content Timeline */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
            {history.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                <History className="mx-auto text-gray-400 mb-3" size={36} />
                <h3 className="text-gray-900 font-medium">No check-ins logged yet</h3>
                <p className="text-sm text-gray-500 mt-1">The employee has not provided any quarterly updates for this goal.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-blue-200 ml-5 space-y-8 py-2">
                {history.map((log) => (
                  <div key={log._id} className="relative pl-8">
                    <div className="absolute w-5 h-5 bg-blue-500 rounded-full border-4 border-white -left-[11px] top-1 shadow-sm"></div>
                    
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition hover:shadow-md">
                      <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                        <div>
                          <span className="bg-blue-50 text-blue-700 text-sm font-bold px-3 py-1 rounded-md border border-blue-100">{log.quarter} Update</span>
                          <span className="ml-3 text-xs text-gray-500 font-medium">{new Date(log.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
                          log.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          log.status === 'On Track' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>{log.status}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1 font-semibold uppercase">Actual Achieved</p>
                          <p className="font-bold text-gray-900 text-lg">{log.actualValue} <span className="text-sm font-normal text-gray-500">{goal.uomType}</span></p>
                        </div>
                        <div className="p-3 bg-blue-50/30 rounded-lg border border-blue-50">
                          <p className="text-xs text-gray-500 mb-1 font-semibold uppercase">Employee Justification</p>
                          <p className="text-sm text-gray-700 italic">"{log.comments}"</p>
                        </div>
                      </div>

                      {/* Manager Feedback Section */}
                      <div className="pt-4 border-t border-gray-100">
                        {log.managerComment ? (
                          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <div className="flex items-center mb-2">
                              <CheckCircle size={16} className="text-green-600 mr-2" />
                              <span className="text-xs font-bold text-green-800 uppercase">Manager Feedback Provided</span>
                              <span className="text-xs text-green-600 ml-auto">{new Date(log.reviewedAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-green-900 font-medium">"{log.managerComment}"</p>
                          </div>
                        ) : (
                          <div>
                            <label className="flex items-center text-xs font-bold text-gray-700 uppercase mb-2">
                              <MessageSquare size={14} className="mr-1.5 text-gray-400" /> Add Quarterly Feedback
                            </label>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <input 
                                type="text"
                                className="flex-1 text-sm border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                                placeholder="E.g., Great progress, keep focusing on pipeline generation..."
                                value={feedbackInput[log._id] || ''}
                                onChange={(e) => handleFeedbackChange(log._id, e.target.value)}
                              />
                              <button 
                                disabled={isSubmitting}
                                onClick={() => submitFeedback(log._id)}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition disabled:opacity-50 flex items-center justify-center"
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
