import { Link } from 'react-router-dom';
import Glyph from '../../components/SubjectGlyph';
import { economicsOutcomes } from '../../data/economicsResourceLibrary';
import { economicsSubject, getAreaTally, sectionNavItems, typeMeta, typeOrder } from './data';

/**
 * Shared components for the Economics section of the resource library.
 * Everything here keeps the economics pages in the site's "shelf" language —
 * Bricolage display headings, a Shantell hand kicker, the coral Commerce
 * identity for the subject badge, and blue as the working accent.
 *
 * Pure constants/helpers live in ./data.js.
 */

/** The coral subject glyph tile, matching the /library subject shelf. */
export function SubjectBadge({ className = 'h-14 w-14', glyphClass = 'h-7 w-7' }) {
  const { subject, faculty } = economicsSubject;
  return (
    <div className={`shrink-0 grid place-items-center rounded-2xl ${faculty.block} ${faculty.text} ${className}`}>
      <Glyph className={glyphClass}>{subject?.glyph}</Glyph>
    </div>
  );
}

/** Hand-written kicker used above headings, tilted like the rest of the site. */
export function Kicker({ children, className = '' }) {
  return <span className={`font-hand text-accent text-xl -rotate-2 inline-block ${className}`}>{children}</span>;
}

/** Back link with a chevron, matching LibrarySubject. */
export function BackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 text-sm font-bold text-text-muted transition-colors hover:text-accent"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {children}
    </Link>
  );
}

/** Pill tab bar linking the Overview / Exam / Assessment pages. */
export function SectionNav({ active }) {
  return (
    <nav className="flex flex-wrap gap-2 rounded-full border border-line-soft bg-surface-raised p-1.5">
      {sectionNavItems.map((item) => {
        const isActive = item.key === active;
        return (
          <Link
            key={item.key}
            to={item.to}
            aria-current={isActive ? 'page' : undefined}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              isActive
                ? 'bg-accent text-white shadow-[0_10px_24px_-16px_rgba(19,81,170,0.9)]'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Syllabus outcome code chip with the full descriptor on hover. */
export function OutcomeChip({ code }) {
  return (
    <span
      title={economicsOutcomes[code]}
      className="inline-flex items-center rounded-lg border border-line-soft bg-surface-soft px-2.5 py-1 font-mono text-xs font-semibold text-text-muted"
    >
      {code}
    </span>
  );
}

/** Compact resource tally (mono counts) for a focus area card. */
export function AreaTally({ area, className = '' }) {
  const tally = getAreaTally(area);
  const parts = typeOrder.filter((type) => tally[type] > 0);
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-text-muted ${className}`}>
      {parts.map((type) => (
        <span key={type} className="inline-flex items-baseline gap-1">
          <span className="font-semibold text-text-primary">{tally[type]}</span>
          {typeMeta[type].tally}
        </span>
      ))}
    </div>
  );
}
