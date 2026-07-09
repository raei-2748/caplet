import { ArrowTopRightOnSquareIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useReveal } from '../../lib/useReveal';
import { economicsResourceLibrary } from '../../data/economicsResourceLibrary';
import { ECON_HOME } from './data';
import { BackLink, Kicker, SectionNav } from './shared';

export default function EconomicsAssessment() {
  useReveal();
  const assessment = economicsResourceLibrary.assessmentBlueprint;
  const { externalExam, schoolAssessmentComponents, samplePrograms } = assessment;

  return (
    <div className="min-h-screen bg-surface-body py-32 selection:bg-accent selection:text-white">
      <div className="container-custom">
        <div className="reveal mb-8">
          <BackLink to={ECON_HOME}>Back to Economics</BackLink>
        </div>

        <div className="reveal mb-10">
          <SectionNav active="assessment" />
        </div>

        <header className="reveal mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <Kicker className="mb-2">How you're marked</Kicker>
            <h1 className="font-display text-5xl font-extrabold tracking-tight text-text-primary md:text-6xl">
              Assessment guide.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-text-muted">
              The shape of the HSC examination and school-based assessment, so every drill and essay on this shelf
              points at the way you'll actually be marked.
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-accent-soft px-4 py-3 text-center">
            <div className="font-display text-3xl font-extrabold tracking-tight text-accent">{externalExam.totalMarks}</div>
            <div className="text-xs font-bold uppercase tracking-wide text-accent">mark HSC paper</div>
          </div>
        </header>

        {/* External examination */}
        <section className="reveal mb-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-text-primary">External examination</h2>
            <span className="rounded-full border border-line-soft bg-surface-raised px-3 py-1 text-xs font-bold text-text-muted">
              {externalExam.time}
            </span>
          </div>
          <div className="reveal-stagger grid gap-4 sm:grid-cols-2">
            {externalExam.sections.map((section) => (
              <div
                key={section.label}
                className="rounded-2xl border border-line-soft bg-surface-raised p-5 shadow-[0_20px_44px_-38px_rgba(20,20,18,0.45)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-lg font-extrabold tracking-tight text-text-primary">
                    {section.label}
                  </span>
                  <span className="font-mono text-sm font-bold text-accent">{section.marks} marks</span>
                </div>
                <p className="mt-2 text-sm font-medium leading-relaxed text-text-muted">{section.format}</p>
              </div>
            ))}
          </div>
        </section>

        {/* School assessment weightings */}
        <section className="reveal mb-8">
          <h2 className="mb-5 font-display text-2xl font-extrabold tracking-tight text-text-primary">
            School assessment weightings
          </h2>
          <div className="grid gap-4">
            {schoolAssessmentComponents.map((component) => (
              <div
                key={component.component}
                className="rounded-2xl border border-line-soft bg-surface-raised p-5 shadow-[0_20px_44px_-38px_rgba(20,20,18,0.45)]"
              >
                <div className="mb-3 flex items-center justify-between gap-4">
                  <span className="text-sm font-bold leading-snug text-text-primary">{component.component}</span>
                  <span className="font-mono text-sm font-bold text-accent">{component.weighting}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-soft">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${component.weighting}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sample programs */}
        {samplePrograms?.length ? (
          <section className="reveal mb-8 rounded-2xl border border-line-soft bg-surface-soft p-6">
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-text-dim">Sample assessment programs</div>
            <ul className="grid gap-2">
              {samplePrograms.map((program) => (
                <li key={program} className="flex gap-2 text-sm leading-relaxed text-text-muted">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{program}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Official sources */}
        <section className="reveal">
          <h2 className="mb-2 font-display text-2xl font-extrabold tracking-tight text-text-primary">Official sources</h2>
          <p className="mb-5 max-w-2xl text-sm leading-relaxed text-text-muted">
            Every focus area, outcome and exam structure on this shelf is built from the official NESA materials below.
          </p>
          <div className="reveal-stagger grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {economicsResourceLibrary.officialSources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col rounded-2xl border border-line-soft bg-surface-raised p-5 shadow-[0_20px_44px_-38px_rgba(20,20,18,0.45)] transition-colors hover:border-accent/50"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="font-display text-sm font-extrabold leading-snug text-text-primary">{source.title}</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 shrink-0 text-text-dim transition-colors group-hover:text-accent" />
                </span>
                <span className="mt-2 text-xs font-medium leading-relaxed text-text-muted">{source.note}</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
