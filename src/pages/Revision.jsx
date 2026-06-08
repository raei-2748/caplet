import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import CapletLoader from '../components/CapletLoader';
import SlideRenderer from '../components/lesson/SlideRenderer';
import { slideKindLabel, normalizeSlide } from '../lib/slideSchema';

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseSlides(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return []; } }
  return [];
}

function getSlideData(savedSlide) {
  const slides = parseSlides(savedSlide.lesson?.slides);
  const raw = slides[savedSlide.slideIndex];
  return raw ? normalizeSlide(raw) : null;
}

function getExcerpt(slide, maxLen = 140) {
  if (!slide) return null;
  switch (slide.type) {
    case 'text': return String(slide.content || '').replace(/[#*`_[\]()>]/g, '').trim().slice(0, maxLen) || null;
    case 'choice': return slide.question || null;
    case 'fillblank': return (slide.template || '').replace(/\{\{[^}]+\}\}/g, '___') || null;
    case 'cards': return slide.cards?.slice(0, 2).map((c) => c.front).join(' · ') || null;
    case 'match': return slide.pairs?.slice(0, 2).map((p) => p.left).join(' · ') || null;
    case 'order': return slide.prompt || slide.items?.slice(0, 3).join(', ') || null;
    case 'divider': return slide.subtitle || slide.title || null;
    case 'timeline': return slide.prompt || null;
    case 'table': return slide.rows?.[0]?.slice(0, 3).join(' · ') || null;
    default: return null;
  }
}

// ── Card back content ─────────────────────────────────────────────────────────

function CardBack({ slide }) {
  if (!slide) return <p className="text-sm text-text-dim italic">No preview</p>;

  switch (slide.type) {
    case 'text':
      return (
        <p className="text-[13px] leading-relaxed text-text-primary line-clamp-7">
          {String(slide.content || '').replace(/[#*`_[\]()>]/g, '').trim()}
        </p>
      );
    case 'choice':
      return (
        <div>
          <p className="text-[13px] font-semibold text-text-primary mb-3 line-clamp-2">{slide.question}</p>
          <ul className="space-y-1.5">
            {(slide.options || []).map((o, i) => (
              <li
                key={i}
                className={`flex items-start gap-2 text-[12px] ${
                  slide.correctIndices?.includes(i)
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-text-muted'
                }`}
              >
                <span className="shrink-0 w-3 mt-px">{slide.correctIndices?.includes(i) ? '✓' : '·'}</span>
                <span className="line-clamp-1">{o}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case 'cards':
      return (
        <ul className="space-y-2">
          {(slide.cards || []).slice(0, 4).map((c, i) => (
            <li key={i} className="text-[12px] flex gap-1.5 flex-wrap">
              <span className="font-medium text-text-primary">{c.front}</span>
              {c.back && (
                <>
                  <span className="text-text-dim/40">→</span>
                  <span className="text-text-muted">{c.back}</span>
                </>
              )}
            </li>
          ))}
          {(slide.cards?.length || 0) > 4 && (
            <li className="text-[11px] text-text-dim">+{slide.cards.length - 4} more</li>
          )}
        </ul>
      );
    case 'fillblank':
      return (
        <p className="text-[13px] text-text-primary leading-relaxed">
          {(slide.template || '').replace(/\{\{[^}]+\}\}/g, '___')}
        </p>
      );
    case 'match':
      return (
        <ul className="space-y-2">
          {(slide.pairs || []).slice(0, 5).map((p, i) => (
            <li key={i} className="text-[12px] flex items-center gap-2">
              <span className="font-medium text-text-primary">{p.left}</span>
              <span className="text-text-dim/40 shrink-0">↔</span>
              <span className="text-text-muted">{p.right}</span>
            </li>
          ))}
        </ul>
      );
    case 'divider':
      return (
        <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-2">
          <p className="text-base font-display font-bold text-text-primary">{slide.title}</p>
          {slide.subtitle && <p className="text-[12px] text-text-muted">{slide.subtitle}</p>}
        </div>
      );
    case 'order':
      return (
        <ul className="space-y-1.5">
          {(slide.items || []).slice(0, 5).map((item, i) => (
            <li key={i} className="text-[12px] flex items-center gap-2">
              <span className="font-mono text-[10px] text-accent/60 w-4">{i + 1}</span>
              <span className="text-text-primary">{item}</span>
            </li>
          ))}
        </ul>
      );
    default:
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-4">
          <div className="w-10 h-10 rounded-xl bg-accent/[0.08] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-accent">
              <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-[12px] text-text-dim">Study this slide in session mode</p>
        </div>
      );
  }
}

// ── Flip card ─────────────────────────────────────────────────────────────────

function SlideFlipCard({ savedSlide, onUnsave, removing }) {
  const [flipped, setFlipped] = useState(false);
  const slide = getSlideData(savedSlide);
  const label = slide ? slideKindLabel(slide) : 'Slide';
  const excerpt = getExcerpt(slide);

  return (
    <div
      className="group relative cursor-pointer select-none"
      style={{ perspective: '1000px', height: '220px' }}
      onClick={() => setFlipped((f) => !f)}
    >
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.42s cubic-bezier(0.16,1,0.3,1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl border border-line-soft bg-surface-raised hover:border-accent/25 hover:shadow-[0_6px_24px_-6px_rgba(0,80,255,0.10)] transition-[border-color,box-shadow] duration-200 p-5 flex flex-col"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <span className="inline-flex items-center px-2 py-[3px] rounded-md bg-accent/[0.08] text-accent text-[10px] font-bold tracking-wide uppercase">
              {label}
            </span>
            <span className="font-mono text-[11px] text-text-dim/40 shrink-0">#{savedSlide.slideIndex + 1}</span>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <p className="text-[13.5px] font-semibold text-text-primary leading-snug line-clamp-2 mb-1.5">
              {savedSlide.lesson?.title || 'Lesson'}
            </p>
            {excerpt ? (
              <p className="text-[12px] text-text-muted leading-relaxed line-clamp-3">{excerpt}</p>
            ) : (
              <p className="text-[12px] text-text-dim/50 italic">Tap to see content →</p>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-line-soft/50">
            <p className="text-[11px] font-medium text-text-dim truncate pr-2">{savedSlide.course?.title}</p>
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <Link
                to={`/courses/${savedSlide.courseId}/lessons/${savedSlide.lessonId}?slide=${savedSlide.slideIndex}`}
                className="w-6 h-6 rounded-full border border-line-soft flex items-center justify-center text-text-dim hover:text-accent hover:border-accent/40 transition-colors duration-150"
                title="Go to lesson"
              >
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <path d="M1.5 7.5L7.5 1.5M7.5 1.5H3.5M7.5 1.5V5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <button
                type="button"
                onClick={() => onUnsave(savedSlide.id)}
                disabled={removing}
                className="w-6 h-6 rounded-full border border-line-soft flex items-center justify-center text-text-dim hover:text-rose-500 hover:border-rose-400/60 transition-colors duration-150 disabled:opacity-40"
                title="Remove"
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] text-text-dim/25 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            tap to flip
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl border border-accent/20 bg-surface-raised p-5 flex flex-col overflow-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex-1 min-h-0 overflow-hidden">
            <CardBack slide={slide} />
          </div>
          <p className="shrink-0 mt-2 text-[9px] text-text-dim/25 font-medium text-center whitespace-nowrap pointer-events-none">
            tap to flip back
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Category tabs ─────────────────────────────────────────────────────────────

function CategoryTabs({ groups, activeCategory, onSelect }) {
  const total = groups.reduce((sum, [, slides]) => sum + slides.length, 0);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`shrink-0 h-8 px-3.5 rounded-full border text-[13px] font-medium transition-all duration-150 ${
          activeCategory === null
            ? 'border-accent/50 bg-accent/[0.08] text-accent'
            : 'border-line-soft text-text-muted hover:border-text-dim hover:text-text-primary'
        }`}
      >
        All
        <span className={`ml-1.5 text-[11px] font-mono ${activeCategory === null ? 'text-accent/60' : 'text-text-dim/50'}`}>
          {total}
        </span>
      </button>
      {groups.map(([category, slides]) => (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(category)}
          className={`shrink-0 h-8 px-3.5 rounded-full border text-[13px] font-medium transition-all duration-150 ${
            activeCategory === category
              ? 'border-accent/50 bg-accent/[0.08] text-accent'
              : 'border-line-soft text-text-muted hover:border-text-dim hover:text-text-primary'
          }`}
        >
          {category === 'Uncategorized' ? 'Other' : category}
          <span className={`ml-1.5 text-[11px] font-mono ${activeCategory === category ? 'text-accent/60' : 'text-text-dim/50'}`}>
            {slides.length}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Study session ─────────────────────────────────────────────────────────────

function StudySession({ savedSlides, category, onClose }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const items = savedSlides
    .map((ss) => ({ ss, slide: getSlideData(ss) }))
    .filter((item) => item.slide);

  const current = items[index];
  const answered = current ? !!answers[current.ss.id] : false;

  useEffect(() => {
    const handler = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(items.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, items.length]);

  const handleSubmit = useCallback(
    (correct) => {
      if (!current) return;
      setAnswers((a) => ({ ...a, [current.ss.id]: { answered: true, correct } }));
    },
    [current],
  );

  const correct = Object.values(answers).filter((a) => a.correct).length;
  const done = Object.keys(answers).length;
  const isLast = index >= items.length - 1;

  if (items.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-surface-body flex flex-col">
      {/* Header */}
      <header className="shrink-0 border-b border-line-soft bg-surface-body/95 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 h-8 px-3 rounded-full border border-line-soft text-[13px] font-medium text-text-muted hover:text-text-primary hover:border-text-dim transition-colors duration-150"
            >
              ← Exit
            </button>
            <span className="w-px h-3.5 bg-line-soft shrink-0" />
            <span className="text-[13px] font-serif italic text-text-dim truncate">
              {category === 'Uncategorized' ? 'Other' : category}
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {done > 0 && (
              <span className="text-[12px] font-mono text-text-dim">
                <span className="text-emerald-500">{correct}</span>
                <span className="text-text-dim/40"> / </span>
                {done}
              </span>
            )}
            <span className="font-mono text-[12px] text-text-dim tabular-nums">
              {index + 1}<span className="text-text-dim/40">/</span>{items.length}
            </span>
          </div>
        </div>
        {/* Progress ticker */}
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 pb-2.5">
          <div className="flex items-center gap-1">
            {items.map((item, i) => {
              const ans = answers[item.ss.id];
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className="group flex-1 py-1.5"
                  aria-label={`Slide ${i + 1}`}
                >
                  <span
                    className={`block rounded-full transition-all duration-300 ${
                      ans?.correct
                        ? 'bg-emerald-500 h-[4px]'
                        : ans?.answered
                        ? 'bg-rose-400 h-[4px]'
                        : i === index
                        ? 'bg-accent h-[5px]'
                        : i < index
                        ? 'bg-accent/35 h-[3px]'
                        : 'bg-line-soft h-[3px] group-hover:h-[4px]'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Slide canvas */}
      <main className="flex-1 min-h-0 max-w-[1200px] w-full mx-auto px-4 md:px-8 py-5 md:py-6 flex flex-col gap-4">
        {current && (
          <>
            <div className="shrink-0 flex items-center gap-3 text-xs font-semibold text-text-dim">
              <span className="font-mono text-accent">
                {String(index + 1).padStart(2, '0')}
                <span className="opacity-50"> / </span>
                {String(items.length).padStart(2, '0')}
              </span>
              <span className="w-6 h-px bg-line-soft" />
              <span>{slideKindLabel(current.slide)}</span>
              <span className="text-text-dim/30">·</span>
              <span className="font-serif italic font-normal truncate max-w-[200px]">
                {current.ss.lesson?.title}
              </span>
            </div>

            <div
              key={index}
              className="animate-lesson-slide-in flex-1 min-h-0 relative bg-surface-raised border border-line-soft rounded-[28px] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 top-0 flex justify-center pointer-events-none">
                <div className="w-32 h-px bg-accent" />
              </div>
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <SlideRenderer
                  slide={current.slide}
                  variant="player"
                  onSubmit={handleSubmit}
                  alreadyAnswered={answered}
                  alreadyCorrect={answers[current.ss.id]?.correct}
                />
              </div>
            </div>

            <div className="shrink-0 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                className="px-4 py-2 rounded-full border border-line-soft text-text-muted hover:text-text-primary hover:border-text-dim disabled:opacity-30 text-sm font-medium transition-colors duration-150"
              >
                ← Previous
              </button>
              <div className="hidden md:flex items-center gap-2 text-xs text-text-dim">
                <kbd className="px-2 py-1 rounded border border-line-soft font-mono text-xs">←</kbd>
                <kbd className="px-2 py-1 rounded border border-line-soft font-mono text-xs">→</kbd>
                <span className="ml-1">navigate</span>
              </div>
              {isLast ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-full bg-accent text-white hover:opacity-90 text-sm font-semibold transition-opacity duration-150"
                >
                  Finish
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
                  className="px-4 py-2 rounded-full bg-text-primary text-surface-body hover:opacity-90 text-sm font-medium transition-opacity duration-150"
                >
                  Next →
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ── Summary viewer (full-screen) ──────────────────────────────────────────────

function SummaryViewer({ open, loading, error, category, slides, onClose }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => { setIdx(0); }, [slides]);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx((i) => Math.min((slides?.length || 1) - 1, i + 1));
      if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, slides]);

  if (!open) return null;

  const total = slides?.length || 0;
  const current = total ? slides[Math.min(idx, total - 1)] : null;

  return (
    <div className="fixed inset-0 z-50 bg-surface-body flex flex-col">
      {/* Header */}
      <header className="shrink-0 border-b border-line-soft bg-surface-body/95 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <svg width="13" height="13" viewBox="0 0 11 11" fill="none" className="shrink-0 text-accent">
              <path d="M5.5 0.75 L6.4 3.6 L9.25 5.5 L6.4 7.4 L5.5 10.25 L4.6 7.4 L1.75 5.5 L4.6 3.6 Z" fill="currentColor" />
            </svg>
            <p className="text-xs font-semibold text-accent shrink-0">AI Summary</p>
            <span className="text-text-dim/40 text-xs mx-1 shrink-0">·</span>
            <p className="text-sm font-serif italic text-text-primary truncate">{category}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-line-soft text-[13px] font-medium text-text-muted hover:text-text-primary hover:border-text-dim transition-colors duration-150"
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
              <path d="M1.5 1.5L7.5 7.5M7.5 1.5L1.5 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Close
          </button>
        </div>
        {!loading && !error && total > 1 && (
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 pb-2.5">
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button key={i} type="button" onClick={() => setIdx(i)} className="group flex-1 py-2">
                  <span
                    className={`block rounded-full transition-all ${
                      i === idx
                        ? 'bg-accent h-[5px]'
                        : i < idx
                        ? 'bg-accent/35 h-[3px]'
                        : 'bg-line-soft h-[3px] group-hover:h-[4px]'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 min-h-0 max-w-[1200px] w-full mx-auto px-4 md:px-8 py-5 md:py-6 flex flex-col gap-4">
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <CapletLoader message="Generating summary with AI…" />
          </div>
        )}
        {!loading && error && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-rose-400 text-sm font-medium">{error}</p>
          </div>
        )}
        {!loading && !error && current && (
          <>
            <div className="shrink-0 flex items-center gap-3 text-xs font-semibold text-text-dim">
              <span className="font-mono text-accent">
                {String(idx + 1).padStart(2, '0')}
                <span className="opacity-50"> / </span>
                {String(total).padStart(2, '0')}
              </span>
            </div>

            <div
              key={idx}
              className="animate-lesson-slide-in flex-1 min-h-0 relative bg-surface-raised border border-line-soft rounded-[28px] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 top-0 flex justify-center pointer-events-none">
                <div className="w-32 h-px bg-accent" />
              </div>
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <SlideRenderer slide={current} variant="player" onSubmit={() => {}} />
              </div>
            </div>

            <div className="shrink-0 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                disabled={idx === 0}
                className="px-4 py-2 rounded-full border border-line-soft text-text-muted hover:text-text-primary hover:border-text-dim disabled:opacity-30 text-sm font-medium transition-colors duration-150"
              >
                ← Previous
              </button>
              <div className="hidden md:flex items-center gap-2 text-xs text-text-dim">
                <kbd className="px-2 py-1 rounded border border-line-soft font-mono text-xs">←</kbd>
                <kbd className="px-2 py-1 rounded border border-line-soft font-mono text-xs">→</kbd>
                <span className="ml-1">navigate</span>
              </div>
              <button
                type="button"
                onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
                disabled={idx >= total - 1}
                className="px-4 py-2 rounded-full bg-text-primary text-surface-body hover:opacity-90 disabled:opacity-30 text-sm font-medium transition-opacity duration-150"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Revision() {
  const [savedSlides, setSavedSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [organizing, setOrganizing] = useState(false);
  const [organizeError, setOrganizeError] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [study, setStudy] = useState(null);
  const [summary, setSummary] = useState({ open: false, loading: false, error: null, category: '', slides: [] });

  const refetch = async () => {
    const data = await api.getSavedSlides().catch(() => null);
    setSavedSlides(data?.savedSlides || []);
  };

  useEffect(() => {
    (async () => {
      await refetch();
      setLoading(false);
    })();
  }, []);

  const grouped = savedSlides.reduce((acc, s) => {
    const topic = s.category || 'Uncategorized';
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(s);
    return acc;
  }, {});

  const groups = Object.entries(grouped).sort(([a], [b]) => {
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b);
  });

  const displayedSlides = activeCategory === null ? savedSlides : (grouped[activeCategory] || []);

  const handleOrganize = async () => {
    setOrganizing(true);
    setOrganizeError(null);
    try {
      await api.categorizeSavedSlides();
      await refetch();
    } catch (e) {
      setOrganizeError(e?.message || 'Could not organize right now.');
    } finally {
      setOrganizing(false);
    }
  };

  const handleSummarize = async (category) => {
    const apiCategory = category === 'Uncategorized' ? null : category;
    setSummary({ open: true, loading: true, error: null, category, slides: [] });
    try {
      const res = await api.summarizeSavedSlides(apiCategory);
      setSummary({ open: true, loading: false, error: null, category, slides: res?.slides || [] });
    } catch (e) {
      setSummary({ open: true, loading: false, error: e?.message || 'Could not summarize right now.', category, slides: [] });
    }
  };

  const handleUnsave = async (id) => {
    setRemovingId(id);
    try {
      await api.unsaveSlide(id);
      setSavedSlides((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.warn('Unsave failed:', e?.message || e);
    } finally {
      setRemovingId(null);
    }
  };

  const activeLabel = activeCategory === null
    ? 'All slides'
    : activeCategory === 'Uncategorized'
    ? 'Other'
    : activeCategory;

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-surface-body flex items-center justify-center">
        <CapletLoader message="Loading your revision…" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-surface-body pb-24">

      {/* Page header */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 pt-24 pb-10">
        <p className="font-mono text-[10px] font-medium text-accent/60 uppercase tracking-[0.22em] mb-4">Revision</p>
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-[2.75rem] md:text-5xl font-display font-bold text-text-primary tracking-tight leading-none">
              Your saved slides
            </h1>
            <p className="mt-3 text-[15px] text-text-dim leading-relaxed">
              {savedSlides.length} slide{savedSlides.length !== 1 ? 's' : ''} across{' '}
              {groups.filter(([g]) => g !== 'Uncategorized').length || groups.length} topic{groups.length !== 1 ? 's' : ''}
            </p>
          </div>
          {savedSlides.length > 0 && (
            <button
              type="button"
              onClick={handleOrganize}
              disabled={organizing}
              className="h-9 px-4 rounded-full border border-line-soft text-[13px] font-medium text-text-muted hover:text-text-primary hover:border-text-dim flex items-center gap-2 transition-colors duration-150 disabled:opacity-40"
            >
              <svg
                width="11" height="11" viewBox="0 0 11 11" fill="none"
                className={organizing ? 'animate-spin' : ''}
              >
                <path d="M5.5 0.75 L6.4 3.6 L9.25 5.5 L6.4 7.4 L5.5 10.25 L4.6 7.4 L1.75 5.5 L4.6 3.6 Z" fill="currentColor" />
              </svg>
              {organizing ? 'Organizing…' : 'Organize with AI'}
            </button>
          )}
        </div>
        {organizeError && <p className="mt-3 text-sm text-rose-500">{organizeError}</p>}
      </div>

      {savedSlides.length === 0 ? (
        /* Empty state */
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="rounded-2xl border border-line-soft bg-surface-raised p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-accent/[0.08] flex items-center justify-center mx-auto mb-6">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-accent">
                <path d="M4 10h12M4 6h8M4 14h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="font-mono text-[10px] font-medium text-text-dim/40 uppercase tracking-[0.22em] mb-3 select-none">empty</p>
            <p className="text-xl font-display font-bold text-text-primary mb-2">No saved slides yet</p>
            <p className="text-[14px] text-text-dim leading-relaxed mb-8 max-w-xs mx-auto font-serif italic">
              Bookmark slides while studying a lesson — they'll appear here, organized by topic.
            </p>
            <Link to="/courses" className="btn-primary px-6 py-2.5 text-sm inline-flex">
              Browse courses
            </Link>
          </div>
        </div>
      ) : (
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12">

          {/* Tabs + action bar */}
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            <CategoryTabs
              groups={groups}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
            />
            <div className="flex items-center gap-2 ml-auto shrink-0">
              {activeCategory !== null && (
                <button
                  type="button"
                  onClick={() => handleSummarize(activeCategory)}
                  className="h-8 px-3 rounded-full border border-line-soft text-[12px] font-medium text-text-muted hover:text-accent hover:border-accent/40 flex items-center gap-1.5 transition-colors duration-150"
                >
                  <svg width="10" height="10" viewBox="0 0 11 11" fill="none">
                    <path d="M5.5 0.75 L6.4 3.6 L9.25 5.5 L6.4 7.4 L5.5 10.25 L4.6 7.4 L1.75 5.5 L4.6 3.6 Z" fill="currentColor" />
                  </svg>
                  Summarize
                </button>
              )}
              <button
                type="button"
                onClick={() => setStudy({ slides: displayedSlides, category: activeLabel })}
                className="h-8 px-3.5 rounded-full border border-accent/50 bg-accent/[0.07] text-accent text-[12px] font-semibold hover:bg-accent/[0.14] flex items-center gap-1.5 transition-colors duration-150"
              >
                <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
                  <path d="M1.5 1.5l6 3.5-6 3.5V1.5z" fill="currentColor"/>
                </svg>
                Study
              </button>
            </div>
          </div>

          {/* Slide grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedSlides.map((ss) => (
              <SlideFlipCard
                key={ss.id}
                savedSlide={ss}
                onUnsave={handleUnsave}
                removing={removingId === ss.id}
              />
            ))}
          </div>

          {/* "All" view: per-topic summarize chips */}
          {activeCategory === null && groups.length > 1 && (
            <div className="mt-12 pt-8 border-t border-line-soft/40">
              <p className="text-[11px] font-mono font-medium text-text-dim/40 uppercase tracking-[0.15em] mb-4">
                Summaries by topic
              </p>
              <div className="flex flex-wrap gap-2">
                {groups.map(([cat]) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleSummarize(cat)}
                    className="h-8 px-3.5 rounded-full border border-line-soft text-[12px] font-medium text-text-muted hover:text-accent hover:border-accent/40 flex items-center gap-1.5 transition-colors duration-150"
                  >
                    <svg width="10" height="10" viewBox="0 0 11 11" fill="none">
                      <path d="M5.5 0.75 L6.4 3.6 L9.25 5.5 L6.4 7.4 L5.5 10.25 L4.6 7.4 L1.75 5.5 L4.6 3.6 Z" fill="currentColor" />
                    </svg>
                    {cat === 'Uncategorized' ? 'Other' : cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Study session overlay */}
      {study && (
        <StudySession
          savedSlides={study.slides}
          category={study.category}
          onClose={() => setStudy(null)}
        />
      )}

      {/* Summary viewer */}
      <SummaryViewer
        open={summary.open}
        loading={summary.loading}
        error={summary.error}
        category={summary.category === 'Uncategorized' ? 'Other' : summary.category}
        slides={summary.slides}
        onClose={() => setSummary((s) => ({ ...s, open: false }))}
      />
    </div>
  );
}
