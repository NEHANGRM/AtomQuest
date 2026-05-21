import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Target, Shield, TrendingUp, Users, ArrowRight, Sun, Moon, 
  Layers, CheckCircle, Clock, Zap, BarChart3, Database
} from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "Goal Cascading & Alignment",
      description: "Define SMART goal sheets and cascade strategic KPIs across departments to align individual aspirations with organizational growth.",
      color: "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/30"
    },
    {
      icon: Clock,
      title: "Continuous Check-ins",
      description: "Empower employees to update milestones quarterly and log actual values, while enabling managers to provide continuous feedback.",
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30"
    },
    {
      icon: BarChart3,
      title: "Enterprise Analytics & Reports",
      description: "Equip leadership with aggregate department metrics, status distributions, and automated CSV/Excel exports for audit compliance.",
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col font-sans overflow-x-hidden">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-glow">
              <span className="text-white font-display font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-display font-bold tracking-tight text-slate-900 dark:text-white">PERFORMIX</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link 
              to="/login" 
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-450 transition"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="btn-primary py-2 px-4 text-xs font-bold"
            >
              Request Access
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col">
        <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-24 overflow-hidden">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-pulse-slow"></div>
            <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
              
              {/* Left Column: Copy */}
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 border border-brand-200/50 dark:border-brand-900/50 mb-6">
                    <Zap className="w-3 h-3 mr-1.5 fill-brand-600 dark:fill-brand-400" /> Goal Alignment & Performance Platform
                  </span>
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                    Enterprise Performance, <br/>
                    <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-emerald-400">
                      Elevated & Aligned.
                    </span>
                  </h1>
                  
                  <p className="mt-6 text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                    Performix bridges the gap between organizational strategy and day-to-day execution. Establish transparent Goal Sheets, log continuous check-ins, and make data-driven alignment decisions in one unified portal.
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                    <button
                      onClick={() => navigate('/login')}
                      className="btn-primary py-3 px-6 text-sm shadow-brand flex items-center justify-center font-bold"
                    >
                      Sign In to Portal <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                    <button
                      onClick={() => navigate('/register')}
                      className="btn-secondary py-3 px-6 text-sm flex items-center justify-center font-semibold"
                    >
                      Request Workspace Access
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Interactive Mock UI */}
              <div className="mt-16 sm:mt-20 lg:mt-0 lg:col-span-6 relative flex justify-center">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card p-6 relative overflow-hidden"
                >
                  {/* Glassmorphic overlay effect */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-brand-500/10 to-emerald-500/10 rounded-full blur-xl"></div>
                  
                  {/* Header mock */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Goal Sheet Overview</h4>
                        <p className="text-[10px] text-slate-400">FY 2026 Cycle · Active</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      APPROVED
                    </span>
                  </div>

                  {/* Goal List Mock */}
                  <div className="space-y-4">
                    {/* Goal 1 */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-150 dark:border-slate-800/80">
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Optimize Cloud Infrastructure Costs</p>
                          <p className="text-[10px] text-slate-400">Thrust: Infrastructure Efficiency</p>
                        </div>
                        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-1.5 py-0.5 rounded">
                          W: 40%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Target: $120k / yr</span>
                        <span className="font-semibold text-brand-600 dark:text-brand-400">85% Complete</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>

                    {/* Goal 2 */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-150 dark:border-slate-800/80">
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Deliver Performance Portal Core V1</p>
                          <p className="text-[10px] text-slate-400">Thrust: Feature Delivery</p>
                        </div>
                        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-1.5 py-0.5 rounded">
                          W: 30%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Target: 100% Core Scopes</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">100% Complete</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Stats Card */}
                  <div className="mt-5 p-4 bg-gradient-to-r from-brand-650 to-brand-800 dark:from-brand-900 dark:to-brand-950 text-white rounded-xl flex items-center justify-between shadow-soft">
                    <div>
                      <p className="text-[10px] text-brand-200 font-semibold uppercase tracking-wider">Overall Progress Score</p>
                      <h5 className="text-xl font-bold font-display mt-0.5">94.0%</h5>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-brand-100 bg-brand-900/50 dark:bg-slate-900/30 px-2 py-1 rounded-lg">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      <span>On Track</span>
                    </div>
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Unified System for All Roles</h2>
              <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                Whether you are an administrator managing directory sync, a manager reviewing check-ins, or an employee logging milestone accomplishments, Performix is built for you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.15 }}
                    className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:shadow-soft transition group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${feature.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-450 leading-relaxed">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-400 dark:text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">P</div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">PERFORMIX</span>
            </div>
            <p>&copy; {new Date().getFullYear()} Performix Inc. Built for AtomQuest Hackathon 1.0.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
