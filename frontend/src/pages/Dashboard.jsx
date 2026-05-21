import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, LayoutDashboard, Target, Activity,
  Users, Menu, Bell, Moon, Sun, X, ChevronRight,
  Settings, FileText, TrendingUp
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

import AdminDashboard from '../components/dashboards/AdminDashboard';
import ManagerDashboard from '../components/dashboards/ManagerDashboard';
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard';
import GoalsPage from '../components/goals/GoalsPage';

// Navigation config per role
const NAV_CONFIG = {
  employee: [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'goals', label: 'My Goals', icon: Target },
    { key: 'progress', label: 'Progress', icon: TrendingUp },
  ],
  manager: [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'goals', label: 'My Goals', icon: Target },
    { key: 'team', label: 'Team Overview', icon: Users },
    { key: 'reports', label: 'Reports', icon: FileText },
  ],
  admin: [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'team', label: 'User Management', icon: Users },
    { key: 'reports', label: 'Reports & Analytics', icon: TrendingUp },
    { key: 'audit', label: 'System Logs', icon: Activity },
  ],
};

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = NAV_CONFIG[user?.role] || NAV_CONFIG.employee;

  const renderContent = () => {
    if (activeNav === 'goals') return <GoalsPage />;

    // For all other nav items, render the role dashboard
    switch (user?.role) {
      case 'admin':   return <AdminDashboard />;
      case 'manager': return <ManagerDashboard />;
      default:        return <EmployeeDashboard />;
    }
  };

  const getNavLabel = () => navItems.find(n => n.key === activeNav)?.label || 'Dashboard';

  const roleConfig = {
    admin:    { badge: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800', dot: 'bg-rose-500' },
    manager:  { badge: 'bg-brand-100 text-brand-700 border-brand-200 dark:bg-brand-900/20 dark:text-brand-300 dark:border-brand-800', dot: 'bg-brand-500' },
    employee: { badge: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800', dot: 'bg-blue-500' },
  };
  const rc = roleConfig[user?.role] || roleConfig.employee;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-glow flex-shrink-0">
            <span className="text-white font-display font-bold text-lg leading-none">P</span>
          </div>
          <div>
            <h1 className="text-base font-display font-bold text-slate-900 dark:text-white tracking-tight leading-none">PERFORMIX</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-widest uppercase">Goal Tracking Portal</p>
          </div>
        </div>
        <button
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role badge */}
      <div className="px-4 pt-4">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${rc.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${rc.dot} animate-pulse`} />
          {user?.role?.toUpperCase()} ACCESS
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-3 mt-2">Navigation</p>
        {navItems.map(item => {
          const isActive = activeNav === item.key;
          return (
            <button
              key={item.key}
              onClick={() => { setActiveNav(item.key); setIsSidebarOpen(false); }}
              className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-brand-600 text-white shadow-brand'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <item.icon className={`w-4 h-4 mr-3 flex-shrink-0 transition-colors ${
                isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-brand-500'
              }`} />
              {item.label}
              {isActive && <ChevronRight className="w-4 h-4 ml-auto text-brand-200 opacity-70" />}
            </button>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-display font-bold text-base flex-shrink-0 shadow-glow">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{user?.email}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-soft">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-display font-semibold text-slate-900 dark:text-white leading-none">{getNavLabel()}</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 capitalize hidden sm:block">{user?.role} portal</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            <div className="flex items-center space-x-2 pl-1">
              <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-glow">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                {user?.name}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="ml-1 flex items-center px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeNav === 'dashboard' && (
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">
                  Welcome back, <span className="text-brand-600 dark:text-brand-400">{user?.name?.split(' ')[0]}</span> 👋
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            )}

            <motion.div
              key={activeNav}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {renderContent()}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
