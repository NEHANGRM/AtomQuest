import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, History, TrendingUp, Calendar, MessageSquare, Target } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

const QuarterlyUpdateModal = ({ goal, onClose, onComplete }) => {
  const [activeTab, setActiveTab] = useState('update'); // 'update' or 'history'
  const [history, setHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [quarter, setQuarter] = useState('Q1');
  const [actualValue, setActualValue] = useState(0);
  const [status, setStatus] = useState(goal.status || 'Not Started');
  const [comments, setComments] = useState('');

  // Auto-select current quarter logic based on month
  useEffect(() => {
    const currentMonth = new Date().getMonth() + 1;
    if (currentMonth >= 7 && currentMonth < 10) setQuarter('Q1');
    else if (currentMonth >= 10 && currentMonth <= 12) setQuarter('Q2');
    else if (currentMonth >= 1 && currentMonth <= 3) setQuarter('Q3');
    else setQuarter('Q4');
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      api.get(`/api/checkins/goal/${goal._id}`)
        .then(res => setHistory(res.data))
        .catch(err => console.error(err));
    }
  }, [activeTab, goal._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comments) {
      toast.error('Please provide comments for this update.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/api/checkins', {
        goalId: goal._id,
        quarter,
        actualValue: Number(actualValue),
        status,
        comments
      });
      toast.success(`${quarter} update saved successfully!`);
      onComplete();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save update');
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-start">
            <div>
              <span className="bg-blue-800/50 text-blue-100 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide mb-3 inline-block">Update Progress</span>
              <h2 className="text-xl font-bold leading-tight">{goal.title}</h2>
              <div className="flex items-center space-x-4 mt-3 text-sm text-blue-100">
                <span className="flex items-center"><Target size={14} className="mr-1.5"/> Target: {goal.target} {goal.uomType}</span>
                <span className="flex items-center"><TrendingUp size={14} className="mr-1.5"/> Weightage: {goal.weightage}%</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition"><X size={20} /></button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50/50">
            <button 
              onClick={() => setActiveTab('update')} 
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center transition-colors ${activeTab === 'update' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            >
              <Save size={16} className="mr-2" /> Log Update
            </button>
            <button 
              onClick={() => setActiveTab('history')} 
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center transition-colors ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            >
              <History size={16} className="mr-2" /> Timeline History
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'update' ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Quarter Window</label>
                    <select value={quarter} onChange={e => setQuarter(e.target.value)} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-white">
                      <option value="Q1">Q1 (July - Sept)</option>
                      <option value="Q2">Q2 (Oct - Dec)</option>
                      <option value="Q3">Q3 (Jan - March)</option>
                      <option value="Q4">Q4 (April - June)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status Indicator</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-white">
                      <option value="Not Started">Not Started</option>
                      <option value="On Track">On Track</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Actual Value Achieved ({goal.uomType})</label>
                  <input 
                    type="number" 
                    required 
                    value={actualValue} 
                    onChange={e => setActualValue(e.target.value)} 
                    className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
                    placeholder={`Target is ${goal.target}...`}
                  />
                  <p className="text-xs text-gray-500 mt-1">Current Progress Score: {goal.progressScore}%</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Check-In Comments / Justification</label>
                  <textarea 
                    rows="3" 
                    value={comments} 
                    onChange={e => setComments(e.target.value)} 
                    className="w-full border-gray-300 rounded-lg p-3 border focus:ring-2 focus:ring-blue-500 outline-none shadow-sm resize-none"
                    placeholder="Provide context for this achievement..."
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                  <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md disabled:opacity-50 flex items-center">
                    <Save size={16} className="mr-2"/> {isSubmitting ? 'Saving...' : 'Submit Update'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {history.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <History className="mx-auto text-gray-400 mb-3" size={32} />
                    <h3 className="text-gray-900 font-medium">No updates logged</h3>
                    <p className="text-sm text-gray-500">Log a progress update to see your timeline here.</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-blue-100 ml-4 space-y-8 py-2">
                    {history.map((log, i) => (
                      <div key={log._id} className="relative pl-6">
                        <div className="absolute w-4 h-4 bg-blue-500 rounded-full border-4 border-white -left-[9px] top-1 shadow-sm"></div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                          <div className="flex justify-between items-start mb-2">
                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">{log.quarter} Update</span>
                            <span className="text-xs text-gray-400 font-medium">{new Date(log.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 my-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Actual Achieved</p>
                              <p className="font-bold text-gray-800">{log.actualValue} <span className="text-xs font-normal text-gray-500">{goal.uomType}</span></p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Status Logged</p>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                log.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                log.status === 'On Track' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>{log.status}</span>
                            </div>
                          </div>
                          <div className="flex items-start text-sm text-gray-600 bg-white pt-1">
                            <MessageSquare size={14} className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                            <p className="italic">{log.comments}</p>
                          </div>
                        </div>
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
export default QuarterlyUpdateModal;
