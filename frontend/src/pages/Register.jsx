import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { registerUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Defaults to 'employee' role as per AuthContext
      await registerUser(name, email, password);
      toast.success('Account created successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
              <span className="text-white font-display font-bold text-xl">A</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">ATOMQUEST</h1>
          </div>
          
          <div className="max-w-md mt-24">
            <h2 className="text-4xl font-display font-bold text-white leading-tight mb-6">
              Empower Your <br/><span className="text-brand-300">Career Journey.</span>
            </h2>
            <p className="text-brand-100 text-lg">
              Join your organization's workspace to track goals, log check-ins, and achieve excellence.
            </p>
          </div>
        </div>
        
        <div className="relative z-10 text-brand-400 text-sm font-medium">
          &copy; {new Date().getFullYear()} AtomQuest Inc. All rights reserved.
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="flex lg:hidden items-center justify-center space-x-3 mb-12">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-glow">
              <span className="text-white font-display font-bold text-xl">A</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">ATOMQUEST</h1>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Create an account</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sign up to access your corporate performance portal.</p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label className="label-text">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
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
                <label className="label-text">Password</label>
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
              Sign Up
            </button>
          </form>
          
          <div className="text-sm text-center lg:text-left text-slate-500 dark:text-slate-400 mt-6">
            Already have an account? <Link to="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
