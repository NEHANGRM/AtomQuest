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

  const fetchGoals = async () => {
    try {
      const { data } = await api.get('/api/goals/my');
      setGoalSheets(data);
    } catch (err) {
      console.error('Failed to fetch goals', err);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const totalGoals = goalSheets.reduce((acc, sheet) => acc + sheet.goals.length, 0);
  const activeSheet = goalSheets.find(s => s.status === 'approved') || goalSheets[0];
  const overallProgress = 35; // Mock progress

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Target size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">My Goals</p><h3 className="text-2xl font-bold text-gray-800">{totalGoals}</h3></div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Flag size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Current Status</p><h3 className="text-lg font-bold text-gray-800 capitalize">{activeSheet?.status || 'Draft'}</h3></div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-gray-500 font-medium">Overall Progress</p>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${overallProgress}%` }} 
              transition={{ duration: 1, delay: 0.2 }}
              className="bg-blue-600 h-full rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <h3 className="text-lg font-semibold text-gray-800">Quarterly Updates Needed</h3>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md flex items-center transition"
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
            <div key={goal._id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white hover:bg-blue-50/50 rounded-xl border border-gray-200 hover:border-blue-200 transition-all shadow-sm hover:shadow">
              <div className="mb-4 sm:mb-0">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  <p className="font-medium text-gray-800">{goal.title}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1.5 ml-4">Target: {goal.target} {goal.uomType}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <div className="w-full sm:w-32">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 font-medium">Progress</span>
                    <span className="text-blue-600 font-bold">{goal.progressScore || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${Math.min(goal.progressScore || 0, 100)}%` }}></div>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveUpdateGoal(goal)}
                  className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-blue-600 hover:text-white border border-gray-200 hover:border-blue-600 text-sm font-medium text-blue-600 rounded-lg shadow-sm transition-all flex items-center justify-center"
                >
                  <Activity size={16} className="mr-2" />
                  Log Update
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 px-4 rounded-xl bg-gray-50 border border-dashed border-gray-200">
              <div className="mx-auto w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-3">
                <Target size={24} />
              </div>
              <h3 className="text-sm font-medium text-gray-900">No active goals</h3>
              <p className="text-sm text-gray-500 mt-1">Create a Goal Sheet and submit it to your manager to get started.</p>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 transition"
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
