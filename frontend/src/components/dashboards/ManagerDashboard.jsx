import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, FileWarning, TrendingUp } from 'lucide-react';
import ManagerReviewModal from '../goals/ManagerReviewModal';
import SharedGoalManager from '../goals/SharedGoalManager';

const ManagerDashboard = () => {
  const [teamSheets, setTeamSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);

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

  const pendingCount = teamSheets.filter(s => s.status === 'submitted').length;
  const approvedCount = teamSheets.filter(s => s.status === 'approved').length;

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
          </div>
        </div>
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
    </motion.div>
  );
};
export default ManagerDashboard;
