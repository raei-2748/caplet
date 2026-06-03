# UI Polish Plan

## Visual direction

Caplet should feel like a refined editorial learning platform: composed, trustworthy, and easy to scan before a learner commits to a lesson or tool. The interface should pair generous whitespace with precise labels so beginners understand what each area helps them do.

## Design principles

- **Warm surfaces:** Use soft cream, parchment, and raised white panels in light mode so pages feel welcoming rather than clinical. In dark mode, keep the same warmth through charcoal surfaces instead of pure black.
- **Deep ink:** Prioritise warm near-black text for headings and primary labels, with muted ink for supporting copy. Avoid low-contrast grey-on-grey combinations, especially in dark mode.
- **Restrained blue accent:** Use blue for primary actions, progress, active navigation, and small orientation cues. Do not flood large panels with accent colour.
- **Calm motion:** Prefer short opacity, lift, and shadow transitions. Hover states should confirm interactivity without distracting from reading.
- **Beginner-friendly labels:** Replace overly clever terms with plain language. Navigation, cards, and calls to action should describe the learner outcome.

## First sprint scope

1. Establish reusable UI primitives in `src/components/ui/` for page shells, cards, actions, badges, inputs, stats, progress, and linked resource rows.
2. Polish the global navbar so labels are clearer, active states are quieter, and dark mode contrast remains stable.
3. Migrate the Tools page first, because it is a self-contained catalogue and can validate the shared primitives.
4. Lightly migrate Dashboard into a clearer learning hub hierarchy: welcome, resume, stats, classes, saved revision, and course shortcuts.
5. Audit changed pages in both light and dark modes for surface layering, accent restraint, text contrast, and motion.

## Page hierarchy guidance

- **Hero / page header:** Explain what the learner can do here in one sentence.
- **Primary task:** Put the next best action first, then supporting resources.
- **Catalogue areas:** Use plain category labels and short descriptions.
- **Empty states:** Tell learners what happened and where to go next.
