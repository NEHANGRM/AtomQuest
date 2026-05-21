import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, XCircle, RotateCcw, Edit2 } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

const ManagerReviewModal = ({ sheet, onClose, onComplete }) => {
  const [goals, setGoals] = useState(sheet.goals || []);
  const [comments, setComments] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!sheet) return null;

  const totalWeightage = goals.reduce((sum, g) => sum + (Number(g.weightage) || 0), 0);

  const handleGoalChange = (index, field, value) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: value };
    setGoals(updated);
  };

  const handleReviewAction = async (status) => {
    if (isEditing && status === 'approved') {
      if (totalWeightage !== 100) {
        toast.error('Total weightage must be exactly 100% before approving.');
        return;
      }
      if (goals.some(g => (Number(g.weightage) || 0) < 10)) {
        toast.error('Each goal must have a weightage of at least 10% before approving.');
        return;
      }
    }
    if ((status === 'returned' || status === 'rejected') && !comments) {
      toast.error(`Please provide feedback comments when ${status === 'rejected' ? 'rejecting' : 'returning'} a goal sheet.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = { status, managerComments: comments };
      if (isEditing) {
        payload.goals = goals;
      }
      await api.put(`/api/goals/sheet/${sheet._id}/status`, payload);
      toast.success(`Goal sheet marked as ${status}`);
      onComplete();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
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
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Review Goal Sheet: <span className="text-brand-600 dark:text-brand-400">{sheet.user?.name}</span></h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Performance Year: {sheet.year} • Current Status: <span className="uppercase font-semibold text-slate-700 dark:text-slate-350">{sheet.status}</span></p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/40">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-white">Proposed Goals</h3>
              <div className="flex space-x-3 items-center">
                <div className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${totalWeightage === 100 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'}`}>
                  Total Weightage: {totalWeightage}%
                </div>
                <button 
                  onClick={() => setIsEditing(!isEditing)} 
                  className="flex items-center text-sm font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5 rounded hover:bg-brand-100 dark:hover:bg-brand-900/40 transition shadow-sm"
                >
                  <Edit2 size={16} className="mr-1.5" /> {isEditing ? 'Cancel Edits' : 'Inline Edit'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {goals.map((goal, idx) => (
                <div key={goal._id || idx} className={`bg-white dark:bg-slate-900 p-5 rounded-xl border transition-all shadow-sm flex flex-col md:flex-row gap-5 ${isEditing ? 'border-brand-300 dark:border-brand-600 ring-2 ring-brand-50 dark:ring-brand-950/20' : 'border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-750'}`}>
                  <div className="flex-1">
                    {isEditing ? (
                      <input className="w-full font-semibold text-slate-900 dark:text-white border-b border-dashed border-slate-450 dark:border-slate-650 focus:border-brand-500 bg-brand-50/30 dark:bg-brand-950/20 p-1 outline-none mb-2" value={goal.title} onChange={(e) => handleGoalChange(idx, 'title', e.target.value)} />
                    ) : (
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{goal.title}</h4>
                    )}
                    
                    {isEditing ? (
                       <textarea className="w-full text-sm text-slate-700 dark:text-slate-200 border border-dashed border-slate-400 dark:border-slate-700 focus:border-brand-500 bg-brand-50/30 dark:bg-brand-950/20 p-2 rounded outline-none" value={goal.description || ''} onChange={(e) => handleGoalChange(idx, 'description', e.target.value)} rows="2" />
                    ) : (
                      <p className="text-sm text-slate-600 dark:text-slate-400">{goal.description || 'No description provided.'}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-4 text-xs font-medium text-slate-605 dark:text-slate-400">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-750">Area: {goal.thrustArea}</span>
                      <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-750">Timeline: {goal.timeline}</span>
                      <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-750">UoM: {goal.uomType}</span>
                    </div>
                  </div>
                  <div className="w-full md:w-48 bg-slate-50 dark:bg-slate-800/40 rounded-lg p-4 flex flex-col justify-center space-y-4 border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-semibold tracking-wider">Target</p>
                      {isEditing ? (
                        <input type="number" className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md p-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 font-bold text-slate-800 dark:text-white" value={goal.target} onChange={(e) => handleGoalChange(idx, 'target', e.target.value)} />
                      ) : (
                        <p className="font-bold text-slate-800 dark:text-white text-lg">{goal.target}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-550 dark:text-slate-400 mb-1.5 uppercase font-semibold tracking-wider">Weightage (%)</p>
                      {isEditing ? (
                        <input type="number" className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md p-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 font-bold text-slate-800 dark:text-white" value={goal.weightage} onChange={(e) => handleGoalChange(idx, 'weightage', e.target.value)} />
                      ) : (
                        <p className="font-bold text-brand-600 dark:text-brand-400 text-lg">{goal.weightage}%</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <label className="label-text text-sm mb-2">Manager Feedback</label>
              <textarea 
                rows="3" 
                className="input-field w-full p-3"
                placeholder="Add constructive feedback, required if returning for rework..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 bg-white dark:bg-slate-900">
            <button 
              disabled={isSubmitting}
              onClick={() => handleReviewAction('rejected')}
              className="px-5 py-2.5 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition flex items-center justify-center disabled:opacity-50"
            >
              <XCircle size={18} className="mr-2" /> Reject completely
            </button>
            <button 
              disabled={isSubmitting}
              onClick={() => handleReviewAction('returned')}
              className="px-5 py-2.5 text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition flex items-center justify-center disabled:opacity-50"
            >
              <RotateCcw size={18} className="mr-2" /> Return for Rework
            </button>
            <button 
              disabled={isSubmitting}
              onClick={() => handleReviewAction('approved')}
              className="px-8 py-2.5 text-sm font-medium text-white bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 rounded-lg transition shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-50"
            >
              <Check size={18} className="mr-2" /> {isEditing ? 'Save & Approve' : 'Approve Goals'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default ManagerReviewModal;
