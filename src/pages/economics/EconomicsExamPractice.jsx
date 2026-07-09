import { ArrowTopRightOnSquareIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useReveal } from '../../lib/useReveal';
import { economicsResourceLibrary } from '../../data/economicsResourceLibrary';
import { ECON_HOME } from './data';
import { BackLink, Kicker, OutcomeChip, SectionNav } from './shared';

const softBox = 'rounded-xl border border-line-soft bg-surface-soft';

function ExamObjectiveItem({ item, index }) {
  return (
    <div className={`${softBox} p-4`}>
      <div className="mb-3 flex items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-surface-raised font-mono text-xs font-bold text-text-muted">
          {index + 1}
        </span>
        <p className="text-sm font-extrabold leading-relaxed text-text-primary">{item.stem}</p>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {item.options.map((option, optionIndex) => (
          <div key={option} className="flex gap-2 text-sm leading-relaxed text-text-muted">
            <span className="font-mono font-bold text-text-primary">{String.fromCharCode(65 + optionIndex)}.</span>
            <span>{option}</span>
          </div>
        ))}
      </div>
      <details className="group mt-3">
        <summary className="flex cursor-pointer items-center gap-1.5 text-sm font-bold text-text-primary [&::-webkit-details-marker]:hidden">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-4 w-4 text-text-dim transition-transform group-open:rotate-180">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
          Show answer
        </summary>
        <p className="mt-2 text-sm font-semibold text-accent">Answer: {item.answer}</p>
        <p className="mt-1 text-sm leading-relaxed text-text-muted">{item.explanation}</p>
      </details>
      <div className="mt-3 flex flex-wrap gap-2">
        {item.outcomes.map((code) => (
          <OutcomeChip key={code} code={code} />
        ))}
      </div>
    </div>
  );
}

function ExamConstructedItem({ item }) {
  return (
    <div className={`${softBox} p-4`}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <h4 className="text-sm font-extrabold leading-relaxed text-text-primary">{item.title}</h4>
        {item.marks ? (
          <span className="rounded-md bg-surface-raised px-2 py-1 font-mono text-xs font-bold text-text-muted">
            {item.marks} marks
          </span>
        ) : null}
      </div>

      {item.stimulus ? (
        <p className="mb-3 rounded-lg border border-line-soft bg-surface-raised px-3 py-2 text-sm font-medium leading-relaxed text-text-muted">
          {item.stimulus}
        </p>
      ) : null}

      {item.prompt ? <p className="text-sm font-bold leading-relaxed text-text-primary">{item.prompt}</p> : null}

      {item.parts ? (
        <div className="mt-3 grid gap-3">
          {item.parts.map((part) => (
            <div key={part.prompt} className="rounded-lg border border-line-soft bg-surface-raised p-3">
              <div className="mb-2 flex items-start justify-between gap-3">
                <p className="text-sm font-bold leading-relaxed text-text-primary">{part.prompt}</p>
                <span className="shrink-0 rounded-md bg-surface-soft px-2 py-1 font-mono text-xs font-bold text-text-muted">
                  {part.marks} marks
                </span>
              </div>
              <ul className="grid gap-1.5">
                {part.markingGuide.map((guide) => (
                  <li key={guide} className="flex gap-2 text-sm leading-relaxed text-text-muted">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{guide}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}

      {item.planningFrame ? (
        <div className="mt-3">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-text-dim">Planning frame</div>
          <div className="grid gap-2">
            {item.planningFrame.map((step) => (
              <p key={step} className="rounded-lg border border-line-soft bg-surface-raised px-3 py-2 text-sm leading-relaxed text-text-muted">
                {step}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {item.outcomes.map((code) => (
          <OutcomeChip key={code} code={code} />
        ))}
      </div>
    </div>
  );
}

function ExamPracticePackCard({ pack }) {
  return (
    <article className="rounded-2xl border border-line-soft bg-surface-raised p-6 shadow-[0_20px_44px_-38px_rgba(20,20,18,0.45)]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.12em] text-text-dim">{pack.syllabus}</div>
          <h3 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-text-primary md:text-3xl">
            {pack.title}
          </h3>
          <p className="mt-2 max-w-4xl text-sm font-medium leading-relaxed text-text-muted">{pack.description}</p>
        </div>
        <div className="shrink-0 rounded-xl bg-accent-soft px-3 py-2 font-mono text-sm font-bold text-accent">
          {pack.totalMarks} marks
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className={`${softBox} p-3`}>
          <div className="text-xs font-bold uppercase tracking-[0.12em] text-text-dim">Audience</div>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-text-primary">{pack.audience}</p>
        </div>
        <div className={`${softBox} p-3`}>
          <div className="text-xs font-bold uppercase tracking-[0.12em] text-text-dim">Timing</div>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-text-primary">{pack.time}</p>
        </div>
      </div>

      <p className={`mb-5 ${softBox} px-4 py-3 text-sm font-medium leading-relaxed text-text-muted`}>
        {pack.transitionNote}
      </p>

      <div className="grid gap-3">
        {pack.sections.map((section) => (
          <details key={section.label} className={`group ${softBox} px-4 py-3`}>
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-4 w-4 text-text-dim transition-transform group-open:rotate-180">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
                <span className="text-sm font-extrabold text-text-primary">{section.label}</span>
                <span className="text-sm font-medium text-text-muted">{section.format}</span>
              </span>
              <span className="font-mono text-xs font-bold text-accent">{section.marks} marks</span>
            </summary>

            {section.sampleItems ? (
              <div className="mt-4">
                <div className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-text-dim">
                  {section.sampleItems.length} worked objective items from a {section.itemCount}-item section
                </div>
                <div className="grid gap-3">
                  {section.sampleItems.map((item, index) => (
                    <ExamObjectiveItem key={item.stem} item={item} index={index} />
                  ))}
                </div>
              </div>
            ) : null}

            {section.items ? (
              <div className="mt-4 grid gap-3">
                {section.items.map((item) => (
                  <ExamConstructedItem key={item.title} item={item} />
                ))}
              </div>
            ) : null}
          </details>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-text-dim">Marker brief</div>
          <ul className="grid gap-2">
            {pack.markerBrief.map((brief) => (
              <li key={brief} className="flex gap-2 text-sm leading-relaxed text-text-muted">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{brief}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-text-dim">Official anchors</div>
          <div className="grid gap-2">
            {pack.sourceLinks.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-between gap-3 rounded-lg border border-line-soft bg-surface-soft px-3 py-2 text-sm font-bold text-text-primary transition-colors hover:border-accent hover:text-accent"
              >
                <span>{source.title}</span>
                <ArrowTopRightOnSquareIcon className="h-4 w-4 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function EconomicsExamPractice() {
  useReveal();
  const packs = economicsResourceLibrary.examPracticePacks;

  return (
    <div className="min-h-screen bg-surface-body py-32 selection:bg-accent selection:text-white">
      <div className="container-custom">
        <div className="reveal mb-8">
          <BackLink to={ECON_HOME}>Back to Economics</BackLink>
        </div>

        <div className="reveal mb-10">
          <SectionNav active="exam" />
        </div>

        <header className="reveal mb-12 max-w-3xl">
          <Kicker className="mb-2">Paper-style practice</Kicker>
          <h1 className="font-display text-5xl font-extrabold tracking-tight text-text-primary md:text-6xl">
            Exam practice.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-text-muted">
            Full paper-style packs for both the transition course and the new syllabus. Each expands section by
            section, with worked items, marker briefs and links to the official NESA anchors.
          </p>
        </header>

        <div className="reveal-stagger grid gap-6">
          {packs.map((pack) => (
            <ExamPracticePackCard key={pack.id} pack={pack} />
          ))}
        </div>
      </div>
    </div>
  );
}
