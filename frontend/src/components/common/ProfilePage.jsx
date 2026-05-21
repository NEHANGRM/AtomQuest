import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, Lock, Mail, ShieldAlert, Award } from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    try {
      setIsUpdating(true);
      await updateProfile({ name, email, password: password || undefined });
      toast.success('Profile updated successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden animate-fade-in">
      <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-55/50 dark:bg-slate-900/50">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">My Profile Settings</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View and update your personal credentials and account settings.</p>
      </div>

      <form onSubmit={handleUpdateProfile} className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="label-text">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                required
                className="input-field pl-9"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label-text">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="email"
                required
                className="input-field pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label-text">Role Permissions</label>
            <div className="relative">
              <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                disabled
                className="input-field pl-9 bg-slate-50 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed capitalize border-slate-200 dark:border-slate-700"
                value={user?.role || ''}
              />
            </div>
          </div>

          <div>
            <label className="label-text">Department</label>
            <div className="relative">
              <ShieldAlert className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                disabled
                className="input-field pl-9 bg-slate-50 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-700"
                value={user?.department || 'Corporate'}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Change Password</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="label-text">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="password"
                  placeholder="Leave blank to keep current"
                  className="input-field pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label-text">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="input-field pl-9"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isUpdating}
            className="btn-primary px-6"
          >
            {isUpdating ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
