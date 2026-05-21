import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showMicrosoftSSO, setShowMicrosoftSSO] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [selectedSSOAcc, setSelectedSSOAcc] = useState(null);
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

  /**
   * PRODUCTION ARCHITECTURE NOTE: Microsoft Entra ID (Azure AD) SSO Integration
   * In a production environment, this simulated Microsoft SSO flow would be replaced by:
   * 1. Configuring an App Registration in Microsoft Entra ID Portal.
   * 2. Configuring Redirect URIs, generating a Client Secret, and assigning Microsoft Graph permissions:
   *    - `User.Read` (Profile details)
   *    - `GroupMember.Read.All` (To check Performix role groups)
   *    - `Directory.Read.All` (To sync reporting hierarchy)
   * 3. On the client, initializing `@azure/msal-browser` (Microsoft Authentication Library) to initiate 
   *    the sign-in redirect flow or popup and obtain an ID/Access token.
   * 4. On the server, validating the token signature using Microsoft's JSON Web Key Sets (JWKS) from
   *    `https://login.microsoftonline.com/common/discovery/v2.0/keys`.
   * 5. Extracting the Microsoft claims, executing automated User Hierarchy Sync, mapping Entra ID Security Groups 
   *    (e.g., Performix-Admins, Performix-Managers) to roles, and generating the local application session/JWT.
   */
  const handleSSOLogin = async (ssoEmail, ssoPassword) => {
    try {
      setSsoLoading(true);
      // Simulate consent authorization and directory syncing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      await login(ssoEmail, ssoPassword);
      toast.success('Microsoft Entra ID SSO Authentication Successful!');
      setShowMicrosoftSSO(false);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Microsoft Sign-in Failed');
    } finally {
      setSsoLoading(false);
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

          <div className="relative my-5 flex items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider font-bold">or</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedSSOAcc(null);
              setShowMicrosoftSSO(true);
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all font-semibold text-slate-700 dark:text-slate-200 shadow-sm"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#F25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
              <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
            </svg>
            <span>Sign in with Microsoft</span>
          </button>
          
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Quick Login (Click to auto-fill)</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => { setEmail('admin@gmail.com'); setPassword('admin'); }}
                  className="w-full flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-brand-500 dark:hover:border-brand-500 transition-all text-xs text-left group"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    <span className="text-brand-600 dark:text-brand-400 font-semibold mr-1">Admin:</span> admin@gmail.com
                  </span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-mono group-hover:bg-brand-50 group-hover:text-brand-700 dark:group-hover:bg-brand-900/30 dark:group-hover:text-brand-300">pw: admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('manager@gmail.com'); setPassword('manager'); }}
                  className="w-full flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-brand-500 dark:hover:border-brand-500 transition-all text-xs text-left group"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    <span className="text-brand-600 dark:text-brand-400 font-semibold mr-1">Manager:</span> manager@gmail.com
                  </span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-mono group-hover:bg-brand-50 group-hover:text-brand-700 dark:group-hover:bg-brand-900/30 dark:group-hover:text-brand-300">pw: manager</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('demouser@gmail.com'); setPassword('user'); }}
                  className="w-full flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-brand-500 dark:hover:border-brand-500 transition-all text-xs text-left group"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    <span className="text-brand-600 dark:text-brand-400 font-semibold mr-1">Employee:</span> demouser@gmail.com
                  </span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-mono group-hover:bg-brand-50 group-hover:text-brand-700 dark:group-hover:bg-brand-900/30 dark:group-hover:text-brand-300">pw: user</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-center lg:text-left text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account? <Link to="/register" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Request access</Link>
          </div>
        </div>
      </div>

      {showMicrosoftSSO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all">
            {/* Microsoft SSO Branding Header */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 21 21">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                </svg>
                <span className="font-semibold text-slate-700 dark:text-slate-200 text-lg tracking-tight font-display">Microsoft Entra ID</span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">Permissions requested</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Performix Portal &middot; performix.atomquest.com</p>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                This application requires consent to access organization resources. If you accept, this app will have access to:
              </p>

              {/* Permissions List */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-start space-x-2.5">
                  <input type="checkbox" checked readOnly className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Read user profile (`User.Read`)</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">Allows logging in and loading full name, email, and department.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2.5">
                  <input type="checkbox" checked readOnly className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Sync Org Hierarchy (`Directory.Read.All`)</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">Enables automatic reporting manager linkage and user data synchronization.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <input type="checkbox" checked readOnly className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Role Mapping via Groups (`GroupMember.Read.All`)</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">Maps MS Security Groups (e.g. `Performix-Admins`) to portal access levels.</p>
                  </div>
                </div>
              </div>

              {/* Account Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Select Account to Simulate Auth</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { name: 'System Admin', email: 'admin@gmail.com', password: 'admin', role: 'Admin' },
                    { name: 'Jane Manager', email: 'manager@gmail.com', password: 'manager', role: 'Manager' },
                    { name: 'Demo User', email: 'demouser@gmail.com', password: 'user', role: 'Employee' },
                  ].map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => setSelectedSSOAcc(acc)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        selectedSSOAcc?.email === acc.email
                          ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-950/20 ring-1 ring-brand-500'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{acc.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{acc.email}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        acc.role === 'Admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                        acc.role === 'Manager' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                        'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                      }`}>
                        {acc.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="orgConsent" defaultChecked className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                <label htmlFor="orgConsent" className="text-[11px] text-slate-500 dark:text-slate-400 cursor-pointer">
                  Consent on behalf of your organization (Acme Industries Pvt. Ltd.)
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowMicrosoftSSO(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedSSOAcc || ssoLoading}
                onClick={() => handleSSOLogin(selectedSSOAcc.email, selectedSSOAcc.password)}
                className="btn-primary px-5 py-2 text-sm font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ssoLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Syncing Directory...</span>
                  </>
                ) : (
                  <span>Accept & Sign In</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
