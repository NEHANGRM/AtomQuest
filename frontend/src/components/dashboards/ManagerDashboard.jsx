import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, FileWarning, TrendingUp, Activity, LayoutList } from 'lucide-react';
import ManagerReviewModal from '../goals/ManagerReviewModal';
import SharedGoalManager from '../goals/SharedGoalManager';
import ManagerCheckInModal from '../goals/ManagerCheckInModal';

const ManagerDashboard = () => {
  const [teamSheets, setTeamSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [activeCheckInGoal, setActiveCheckInGoal] = useState(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const { data } = await api.get('/api/goals/team');
        setTeamSheets(data);
      } catch (err) {
        console.error('Failed to fetch team data', err);
      }
    };
    fetchTeamData();
  }, []);

  const pendingReview = teamSheets.filter(s => s.status === 'submitted');
  const pendingCount = teamSheets.filter(s => s.status === 'submitted').length;
  const approvedCount = teamSheets.filter(s => s.status === 'approved').length;
  const activeSheets = teamSheets.filter(s => s.status === 'approved');

  const mockProgressData = [
    { month: 'Q1', performance: 65 },
    { month: 'Q2', performance: 78 },
    { month: 'Q3', performance: 82 },
    { month: 'Q4', performance: 91 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Team Members</p><h3 className="text-2xl font-bold text-gray-800">{new Set(teamSheets.map(s => s.user?._id)).size}</h3></div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg"><FileWarning size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Pending Approvals</p><h3 className="text-2xl font-bold text-gray-800">{pendingCount}</h3></div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg"><TrendingUp size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Approved Sheets</p><h3 className="text-2xl font-bold text-gray-800">{approvedCount}</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Performance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockProgressData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="performance" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 0}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Action Items</h3>
          <div className="space-y-3">
            {teamSheets.filter(s => s.status === 'submitted').length === 0 ? (
               <p className="text-sm text-gray-500 text-center py-8">No pending actions. Great job! 🎉</p>
            ) : teamSheets.filter(s => s.status === 'submitted').map(sheet => (
              <div key={sheet._id} className="p-4 bg-blue-50/50 hover:bg-blue-50 rounded-lg border border-blue-100 transition">
                <p className="text-sm font-medium text-gray-800">{sheet.user?.name} submitted goals</p>
                <p className="text-xs text-gray-500 mt-1 mb-3">Review required for {sheet.year}</p>
                <button 
                  onClick={() => setSelectedSheet(sheet)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-white px-3 py-1.5 rounded shadow-sm border border-blue-200 transition"
                >
                  Review Now &rarr;
                </button>
              </div>
            ))}
            {pendingReview.length === 0 && (
              <p className="text-sm text-gray-500 italic p-4 text-center border border-dashed border-gray-200 rounded-lg">No pending approvals at the moment.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center mb-6 border-b border-gray-100 pb-4">
          <LayoutList className="w-5 h-5 mr-2 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Active Team Goals Progress</h3>
        </div>
        
        {activeSheets.length === 0 ? (
          <p className="text-sm text-gray-500 italic text-center py-6">No approved goal sheets to track yet.</p>
        ) : (
          <div className="space-y-6">
            {activeSheets.map(sheet => (
              <div key={sheet._id} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-800">{sheet.user?.name}</h4>
                    <p className="text-xs text-gray-500">{sheet.year} Performance Cycle</p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase">Approved</span>
                </div>
                <div className="p-0">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white border-b border-gray-100 text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="px-5 py-3 font-medium">Goal</th>
                        <th className="px-5 py-3 font-medium">Target</th>
                        <th className="px-5 py-3 font-medium">Current Progress</th>
                        <th className="px-5 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sheet.goals?.map(goal => (
                        <tr key={goal._id} className="hover:bg-blue-50/30 transition">
                          <td className="px-5 py-4">
                            <p className="font-medium text-gray-900">{goal.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{goal.thrustArea}</p>
                          </td>
                          <td className="px-5 py-4 font-semibold text-gray-700">
                            {goal.target} <span className="text-xs text-gray-400 font-normal">{goal.uomType}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${goal.progressScore || 0}%` }}></div>
                              </div>
                              <span className="text-xs font-bold text-blue-600">{goal.progressScore || 0}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button 
                              onClick={() => setActiveCheckInGoal(goal)}
                              className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 text-xs font-medium rounded-md shadow-sm transition"
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
