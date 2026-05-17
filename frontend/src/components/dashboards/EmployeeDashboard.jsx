import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Flag, CalendarCheck, ChevronRight, Plus, Activity } from 'lucide-react';
import GoalCreationForm from '../goals/GoalCreationForm';
import QuarterlyUpdateModal from '../goals/QuarterlyUpdateModal';

const EmployeeDashboard = () => {
  const [goalSheets, setGoalSheets] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeUpdateGoal, setActiveUpdateGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/api/goals/my');
      setGoalSheets(data);
    } catch (err) {
      console.error('Failed to fetch goals', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const totalGoals = goalSheets.reduce((acc, sheet) => acc + sheet.goals.length, 0);
  const activeSheet = goalSheets.find(s => s.status === 'approved') || goalSheets[0];
  
  const overallProgress = activeSheet?.goals?.length 
    ? Math.round(activeSheet.goals.reduce((sum, g) => sum + ((g.progressScore || 0) * (g.weightage / 100)), 0)) 
    : 0;

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="h-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"></div>
           <div className="h-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"></div>
           <div className="h-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"></div>
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg"><Target size={24} /></div>
          <div><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">My Goals</p><h3 className="text-2xl font-display font-bold text-slate-800 dark:text-white">{totalGoals}</h3></div>
        </div>
        <div className="card p-6 flex items-center space-x-4">
          <div className="p-3 bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 rounded-lg"><Flag size={24} /></div>
          <div><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Current Status</p><h3 className="text-lg font-display font-bold text-slate-800 dark:text-white capitalize">{activeSheet?.status || 'Draft'}</h3></div>
        </div>
        <div className="card p-6 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Overall Progress</p>
            <span className="text-sm font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/40 px-2 py-0.5 rounded">{overallProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${overallProgress}%` }} 
              transition={{ duration: 1, delay: 0.2 }}
              className="bg-brand-500 h-full rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
          <h3 className="text-lg font-display font-semibold text-slate-800 dark:text-white">Quarterly Updates Needed</h3>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-primary py-1.5"
            >
              <Plus size={16} className="mr-1"/> {showCreateForm ? 'Close Form' : 'New Goal Sheet'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showCreateForm && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <GoalCreationForm onComplete={() => { setShowCreateForm(false); fetchGoals(); }} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {activeSheet?.goals?.length > 0 ? activeSheet.goals.map(goal => (
            <div key={goal._id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm">
              <div className="mb-4 sm:mb-0">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{goal.title}</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 ml-4">Target: {goal.target} {goal.uomType}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <div className="w-full sm:w-32">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Progress</span>
                    <span className="text-brand-600 dark:text-brand-400 font-bold">{goal.progressScore || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${Math.min(goal.progressScore || 0, 100)}%` }}></div>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveUpdateGoal(goal)}
                  className="btn-secondary text-xs sm:w-auto w-full"
                >
                  <Activity size={14} className="mr-2" />
                  Log Update
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
              <div className="mx-auto w-12 h-12 bg-white dark:bg-slate-800 text-slate-400 shadow-sm rounded-full flex items-center justify-center mb-3">
                <Target size={24} />
              </div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">No active goals</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create a Goal Sheet and submit it to your manager to get started.</p>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="btn-primary mt-4"
              >
                Create Goal Sheet
              </button>
            </div>
          )}
        </div>
      </div>

      {activeUpdateGoal && (
        <QuarterlyUpdateModal 
          goal={activeUpdateGoal}
          onClose={() => setActiveUpdateGoal(null)}
          onComplete={() => {
            setActiveUpdateGoal(null);
            fetchGoals(); // Re-fetch the dash
          }}
        />
      )}
    </motion.div>
  );
};
export default EmployeeDashboard;
