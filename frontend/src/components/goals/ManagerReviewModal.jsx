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
    if (status === 'returned' && !comments) {
      toast.error('Please provide comments when returning for rework.');
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Review Goal Sheet: <span className="text-brand-600">{sheet.user?.name}</span></h2>
              <p className="text-sm text-gray-500 mt-1">Performance Year: {sheet.year} • Current Status: <span className="uppercase font-semibold text-gray-700">{sheet.status}</span></p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Proposed Goals</h3>
              <div className="flex space-x-3 items-center">
                <div className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${totalWeightage === 100 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  Total Weightage: {totalWeightage}%
                </div>
                <button 
                  onClick={() => setIsEditing(!isEditing)} 
                  className="flex items-center text-sm font-medium text-brand-600 bg-brand-50 px-3 py-1.5 rounded hover:bg-brand-100 transition shadow-sm"
                >
                  <Edit2 size={16} className="mr-1.5" /> {isEditing ? 'Cancel Edits' : 'Inline Edit'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {goals.map((goal, idx) => (
                <div key={goal._id || idx} className={`bg-white p-5 rounded-xl border transition-all shadow-sm flex flex-col md:flex-row gap-5 ${isEditing ? 'border-brand-300 ring-2 ring-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex-1">
                    {isEditing ? (
                      <input className="w-full font-semibold text-gray-900 border-b border-dashed border-gray-400 focus:border-brand-500 bg-brand-50/30 p-1 outline-none mb-2" value={goal.title} onChange={(e) => handleGoalChange(idx, 'title', e.target.value)} />
                    ) : (
                      <h4 className="font-semibold text-gray-900 mb-2">{goal.title}</h4>
                    )}
                    
                    {isEditing ? (
                       <textarea className="w-full text-sm text-gray-700 border border-dashed border-gray-400 focus:border-brand-500 bg-brand-50/30 p-2 rounded outline-none" value={goal.description || ''} onChange={(e) => handleGoalChange(idx, 'description', e.target.value)} rows="2" />
                    ) : (
                      <p className="text-sm text-gray-600">{goal.description || 'No description provided.'}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-4 text-xs font-medium text-gray-600">
                      <span className="bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">Area: {goal.thrustArea}</span>
                      <span className="bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">Timeline: {goal.timeline}</span>
                      <span className="bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">UoM: {goal.uomType}</span>
                    </div>
                  </div>
                  <div className="w-full md:w-48 bg-gray-50 rounded-lg p-4 flex flex-col justify-center space-y-4 border border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5 uppercase font-semibold tracking-wider">Target</p>
                      {isEditing ? (
                        <input type="number" className="w-full border-2 border-brand-200 rounded-md p-1.5 text-sm outline-none focus:border-brand-500 font-bold text-gray-800" value={goal.target} onChange={(e) => handleGoalChange(idx, 'target', e.target.value)} />
                      ) : (
                        <p className="font-bold text-gray-800 text-lg">{goal.target}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5 uppercase font-semibold tracking-wider">Weightage (%)</p>
                      {isEditing ? (
                        <input type="number" className="w-full border-2 border-brand-200 rounded-md p-1.5 text-sm outline-none focus:border-brand-500 font-bold text-gray-800" value={goal.weightage} onChange={(e) => handleGoalChange(idx, 'weightage', e.target.value)} />
                      ) : (
                        <p className="font-bold text-brand-600 text-lg">{goal.weightage}%</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Manager Feedback</label>
              <textarea 
                rows="3" 
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-shadow"
                placeholder="Add constructive feedback, required if returning for rework..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 bg-white">
            <button 
              disabled={isSubmitting}
              onClick={() => handleReviewAction('rejected')}
              className="px-5 py-2.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition flex items-center justify-center disabled:opacity-50"
            >
              <XCircle size={18} className="mr-2" /> Reject completely
            </button>
            <button 
              disabled={isSubmitting}
              onClick={() => handleReviewAction('returned')}
              className="px-5 py-2.5 text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition flex items-center justify-center disabled:opacity-50"
            >
              <RotateCcw size={18} className="mr-2" /> Return for Rework
            </button>
            <button 
              disabled={isSubmitting}
              onClick={() => handleReviewAction('approved')}
              className="px-8 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-50"
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
