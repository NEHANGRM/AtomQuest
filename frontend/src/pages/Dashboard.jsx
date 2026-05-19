import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Target, Activity, Users, Menu, Bell, Moon, Sun, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

import AdminDashboard from '../components/dashboards/AdminDashboard';
import ManagerDashboard from '../components/dashboards/ManagerDashboard';
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'employee':
      default:
        return <EmployeeDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-surface-light dark:bg-surface-darker font-sans transition-colors duration-300">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div 
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        className={`fixed md:relative w-64 h-full bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex flex-col z-40 shadow-soft md:transform-none ${isSidebarOpen ? 'transform-none' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center mr-3 shadow-glow">
              <span className="text-white font-display font-bold text-lg">P</span>
            </div>
            <h1 className="text-xl font-display font-bold text-slate-800 dark:text-white tracking-tight">PERFORMIX</h1>
          </div>
          <button className="md:hidden text-slate-500 dark:text-slate-400" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-4">Menu</p>
          <button className="flex items-center w-full px-4 py-2.5 text-left bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium rounded-lg transition-all hover:bg-brand-100 dark:hover:bg-brand-900/50">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </button>
          <button className="flex items-center w-full px-4 py-2.5 text-left text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium rounded-lg transition-all">
            <Target className="w-5 h-5 mr-3" /> My Goals
          </button>
          
          {(user?.role === 'manager' || user?.role === 'admin') && (
            <button className="flex items-center w-full px-4 py-2.5 text-left text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium rounded-lg transition-all">
              <Users className="w-5 h-5 mr-3" /> Team Overview
            </button>
          )}
          
          {user?.role === 'admin' && (
            <button className="flex items-center w-full px-4 py-2.5 text-left text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium rounded-lg transition-all">
              <Activity className="w-5 h-5 mr-3" /> System Logs
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-300 flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Navbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 transition-colors duration-300">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg mr-3 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-display font-semibold text-slate-800 dark:text-white capitalize hidden sm:block">
              {user?.role} Portal
            </h2>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark"></span>
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 sm:mx-2"></div>
            <button 
              onClick={handleLogout} 
              className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Here is what's happening with your goals today.</p>
            </div>
            
            {renderDashboard()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
