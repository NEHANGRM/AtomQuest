import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, FileText, CheckCircle, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ usersCount: 0, sheetsCount: 0, approvedCount: 0 });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.get('/api/admin/stats'),
          api.get('/api/admin/audit')
        ]);
        setStats(statsRes.data);
        setLogs(logsRes.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      }
    };
    fetchAdminData();
  }, []);

  const chartData = [
    { name: 'Total Sheets', count: stats.sheetsCount },
    { name: 'Approved', count: stats.approvedCount },
    { name: 'Pending', count: stats.sheetsCount - stats.approvedCount }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Total Users</p><h3 className="text-2xl font-bold text-gray-800">{stats.usersCount}</h3></div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><FileText size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Goal Sheets</p><h3 className="text-2xl font-bold text-gray-800">{stats.sheetsCount}</h3></div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Approved</p><h3 className="text-2xl font-bold text-gray-800">{stats.approvedCount}</h3></div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><Activity size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">System Health</p><h3 className="text-2xl font-bold text-gray-800">100%</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Completion Metrics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Audit Logs</h3>
          <div className="space-y-3">
            {logs.length === 0 ? <p className="text-gray-500">No recent logs</p> : logs.map((log) => (
              <div key={log._id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-800">{log.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{log.user?.name || 'Unknown User'} - {log.model}</p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{new Date(log.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default AdminDashboard;
