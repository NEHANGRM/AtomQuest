import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen bg-surface-light dark:bg-surface-darker transition-colors duration-300">
      
      {/* Left Pane - Branding & Art */}
      <div className="hidden lg:flex w-1/2 bg-brand-900 relative overflow-hidden flex-col justify-between p-12">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-slow"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-glow">
              <span className="text-white font-display font-bold text-xl">P</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">PERFORMIX</h1>
          </div>
          
          <div className="max-w-md mt-24">
            <h2 className="text-4xl font-display font-bold text-white leading-tight mb-6">
              Enterprise Performance, <br/><span className="text-brand-300">Elevated.</span>
            </h2>
            <p className="text-brand-100 text-lg">
              The premier SaaS platform for aligning goals, cascading KPIs, and unlocking exponential organizational growth.
            </p>
          </div>
        </div>
        
        <div className="relative z-10 text-brand-400 text-sm font-medium">
          &copy; {new Date().getFullYear()} Performix Inc. All rights reserved.
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="flex lg:hidden items-center justify-center space-x-3 mb-12">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-glow">
              <span className="text-white font-display font-bold text-xl">P</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">PERFORMIX</h1>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Please enter your credentials to access your portal.</p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label className="label-text">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="label-text flex justify-between">
                  <span>Password</span>
                  <a href="#" className="text-brand-600 dark:text-brand-400 hover:underline">Forgot password?</a>
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-3 mt-4 text-base shadow-glow">
              Sign In to Portal
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Demo Accounts</p>
              <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                <p><span className="font-medium text-brand-600 dark:text-brand-400">Admin:</span> admin@test.com</p>
                <p><span className="font-medium text-brand-600 dark:text-brand-400">Manager:</span> manager@test.com</p>
                <p><span className="font-medium text-brand-600 dark:text-brand-400">Employee:</span> emp@test.com</p>
                <p className="mt-2 text-xs italic text-slate-400">Pass: password123</p>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-center lg:text-left text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account? <Link to="/register" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Request access</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
