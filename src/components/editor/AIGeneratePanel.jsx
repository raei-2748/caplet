import { useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import { extractPdfText } from '../../lib/pdfExtract';

const PRESETS = [
  { label: 'Full lesson',   text: 'Create a complete lesson covering the topic end to end. Start with a hero introduction, then content slides explaining key concepts using text, charts, diagrams, Desmos graphs, and interactive simulations where relevant. Follow with varied practice activities (multiple choice, fill blanks, matching, ordering). End with a flashcard summary.' },
  { label: 'Presentation',  text: 'Create a presentation for live delivery to an audience. Use strong hero and divider slides for structure, concise text slides with key bullet points, charts, diagrams, and interactive embeds. No practice questions or quizzes — this is designed to be presented, not self-studied.' },
  { label: 'Practice',      text: 'Generate only practice and quiz slides — no reading content. Include a variety of: multiple choice (single and multi-select), fill in the blank (textbox and dropdown), matching pairs, ordering activities, and timeline activities. Every question must have correct answers and a clear educational explanation.' },
  { label: 'Exam prep',     text: 'Generate hard exam-style practice only. Use common misconceptions as distractors, tricky wording, and multi-step reasoning. Mix multiple choice, fill blanks, and matching. Every answer needs a detailed explanation covering why the correct answer is right and why each wrong option is wrong.' },
  { label: 'Flashcards',    text: 'Generate flashcard slides only using carousel mode for active recall. Cover all key terms, definitions, formulas, and concepts from the material. No other slide types.' },
  { label: 'Summary',       text: 'Generate a condensed revision reference. Use dividers for sections, callout text slides for key takeaways, tables for comparisons, charts for numerical data. End with a grid flashcard slide of the most important terms. Keep it concise — no lengthy reading passages, minimal practice questions.' },
  { label: 'Introduction',  text: 'Just introduce the topic for a first encounter with it. One hero slide to set the scene, a few content slides covering the core concepts accessibly, and one carousel flashcard set for key vocabulary. Brief and beginner-friendly — no advanced content.' },
  { label: 'Deep dive',     text: 'Generate a comprehensive in-depth lesson covering the topic exhaustively. Explain every concept in text, supported by charts, Desmos graphs, diagrams, and PhET simulations where relevant. Follow with a full range of varied practice activities. Maximum depth and breadth — prioritise quality and completeness over brevity.' },
];

const MODEL_OPTIONS = [
  { id: 'gpt-5.4-nano', label: 'Nano',  tier: 'Fastest & cheapest',           desc: 'Good for simple flashcards or quick summaries.', cost: 1 },
  { id: 'gpt-5.4-mini', label: 'Mini',  tier: 'Great balance',                desc: 'Speed and quality. Recommended default.',          cost: 2 },
  { id: 'gpt-5.4',      label: 'Std',   tier: 'Frontier quality',             desc: 'Better at complex lessons and curriculum.',        cost: 3 },
  { id: 'gpt-5.5',      label: 'Max',   tier: 'Most powerful',                desc: 'Best for nuanced, curriculum-accurate content.',   cost: 4 },
];

const FORMATTER_OPTIONS = [
  { id: 'gpt-5.4-mini', label: 'Mini', desc: 'Faster JSON formatting. Recommended.' },
  { id: 'gpt-5.4-nano', label: 'Nano', desc: 'Cheapest formatting option.' },
];

const PLACEHOLDER_NOTES = `Paste notes, dot points, or textbook paragraphs — or just describe the topic:\n"Explain opportunity cost for Year 11 Economics"\n"10 MCQs on Newton's laws, NESA syllabus"`;

const LOADING_STAGES = [
  { label: 'Planning lesson',  phase: 0 },
  { label: 'Planning lesson',  phase: 0 },
  { label: 'Building slides',  phase: 1 },
  { label: 'Building slides',  phase: 1 },
  { label: 'Finishing up',     phase: 2 },
];

function CostDots({ cost, active }) {
  return (
    <span className="flex items-center gap-[3px]">
      {Array.from({ length: 4 }).map((_, k) => (
        <span
          key={k}
          className={`rounded-full transition-all duration-200 ${
            k < cost
              ? active ? 'w-[5px] h-[5px] bg-accent' : 'w-[5px] h-[5px] bg-text-dim/40'
              : 'w-[5px] h-[5px] bg-line-soft'
          }`}
        />
      ))}
    </span>
  );
}

export default function AIGeneratePanel({ open, onClose, lessonTitle, onApply }) {
  const [notes, setNotes] = useState('');
  const [curriculum, setCurriculum] = useState('');
  const [audience, setAudience] = useState('');
  const [outputDesc, setOutputDesc] = useState('');
  const [slideCount, setSlideCount] = useState(15);
  const [model, setModel] = useState('gpt-5.4-mini');
  const [formatterModel, setFormatterModel] = useState('gpt-5.4-mini');
  const [pdfState, setPdfState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [applied, setApplied] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const fileRef = useRef(null);

  // Reset transient result state each time the modal opens.
  useEffect(() => {
    if (open) {
      setWarnings([]);
      setApplied(false);
      setError('');
    }
  }, [open]);

  useEffect(() => {
    if (!loading) { setLoadingStage(0); return; }
    setLoadingStage(0);
    let i = 0;
    const id = setInterval(() => {
      i = Math.min(i + 1, LOADING_STAGES.length - 1);
      setLoadingStage(i);
    }, 7000);
    return () => clearInterval(id);
  }, [loading]);

  const totalChars = notes.length + (pdfState?.chars || 0);

  const handlePdf = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setPdfState('extracting');
    try {
      const text = await extractPdfText(file);
      if (!text.trim()) throw new Error('Could not extract any text from this PDF. It may be image-only — try pasting the text manually.');
      setPdfState({ name: file.name, chars: text.length, text });
    } catch (err) {
      setError(err.message || 'PDF extraction failed');
      setPdfState(null);
    } finally {
      e.target.value = '';
    }
  };

  const removePdf = () => setPdfState(null);

  const submit = async (mode) => {
    if (applied) return; // slides from this run are already applied; don't re-apply
    setError('');
    setWarnings([]);
    const sourceText = pdfState?.text || '';
    const combined = [sourceText, notes].filter(Boolean).join('\n\n').trim();
    if (!combined || combined.length < 20) {
      setError('Add some notes, a PDF, or describe what you want (at least 20 characters).');
      return;
    }
    if (combined.length > 30000) {
      setError('Content is too long (max ~30,000 characters). Trim your notes or use a shorter PDF section.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.aiGenerateLesson({
        notes: combined,
        title: lessonTitle,
        curriculum: curriculum.trim() || undefined,
        audience: audience.trim() || undefined,
        outputDescription: outputDesc.trim() || undefined,
        slideCount,
        model,
        formatterModel,
      });
      onApply(res.slides || [], mode);
      if (res.warnings?.length) {
        // Slides applied, but hold the modal open to surface warnings.
        // Mark as applied so the action buttons can't append the same slides twice.
        setWarnings(res.warnings);
        setApplied(true);
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'AI generation failed');
    } finally {
      setLoading(false);
    }
  };

  const currentPhase = LOADING_STAGES[loadingStage]?.phase ?? 0;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'rgba(0,0,0,0.48)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-[560px] max-h-[90dvh] bg-surface-raised rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out ${open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.97] translate-y-3'}`}
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 4px 20px rgba(0,0,0,0.12), 0 0 0 1px var(--line-soft)' }}
      >
        {/* Top accent line */}
        <div className="h-px bg-gradient-to-r from-accent via-accent/50 to-transparent shrink-0" />

        {/* Header */}
        <header className="shrink-0 px-7 pt-6 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-medium text-accent/50 uppercase tracking-[0.22em] mb-3 flex items-center gap-2">
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                  <path d="M5 0.5L6.1 3.7L9.5 5L6.1 6.3L5 9.5L3.9 6.3L0.5 5L3.9 3.7Z" fill="currentColor" />
                </svg>
                AI generate
              </p>
              <h2 className="text-[1.6rem] font-display font-bold text-text-primary leading-tight tracking-tight">
                Generate slides
              </h2>
              <p className="mt-1.5 text-[13px] font-serif italic text-text-dim leading-relaxed">
                Two-pass pipeline — plan then format. You review before saving.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-1 w-7 h-7 flex items-center justify-center rounded-full border border-line-soft text-text-dim hover:text-text-primary hover:border-text-dim/50 transition-colors duration-150 shrink-0"
              aria-label="Close"
            >
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M1.5 1.5L7.5 7.5M7.5 1.5L1.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-line-soft via-line-soft/60 to-transparent shrink-0 mx-0" />

        {/* Form */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-7 py-5 space-y-6">

            {/* ── Notes ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-[10px] font-medium text-text-dim/60 uppercase tracking-[0.12em]">
                  Notes or topic <span className="text-rose-400 not-italic">*</span>
                </label>
                <span className={`font-mono text-[10px] tabular-nums transition-colors duration-150 ${totalChars > 28000 ? 'text-amber-500 font-semibold' : 'text-text-dim/40'}`}>
                  {totalChars > 0 ? `${(totalChars / 1000).toFixed(1)}k` : '0'} / 30k
                </span>
              </div>
              <textarea
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={PLACEHOLDER_NOTES}
                className="w-full rounded-lg border border-line-soft bg-surface-body px-3.5 py-3 text-[13px] text-text-primary placeholder:text-text-dim/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 resize-none transition-[border-color,box-shadow] duration-150 leading-relaxed"
              />
              {totalChars > 28000 && (
                <p className="mt-1.5 text-[11px] text-amber-500">Getting long — consider trimming or splitting into sections.</p>
              )}
            </div>

            {/* ── PDF upload ── */}
            <div>
              <label className="font-mono text-[10px] font-medium text-text-dim/60 uppercase tracking-[0.12em] mb-2 block">
                PDF <span className="font-body normal-case text-text-dim/40 not-italic">(optional)</span>
              </label>
              {pdfState === 'extracting' ? (
                <div className="flex items-center gap-2 text-[13px] text-text-muted py-2">
                  <span className="w-3.5 h-3.5 border-[1.5px] border-accent border-t-transparent rounded-full animate-spin shrink-0" />
                  Extracting text…
                </div>
              ) : pdfState?.text ? (
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.05]">
                  <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="flex-1 min-w-0 text-[13px] text-text-primary truncate font-medium" title={pdfState.name}>{pdfState.name}</span>
                  <span className="font-mono text-[10px] text-text-dim shrink-0">{(pdfState.chars / 1000).toFixed(1)}k chars</span>
                  <button type="button" onClick={removePdf} className="text-text-dim hover:text-rose-500 shrink-0 transition-colors duration-150">
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 1.5L7.5 7.5M7.5 1.5L1.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full py-3 rounded-lg border border-dashed border-line-soft text-[13px] text-text-dim hover:text-text-muted hover:border-text-dim/40 hover:bg-surface-soft/50 transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v8M3.5 4.5l3-3 3 3M1 10h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Upload PDF
                  </button>
                  <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdf} />
                  <p className="mt-1.5 text-[11px] text-text-dim/50">Text-based PDFs only — scanned / image PDFs won't extract well.</p>
                </>
              )}
            </div>

            {/* ── Divider ── */}
            <div className="h-px bg-line-soft/50" />

            {/* ── Output format ── */}
            <div>
              <label className="font-mono text-[10px] font-medium text-text-dim/60 uppercase tracking-[0.12em] mb-3 block">
                Output format <span className="font-body normal-case text-text-dim/40">(optional)</span>
              </label>
              <div className="grid grid-cols-4 gap-1 mb-3">
                {PRESETS.map((p) => {
                  const active = outputDesc === p.text;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setOutputDesc(active ? '' : p.text)}
                      className={`px-1.5 py-2 rounded-lg text-[11px] font-semibold text-center transition-all duration-150 leading-tight ${
                        active
                          ? 'bg-accent text-white shadow-sm'
                          : 'bg-surface-soft text-text-muted hover:bg-surface-body hover:text-text-primary border border-line-soft/60'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <textarea
                rows={3}
                value={outputDesc}
                onChange={(e) => setOutputDesc(e.target.value)}
                placeholder="Describe the structure, slide types, tone, or what to include or skip… Presets above are a starting point you can edit."
                className="w-full rounded-lg border border-line-soft bg-surface-body px-3.5 py-3 text-[13px] text-text-primary placeholder:text-text-dim/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 resize-none transition-[border-color,box-shadow] duration-150 leading-relaxed"
              />
            </div>

            {/* ── Slide count ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="font-mono text-[10px] font-medium text-text-dim/60 uppercase tracking-[0.12em]">Slide count</label>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-display font-bold text-accent tabular-nums leading-none">{slideCount}</span>
                  <span className="text-[10px] text-text-dim ml-1">slides</span>
                </div>
              </div>
              <input
                type="range"
                min={3}
                max={50}
                step={1}
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer h-px"
              />
              <div className="flex justify-between text-[10px] text-text-dim/40 mt-1.5 font-mono">
                <span>3</span>
                <span className="text-text-dim/30">target · AI may vary slightly</span>
                <span>50</span>
              </div>
            </div>

            {/* ── Divider ── */}
            <div className="h-px bg-line-soft/50" />

            {/* ── Model (planning pass) ── */}
            <div>
              <label className="font-mono text-[10px] font-medium text-text-dim/60 uppercase tracking-[0.12em] mb-3 block">
                Model <span className="font-body normal-case text-text-dim/40">(planning pass — cheapest → smartest)</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {MODEL_OPTIONS.map((m) => {
                  const active = model === m.id;
                  return (
                    <label
                      key={m.id}
                      className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                        active ? 'border-accent/50 bg-accent/[0.04]' : 'border-line-soft hover:border-text-dim/30 hover:bg-surface-soft/60'
                      }`}
                    >
                      <input type="radio" name="model" value={m.id} checked={active} onChange={() => setModel(m.id)} className="sr-only" />
                      <div className={`mt-0.5 w-3.5 h-3.5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-150 ${active ? 'border-accent' : 'border-line-strong/30'}`}>
                        {active && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[12px] font-semibold transition-colors duration-150 ${active ? 'text-text-primary' : 'text-text-muted'}`}>{m.label}</span>
                          <CostDots cost={m.cost} active={active} />
                        </div>
                        <p className="text-[10px] text-text-dim leading-snug">{m.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* ── Advanced (formatter + context) ── */}
            <div>
              <button
                type="button"
                onClick={() => setAdvancedOpen((v) => !v)}
                className="flex items-center gap-1.5 text-[11px] font-medium text-text-dim hover:text-text-muted transition-colors duration-150 mb-3"
              >
                <svg
                  width="9" height="9" viewBox="0 0 9 9" fill="none"
                  className={`transition-transform duration-150 ${advancedOpen ? 'rotate-90' : 'rotate-0'}`}
                >
                  <path d="M3 2l3 2.5L3 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Advanced options
              </button>

              {advancedOpen && (
                <div className="space-y-5 animate-slide-card-enter">
                  {/* Curriculum */}
                  <div>
                    <label className="font-mono text-[10px] font-medium text-text-dim/60 uppercase tracking-[0.12em] mb-2 block">
                      Curriculum / syllabus <span className="font-body normal-case text-text-dim/40">(recommended)</span>
                    </label>
                    <input
                      type="text"
                      value={curriculum}
                      onChange={(e) => setCurriculum(e.target.value)}
                      placeholder="e.g. NSW Year 11 Economics 2025, AP Physics 1, GCSE Chemistry AQA"
                      className="w-full rounded-lg border border-line-soft bg-surface-body px-3.5 py-2.5 text-[13px] text-text-primary placeholder:text-text-dim/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 transition-[border-color,box-shadow] duration-150"
                    />
                  </div>

                  {/* Audience */}
                  <div>
                    <label className="font-mono text-[10px] font-medium text-text-dim/60 uppercase tracking-[0.12em] mb-2 block">
                      Audience / year level
                    </label>
                    <input
                      type="text"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="e.g. Year 10 students, University first year, Adult beginners"
                      className="w-full rounded-lg border border-line-soft bg-surface-body px-3.5 py-2.5 text-[13px] text-text-primary placeholder:text-text-dim/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 transition-[border-color,box-shadow] duration-150"
                    />
                  </div>

                  {/* Stage 2 formatter */}
                  <div>
                    <label className="font-mono text-[10px] font-medium text-text-dim/60 uppercase tracking-[0.12em] mb-2.5 block">
                      Stage 2 model <span className="font-body normal-case text-text-dim/40">(JSON formatting pass)</span>
                    </label>
                    <div className="flex gap-1 p-1 rounded-xl bg-surface-soft border border-line-soft/60">
                      {FORMATTER_OPTIONS.map((m) => {
                        const active = formatterModel === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setFormatterModel(m.id)}
                            className={`flex-1 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 ${
                              active
                                ? 'bg-surface-raised shadow-minimal text-text-primary'
                                : 'text-text-dim hover:text-text-muted'
                            }`}
                          >
                            {m.label}
                            <span className="ml-1.5 font-mono text-[9px] opacity-50 font-normal">{active ? m.desc.split('.')[0] : ''}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Error ── */}
            {error && (
              <div className="rounded-lg border border-rose-400/30 bg-rose-500/[0.05] px-4 py-3 text-[13px] text-rose-600 dark:text-rose-400 leading-snug">
                {error}
              </div>
            )}

            {/* ── Warnings ── */}
            {warnings.length > 0 && (
              <div className="rounded-lg border border-amber-400/30 bg-amber-500/[0.05] px-4 py-3 space-y-1.5">
                <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Some slides were skipped</p>
                {warnings.map((w, i) => <p key={i} className="text-[12px] text-amber-700 dark:text-amber-400">{w}</p>)}
                <button type="button" onClick={onClose} className="mt-1 text-accent hover:underline text-[12px] transition-colors duration-150">
                  Close and review →
                </button>
              </div>
            )}

            {/* Spacer */}
            <div className="h-2" />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-line-soft/60 px-7 py-4 bg-surface-raised">

          {/* Loading state */}
          {loading && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 border-[1.5px] border-accent border-t-transparent rounded-full animate-spin shrink-0" />
                  <span className="text-[12px] font-medium text-text-primary">{LOADING_STAGES[loadingStage]?.label}…</span>
                </div>
                <span className="font-mono text-[10px] text-text-dim">
                  {currentPhase === 0 ? 'planning' : currentPhase === 1 ? 'building' : 'finishing'}
                </span>
              </div>
              {/* 3-stage progress bar */}
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex-1 h-[2px] rounded-full overflow-hidden bg-line-soft">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        i < currentPhase ? 'w-full bg-accent'
                        : i === currentPhase ? 'w-full bg-accent animate-progress-indefinite'
                        : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-[13px] font-medium text-text-dim hover:text-text-muted transition-colors duration-150 px-1"
            >
              Cancel
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => submit('append')}
              disabled={loading || applied || pdfState === 'extracting'}
              className="h-8 px-4 rounded-full border border-line-soft text-[13px] font-medium text-text-muted hover:text-text-primary hover:border-text-dim/40 disabled:opacity-40 transition-colors duration-150"
            >
              Append
            </button>
            <button
              type="button"
              onClick={() => submit('replace')}
              disabled={loading || applied || pdfState === 'extracting'}
              className="h-8 px-5 btn-primary text-[13px] font-medium disabled:opacity-40"
            >
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
