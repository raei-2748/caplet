import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.getPublicProfile(userId);
        if (!cancelled && res?.user) setProfile(res.user);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isAuthenticated, userId, navigate]);

  if (!isAuthenticated) return null;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center page-section-light">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand border-t-transparent" />
      </div>
    );
  }
  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 page-section-light">
        <div className="text-center">
          <span className="section-kicker mb-4 text-red-500">System Notice</span>
          <p className="text-zinc-500 dark:text-zinc-400 mb-4 text-xs font-bold uppercase tracking-widest">
            {error || 'User not found'}
          </p>
          <Link to="/courses" className="btn-primary text-[10px] px-8 py-3">Back to Courses</Link>
        </div>
      </div>
    );
  }

  const roleLabel = profile.role === 'admin' ? 'Admin' : profile.role === 'instructor' ? 'Teacher' : 'Student';
  const initials = [profile.firstName, profile.lastName]
    .map((s) => (s || '').charAt(0))
    .join('')
    .toUpperCase() || '?';
  const colors = [
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-emerald-400 to-emerald-600',
  ];
  const colorIndex = (profile.firstName + profile.lastName).split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;

  return (
    <div className="min-h-screen py-24 page-section-light">
      <div className="container-custom">
        <div className="max-w-lg mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6"
        >
          ← Back
        </button>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 overflow-hidden p-8">
          <div className="pb-2 mb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                {initials}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-black dark:text-white uppercase tracking-tight">
                  {profile.firstName} {profile.lastName}
                </h1>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{roleLabel}</span>
              </div>
            </div>
            {profile.bio && (
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap font-medium leading-relaxed uppercase tracking-tight">
                  {profile.bio}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
