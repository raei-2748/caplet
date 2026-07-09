import { ChartBarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { typeMeta } from './data';
import { OutcomeChip } from './shared';

/**
 * Renderers for the five practice resource types. Each is a self-contained
 * card in the site's shelf style (rounded-2xl, soft shadow, design tokens);
 * answers and worked responses stay tucked inside <details> reveals so a card
 * reads as a question first and a solution second.
 */

const cardClass =
  'rounded-2xl border border-line-soft bg-surface-raised p-6 shadow-[0_20px_44px_-38px_rgba(20,20,18,0.45)]';
const revealClass =
  'mt-4 rounded-xl border border-line-soft bg-surface-soft px-4 py-3 [&_summary]:cursor-pointer [&_summary]:list-none [&_summary]:font-bold [&_summary]:text-sm [&_summary]:text-text-primary [&_summary::-webkit-details-marker]:hidden';
const softBox = 'rounded-xl border border-line-soft bg-surface-soft';

function Bullets({ items }) {
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-relaxed text-text-muted">
          <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Label({ children }) {
  return <div className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-text-dim">{children}</div>;
}

function RevealSummary({ children }) {
  return (
    <summary className="flex items-center justify-between gap-3">
      <span>{children}</span>
      <span className="text-text-dim transition-transform group-open:rotate-180" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </span>
    </summary>
  );
}

function QuestionShell({ resource, children }) {
  const meta = typeMeta[resource.type];
  return (
    <article className={cardClass}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-accent-soft px-2.5 py-1 text-xs font-extrabold text-accent">{meta.label}</span>
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-text-dim">{resource.difficulty}</span>
        {resource.marks ? (
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-text-dim">{resource.marks} marks</span>
        ) : null}
      </div>
      {children}
      <div className="mt-5 flex flex-wrap gap-2">
        {resource.outcomes.map((code) => (
          <OutcomeChip key={code} code={code} />
        ))}
      </div>
    </article>
  );
}

function MultipleChoiceResource({ resource }) {
  return (
    <QuestionShell resource={resource}>
      <h4 className="text-base font-bold leading-snug text-text-primary">{resource.stem}</h4>
      <div className="mt-4 grid gap-2">
        {resource.options.map((option, index) => (
          <div key={option} className={`flex gap-3 ${softBox} px-3 py-2`}>
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface-raised font-mono text-xs font-bold text-text-muted">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="text-sm font-medium leading-relaxed text-text-primary">{option}</span>
          </div>
        ))}
      </div>
      <details className={`group ${revealClass}`}>
        <RevealSummary>Show answer and explanation</RevealSummary>
        <p className="mt-3 text-sm font-semibold text-accent">Answer: {resource.answer}</p>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">{resource.explanation}</p>
      </details>
    </QuestionShell>
  );
}

function ShortAnswerResource({ resource }) {
  return (
    <QuestionShell resource={resource}>
      <h4 className="text-base font-bold leading-snug text-text-primary">{resource.question}</h4>
      {resource.stimulus ? (
        <p className={`mt-3 ${softBox} px-4 py-3 text-sm font-medium leading-relaxed text-text-muted`}>{resource.stimulus}</p>
      ) : null}
      <div className="mt-4">
        <Label>Marking guide</Label>
        <Bullets items={resource.markingGuide} />
      </div>
      <details className={`group ${revealClass}`}>
        <RevealSummary>Show sample response</RevealSummary>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">{resource.sampleAnswer}</p>
      </details>
    </QuestionShell>
  );
}

function ExtendedResponseResource({ resource }) {
  return (
    <QuestionShell resource={resource}>
      <h4 className="text-base font-bold leading-snug text-text-primary">{resource.prompt}</h4>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <Label>Planning frame</Label>
          <ol className="grid gap-2">
            {resource.planningFrame.map((item) => (
              <li key={item} className={`${softBox} px-3 py-2 text-sm leading-relaxed text-text-muted`}>
                {item}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <Label>Band guide</Label>
          <div className="grid gap-2">
            {resource.rubric.map((band) => (
              <p key={band} className={`${softBox} px-3 py-2 text-sm leading-relaxed text-text-muted`}>
                {band}
              </p>
            ))}
          </div>
        </div>
      </div>
      <details className={`group ${revealClass}`}>
        <RevealSummary>Show exemplar thesis</RevealSummary>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">{resource.exemplarThesis}</p>
      </details>
    </QuestionShell>
  );
}

function TopicDrillResource({ resource }) {
  return (
    <QuestionShell resource={resource}>
      <h4 className="text-lg font-extrabold leading-snug text-text-primary">{resource.title}</h4>
      <p className={`mt-3 ${softBox} px-4 py-3 text-sm font-medium leading-relaxed text-text-muted`}>{resource.keyIdea}</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className={`${softBox} p-4`}>
          <Label>Quick check</Label>
          <p className="text-sm font-bold leading-relaxed text-text-primary">{resource.quickCheck.stem}</p>
          <div className="mt-3 grid gap-2">
            {resource.quickCheck.options.map((option, index) => (
              <div key={option} className="flex gap-2 text-sm leading-relaxed text-text-muted">
                <span className="font-mono font-bold text-text-primary">{String.fromCharCode(65 + index)}.</span>
                <span>{option}</span>
              </div>
            ))}
          </div>
          <details className="group mt-3">
            <RevealSummary>Show answer</RevealSummary>
            <p className="mt-2 text-sm font-semibold text-accent">Answer: {resource.quickCheck.answer}</p>
            <p className="mt-1 text-sm leading-relaxed text-text-muted">{resource.quickCheck.explanation}</p>
          </details>
        </div>

        <div className={`${softBox} p-4`}>
          <Label>Short response</Label>
          <p className="text-sm font-bold leading-relaxed text-text-primary">{resource.practicePrompt}</p>
          <div className="mt-3">
            <Bullets items={resource.markingGuide} />
          </div>
        </div>
      </div>

      <details className={`group ${revealClass}`}>
        <RevealSummary>Show target response and teaching move</RevealSummary>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">{resource.sampleAnswer}</p>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-text-primary">{resource.teacherMove}</p>
      </details>
    </QuestionShell>
  );
}

function formatStimulusValue(row) {
  const value =
    typeof row.value === 'number' ? row.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : row.value;
  return row.unit ? `${value} ${row.unit}` : value;
}

function StimulusSetResource({ resource }) {
  const maxValue = Math.max(...resource.data.map((row) => Math.abs(Number(row.value)) || 0), 1);

  return (
    <QuestionShell resource={resource}>
      <div className="mb-3 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
          <ChartBarIcon className="h-5 w-5" />
        </span>
        <div>
          <h4 className="text-lg font-extrabold leading-snug text-text-primary">{resource.title}</h4>
          <p className="mt-2 text-sm font-medium leading-relaxed text-text-muted">{resource.context}</p>
          <p className="mt-2 text-xs font-semibold text-text-dim">{resource.sourceNote}</p>
        </div>
      </div>

      <div className={`mt-4 overflow-hidden ${softBox}`}>
        <div className="hidden grid-cols-[minmax(0,0.9fr)_minmax(6rem,0.45fr)_minmax(0,1.15fr)] border-b border-line-soft px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-text-dim md:grid">
          <span>Indicator</span>
          <span>Value</span>
          <span>Use in answer</span>
        </div>
        {resource.data.map((row) => {
          const width = `${Math.max(8, Math.round((Math.abs(Number(row.value)) / maxValue) * 100))}%`;
          return (
            <div
              key={row.indicator}
              className="grid gap-3 border-b border-line-soft px-3 py-3 text-sm last:border-b-0 md:grid-cols-[minmax(0,0.9fr)_minmax(6rem,0.45fr)_minmax(0,1.15fr)]"
            >
              <div className="font-bold leading-snug text-text-primary">{row.indicator}</div>
              <div>
                <div className="font-mono font-bold text-accent">{formatStimulusValue(row)}</div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-raised">
                  <div className="h-full rounded-full bg-accent" style={{ width }} />
                </div>
              </div>
              <div className="font-medium leading-relaxed text-text-muted">{row.interpretation}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3">
        {resource.questions.map((question) => (
          <div key={question.prompt} className={`${softBox} p-4`}>
            <div className="mb-2 flex items-start justify-between gap-3">
              <p className="text-sm font-extrabold leading-relaxed text-text-primary">{question.prompt}</p>
              <span className="shrink-0 rounded-md bg-surface-raised px-2 py-1 font-mono text-xs font-bold text-text-muted">
                {question.marks} marks
              </span>
            </div>
            <Bullets items={question.markingGuide} />
          </div>
        ))}
      </div>

      <details className={`group ${revealClass}`}>
        <RevealSummary>Show sample integrated response</RevealSummary>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">{resource.sampleResponse}</p>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-text-primary">{resource.teacherMove}</p>
      </details>
    </QuestionShell>
  );
}

const renderers = {
  topicDrill: TopicDrillResource,
  multipleChoice: MultipleChoiceResource,
  shortAnswer: ShortAnswerResource,
  stimulusSet: StimulusSetResource,
  extendedResponse: ExtendedResponseResource,
};

export default function ResourceRenderer({ resource }) {
  const Component = renderers[resource.type] || ExtendedResponseResource;
  return <Component resource={resource} />;
}
