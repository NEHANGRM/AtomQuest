import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Target, Activity, Users } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">ATOMQUEST</h1>
        </div>
        <nav className="p-4 space-y-2">
          <button className="flex items-center w-full px-4 py-2 text-left bg-blue-50 text-blue-700 rounded-md">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </button>
          <button className="flex items-center w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-50 rounded-md">
            <Target className="w-5 h-5 mr-3" /> My Goals
          </button>
          {(user?.role === 'manager' || user?.role === 'admin') && (
            <button className="flex items-center w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-50 rounded-md">
              <Users className="w-5 h-5 mr-3" /> Team Goals
            </button>
          )}
          {user?.role === 'admin' && (
            <button className="flex items-center w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-50 rounded-md">
              <Activity className="w-5 h-5 mr-3" /> Audit Logs
            </button>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Welcome, {user?.name}</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 uppercase">{user?.role}</span>
            <button onClick={handleLogout} className="p-2 text-gray-600 hover:text-red-600">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dashboard Cards Placeholder */}
            <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
              <h3 className="text-gray-500 text-sm font-medium">Total Goals</h3>
              <p className="text-3xl font-bold mt-2">12</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
              <h3 className="text-gray-500 text-sm font-medium">Completed</h3>
              <p className="text-3xl font-bold mt-2 text-green-600">4</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
              <h3 className="text-gray-500 text-sm font-medium">Progress</h3>
              <p className="text-3xl font-bold mt-2 text-blue-600">33%</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
