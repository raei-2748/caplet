import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import CapletLoader from '../components/CapletLoader';
import { coverGradient } from '../lib/coverGradient';

/* ── Section header ───────────────────────────────────────────────────────────── */

function SectionHeader({ label, count }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="font-mono text-[9.5px] font-semibold text-text-dim/60 uppercase tracking-[0.2em] flex items-center gap-2">
        <span className="w-3 h-px bg-text-dim/40 shrink-0" />
        {label}
      </p>
      {count != null && (
        <span className="font-mono text-[10px] text-text-dim uppercase tracking-[0.14em]">
          {count} class{count !== 1 ? 'es' : ''}
        </span>
      )}
    </div>
  );
}

/* ── Class card ───────────────────────────────────────────────────────────────── */

function ClassCard({ cls, role, index }) {
  const isOwner = role === 'teaching';
  return (
    <Link
      to={`/classes/${cls.id}`}
      className="group flex flex-col rounded-2xl border border-line-soft bg-surface-raised overflow-hidden hover:-translate-y-0.5 hover:shadow-minimal-lg transition-all duration-300 animate-fade-slide-up"
      style={{ animationDelay: `${Math.min(index * 40, 300)}ms`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      {/* Cover */}
      <div className="relative h-28 overflow-hidden border-b border-line-soft">
        <div
          className="w-full h-full group-hover:scale-[1.04] transition-transform duration-700"
          style={coverGradient(cls.id)}
        />
        <span className={`absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-md bg-surface-raised border text-[10px] font-bold uppercase tracking-[0.08em] ${
          isOwner
            ? 'border-emerald-400/40 text-emerald-600 dark:text-emerald-400'
            : 'border-line-soft text-text-muted'
        }`}>
          {isOwner ? 'Teacher' : 'Student'}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-5">
        <h3 className="text-[1.05rem] font-display font-bold text-text-primary leading-snug group-hover:text-accent transition-colors duration-200">
          {cls.name}
        </h3>
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between pt-4 border-t border-line-soft">
            <span className="font-mono text-[11px] font-semibold tracking-[0.16em] text-text-muted">
              {cls.code}
            </span>
            <svg
              className="text-text-dim group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-200"
              width="13" height="13" viewBox="0 0 13 13" fill="none"
            >
              <path d="M2.5 6.5h7M6.5 3l3.5 3.5L6.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Empty section ────────────────────────────────────────────────────────────── */

function EmptySection({ message, action }) {
  return (
    <div className="flex flex-col items-center py-14 text-center rounded-2xl border border-dashed border-line-soft bg-surface-raised/40">
      <p className="text-[13.5px] text-text-dim leading-relaxed max-w-[280px] mb-5">{message}</p>
      {action}
    </div>
  );
}

/* ── Modal shell ──────────────────────────────────────────────────────────────── */

function Modal({ title, onClose, children, maxWidth = 'max-w-md' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div className={`relative w-full ${maxWidth} bg-surface-raised border border-line-soft rounded-2xl p-6 shadow-xl animate-fade-slide-up`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[1.2rem] font-display font-bold text-text-primary tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-dim hover:text-text-primary hover:bg-surface-soft transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputClass =
  'w-full h-11 px-4 rounded-xl bg-surface-soft border border-line-soft text-sm font-medium text-text-primary outline-none focus:border-accent transition-colors placeholder:text-text-dim';

/* ── Academy page ─────────────────────────────────────────────────────────────── */

const Classes = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState({ teaching: [], student: [] });
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [joinCode, setJoinCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getClasses();
        setClasses(data);
      } catch (e) {
        console.error('Error loading classes:', e);
        setError(e.message || 'Failed to load classes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  const isTeacher = user?.role === 'instructor' || user?.role === 'admin';

  const refreshClasses = async () => {
    const data = await api.getClasses();
    setClasses(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await api.createClass({
        name: createForm.name.trim(),
        description: createForm.description.trim(),
      });
      setShowCreate(false);
      setCreateForm({ name: '', description: '' });
      await refreshClasses();
    } catch (err) {
      console.error('Create class error:', err);
      setError(err.message || 'Failed to create class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.joinClass(joinCode.trim());
      setShowJoin(false);
      setJoinCode('');
      await refreshClasses();
      navigate(`/classes/${res.classroom.id}`);
    } catch (err) {
      console.error('Join class error:', err);
      setError(err.message || 'Failed to join class');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-surface-body flex items-center justify-center">
        <CapletLoader message="Loading the Academy…" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pt-14 md:pt-[60px] bg-surface-body selection:bg-accent selection:text-white">

      {/* ── Hero ─────────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-line-soft">
        <div className="absolute inset-0 grid-technical opacity-[0.09] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface-body to-transparent pointer-events-none" />

        <div className="relative container-custom py-12 md:py-16 animate-fade-slide-up">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="font-mono text-[10px] font-medium text-accent uppercase tracking-[0.24em] mb-4 flex items-center gap-2">
                <span className="w-3 h-px bg-accent shrink-0" />
                Academy
              </p>
              <h1 className="text-[2.6rem] md:text-[3.5rem] font-display font-bold text-text-primary tracking-tight leading-[1.02]">
                Academy
              </h1>
              <p className="mt-4 text-lg text-text-muted font-serif italic max-w-xl leading-relaxed">
                Collaborative classrooms for learning together.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              {isTeacher && (
                <button onClick={() => setShowCreate(true)} className="btn-secondary px-5 py-2.5 text-sm">
                  Create class
                </button>
              )}
              <button
                onClick={() => {
                  if (!isAuthenticated) return navigate('/login');
                  setShowJoin(true);
                }}
                className="btn-primary px-5 py-2.5 text-sm gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Join class
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────────── */}
      <div className="container-custom py-8 md:py-10 space-y-10">

        {error && (
          <div className="rounded-xl border border-line-error bg-surface-error px-4 py-3 text-sm font-medium text-text-error">
            {error}
          </div>
        )}

        {/* Teaching */}
        {isTeacher && (
          <section className="animate-fade-slide-up stagger-1">
            <SectionHeader label="Teaching" count={classes.teaching.length} />
            {classes.teaching.length === 0 ? (
              <EmptySection
                message="You're not teaching any classes yet. Create one to invite students."
                action={
                  <button onClick={() => setShowCreate(true)} className="btn-primary text-sm px-5 py-2">
                    Create a class
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.teaching.map((cls, i) => (
                  <ClassCard key={cls.id} cls={cls} role="teaching" index={i} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Enrolled */}
        <section className="animate-fade-slide-up stagger-2">
          <SectionHeader label="Enrolled" count={classes.student.length} />
          {classes.student.length === 0 ? (
            <EmptySection
              message="You haven't joined any classes yet. Enter a class code to get started."
              action={
                <button onClick={() => setShowJoin(true)} className="btn-primary text-sm px-5 py-2">
                  Join a class
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.student.map((cls, i) => (
                <ClassCard key={cls.id} cls={cls} role="student" index={i} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────────────── */}
      {showCreate && (
        <Modal title="Create a class" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-text-dim uppercase tracking-wide mb-2 block">Class name</label>
              <input
                type="text"
                autoFocus
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="e.g. Year 10 Economics"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-text-dim uppercase tracking-wide mb-2 block">Description (optional)</label>
              <textarea
                rows={3}
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="What's this class about?"
                className="w-full px-4 py-3 rounded-xl bg-surface-soft border border-line-soft text-sm font-medium text-text-primary outline-none focus:border-accent transition-colors resize-none placeholder:text-text-dim"
              />
            </div>
            <div className="flex items-center gap-2.5 pt-1">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
              <button type="submit" disabled={submitting || !createForm.name.trim()} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50">
                {submitting ? 'Creating…' : 'Create class'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showJoin && (
        <Modal title="Join a class" onClose={() => setShowJoin(false)} maxWidth="max-w-sm">
          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label className="text-[11px] font-semibold text-text-dim uppercase tracking-wide mb-2 block">Class code</label>
              <input
                type="text"
                autoFocus
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="w-full h-14 px-4 rounded-xl bg-surface-soft border border-line-soft text-center text-2xl font-display font-bold tracking-[0.3em] text-text-primary outline-none focus:border-accent transition-colors placeholder:text-text-dim/40 placeholder:tracking-[0.3em]"
              />
            </div>
            <button type="submit" disabled={submitting || !joinCode.trim()} className="w-full btn-primary py-2.5 text-sm disabled:opacity-50">
              {submitting ? 'Joining…' : 'Join class'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Classes;
