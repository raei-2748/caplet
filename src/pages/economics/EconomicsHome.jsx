import { createElement, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AcademicCapIcon,
  ArrowLongRightIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { useReveal } from '../../lib/useReveal';
import {
  economicsResourceLibrary,
  getEconomicsResourceStats,
} from '../../data/economicsResourceLibrary';
import { ECON_HOME, getAreasByYear } from './data';
import { AreaTally, BackLink, Kicker, SectionNav, SubjectBadge } from './shared';

/** A single focus-area tile on a year shelf. */
function FocusAreaCard({ area }) {
  return (
    <Link
      to={`${ECON_HOME}/${area.id}`}
      className="group flex flex-col rounded-2xl border border-line-soft bg-surface-raised p-5 shadow-[0_20px_44px_-38px_rgba(20,20,18,0.45)] transition-colors duration-200 hover:border-accent/50"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full border border-line-soft bg-surface-soft px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-text-muted">
          {area.hours} hrs
        </span>
        <ArrowLongRightIcon className="h-5 w-5 text-text-dim transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent" />
      </div>
      <h3 className="font-display text-lg font-extrabold leading-tight tracking-tight text-text-primary">
        {area.title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-text-muted">{area.focus}</p>
      <div className="mt-4 flex-1" />
      <AreaTally area={area} className="border-t border-line-soft pt-3" />
    </Link>
  );
}

function YearShelf({ year, label }) {
  const areas = getAreasByYear(year);
  return (
    <section className="reveal">
      <div className="mb-6 flex items-center gap-4">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-text-primary">{label}</h2>
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
          {areas.length} focus {areas.length === 1 ? 'area' : 'areas'}
        </span>
      </div>
      <div className="reveal-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((area) => (
          <FocusAreaCard key={area.id} area={area} />
        ))}
      </div>
    </section>
  );
}

function PathwayCard({ to, icon, eyebrow, title, description, meta }) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-4 rounded-2xl border border-line-soft bg-surface-raised p-6 shadow-[0_20px_44px_-38px_rgba(20,20,18,0.45)] transition-colors duration-200 hover:border-accent/50"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
        {createElement(icon, { className: 'h-6 w-6' })}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-dim">{eyebrow}</div>
        <div className="mt-0.5 flex items-center gap-2">
          <h3 className="font-display text-xl font-extrabold tracking-tight text-text-primary">{title}</h3>
          <ArrowLongRightIcon className="h-5 w-5 text-text-dim transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent" />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">{description}</p>
        <div className="mt-3 font-mono text-xs font-semibold text-accent">{meta}</div>
      </div>
    </Link>
  );
}

export default function EconomicsHome() {
  useReveal();
  const stats = useMemo(() => getEconomicsResourceStats(), []);

  return (
    <div className="min-h-screen bg-surface-body py-32 selection:bg-accent selection:text-white">
      <div className="container-custom">
        <div className="reveal mb-10">
          <BackLink to="/library">Back to library</BackLink>
        </div>

        {/* Header */}
        <header className="reveal mb-12 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-5">
            <SubjectBadge className="h-16 w-16" glyphClass="h-8 w-8" />
            <div>
              <Kicker className="mb-2">Commerce · Stage 6</Kicker>
              <h1 className="font-display text-6xl font-extrabold tracking-tight lg:text-7xl">Economics.</h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-text-muted">
                A syllabus-aligned bank of original practice built around the NSW Economics 11–12 focus areas,
                outcomes and assessment styles. Pick a topic below, or jump straight to exam practice.
              </p>
            </div>
          </div>

          {/* Catalogue index card — the shelf's own artefact */}
          <div className="hidden shrink-0 rotate-3 md:block">
            <div className="w-60 rounded-2xl border border-line-soft bg-surface-raised p-5 shadow-[0_28px_56px_-38px_rgba(20,20,18,0.5)]">
              <div className="mb-4 flex items-center justify-between">
                <Kicker className="text-lg">catalogue</Kicker>
                <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                  HSC
                </span>
              </div>
              <div className="font-display text-5xl font-extrabold tracking-tight text-text-primary">{stats.questions}</div>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-text-muted">practice resources</p>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line-soft pt-4 font-mono text-xs text-text-muted">
                <span><span className="font-semibold text-text-primary">{stats.focusAreas}</span> topics</span>
                <span><span className="font-semibold text-text-primary">{stats.examPacks}</span> exam packs</span>
                <span><span className="font-semibold text-text-primary">{stats.outcomes}</span> outcomes</span>
                <span><span className="font-semibold text-text-primary">{stats.contentGroups}</span> content groups</span>
              </div>
            </div>
          </div>
        </header>

        {/* Transition note */}
        <div className="reveal mb-8 flex flex-col gap-2 rounded-2xl border border-line-soft bg-surface-soft px-5 py-4 sm:flex-row sm:items-start sm:gap-4">
          <span className="shrink-0 rounded-md bg-accent-soft px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-accent">
            Syllabus transition
          </span>
          <p className="text-sm leading-relaxed text-text-muted">{economicsResourceLibrary.implementationNote}</p>
        </div>

        {/* Section nav */}
        <div className="reveal mb-10">
          <SectionNav active="overview" />
        </div>

        {/* Pathways to the other pages */}
        <div className="reveal-stagger mb-16 grid grid-cols-1 gap-4 md:grid-cols-2">
          <PathwayCard
            to={`${ECON_HOME}/exam-practice`}
            icon={ClipboardDocumentCheckIcon}
            eyebrow="Paper-style practice"
            title="Exam practice"
            description="Full paper-style packs for both the transition course and the new syllabus, with marker briefs and official anchors."
            meta={`${stats.examPacks} packs · ${stats.examItems} items`}
          />
          <PathwayCard
            to={`${ECON_HOME}/assessment`}
            icon={AcademicCapIcon}
            eyebrow="How you're marked"
            title="Assessment guide"
            description="The HSC exam structure, school-based weightings and the official NESA sources every resource is built from."
            meta={`${stats.outcomes} outcomes mapped`}
          />
        </div>

        {/* Course content shelves */}
        <div className="mb-10 space-y-14">
          <div className="reveal">
            <Kicker className="mb-2">Course content</Kicker>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-text-primary md:text-4xl">
              Practice by focus area
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-text-muted">
              Each focus area opens to its own shelf of drills, multiple choice, short answer, stimulus sets and
              extended responses — filterable by type once you're inside.
            </p>
          </div>
          <YearShelf year={11} label="Year 11" />
          <YearShelf year={12} label="Year 12" />
        </div>
      </div>
    </div>
  );
}
