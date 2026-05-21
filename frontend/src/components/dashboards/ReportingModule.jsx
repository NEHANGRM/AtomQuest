import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, Filter, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

const ReportingModule = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Filters for Goal Completion Report
  const [gcDepartment, setGcDepartment] = useState('All');
  const [gcYear, setGcYear] = useState(new Date().getFullYear().toString());

  // Filters for Quarterly Achievements Report
  const [qaQuarter, setQaQuarter] = useState('All');

  const handleDownload = async (endpoint, format, filters) => {
    try {
      setIsDownloading(true);
      const queryParams = new URLSearchParams({ format, ...filters }).toString();
      
      const response = await api.get(`/api/reports/${endpoint}?${queryParams}`, {
        responseType: 'blob' // Important for file download
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const extension = format === 'excel' ? 'xlsx' : 'csv';
      const filename = `${endpoint}_report_${Date.now()}.${extension}`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      toast.success(`Successfully downloaded ${format.toUpperCase()} report!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-gradient-to-r from-brand-800 to-brand-950 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-2 flex items-center"><Download className="mr-3" /> Reporting & Data Export</h2>
        <p className="text-brand-100 max-w-2xl">Generate comprehensive system reports, including goal completion metrics and quarterly achievement ledgers. Export directly to CSV or structured Excel formats for HR presentations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Goal Completion Report Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-250 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <CheckCircle size={18} className="mr-2 text-emerald-600" /> Goal Completion Report
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-450 mt-1">Extract performance metrics, weightages, and completion scores for all employee goals.</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1 flex items-center"><Filter size={12} className="mr-1"/> Department</label>
                <select value={gcDepartment} onChange={(e) => setGcDepartment(e.target.value)} className="w-full border-gray-300 dark:border-slate-700 rounded-md p-2 text-sm border bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none">
                  <option value="All">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1 flex items-center"><Filter size={12} className="mr-1"/> Performance Year</label>
                <select value={gcYear} onChange={(e) => setGcYear(e.target.value)} className="w-full border-gray-300 dark:border-slate-700 rounded-md p-2 text-sm border bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none">
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
              <button 
                disabled={isDownloading}
                onClick={() => handleDownload('goal-completion', 'csv', { department: gcDepartment, year: gcYear })}
                className="flex-1 flex items-center justify-center px-4 py-2.5 bg-white dark:bg-slate-850 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-400 text-sm font-medium rounded-lg shadow-sm transition disabled:opacity-50"
              >
                <FileText size={16} className="mr-2 text-gray-400 dark:text-slate-500" /> Download CSV
              </button>
              <button 
                disabled={isDownloading}
                onClick={() => handleDownload('goal-completion', 'excel', { department: gcDepartment, year: gcYear })}
                className="flex-1 flex items-center justify-center px-4 py-2.5 bg-brand-600 dark:bg-brand-500 text-white hover:bg-brand-700 dark:hover:bg-brand-600 text-sm font-medium rounded-lg shadow-md transition disabled:opacity-50"
              >
                <FileSpreadsheet size={16} className="mr-2" /> Download Excel
              </button>
            </div>
          </div>
        </div>

        {/* Quarterly Achievements Report Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-250 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <FileSpreadsheet size={18} className="mr-2 text-brand-600" /> Quarterly Check-Ins Ledger
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-450 mt-1">Extract historical logs of employee check-ins, actual values achieved, and manager feedback.</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1 flex items-center"><Filter size={12} className="mr-1"/> Target Quarter</label>
                <select value={qaQuarter} onChange={(e) => setQaQuarter(e.target.value)} className="w-full border-gray-300 dark:border-slate-700 rounded-md p-2 text-sm border bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none">
                  <option value="All">All Quarters (YTD)</option>
                  <option value="Q1">Q1 Update</option>
                  <option value="Q2">Q2 Update</option>
                  <option value="Q3">Q3 Update</option>
                  <option value="Q4">Q4 Update</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
              <button 
                disabled={isDownloading}
                onClick={() => handleDownload('quarterly', 'csv', { quarter: qaQuarter })}
                className="flex-1 flex items-center justify-center px-4 py-2.5 bg-white dark:bg-slate-850 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-400 text-sm font-medium rounded-lg shadow-sm transition disabled:opacity-50"
              >
                <FileText size={16} className="mr-2 text-gray-400 dark:text-slate-500" /> Download CSV
              </button>
              <button 
                disabled={isDownloading}
                onClick={() => handleDownload('quarterly', 'excel', { quarter: qaQuarter })}
                className="flex-1 flex items-center justify-center px-4 py-2.5 bg-brand-600 dark:bg-brand-500 text-white hover:bg-brand-700 dark:hover:bg-brand-600 text-sm font-medium rounded-lg shadow-md transition disabled:opacity-50"
              >
                <FileSpreadsheet size={16} className="mr-2" /> Download Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReportingModule;
