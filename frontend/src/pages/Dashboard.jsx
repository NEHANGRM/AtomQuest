import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Target, Activity, Users, Menu, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

import AdminDashboard from '../components/dashboards/AdminDashboard';
import ManagerDashboard from '../components/dashboards/ManagerDashboard';
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 hidden md:flex flex-col z-20 shadow-sm"
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">ATOMQUEST</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">Menu</p>
          <button className="flex items-center w-full px-4 py-2.5 text-left bg-blue-50 text-blue-700 font-medium rounded-lg transition-colors">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </button>
          <button className="flex items-center w-full px-4 py-2.5 text-left text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors">
            <Target className="w-5 h-5 mr-3" /> My Goals
          </button>
          
          {(user?.role === 'manager' || user?.role === 'admin') && (
            <button className="flex items-center w-full px-4 py-2.5 text-left text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors">
              <Users className="w-5 h-5 mr-3" /> Team Overview
            </button>
          )}
          
          {user?.role === 'admin' && (
            <button className="flex items-center w-full px-4 py-2.5 text-left text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors">
              <Activity className="w-5 h-5 mr-3" /> System Logs
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Navbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-800 border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center">
            <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg mr-3">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white capitalize hidden sm:block">
              {user?.role} Portal
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            <button 
              onClick={handleLogout} 
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </button>
          </div>
        </header>

        {/* Dashboard Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50/50">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
              <p className="text-gray-500 mt-1">Here is what's happening with your goals today.</p>
            </div>
            
            {renderDashboard()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
