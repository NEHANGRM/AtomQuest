import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, FileWarning, TrendingUp, Activity, LayoutList } from 'lucide-react';
import ManagerReviewModal from '../goals/ManagerReviewModal';
import SharedGoalManager from '../goals/SharedGoalManager';
import ManagerCheckInModal from '../goals/ManagerCheckInModal';
import ReportingModule from './ReportingModule';

const ManagerDashboard = ({ activeNav }) => {
  const [teamSheets, setTeamSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [activeCheckInGoal, setActiveCheckInGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get('/api/goals/team');
        setTeamSheets(data);
      } catch (err) {
        console.error('Failed to fetch team data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeamData();
  }, []);

  const pendingReview = teamSheets.filter(s => s.status === 'submitted');
  const pendingCount = teamSheets.filter(s => s.status === 'submitted').length;
  const approvedCount = teamSheets.filter(s => s.status === 'approved').length;
  const activeSheets = teamSheets.filter(s => s.status === 'approved');

  // Compute Team Performance Trend from goal achievements
  const qScores = { Q1: [], Q2: [], Q3: [], Q4: [] };
  teamSheets.forEach(sheet => {
    sheet.goals?.forEach(goal => {
      // Find latest achievement for each quarter
      ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
        const achs = goal.achievements?.filter(a => a.quarter === q) || [];
        if (achs.length > 0) {
          const latestAch = achs[achs.length - 1];
          // simplistically approximate progress based on actual / target
          let score = 0;
          if (goal.uomType === 'Numeric' || goal.uomType === 'Percentage') {
             score = goal.direction === 'Lower' ? (goal.target / latestAch.actualValue) * 100 : (latestAch.actualValue / goal.target) * 100;
          } else {
             score = 100; // simplistic for timeline/zero-based
          }
          if (score > 100) score = 100;
          if (score < 0 || isNaN(score)) score = 0;
          qScores[q].push(score);
        }
      });
    });
  });

  const teamProgressTrend = ['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
    const sum = qScores[q].reduce((a, b) => a + b, 0);
    return {
      month: q,
      performance: qScores[q].length > 0 ? Math.round(sum / qScores[q].length) : 0
    };
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="h-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"></div>
           <div className="h-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"></div>
           <div className="h-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="h-80 lg:col-span-2 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"></div>
           <div className="h-80 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {activeNav === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg"><Users size={24} /></div>
              <div><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Team Members</p><h3 className="text-2xl font-display font-bold text-slate-800 dark:text-white">{new Set(teamSheets.map(s => s.user?._id)).size}</h3></div>
            </div>
            <div className="card p-6 flex items-center space-x-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg"><FileWarning size={24} /></div>
              <div><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Pending Approvals</p><h3 className="text-2xl font-display font-bold text-slate-800 dark:text-white">{pendingCount}</h3></div>
            </div>
            <div className="card p-6 flex items-center space-x-4">
              <div className="p-3 bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 rounded-lg"><TrendingUp size={24} /></div>
              <div><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Approved Sheets</p><h3 className="text-2xl font-display font-bold text-slate-800 dark:text-white">{approvedCount}</h3></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2">
              <h3 className="text-lg font-display font-semibold text-slate-800 dark:text-white mb-4">Team Performance Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={teamProgressTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Line type="monotone" dataKey="performance" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 0}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-display font-semibold text-slate-800 dark:text-white mb-4">Action Items</h3>
              <div className="space-y-3">
                {teamSheets.filter(s => s.status === 'submitted').length === 0 ? (
                   <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No pending actions. Great job! 🎉</p>
                ) : teamSheets.filter(s => s.status === 'submitted').map(sheet => (
                  <div key={sheet._id} className="p-4 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg border border-blue-100 dark:border-blue-900/50 transition">
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{sheet.user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">Review required for {sheet.year}</p>
                    <button 
                      onClick={() => setSelectedSheet(sheet)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Review Now &rarr;
                    </button>
                  </div>
                ))}
                {pendingReview.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic p-4 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">No pending approvals at the moment.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeNav === 'team' && (
        <>
          <div className="card p-6">
            <div className="flex items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
              <LayoutList className="w-5 h-5 mr-2 text-brand-600 dark:text-brand-400" />
              <h3 className="text-lg font-display font-semibold text-slate-800 dark:text-white">Active Team Goals Progress</h3>
            </div>
            
            {activeSheets.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center py-6">No approved goal sheets to track yet.</p>
            ) : (
              <div className="space-y-6">
                {activeSheets.map(sheet => (
                  <div key={sheet._id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800 px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">{sheet.user?.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{sheet.year} Performance Cycle</p>
                      </div>
                      <span className="bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-bold px-2.5 py-1 rounded-md uppercase border border-brand-200 dark:border-brand-800">Approved</span>
                    </div>
                    <div className="p-0 overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                          <tr>
                            <th className="px-5 py-3 font-medium">Goal</th>
                            <th className="px-5 py-3 font-medium">Target</th>
                            <th className="px-5 py-3 font-medium">Current Progress</th>
                            <th className="px-5 py-3 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {sheet.goals?.map(goal => (
                            <tr key={goal._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                              <td className="px-5 py-4">
                                <p className="font-medium text-slate-900 dark:text-slate-100">{goal.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{goal.thrustArea}</p>
                              </td>
                              <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">
                                {goal.target} <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">{goal.uomType}</span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${goal.progressScore || 0}%` }}></div>
                                  </div>
                                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{goal.progressScore || 0}%</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <button 
                                  onClick={() => setActiveCheckInGoal(goal)}
                                  className="btn-secondary text-xs py-1.5 px-3"
                                >
                                  <Activity size={14} className="mr-1.5"/> Review Check-ins
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8">
            <SharedGoalManager />
          </div>
        </>
      )}

      {activeNav === 'reports' && (
        <ReportingModule />
      )}

      {selectedSheet && (
        <ManagerReviewModal 
          sheet={selectedSheet} 
          onClose={() => setSelectedSheet(null)} 
          onComplete={() => {
            setSelectedSheet(null);
            // Re-fetch data
            api.get('/api/goals/team').then(res => setTeamSheets(res.data));
          }}
        />
      )}

      {activeCheckInGoal && (
        <ManagerCheckInModal 
          goal={activeCheckInGoal}
          onClose={() => setActiveCheckInGoal(null)}
        />
      )}
    </motion.div>
  );
};

export default ManagerDashboard;
