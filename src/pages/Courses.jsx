import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '../contexts/CoursesContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import CapletLoader from '../components/CapletLoader';
import { coverGradient } from '../lib/coverGradient';

/* ── Progress bar ─────────────────────────────────────────────────────────────── */

function ProgressBar({ pct }) {
  return (
    <div className="h-[3px] bg-line-soft rounded-full overflow-hidden">
      <div
        className="h-full bg-accent rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

/* ── Course card ──────────────────────────────────────────────────────────────── */

function CourseCard({ course, progress, authed, index }) {
  const hasProgress = progress > 0;
  const lessons = (course.modules || []).reduce((sum, m) => sum + (m.lessons || []).length, 0);

  return (
    <Link
      to={`/courses/${course.id}`}
      className="group flex flex-col rounded-2xl border border-line-soft bg-surface-raised overflow-hidden hover:-translate-y-0.5 hover:shadow-minimal-lg transition-all duration-300 animate-fade-slide-up"
      style={{ animationDelay: `${Math.min(index * 40, 300)}ms`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      {/* Cover */}
      <div className="relative h-36 overflow-hidden border-b border-line-soft">
        <div
          className="w-full h-full group-hover:scale-[1.04] transition-transform duration-700"
          style={coverGradient(course.id)}
        />

        {/* Level pill */}
        <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-md bg-surface-raised border border-line-soft text-[10px] font-bold uppercase tracking-[0.08em] text-text-muted">
          {course.level || 'Beginner'}
        </span>

        {/* In-progress pill */}
        {hasProgress && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-raised border border-line-soft text-[9.5px] font-bold uppercase tracking-[0.06em] text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            In progress
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-5">
        <h3 className="text-[1.05rem] font-display font-bold text-text-primary leading-snug group-hover:text-accent transition-colors duration-200">
          {course.title}
        </h3>
        {course.shortDescription && (
          <p className="mt-2 text-[13px] text-text-dim leading-relaxed line-clamp-2">
            {course.shortDescription}
          </p>
        )}

        {/* Meta */}
        <div className="mt-3 flex items-center gap-2.5 font-mono text-[10px] text-text-dim">
          {course.duration != null && <span>{course.duration}m</span>}
          {course.duration != null && <span className="w-1 h-1 rounded-full bg-text-dim" />}
          <span>{lessons} lesson{lessons !== 1 ? 's' : ''}</span>
        </div>

        {/* Progress */}
        {authed && hasProgress && (
          <div className="mt-4">
            <div className="flex items-center justify-between font-mono text-[10px] text-text-dim mb-1.5">
              <span>{Math.round(progress)}% complete</span>
            </div>
            <ProgressBar pct={progress} />
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between pt-4 border-t border-line-soft">
            <span className="text-[12px] font-semibold text-text-muted group-hover:text-accent transition-colors duration-200">
              {hasProgress ? 'Continue' : 'Start learning'}
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

/* ── Curriculum page ──────────────────────────────────────────────────────────── */

const Courses = () => {
  const { courses, loading, error, fetchCourses } = useCourses();
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState({ level: '', search: '' });
  const [courseProgress, setCourseProgress] = useState({});

  useEffect(() => {
    fetchCourses(filters);
  }, [fetchCourses, filters]);

  useEffect(() => {
    if (isAuthenticated && courses.length > 0) {
      const fetchProgress = async () => {
        const progressMap = {};
        const courseIds = [...new Set(courses.map((c) => c.id))];
        await Promise.all(
          courseIds.map(async (courseId) => {
            try {
              const progress = await api.getCourseProgress(courseId);
              progressMap[courseId] = progress.courseProgress?.progressPercentage || 0;
            } catch {
              progressMap[courseId] = 0;
            }
          }),
        );
        setCourseProgress(progressMap);
      };
      fetchProgress();
    }
  }, [isAuthenticated, courses]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const hasFilters = filters.level || filters.search;

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-surface-body flex items-center justify-center">
        <CapletLoader message="Loading curriculum…" />
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
          <p className="font-mono text-[10px] font-medium text-accent uppercase tracking-[0.24em] mb-4 flex items-center gap-2">
            <span className="w-3 h-px bg-accent shrink-0" />
            Library
          </p>
          <h1 className="text-[2.6rem] md:text-[3.5rem] font-display font-bold text-text-primary tracking-tight leading-[1.02]">
            Curriculum
          </h1>
          <p className="mt-4 text-lg text-text-muted font-serif italic max-w-xl leading-relaxed">
            Browse the course library, built for Australian learners.
          </p>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────────── */}
      <div className="container-custom py-8 md:py-10">

        {error && (
          <div className="mb-6 rounded-xl border border-line-error bg-surface-error px-4 py-3 text-sm font-medium text-text-error">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-slide-up stagger-1">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
              width="15" height="15" viewBox="0 0 15 15" fill="none"
            >
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search courses…"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-raised border border-line-soft text-sm font-medium outline-none focus:border-accent transition-colors placeholder:text-text-dim"
            />
          </div>
          <select
            value={filters.level}
            onChange={(e) => handleFilterChange('level', e.target.value)}
            className="h-11 px-4 rounded-xl bg-surface-raised border border-line-soft text-sm font-medium text-text-primary outline-none focus:border-accent transition-colors sm:w-44 cursor-pointer"
          >
            <option value="">All levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Results count */}
        {courses.length > 0 && (
          <p className="font-mono text-[10px] text-text-dim uppercase tracking-[0.16em] mb-4">
            {courses.length} course{courses.length !== 1 ? 's' : ''}
            {hasFilters ? ' found' : ''}
          </p>
        )}

        {/* Grid */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                progress={courseProgress[course.id] || 0}
                authed={isAuthenticated}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-24 text-center animate-fade-slide-up">
            <div className="relative mb-7 w-16 h-16 rounded-2xl border-2 border-dashed border-line-soft bg-surface-raised flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="9.5" cy="9.5" r="6.5" stroke="var(--text-dim)" strokeOpacity="0.45" strokeWidth="1.6" />
                <path d="M14.5 14.5l4 4" stroke="var(--text-dim)" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-[1.3rem] font-display font-bold text-text-primary tracking-tight mb-2">
              No courses found
            </h3>
            <p className="text-[13.5px] text-text-dim leading-relaxed max-w-[260px] mb-7">
              {hasFilters
                ? 'No courses match your filters. Try broadening your search.'
                : 'The course library is empty right now — check back soon.'}
            </p>
            {hasFilters && (
              <button
                onClick={() => setFilters({ level: '', search: '' })}
                className="h-9 px-5 rounded-full border border-line-soft text-[13px] font-medium text-text-muted hover:text-text-primary hover:border-text-dim transition-colors duration-150"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
