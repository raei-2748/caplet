import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useReveal } from '../../lib/useReveal';
import { getEconomicsAreaResources } from '../../data/economicsResourceLibrary';
import ResourceRenderer from './resourceCards';
import { ECON_HOME, findAreaById, orderedAreas, typeMeta, typeOrder } from './data';
import { BackLink, Kicker, OutcomeChip, SectionNav } from './shared';

/** Free-text search scoped to a single resource. */
function matchesResource(resource, query) {
  if (!query) return true;
  const haystack = [
    resource.title,
    resource.stem,
    resource.question,
    resource.prompt,
    resource.keyIdea,
    resource.practicePrompt,
    resource.context,
    resource.sampleAnswer,
    resource.sampleResponse,
    resource.exemplarThesis,
    resource.difficulty,
    resource.quickCheck?.stem,
    ...(resource.options || []),
    ...(resource.markingGuide || []),
    ...(resource.outcomes || []),
    ...(resource.data || []).flatMap((row) => [row.indicator, row.interpretation]),
    ...(resource.questions || []).flatMap((q) => [q.prompt, ...(q.markingGuide || [])]),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function TypeTab({ active, onClick, children, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
        active ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'
      }`}
    >
      {children}
      <span
        className={`font-mono text-xs ${active ? 'text-white/80' : 'text-text-dim'}`}
      >
        {count}
      </span>
    </button>
  );
}

function AreaStep({ area, direction }) {
  const isPrev = direction === 'prev';
  return (
    <Link
      to={`${ECON_HOME}/${area.id}`}
      className={`group flex flex-1 items-center gap-3 rounded-2xl border border-line-soft bg-surface-raised p-5 shadow-[0_20px_44px_-38px_rgba(20,20,18,0.45)] transition-colors hover:border-accent/50 ${
        isPrev ? '' : 'sm:flex-row-reverse sm:text-right'
      }`}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-soft text-text-muted transition-colors group-hover:text-accent">
        {isPrev ? <ArrowLongLeftIcon className="h-5 w-5" /> : <ArrowLongRightIcon className="h-5 w-5" />}
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-bold uppercase tracking-wide text-text-dim">
          {isPrev ? 'Previous' : 'Next'} · Year {area.year}
        </span>
        <span className="block truncate font-display font-bold tracking-tight text-text-primary">{area.title}</span>
      </span>
    </Link>
  );
}

export default function EconomicsFocusArea() {
  useReveal();
  const { areaId } = useParams();
  const area = findAreaById(areaId);
  const [type, setType] = useState('all');
  const [query, setQuery] = useState('');

  const resources = useMemo(() => (area ? getEconomicsAreaResources(area) : []), [area]);

  const typeCounts = useMemo(() => {
    const counts = {};
    resources.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    return counts;
  }, [resources]);

  const visible = useMemo(
    () => resources.filter((r) => (type === 'all' || r.type === type) && matchesResource(r, query)),
    [resources, type, query]
  );

  if (!area) return <Navigate to={ECON_HOME} replace />;

  const index = orderedAreas.findIndex((a) => a.id === area.id);
  const prev = index > 0 ? orderedAreas[index - 1] : null;
  const next = index < orderedAreas.length - 1 ? orderedAreas[index + 1] : null;
  const availableTypes = typeOrder.filter((t) => typeCounts[t] > 0);

  return (
    <div className="min-h-screen bg-surface-body py-32 selection:bg-accent selection:text-white">
      <div className="container-custom">
        <div className="reveal mb-8 flex flex-wrap items-center gap-4">
          <BackLink to={ECON_HOME}>Back to Economics</BackLink>
        </div>

        <div className="reveal mb-10">
          <SectionNav active="overview" />
        </div>

        {/* Header */}
        <header className="reveal mb-10 border-b border-line-soft pb-10">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-accent px-2.5 py-1 text-xs font-extrabold text-white">Year {area.year}</span>
            <span className="rounded-lg border border-line-soft bg-surface-soft px-2.5 py-1 text-xs font-bold text-text-muted">
              {area.hours} indicative hours
            </span>
            <a
              href={area.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-line-soft bg-surface-soft px-2.5 py-1 text-xs font-bold text-text-muted transition-colors hover:text-accent"
            >
              NESA source
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
            </a>
          </div>
          <Kicker className="mb-2">{area.focus}</Kicker>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-text-primary md:text-5xl">
            {area.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-text-muted">{area.description}</p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-text-dim">Content groups</div>
              <div className="flex flex-wrap gap-2">
                {area.contentGroups.map((group) => (
                  <span
                    key={group}
                    className="rounded-lg border border-line-soft bg-surface-raised px-3 py-1.5 text-xs font-semibold text-text-muted"
                  >
                    {group}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-text-dim">Mapped outcomes</div>
              <div className="flex flex-wrap gap-2">
                {area.outcomes.map((code) => (
                  <OutcomeChip key={code} code={code} />
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Filter bar */}
        <div className="reveal mb-8 flex flex-col gap-4 rounded-2xl border border-line-soft bg-surface-raised p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            <TypeTab active={type === 'all'} onClick={() => setType('all')} count={resources.length}>
              All
            </TypeTab>
            {availableTypes.map((t) => (
              <TypeTab key={t} active={type === t} onClick={() => setType(t)} count={typeCounts[t]}>
                {typeMeta[t].title}
              </TypeTab>
            ))}
          </div>
          <label className="flex items-center gap-3 rounded-xl border border-line-soft bg-surface-soft px-4 py-2.5 lg:w-72">
            <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-text-dim" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search this topic..."
              className="w-full bg-transparent text-sm font-semibold text-text-primary outline-none placeholder:text-text-dim"
            />
          </label>
        </div>

        {/* Resources */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-text-primary">Practice resources</h2>
          <span className="font-mono text-sm text-text-muted">
            {visible.length} of {resources.length}
          </span>
        </div>

        {visible.length ? (
          <div className="grid gap-5">
            {visible.map((resource) => (
              <ResourceRenderer key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line-soft bg-surface-soft p-12 text-center">
            <p className="font-display text-xl font-bold text-text-primary">Nothing matches yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-text-muted">
              Clear the search or switch back to all resources for this topic.
            </p>
            <button
              type="button"
              onClick={() => {
                setType('all');
                setQuery('');
              }}
              className="mt-6 rounded-full bg-accent px-5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Teacher notes */}
        {area.teacherNotes?.length ? (
          <section className="mt-10 rounded-2xl border border-line-soft bg-surface-raised p-6 shadow-[0_20px_44px_-38px_rgba(20,20,18,0.45)]">
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-text-dim">Teacher use</div>
            <ul className="grid gap-2">
              {area.teacherNotes.map((note) => (
                <li key={note} className="flex gap-2 text-sm leading-relaxed text-text-muted">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Prev / next */}
        {(prev || next) && (
          <nav className="mt-10 flex flex-col gap-4 sm:flex-row">
            {prev ? <AreaStep area={prev} direction="prev" /> : <span className="hidden flex-1 sm:block" />}
            {next ? <AreaStep area={next} direction="next" /> : <span className="hidden flex-1 sm:block" />}
          </nav>
        )}
      </div>
    </div>
  );
}
