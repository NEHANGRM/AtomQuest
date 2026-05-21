import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, Activity, Unlock, Database, Shield, LayoutDashboard, Search, Plus, Edit2, Trash2, CheckCircle, RefreshCcw, Download
} from 'lucide-react';
import { toast } from 'sonner';
import ReportingModule from './ReportingModule';
import { useTheme } from '../../context/ThemeContext';

const AdminDashboard = ({ activeNav, setActiveNav }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, sheets, audit, reporting
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const getTabFromNav = (nav) => {
    switch (nav) {
      case 'dashboard': return 'overview';
      case 'team': return 'users';
      case 'reports': return 'reporting';
      case 'audit': return 'audit';
      default: return 'overview';
    }
  };

  const getNavFromTab = (tab) => {
    switch (tab) {
      case 'overview': return 'dashboard';
      case 'users': return 'team';
      case 'reporting': return 'reports';
      case 'audit': return 'audit';
      default: return 'dashboard';
    }
  };

  useEffect(() => {
    if (activeNav) {
      const mappedTab = getTabFromNav(activeNav);
      if (activeNav === 'dashboard' && activeTab === 'sheets') {
        // Keep sheets sub-tab
      } else {
        setActiveTab(mappedTab);
      }
    }
  }, [activeNav]);

  const changeTab = (tab) => {
    setActiveTab(tab);
    if (setActiveNav) {
      if (tab === 'sheets') {
        setActiveNav('dashboard');
      } else {
        setActiveNav(getNavFromTab(tab));
      }
    }
  };

  // Audit Filters
  const [auditSearch, setAuditSearch] = useState('');
  const [auditAction, setAuditAction] = useState('All');
  const [auditModel, setAuditModel] = useState('All');
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/api/admin/stats');
      setStats(res.data);
      
      const analyticsRes = await api.get('/api/reports/analytics');
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
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
      const queryParams = new URLSearchParams();
      if (auditSearch) queryParams.append('search', auditSearch);
      if (auditAction !== 'All') queryParams.append('action', auditAction);
      if (auditModel !== 'All') queryParams.append('modelFilter', auditModel);

      const res = await api.get(`/api/admin/audit?${queryParams.toString()}`);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'sheets') fetchSheets();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'audit') fetchLogs();
  }, [activeTab, auditSearch, auditAction, auditModel]);

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

  // Real data for charts from backend
  const completionData = analytics?.departmentProgress || [
    { name: 'Engineering', completed: 0 },
    { name: 'Sales', completed: 0 }
  ];

  const pieData = analytics?.statusDistribution || [
    { name: 'Completed', value: 0 },
    { name: 'On Track', value: 0 },
    { name: 'Not Started', value: 0 },
  ];
  
  const trendData = analytics?.quarterlyTrends || [
    { quarter: 'Q1', activity: 0 },
    { quarter: 'Q2', activity: 0 },
    { quarter: 'Q3', activity: 0 },
    { quarter: 'Q4', activity: 0 }
  ];

  const COLORS = ['#10b981', '#0d9488', '#f59e0b'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Top Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-800 p-2 flex flex-wrap gap-2">
        <button onClick={() => changeTab('overview')} className={`px-4 py-2 text-sm font-semibold rounded-xl flex items-center transition-all ${activeTab === 'overview' ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
          <LayoutDashboard size={16} className="mr-2" /> Org Overview
        </button>
        <button onClick={() => changeTab('sheets')} className={`px-4 py-2 text-sm font-semibold rounded-xl flex items-center transition-all ${activeTab === 'sheets' ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
          <Activity size={16} className="mr-2" /> Goal Sheets
        </button>
        <button onClick={() => changeTab('users')} className={`px-4 py-2 text-sm font-semibold rounded-xl flex items-center transition-all ${activeTab === 'users' ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
          <Users size={16} className="mr-2" /> User Management
        </button>
        <button onClick={() => changeTab('audit')} className={`px-4 py-2 text-sm font-semibold rounded-xl flex items-center transition-all ${activeTab === 'audit' ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
          <Shield size={16} className="mr-2" /> Security & Audit
        </button>
        <button onClick={() => changeTab('reporting')} className={`px-4 py-2 text-sm font-semibold rounded-xl flex items-center transition-all ${activeTab === 'reporting' ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
          <Download size={16} className="mr-2" /> Export Reports
        </button>
      </div>

      {isLoading && activeTab === 'overview' && (
        <div className="animate-fade-in space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="h-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"></div>
             <div className="h-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"></div>
             <div className="h-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"></div>
             <div className="h-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="h-80 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"></div>
             <div className="h-80 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"></div>
          </div>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {!isLoading && activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-brand-50 dark:bg-brand-900/20 text-brand-650 dark:text-brand-400 rounded-lg"><Users size={24} /></div>
              <div><p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Total Users</p><h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.usersCount || 0}</h3></div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-650 dark:text-teal-400 rounded-lg"><Database size={24} /></div>
              <div><p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Goal Sheets Active</p><h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.sheetsCount || 0}</h3></div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-650 dark:text-emerald-400 rounded-lg"><CheckCircle size={24} /></div>
              <div><p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Sheets Approved</p><h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.approvedCount || 0}</h3></div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-650 dark:text-purple-400 rounded-lg"><Activity size={24} /></div>
              <div><p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Avg Org Progress</p><h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.avgCompletion || 0}%</h3></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Department Completion Rates</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={theme === 'dark' ? '#334155' : '#f3f4f6'} />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} width={80} tick={{ fill: theme === 'dark' ? '#cbd5e1' : '#475569' }} />
                    <RechartsTooltip cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb', backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#000000' }} />
                    <Bar dataKey="completed" fill="#0d9488" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Goal Sheet Status Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb', backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#000000' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-slate-400"><div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>Completed</div>
                <div className="flex items-center text-sm text-gray-600 dark:text-slate-400"><div className="w-3 h-3 bg-brand-500 rounded-full mr-2"></div>On Track</div>
                <div className="flex items-center text-sm text-gray-600 dark:text-slate-400"><div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>Not Started</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm mt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Quarterly Check-In Activity Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f3f4f6'} />
                  <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#cbd5e1' : '#475569' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#cbd5e1' : '#475569' }} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#000000', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="activity" stroke="#0d9488" strokeWidth={3} dot={{ r: 4, fill: '#0d9488', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* SHEETS TAB */}
      {activeTab === 'sheets' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Organization Goal Sheets</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Monitor all employee goals and forcibly unlock sheets if changes are required.</p>
            </div>
            <button onClick={fetchSheets} className="p-2 text-gray-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition"><RefreshCcw size={18} /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Cycle</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {sheets.map(sheet => {
                  const progress = Math.round(sheet.goals?.reduce((sum, g) => sum + ((g.progressScore||0)*(g.weightage/100)), 0) || 0);
                  return (
                    <tr key={sheet._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{sheet.user?.name || 'Unknown User'}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{sheet.user?.department || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{sheet.year}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider ${
                          sheet.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50' :
                          sheet.status === 'submitted' ? 'bg-brand-100 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-900/50' :
                          sheet.status === 'returned' ? 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-850 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50' :
                          'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                        }`}>{sheet.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-600 dark:bg-brand-500 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-gray-700 dark:text-slate-350">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          disabled={sheet.status !== 'approved' && sheet.status !== 'submitted'}
                          onClick={() => handleUnlockSheet(sheet._id)}
                          className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-xs font-medium rounded shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-red-650 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-900/50 transition disabled:opacity-30"
                        >
                          <Unlock size={14} className="mr-1.5" /> Force Unlock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {sheets.length === 0 && <div className="p-8 text-center text-gray-500 dark:text-slate-400">No goal sheets found.</div>}
          </div>
        </motion.div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Management</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage employee access, roles, and reporting hierarchies.</p>
            </div>
            <button className="flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-650 text-white text-sm font-medium rounded-lg shadow-sm transition">
              <Plus size={16} className="mr-2" /> New User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Manager</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{user.name}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider ${
                        user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400' :
                        user.role === 'manager' ? 'bg-brand-100 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400' :
                        'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-350'
                      }`}>{user.role}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-350">{user.department || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-350">{user.managerId?.name || '-'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="p-1.5 text-gray-400 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-450 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded transition"><Edit2 size={16} /></button>
                      <button className="p-1.5 text-gray-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition"><Trash2 size={16} /></button>
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50 dark:bg-slate-900/50">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">System Audit Logs</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Immutable ledger of all critical system events and state changes.</p>
            </div>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <select value={auditModel} onChange={e => setAuditModel(e.target.value)} className="text-sm border-gray-300 dark:border-slate-700 rounded-lg p-2 border bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-350 focus:ring-2 focus:ring-brand-500 outline-none">
                <option value="All">All Models</option>
                <option value="GoalSheet">Goal Sheets</option>
                <option value="Goal">Goals</option>
                <option value="CheckIn">Check-Ins</option>
                <option value="User">Users</option>
              </select>
              <select value={auditAction} onChange={e => setAuditAction(e.target.value)} className="text-sm border-gray-300 dark:border-slate-700 rounded-lg p-2 border bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-350 focus:ring-2 focus:ring-brand-500 outline-none">
                <option value="All">All Actions</option>
                <option value="CREATE">Creates</option>
                <option value="UPDATE">Updates</option>
                <option value="DELETE">Deletes</option>
                <option value="FEEDBACK">Feedback</option>
                <option value="STATUS">Status Changes</option>
              </select>
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 w-4 h-4" />
                <input 
                  type="text" 
                  value={auditSearch}
                  onChange={e => setAuditSearch(e.target.value)}
                  placeholder="Search logs..." 
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">User / Actor</th>
                  <th className="px-6 py-4">Action Event</th>
                  <th className="px-6 py-4">Target Model</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {logs.map(log => (
                  <React.Fragment key={log._id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition cursor-pointer" onClick={() => setExpandedLogId(expandedLogId === log._id ? null : log._id)}>
                      <td className="px-6 py-4 text-xs font-mono text-gray-500 dark:text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 dark:text-white">{log.user?.name || 'System'}</p>
                        <p className="text-[10px] text-gray-500 dark:text-slate-450 uppercase">{log.user?.role || 'SYSTEM'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 text-[10px] font-bold px-2 py-1 rounded border border-gray-200 dark:border-slate-700 font-mono">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-650 dark:text-slate-300 font-medium">{log.model}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-850 dark:hover:text-brand-300 font-medium">
                          {expandedLogId === log._id ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>
                    {expandedLogId === log._id && (
                      <tr className="bg-gray-50/50 dark:bg-slate-900/50">
                        <td colSpan="5" className="px-6 py-4 border-t border-gray-100 dark:border-slate-800">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-slate-800 p-3 rounded border border-gray-200 dark:border-slate-700 shadow-sm overflow-x-auto">
                              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">Previous State</p>
                              <pre className="text-[11px] font-mono text-red-650 dark:text-red-400">{JSON.stringify(log.previousValue || {}, null, 2)}</pre>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-3 rounded border border-gray-200 dark:border-slate-700 shadow-sm overflow-x-auto">
                              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">New State</p>
                              <pre className="text-[11px] font-mono text-green-650 dark:text-green-400">{JSON.stringify(log.newValue || {}, null, 2)}</pre>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-gray-500 dark:text-slate-450 font-mono">Document ID: {log.documentId}</div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && <div className="p-8 text-center text-gray-500 dark:text-slate-400">No audit logs found.</div>}
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
