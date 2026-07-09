import { faculties } from '../../data/hscSubjects';
import { economicsResourceLibrary, getEconomicsAreaResources } from '../../data/economicsResourceLibrary';

/**
 * Pure constants and helpers for the Economics section. Kept JSX-free (and in a
 * .js file) so the component module stays fast-refresh friendly.
 */

export const ECON_HOME = '/library/economics';

// Look up the Economics subject + its faculty (Commerce → coral) once.
export const economicsSubject = (() => {
  for (const faculty of faculties) {
    const subject = faculty.subjects.find((s) => s.slug === 'economics');
    if (subject) return { subject, faculty };
  }
  return { subject: null, faculty: { block: 'block-coral', text: 'text-coral' } };
})();

// Section tabs shared across every economics page.
export const sectionNavItems = [
  { key: 'overview', label: 'Overview', to: ECON_HOME },
  { key: 'exam', label: 'Exam practice', to: `${ECON_HOME}/exam-practice` },
  { key: 'assessment', label: 'Assessment', to: `${ECON_HOME}/assessment` },
];

// The five practice resource types, in the order we always present them.
export const typeOrder = ['topicDrill', 'multipleChoice', 'shortAnswer', 'stimulusSet', 'extendedResponse'];

export const typeLabels = {
  all: 'All resources',
  topicDrill: 'Topic drills',
  multipleChoice: 'Multiple choice',
  shortAnswer: 'Short answer',
  stimulusSet: 'Stimulus sets',
  extendedResponse: 'Extended response',
};

export const typeMeta = {
  topicDrill: { label: 'Drill', title: 'Topic Drill', tally: 'drills' },
  multipleChoice: { label: 'MCQ', title: 'Multiple Choice', tally: 'MCQ' },
  shortAnswer: { label: 'SA', title: 'Short Answer', tally: 'short' },
  stimulusSet: { label: 'Stimulus', title: 'Stimulus Set', tally: 'stimulus' },
  extendedResponse: { label: 'Essay', title: 'Extended Response', tally: 'essays' },
};

// Count each resource type within a focus area, plus a total.
export function getAreaTally(area) {
  const counts = { total: 0 };
  typeOrder.forEach((type) => {
    counts[type] = 0;
  });
  getEconomicsAreaResources(area).forEach((resource) => {
    counts[resource.type] = (counts[resource.type] || 0) + 1;
    counts.total += 1;
  });
  return counts;
}

// Focus areas grouped by year, in syllabus order.
export function getAreasByYear(year) {
  return economicsResourceLibrary.focusAreas.filter((area) => area.year === year);
}

// Ordered flat list, used for prev/next navigation between focus areas.
export const orderedAreas = economicsResourceLibrary.focusAreas;

export function findAreaById(areaId) {
  return economicsResourceLibrary.focusAreas.find((area) => area.id === areaId) || null;
}
