import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, LayoutDashboard, Target, Activity,
  Users, Menu, Bell, Moon, Sun, X, ChevronRight, Settings
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

import AdminDashboard from '../components/dashboards/AdminDashboard';
import ManagerDashboard from '../components/dashboards/ManagerDashboard';
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, roles: ['employee', 'manager', 'admin'] },
  { label: 'My Goals', icon: Target, roles: ['employee', 'manager', 'admin'] },
  { label: 'Team Overview', icon: Users, roles: ['manager', 'admin'] },
  { label: 'System Logs', icon: Activity, roles: ['admin'] },
  { label: 'Settings', icon: Settings, roles: ['employee', 'manager', 'admin'] },
];

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Dashboard');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin': return <AdminDashboard />;
      case 'manager': return <ManagerDashboard />;
      case 'employee':
      default: return <EmployeeDashboard />;
    }
  };

  const roleColor = {
    admin: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    manager: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
    employee: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-glow flex-shrink-0">
            <span className="text-white font-display font-bold text-lg leading-none">P</span>
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-slate-900 dark:text-white tracking-tight leading-none">PERFORMIX</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-widest uppercase">Performance Portal</p>
          </div>
        </div>
        <button
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-3 mt-2">Navigation</p>
        {NAV_ITEMS.filter(item => item.roles.includes(user?.role)).map(item => {
          const isActive = activeNav === item.label;
          return (
            <button
              key={item.label}
              onClick={() => { setActiveNav(item.label); setIsSidebarOpen(false); }}
              className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <item.icon className={`w-4.5 h-4.5 mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-brand-500'}`} />
              {item.label}
              {isActive && <ChevronRight className="w-4 h-4 ml-auto text-brand-200" />}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-display font-bold text-base flex-shrink-0 shadow-glow">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${roleColor[user?.role]}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">

      {/* ── Desktop Sidebar (always visible) ── */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-soft">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar (drawer) ── */}
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
              className="fixed top-0 left-0 h-full w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 shadow-2xl md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 z-10">
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-display font-semibold text-slate-900 dark:text-white capitalize leading-none">
                {activeNav}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 capitalize hidden sm:block">
                {user?.role} portal
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* User avatar */}
            <div className="flex items-center space-x-2 pl-1">
              <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-glow">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                {user?.name}
              </span>
            </div>

            {/* Logout */}
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
            {/* Welcome Banner */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">
                  Welcome back, <span className="text-brand-600 dark:text-brand-400">{user?.name?.split(' ')[0]}</span> 👋
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className={`hidden sm:flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${
                user?.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800' :
                user?.role === 'manager' ? 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/20 dark:text-brand-300 dark:border-brand-800' :
                'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse" />
                {user?.role?.toUpperCase()} ACCESS
              </div>
            </div>

            {/* Dashboard Content */}
            <motion.div
              key={user?.role}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderDashboard()}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
