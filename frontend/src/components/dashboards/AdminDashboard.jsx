import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, Activity, LockOpen, Database, Shield, LayoutDashboard, Search, Plus, Edit2, Trash2, CheckCircle, RefreshCcw, Download
} from 'lucide-react';
import { toast } from 'sonner';
import ReportingModule from './ReportingModule';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, sheets, audit
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSheets = async () => {
    try {
      const res = await api.get('/api/admin/sheets');
      setSheets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get('/api/admin/audit');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'sheets') fetchSheets();
    if (activeTab === 'audit') fetchLogs();
  }, [activeTab]);

  const handleUnlockSheet = async (id) => {
    try {
      setIsActionLoading(true);
      await api.put(`/api/admin/unlock/${id}`);
      toast.success('Sheet unlocked and returned to draft status.');
      fetchSheets();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unlock sheet');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Mock data for charts
  const completionData = [
    { name: 'Engineering', completed: 85 },
    { name: 'Sales', completed: 65 },
    { name: 'Marketing', completed: 90 },
    { name: 'HR', completed: 75 },
    { name: 'Finance', completed: 95 }
  ];

  const pieData = [
    { name: 'Approved', value: stats?.approvedCount || 0 },
    { name: 'Pending Review', value: stats?.submittedCount || 0 },
    { name: 'Draft/Returned', value: stats?.draftCount || 0 },
  ];
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Top Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex flex-wrap gap-2">
        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center transition ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          <LayoutDashboard size={16} className="mr-2" /> Org Overview
        </button>
        <button onClick={() => setActiveTab('sheets')} className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center transition ${activeTab === 'sheets' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          <Activity size={16} className="mr-2" /> Goal Sheets
        </button>
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center transition ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          <Users size={16} className="mr-2" /> User Management
        </button>
        <button onClick={() => setActiveTab('audit')} className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center transition ${activeTab === 'audit' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          <Shield size={16} className="mr-2" /> Security & Audit
        </button>
        <button onClick={() => setActiveTab('reporting')} className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center transition ${activeTab === 'reporting' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          <Download size={16} className="mr-2" /> Export Reports
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><Users size={24} /></div>
              <div><p className="text-sm text-gray-500 font-medium">Total Users</p><h3 className="text-2xl font-bold text-gray-800">{stats?.usersCount || 0}</h3></div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Database size={24} /></div>
              <div><p className="text-sm text-gray-500 font-medium">Goal Sheets Active</p><h3 className="text-2xl font-bold text-gray-800">{stats?.sheetsCount || 0}</h3></div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
              <div><p className="text-sm text-gray-500 font-medium">Sheets Approved</p><h3 className="text-2xl font-bold text-gray-800">{stats?.approvedCount || 0}</h3></div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Activity size={24} /></div>
              <div><p className="text-sm text-gray-500 font-medium">Avg Org Progress</p><h3 className="text-2xl font-bold text-gray-800">{stats?.avgCompletion || 0}%</h3></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Department Completion Rates</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} width={80} />
                    <RechartsTooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: '1px solid #e5e7eb'}} />
                    <Bar dataKey="completed" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Goal Sheet Status Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{borderRadius: '8px', border: '1px solid #e5e7eb'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center text-sm text-gray-600"><div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>Approved</div>
                <div className="flex items-center text-sm text-gray-600"><div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>Review</div>
                <div className="flex items-center text-sm text-gray-600"><div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>Draft</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* SHEETS TAB */}
      {activeTab === 'sheets' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Organization Goal Sheets</h3>
              <p className="text-sm text-gray-500 mt-1">Monitor all employee goals and forcibly unlock sheets if changes are required.</p>
            </div>
            <button onClick={fetchSheets} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><RefreshCcw size={18} /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Cycle</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sheets.map(sheet => {
                  const progress = Math.round(sheet.goals?.reduce((sum, g) => sum + ((g.progressScore||0)*(g.weightage/100)), 0) || 0);
                  return (
                    <tr key={sheet._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{sheet.user?.name || 'Unknown User'}</td>
                      <td className="px-6 py-4 text-gray-500">{sheet.user?.department || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-600">{sheet.year}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider ${
                          sheet.status === 'approved' ? 'bg-green-100 text-green-700' :
                          sheet.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                          sheet.status === 'returned' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>{sheet.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-gray-700">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          disabled={sheet.status !== 'approved' && sheet.status !== 'submitted'}
                          onClick={() => handleUnlockSheet(sheet._id)}
                          className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded shadow-sm hover:bg-gray-50 hover:text-red-600 hover:border-red-300 transition disabled:opacity-30"
                        >
                          <LockOpen size={14} className="mr-1.5" /> Force Unlock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {sheets.length === 0 && <div className="p-8 text-center text-gray-500">No goal sheets found.</div>}
          </div>
        </motion.div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="text-lg font-bold text-gray-900">User Management</h3>
              <p className="text-sm text-gray-500 mt-1">Manage employee access, roles, and reporting hierarchies.</p>
            </div>
            <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition">
              <Plus size={16} className="mr-2" /> New User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Manager</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-bold text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{user.role}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.department || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{user.managerId?.name || '-'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"><Edit2 size={16} /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* AUDIT TAB */}
      {activeTab === 'audit' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="text-lg font-bold text-gray-900">System Audit Logs</h3>
              <p className="text-sm text-gray-500 mt-1">Immutable ledger of all critical system events and state changes.</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search logs..." className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">User / Actor</th>
                  <th className="px-6 py-4">Action Event</th>
                  <th className="px-6 py-4">Target Model</th>
                  <th className="px-6 py-4">Document ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{log.user?.name || 'System'}</p>
                      <p className="text-[10px] text-gray-500 uppercase">{log.user?.role || 'SYSTEM'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-1 rounded border border-gray-200 font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{log.model}</td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">{log.documentId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && <div className="p-8 text-center text-gray-500">No audit logs found.</div>}
          </div>
        </motion.div>
      )}

      {/* REPORTING TAB */}
      {activeTab === 'reporting' && (
        <ReportingModule />
      )}

    </motion.div>
  );
};
export default AdminDashboard;
