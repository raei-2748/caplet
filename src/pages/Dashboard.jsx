import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AcademicCapIcon,
  ArrowRightIcon,
  BookOpenIcon,
  BookmarkIcon,
  CheckCircleIcon,
  FireIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CoursesContext';
import api from '../services/api';
import CapletLoader from '../components/CapletLoader';
import { Badge, Button, Card, EmptyState, PageHeader, PageShell, ProgressBar, ResourceLink, SectionHeader, StatCard } from '../components/ui';

export default function Dashboard() {
  const { user } = useAuth();
  const { courses, loading: coursesLoading, hasFetched, fetchCourses } = useCourses();
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [savedSlides, setSavedSlides] = useState([]);

  useEffect(() => {
    if (!hasFetched && !coursesLoading) {
      fetchCourses().catch(() => {
        // Sidebar can render without courses when unavailable.
      });
    }
  }, [coursesLoading, fetchCourses, hasFetched]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressData, classesData, savedSlidesData] = await Promise.all([
          api.getUserProgress(),
          api.getClasses(),
          api.getSavedSlides().catch(() => null),
        ]);
        setUserProgress(progressData?.progress || []);
        const allClasses = [
          ...(classesData?.teaching || []),
          ...(classesData?.student || []),
        ];
        setClasses(allClasses);
        setSavedSlides(savedSlidesData?.savedSlides || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || coursesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-body">
        <CapletLoader message="Loading your learning hub…" />
      </div>
    );
  }

  const inProgressCourses = userProgress?.filter((progress) => progress.status === 'in_progress') || [];
  const completedCourses = userProgress?.filter((progress) => progress.status === 'completed') || [];
  const lastAccessed = [...(userProgress || [])].sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt))[0];
  const lastAccessedCourse = lastAccessed ? courses.find((course) => course.id === lastAccessed.courseId) : null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = [
    { label: 'Courses in progress', value: inProgressCourses.length, icon: BookOpenIcon, footer: 'Lessons you have started and can resume.' },
    { label: 'Courses completed', value: completedCourses.length, icon: CheckCircleIcon, footer: 'Finished learning milestones.' },
    { label: 'Classes joined', value: classes.length, icon: AcademicCapIcon, footer: 'Teacher-led spaces connected to you.' },
    { label: 'Saved revision', value: savedSlides.length, icon: BookmarkIcon, footer: 'Slides saved for another look.' },
  ];

  return (
    <PageShell spacing="lg">
      <PageHeader
        eyebrow="Learning hub"
        title={`${getGreeting()}, ${user?.firstName || 'Student'}.`}
        actions={(
          <Button as={Link} to="/courses" variant="secondary">
            Browse courses
          </Button>
        )}
      >
        Your next lesson, classes, revision notes, and course shortcuts are gathered here in one calm place.
      </PageHeader>

      <section className="mb-16 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Learning summary">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <section>
            <SectionHeader eyebrow="Next step" title="Continue learning">
              Pick up where you left off, or browse courses if you are ready to start something new.
            </SectionHeader>

            {lastAccessed && lastAccessedCourse ? (
              <Card className="group overflow-hidden" padding="none">
                <div className="grid gap-0 md:grid-cols-[240px_1fr]">
                  <div className="border-b border-line-soft bg-surface-soft p-4 md:border-b-0 md:border-r">
                    <img
                      src={lastAccessedCourse.thumbnail || 'https://placehold.co/480x480'}
                      alt=""
                      className="h-56 w-full rounded-2xl object-cover opacity-90 ring-1 ring-line-soft transition-all duration-500 group-hover:opacity-100 md:h-full"
                    />
                  </div>
                  <div className="p-8 md:p-10">
                    <Badge variant="accent">Resume course</Badge>
                    <h2 className="mt-5 text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
                      {lastAccessedCourse.title}
                    </h2>
                    <p className="mt-4 text-base leading-7 text-text-muted">
                      Continue from your latest activity and keep building confidence one lesson at a time.
                    </p>
                    <ProgressBar className="mt-8" label="Course progress" value={lastAccessed.progressPercentage} />
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button as={Link} to={`/courses/${lastAccessedCourse.id}`}>
                        Continue course
                        <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button as={Link} to="/revision" variant="ghost">
                        Review saved slides
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <EmptyState
                icon={SparklesIcon}
                title="Start your first course"
                action={(
                  <Button as={Link} to="/courses">
                    Explore courses
                  </Button>
                )}
              >
                Your learning hub will show a resume card once you begin a course.
              </EmptyState>
            )}
          </section>

          <section>
            <SectionHeader
              eyebrow="Classes"
              title="Teacher-led spaces"
              actions={(
                <Button as={Link} to="/classes" variant="soft" size="sm">
                  View all classes
                </Button>
              )}
            >
              Classes connect lessons, assignments, and cohort activity when you are learning with a group.
            </SectionHeader>

            <div className="space-y-3">
              {classes.length > 0 ? (
                classes.slice(0, 3).map((cls) => (
                  <ResourceLink
                    key={cls.id}
                    to={`/classes/${cls.id}`}
                    title={cls.name}
                    meta={cls.code}
                    icon={AcademicCapIcon}
                  />
                ))
              ) : (
                <EmptyState icon={AcademicCapIcon} title="No active classes yet">
                  When a teacher or cohort adds you to a class, it will appear here.
                </EmptyState>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-8 lg:col-span-4">
          <Card variant="soft" padding="lg">
            <SectionHeader eyebrow="Course shortcuts" title="My courses" className="mb-6">
              Quickly open a course catalogue entry.
            </SectionHeader>
            <div className="space-y-3">
              {courses.slice(0, 4).map((course) => (
                <ResourceLink
                  key={course.id}
                  to={`/courses/${course.id}`}
                  title={course.title}
                  meta={course.duration ? `${course.duration} min` : 'Self-paced'}
                />
              ))}
              {courses.length === 0 && (
                <p className="rounded-xl border border-line-soft bg-surface-raised p-5 text-sm leading-6 text-text-muted">
                  Courses are temporarily unavailable. Try again soon.
                </p>
              )}
            </div>
          </Card>

          <ResourceLink
            to="/revision"
            title="Saved revision slides"
            description="Return to examples, definitions, and slides you flagged for later."
            meta={`${savedSlides.length} ${savedSlides.length === 1 ? 'slide' : 'slides'} saved`}
            icon={BookmarkIcon}
          />

          <Card variant="inverse" padding="lg" className="relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 grid-technical !bg-[size:40px_40px]" />
            <div className="relative z-10">
              <FireIcon className="mb-8 h-10 w-10 text-accent" aria-hidden="true" />
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">Daily insight</p>
              <blockquote className="font-serif text-xl italic leading-8 text-text-contrast">
                Small money habits are easier to sustain when your next step is visible.
              </blockquote>
            </div>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}
