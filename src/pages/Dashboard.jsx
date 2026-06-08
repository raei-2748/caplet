import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CoursesContext';
import api from '../services/api';
import CapletLoader from '../components/CapletLoader';
import {
  BookOpenIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';

/* ── Helpers ──────────────────────────────────────────────────────────────────── */

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  if (h >= 17 && h < 21) return 'Good evening';
  return 'Good night';
}

function formatMemberSince(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
}

function getInitials(user) {
  return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || '?';
}

/* ── User avatar ──────────────────────────────────────────────────────────────── */

function UserAvatar({ user, size = 'md' }) {
  const dim =
    size === 'xl' ? 'w-16 h-16 text-xl' :
    size === 'lg' ? 'w-12 h-12 text-base' :
    'w-9 h-9 text-sm';

  if (user?.profilePicture) {
    return (
      <img
        src={user.profilePicture}
        alt={user.firstName}
        className={`${dim} rounded-full object-cover shrink-0 border border-line-soft`}
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-full shrink-0 flex items-center justify-center font-display font-bold text-white select-none`}
      style={{ background: 'var(--accent)' }}
    >
      {getInitials(user)}
    </div>
  );
}

/* ── Role badge ───────────────────────────────────────────────────────────────── */

function RoleBadge({ role }) {
  const styles = {
    admin:      'bg-rose-500/10 text-rose-600 border-rose-400/30 dark:text-rose-400',
    instructor: 'bg-violet-500/10 text-violet-600 border-violet-400/30 dark:text-violet-400',
    student:    'bg-accent/[0.08] text-accent border-accent/20',
  };
  const labels = { admin: 'Admin', instructor: 'Instructor', student: 'Student' };
  const s = styles[role] || styles.student;
  return (
    <span className={`inline-flex items-center px-2 py-[3px] rounded-md border text-[9.5px] font-bold uppercase tracking-[0.07em] ${s}`}>
      {labels[role] || 'Student'}
    </span>
  );
}

/* ── Stat tile ────────────────────────────────────────────────────────────────── */

function StatTile({ value, label, icon, to }) {
  const inner = (
    <div className="group flex flex-col gap-2.5 px-5 py-4 bg-surface-raised border border-line-soft rounded-xl hover:border-accent/30 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9.5px] font-semibold text-text-dim uppercase tracking-[0.14em]">{label}</span>
        {icon}
      </div>
      <p className="text-[1.75rem] font-display font-bold text-text-primary tabular-nums leading-none">
        {value}
      </p>
    </div>
  );
  return to ? (
    <Link to={to} className="block">{inner}</Link>
  ) : (
    inner
  );
}

/* ── Progress bar ─────────────────────────────────────────────────────────────── */

function ProgressBar({ pct, className = '' }) {
  return (
    <div className={`h-[3px] bg-line-soft rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-accent rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

/* ── Continue learning card ───────────────────────────────────────────────────── */

function ContinueLearningCard({ course, pct }) {
  const [thumbError, setThumbError] = useState(false);
  const isRealThumb = course.thumbnail && !course.thumbnail.includes('placehold');
  const showThumb = isRealThumb && !thumbError;
  return (
    <Link
      to={`/courses/${course.id}`}
      className="group block rounded-2xl border border-line-soft bg-surface-raised overflow-hidden hover:border-accent/30 hover:shadow-minimal-lg transition-all duration-300"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div className="flex min-h-[120px]">
        {showThumb ? (
          <div className="w-28 md:w-40 shrink-0 overflow-hidden">
            <img
              src={course.thumbnail}
              alt=""
              onError={() => setThumbError(true)}
              className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
            />
          </div>
        ) : (
          <div className="w-28 md:w-40 shrink-0 bg-accent/[0.06] border-r border-line-soft flex items-center justify-center">
            <span className="font-display font-bold text-[2rem] text-accent/30 select-none">
              {course.title[0]}
            </span>
          </div>
        )}
        <div className="flex-1 p-5 md:p-6 flex flex-col justify-between min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              {course.category && (
                <p className="font-mono text-[9px] text-text-dim/50 uppercase tracking-[0.14em] mb-1.5">
                  {course.category.replace(/-/g, ' ')}
                </p>
              )}
              <h2 className="text-[1.05rem] md:text-[1.2rem] font-display font-bold text-text-primary leading-snug group-hover:text-accent transition-colors duration-200 truncate">
                {course.title}
              </h2>
            </div>
            <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center border border-line-soft group-hover:border-accent group-hover:bg-accent text-text-dim group-hover:text-white transition-all duration-250">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M2 5.5h7M5.5 2L9 5.5 5.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] text-text-dim">{pct}% complete</span>
              {pct === 100 && (
                <span className="font-mono text-[9.5px] text-emerald-600 dark:text-emerald-400 font-semibold">Done</span>
              )}
            </div>
            <ProgressBar pct={pct} />
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Course list row ──────────────────────────────────────────────────────────── */

function CourseRow({ course, completedCount }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="group flex items-center gap-3.5 px-4 py-3.5 rounded-xl border border-line-soft bg-surface-raised hover:border-accent/30 transition-all duration-200 relative overflow-hidden"
    >
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent origin-center scale-y-0 group-hover:scale-y-100 transition-transform duration-200" />
      {course.thumbnail && !course.thumbnail.includes('placehold') ? (
        <img
          src={course.thumbnail}
          alt=""
          className="w-9 h-9 rounded-lg object-cover shrink-0 border border-line-soft/50 grayscale-[40%] group-hover:grayscale-0 transition-all duration-400"
        />
      ) : (
        <div className="w-9 h-9 rounded-lg bg-accent/[0.08] shrink-0 flex items-center justify-center border border-accent/15">
          <span className="font-display font-bold text-sm text-accent">{course.title[0]}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-text-primary group-hover:text-accent truncate transition-colors duration-150 leading-tight">
          {course.title}
        </p>
        {completedCount > 0 && (
          <p className="font-mono text-[9.5px] text-text-dim mt-0.5">
            {completedCount} lesson{completedCount !== 1 ? 's' : ''} completed
          </p>
        )}
      </div>
      <svg className="shrink-0 text-text-dim group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-150" width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M4.5 2.5L8.5 6.5L4.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </Link>
  );
}

/* ── Class row ────────────────────────────────────────────────────────────────── */

function ClassRow({ cls, role }) {
  return (
    <Link
      to={`/classes/${cls.id}`}
      className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-line-soft bg-surface-raised hover:border-accent/30 transition-all duration-200"
    >
      <div className="w-8 h-8 rounded-lg bg-accent/[0.07] border border-accent/15 flex items-center justify-center shrink-0 font-display font-bold text-[11px] text-accent select-none">
        {cls.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-text-primary group-hover:text-accent truncate transition-colors duration-150">
          {cls.name}
        </p>
        <p className="font-mono text-[9.5px] text-text-dim mt-0.5 tracking-wide">{cls.code}</p>
      </div>
      <span className={`shrink-0 text-[9px] font-bold uppercase tracking-[0.06em] px-2 py-[3px] rounded-md border ${
        role === 'teaching'
          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-400/30'
          : 'bg-surface-soft text-text-dim border-line-soft'
      }`}>
        {role === 'teaching' ? 'Teacher' : 'Student'}
      </span>
    </Link>
  );
}

/* ── Section header ───────────────────────────────────────────────────────────── */

function SectionHeader({ label, to, toLabel = 'View all' }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="font-mono text-[9.5px] font-semibold text-text-dim/60 uppercase tracking-[0.2em] flex items-center gap-2">
        <span className="w-3 h-px bg-text-dim/40 shrink-0" />
        {label}
      </p>
      {to && (
        <Link to={to} className="text-[11.5px] font-medium text-accent hover:underline transition-colors">
          {toLabel}
        </Link>
      )}
    </div>
  );
}

/* ── Empty / onboarding state ─────────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-20 text-center animate-fade-slide-up">
      <div className="relative mb-8 w-20 h-16">
        <div className="absolute inset-0 rounded-xl border border-line-soft/60 bg-surface-raised/80 rotate-[6deg] translate-x-2 translate-y-0.5 shadow-minimal" />
        <div className="absolute inset-0 rounded-xl border border-line-soft/70 bg-surface-raised/90 rotate-[3deg] translate-x-1 shadow-minimal" />
        <div className="absolute inset-0 rounded-xl border-2 border-dashed border-line-soft bg-surface-body flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M4 10h12" stroke="var(--text-dim)" strokeOpacity="0.4" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      <h3 className="text-[1.4rem] font-display font-bold text-text-primary tracking-tight mb-2">
        Start your learning journey
      </h3>
      <p className="text-[13.5px] text-text-dim leading-relaxed max-w-[260px] mb-8">
        Browse courses and complete your first lesson to see your progress tracked here.
      </p>
      <Link to="/courses" className="btn-primary px-6 py-2.5 text-sm">
        Explore Courses
      </Link>
    </div>
  );
}

/* ── Dashboard ────────────────────────────────────────────────────────────────── */

export default function Dashboard() {
  const { user } = useAuth();
  const { courses, loading: coursesLoading, hasFetched, fetchCourses } = useCourses();
  const [userProgress, setUserProgress] = useState([]);
  const [classes, setClasses] = useState({ teaching: [], student: [] });
  const [savedSlides, setSavedSlides] = useState([]);
  const [lastCoursePct, setLastCoursePct] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasFetched && !coursesLoading) fetchCourses().catch(() => {});
  }, [coursesLoading, fetchCourses, hasFetched]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressData, classesData, savedSlidesData] = await Promise.all([
          api.getUserProgress(),
          api.getClasses(),
          api.getSavedSlides().catch(() => null),
        ]);
        const progress = progressData?.progress || [];
        setUserProgress(progress);
        setClasses({
          teaching: classesData?.teaching || [],
          student: classesData?.student || [],
        });
        setSavedSlides(savedSlidesData?.savedSlides || []);

        // Fetch accurate progress % for the most-recently-accessed course
        const lastRow = [...progress].sort(
          (a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt),
        )[0];
        if (lastRow?.courseId) {
          try {
            // Backend computes the percentage (content-aware, excludes empty lessons).
            const detail = await api.getCourseProgress(lastRow.courseId);
            setLastCoursePct(Math.round(detail?.courseProgress?.progressPercentage ?? 0));
          } catch {
            // Non-fatal — progress bar stays at 0
          }
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* Derived values */
  const inProgressCourseIds = [...new Set(
    userProgress.filter((p) => p.status === 'in_progress').map((p) => p.courseId),
  )];
  const completedCourseIds = [...new Set(
    userProgress.filter((p) => p.status === 'completed').map((p) => p.courseId),
  )];
  const sortedProgress = [...userProgress].sort(
    (a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt),
  );
  const lastAccessed = sortedProgress[0];
  const lastAccessedCourse = lastAccessed ? courses.find((c) => c.id === lastAccessed.courseId) : null;

  const activeCourses = courses.filter((c) => inProgressCourseIds.includes(c.id));
  const allClasses = [
    ...classes.teaching.map((c) => ({ ...c, role: 'teaching' })),
    ...classes.student.map((c) => ({ ...c, role: 'student' })),
  ];

  const getCompletedLessons = (courseId) =>
    userProgress.filter((p) => p.courseId === courseId && p.status === 'completed' && p.lessonId).length;

  const isNewUser =
    inProgressCourseIds.length === 0 &&
    completedCourseIds.length === 0 &&
    allClasses.length === 0;

  if (loading || coursesLoading) {
    return (
      <div className="min-h-[100dvh] bg-surface-body flex items-center justify-center">
        <CapletLoader message="Loading your dashboard…" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pt-14 md:pt-[60px] bg-surface-body selection:bg-accent selection:text-white">

      {/* ── Hero header ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-line-soft">
        <div className="absolute inset-0 grid-technical opacity-[0.09] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface-body to-transparent pointer-events-none" />

        <div className="relative container-custom py-10 md:py-14">
          {/* Greeting + avatar */}
          <div className="flex items-start justify-between gap-6 animate-fade-slide-up">
            <div className="min-w-0">
              <h1 className="text-[1.6rem] md:text-[2rem] font-display font-bold text-text-primary tracking-tight leading-snug">
                <span className="text-text-dim font-medium">{getGreeting()}, </span>{user?.firstName || 'Welcome'}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <RoleBadge role={user?.role} />
                {user?.createdAt && (
                  <span className="text-[11.5px] text-text-dim">
                    Member since {formatMemberSince(user.createdAt)}
                  </span>
                )}
              </div>
            </div>
            <UserAvatar user={user} size="xl" />
          </div>

          {/* Divider */}
          <div className="mt-8 mb-6 h-px bg-line-soft" />

          {/* Stat tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-fade-slide-up stagger-1">
            <StatTile
              value={inProgressCourseIds.length}
              label="In Progress"
              icon={<BookOpenIcon className="w-3.5 h-3.5 text-text-dim/40 group-hover:text-accent/60 transition-colors duration-200" />}
              to={inProgressCourseIds.length > 0 ? '/courses' : undefined}
            />
            <StatTile
              value={completedCourseIds.length}
              label="Completed"
              icon={<CheckCircleIcon className="w-3.5 h-3.5 text-text-dim/40 group-hover:text-accent/60 transition-colors duration-200" />}
            />
            <StatTile
              value={allClasses.length}
              label="Classes"
              icon={<AcademicCapIcon className="w-3.5 h-3.5 text-text-dim/40 group-hover:text-accent/60 transition-colors duration-200" />}
              to={allClasses.length > 0 ? '/classes' : undefined}
            />
            <StatTile
              value={savedSlides.length}
              label="Saved Slides"
              icon={<BookmarkIcon className="w-3.5 h-3.5 text-text-dim/40 group-hover:text-accent/60 transition-colors duration-200" />}
              to={savedSlides.length > 0 ? '/revision' : undefined}
            />
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────────────── */}
      <div className="container-custom py-8 md:py-10">
        {isNewUser ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

            {/* ── Left column ─────────────────────────────────────────────────── */}
            <div className="lg:col-span-7 space-y-7">

              {/* Continue Learning */}
              {lastAccessedCourse && (
                <section className="animate-fade-slide-up stagger-1">
                  <SectionHeader label="Continue learning" />
                  <ContinueLearningCard course={lastAccessedCourse} pct={lastCoursePct} />
                </section>
              )}

              {/* Active courses list (excluding the last-accessed hero) */}
              {activeCourses.filter((c) => c.id !== lastAccessedCourse?.id).length > 0 && (
                <section className="animate-fade-slide-up stagger-2">
                  <SectionHeader label="Active courses" to="/courses" />
                  <div className="space-y-2">
                    {activeCourses
                      .filter((c) => c.id !== lastAccessedCourse?.id)
                      .map((course) => (
                        <CourseRow
                          key={course.id}
                          course={course}
                          completedCount={getCompletedLessons(course.id)}
                        />
                      ))}
                  </div>
                </section>
              )}

              {/* All caught up — only completed courses */}
              {inProgressCourseIds.length === 0 && completedCourseIds.length > 0 && (
                <section className="animate-fade-slide-up stagger-2">
                  <div className="rounded-2xl border border-line-soft bg-surface-raised p-8 text-center">
                    <p className="font-display font-bold text-[1.1rem] text-text-primary mb-1.5">All caught up</p>
                    <p className="text-[13px] text-text-dim leading-relaxed mb-5">
                      You&apos;ve completed all your active courses.
                    </p>
                    <Link to="/courses" className="btn-primary text-sm px-5 py-2">
                      Explore More Courses
                    </Link>
                  </div>
                </section>
              )}
            </div>

            {/* ── Right sidebar ───────────────────────────────────────────────── */}
            <div className="lg:col-span-5 space-y-6">

              {/* Classes */}
              {allClasses.length > 0 && (
                <section className="animate-fade-slide-up stagger-2">
                  <SectionHeader label="My classes" to="/classes" />
                  <div className="space-y-2">
                    {allClasses.slice(0, 5).map((cls) => (
                      <ClassRow key={cls.id} cls={cls} role={cls.role} />
                    ))}
                  </div>
                </section>
              )}

              {/* Revision */}
              <section className="animate-fade-slide-up stagger-3">
                <SectionHeader label="Revision" to="/revision" toLabel="Open" />
                <Link
                  to="/revision"
                  className="group flex items-center gap-4 p-5 rounded-xl border border-line-soft bg-surface-raised hover:border-accent/30 hover:shadow-minimal transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl border border-accent/20 bg-accent/[0.07] flex items-center justify-center shrink-0 group-hover:bg-accent/[0.12] transition-colors">
                    <BookmarkIcon className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-text-primary group-hover:text-accent transition-colors duration-150">
                      Saved Slides
                    </p>
                    <p className="text-[11.5px] text-text-dim mt-0.5">
                      {savedSlides.length > 0
                        ? `${savedSlides.length} slide${savedSlides.length !== 1 ? 's' : ''} saved for review`
                        : 'Save slides during lessons to review later'}
                    </p>
                  </div>
                  <svg className="shrink-0 text-text-dim group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-150" width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M4.5 2.5L8.5 6.5L4.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </section>

              {/* Explore CTA — shown when sidebar has little content */}
              {allClasses.length === 0 && (
                <section className="animate-fade-slide-up stagger-4">
                  <div
                    className="relative overflow-hidden rounded-2xl bg-surface-inverse p-7"
                    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  >
                    <div className="absolute inset-0 grid-technical opacity-[0.07] pointer-events-none" />
                    <div className="relative">
                      <p className="font-mono text-[9.5px] font-semibold text-accent uppercase tracking-[0.22em] mb-3">
                        Academy
                      </p>
                      <h3 className="text-[1.15rem] font-display font-bold text-surface-body leading-snug mb-2">
                        Join or create a class
                      </h3>
                      <p className="text-[12.5px] text-text-dim leading-relaxed mb-5">
                        Connect with teachers and classmates through the Academy.
                      </p>
                      <Link to="/classes" className="btn-primary text-sm px-5 py-2">
                        Go to Classes
                      </Link>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
