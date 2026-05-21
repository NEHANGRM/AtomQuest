import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Flag, CalendarCheck, ChevronRight, Plus, Activity, Award, CheckCircle2, TrendingUp, BarChart2, CheckSquare } from 'lucide-react';
import GoalCreationForm from '../goals/GoalCreationForm';
import QuarterlyUpdateModal from '../goals/QuarterlyUpdateModal';
import { useTheme } from '../../context/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const EmployeeDashboard = ({ activeNav }) => {
  const { theme } = useTheme();
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
  const activeSheetCount = goalSheets.filter(s => s.status !== 'draft').length;

  // Aggregate ALL goals from ALL sheets (not just one sheet)
  const allGoals = goalSheets.flatMap(sheet => sheet.goals || []);

  // Weighted progress across all goals from all sheets
  const totalWeight = allGoals.reduce((sum, g) => sum + (g.weightage || 0), 0);
  const overallProgress = totalWeight > 0
    ? Math.round(allGoals.reduce((sum, g) => sum + ((g.progressScore || 0) * ((g.weightage || 0) / totalWeight)), 0))
    : 0;

  // Aggregate stats for progress page - across ALL sheets
  const thrustAreasMap = {};
  allGoals.forEach(g => {
    const area = g.thrustArea || 'General';
    if (!thrustAreasMap[area]) {
      thrustAreasMap[area] = { sum: 0, count: 0, weight: 0 };
    }
    thrustAreasMap[area].sum += g.progressScore || 0;
    thrustAreasMap[area].count += 1;
    thrustAreasMap[area].weight += g.weightage || 0;
  });

  const thrustAreasList = Object.keys(thrustAreasMap).map(name => ({
    name,
    avg: Math.round(thrustAreasMap[name].sum / thrustAreasMap[name].count),
    weight: thrustAreasMap[name].weight
  }));

  const chartData = allGoals.map(g => ({
    name: g.title.length > 20 ? g.title.substring(0, 20) + '...' : g.title,
    progress: g.progressScore || 0,
    weight: g.weightage || 0
  }));

  const allAchievements = [];
  allGoals.forEach(g => {
    g.achievements?.forEach(a => {
      allAchievements.push({
        goalTitle: g.title,
        ...a
      });
    });
  });
  allAchievements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
      {activeNav === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg"><Target size={24} /></div>
              <div><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Goals</p><h3 className="text-2xl font-display font-bold text-slate-800 dark:text-white">{totalGoals}</h3></div>
            </div>
            <div className="card p-6 flex items-center space-x-4">
              <div className="p-3 bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 rounded-lg"><Flag size={24} /></div>
              <div><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Sheets</p><h3 className="text-2xl font-display font-bold text-slate-800 dark:text-white">{activeSheetCount}</h3></div>
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
              <h3 className="text-lg font-display font-semibold text-slate-800 dark:text-white">All My Goals</h3>
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
              {allGoals.length > 0 ? allGoals.map(goal => (
                <div key={goal._id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{goal.title}</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 ml-4">Target: {goal.target} {goal.uomType} · Weightage: {goal.weightage}%</p>
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
        </>
      )}

      {activeNav === 'progress' && (
        <>
          {/* Key achievement metrics summary cards - aggregated across ALL sheets */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-4">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl"><CheckCircle2 size={22} /></div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Completed Goals</p>
                <h4 className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">
                  {allGoals.filter(g => g.progressScore >= 100).length}
                </h4>
              </div>
            </div>
            <div className="card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-4">
              <div className="p-2.5 bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 rounded-xl"><TrendingUp size={22} /></div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Weighted Progress</p>
                <h4 className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">{overallProgress}%</h4>
              </div>
            </div>
            <div className="card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-4">
              <div className="p-2.5 bg-purple-50 dark:bg-purple-950/20 text-purple-650 dark:text-purple-400 rounded-xl"><Award size={22} /></div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Check-Ins</p>
                <h4 className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">{allAchievements.length}</h4>
              </div>
            </div>
            <div className="card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-4">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl"><CheckSquare size={22} /></div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Thrust Areas</p>
                <h4 className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">{thrustAreasList.length}</h4>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recharts progress chart */}
            <div className="card p-6 lg:col-span-2">
              <h3 className="text-lg font-display font-semibold text-slate-800 dark:text-white mb-6">Goals Performance Breakdown</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={theme === 'dark' ? '#334155' : '#e5e7eb'} />
                    <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#cbd5e1' : '#475569' }} />
                    <YAxis domain={[0, 100]} fontSize={11} axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#cbd5e1' : '#475569' }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb', backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#000000' }} />
                    <Bar dataKey="progress" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Breakdown by Thrust Area */}
            <div className="card p-6">
              <h3 className="text-lg font-display font-semibold text-slate-800 dark:text-white mb-6">Progress by Thrust Area</h3>
              <div className="space-y-5">
                {thrustAreasList.length > 0 ? thrustAreasList.map((item, index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-350">{item.name}</span>
                      <span className="text-brand-650 dark:text-brand-450">{item.avg}% Avg</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${item.avg}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Weightage Allocation: {item.weight}%</p>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400 italic text-center py-8">No thrust areas found.</p>
                )}
              </div>
            </div>
          </div>

          {/* Detailed list of achievements / updates */}
          <div className="card p-6">
            <h3 className="text-lg font-display font-semibold text-slate-800 dark:text-white mb-4">Milestones & Log History</h3>
            {allAchievements.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-8">No check-in entries logged yet for this performance cycle.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-450 text-xs uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Goal Title</th>
                      <th className="px-5 py-3.5">Quarter</th>
                      <th className="px-5 py-3.5">Value Logged</th>
                      <th className="px-5 py-3.5">Logged Date</th>
                      <th className="px-5 py-3.5">Comments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-650 dark:text-slate-350">
                    {allAchievements.map((ach, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-white max-w-xs truncate">{ach.goalTitle}</td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 border border-slate-200 dark:border-slate-700 rounded-full">{ach.quarter}</span>
                        </td>
                        <td className="px-5 py-4 font-mono font-bold text-brand-650 dark:text-brand-450">{ach.actualValue}</td>
                        <td className="px-5 py-4 text-xs font-mono text-slate-400 dark:text-slate-500">{new Date(ach.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-4 text-xs italic max-w-sm truncate">{ach.comment || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

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
