import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const SettingsAccount = () => {
  const { user, updateProfile } = useAuth();
  const { isSidebar, toggleNavLayout } = useTheme();
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSwitchRole = async () => {
    if (user?.role === 'admin') return;
    setUpdating(true);
    setMessage({ type: '', text: '' });
    try {
      const nextRole = user?.role === 'instructor' ? 'student' : 'instructor';
      await updateProfile({ role: nextRole });
      setMessage({ type: 'success', text: 'Role updated. You are now a ' + (nextRole === 'instructor' ? 'teacher' : 'student') + '.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update role.' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <div className="pb-8 border-b border-line-soft mb-12">
        <h2 className="text-xl font-bold text-text-primary">Account Settings.</h2>
        <p className="text-sm font-medium text-text-dim mt-2">
          Manage your account role and preferences.
        </p>
      </div>
      <div className="space-y-12">
        {message.text && (
          <div
            className={`px-6 py-4 border font-medium text-sm ${message.type === 'success'
              ? 'border-accent text-accent'
              : 'border-line-error text-text-error'
              }`}
          >
            {message.type === 'success' ? 'Success:' : 'Error:'} {message.text}
          </div>
        )}

        {/* Navigation Layout */}
        <div>
          <h3 className="text-sm font-semibold text-text-dim mb-6">Navigation Layout</h3>
          <div className="p-10 bg-surface-soft border border-line-soft">
            <p className="text-sm font-medium text-text-dim leading-relaxed mb-8 max-w-sm">
              Choose between a top navigation bar or a collapsible vertical sidebar. The sidebar is only available on larger screens.
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => isSidebar && toggleNavLayout()}
                className={`flex flex-col items-center gap-3 px-6 py-5 border rounded-lg transition-all duration-200 ${
                  !isSidebar
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-line-soft text-text-dim hover:border-text-dim hover:text-text-primary'
                }`}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span className="text-xs font-semibold">Top bar</span>
              </button>
              <button
                type="button"
                onClick={() => !isSidebar && toggleNavLayout()}
                className={`flex flex-col items-center gap-3 px-6 py-5 border rounded-lg transition-all duration-200 ${
                  isSidebar
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-line-soft text-text-dim hover:border-text-dim hover:text-text-primary'
                }`}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h3v12H4zm6-0h10M10 12h10M10 18h10" />
                </svg>
                <span className="text-xs font-semibold">Sidebar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Access Level */}
        <div>
          <h3 className="text-sm font-semibold text-text-dim mb-6">Access Level</h3>
          <div className="p-10 bg-surface-soft border border-line-soft">
            <p className="text-sm font-medium text-text-dim mb-4">
              Current role:
            </p>
            <p className="text-3xl font-serif italic text-accent mb-8">
              {user?.role === 'admin' ? 'Strategic Admin' : user?.role === 'instructor' ? 'Lead Architect' : 'Scholar'}
            </p>
            {user?.role !== 'admin' && (
              <p className="text-sm font-medium text-text-dim leading-relaxed mb-10 max-w-sm">
                You can switch between teacher and student roles to access different features.
              </p>
            )}
            {user?.role !== 'admin' && (
              <button
                type="button"
                onClick={handleSwitchRole}
                disabled={updating}
                className="btn-primary py-5 px-10 text-sm disabled:opacity-30"
              >
                {updating ? 'Updating...' : user?.role === 'instructor' ? 'Switch to Student' : 'Switch to Teacher'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsAccount;
