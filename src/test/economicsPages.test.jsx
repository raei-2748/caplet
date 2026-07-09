import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import EconomicsHome from '../pages/economics/EconomicsHome';
import EconomicsFocusArea from '../pages/economics/EconomicsFocusArea';
import EconomicsExamPractice from '../pages/economics/EconomicsExamPractice';

const renderAt = (path, element, routePath) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={routePath} element={element} />
      </Routes>
    </MemoryRouter>,
  );

describe('Economics resource pages', () => {
  it('renders the hub with both year shelves and pathways', () => {
    renderAt('/library/economics', <EconomicsHome />, '/library/economics');

    expect(screen.getByRole('heading', { level: 1, name: /Economics\./i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Year 11' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Year 12' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Introduction to economics' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Economic issues in the Australian economy' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Exam practice' })).toHaveAttribute(
      'href',
      '/library/economics/exam-practice',
    );
  });

  it('renders a focus area and filters it down to stimulus sets', () => {
    renderAt(
      '/library/economics/year-11-introduction-to-economics',
      <EconomicsFocusArea />,
      '/library/economics/:areaId',
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Introduction to economics' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Stimulus Set/i }));

    expect(screen.getByRole('heading', { name: 'Scarcity and local resource allocation' })).toBeInTheDocument();
    expect(screen.getByText('Available budget')).toBeInTheDocument();
    expect(screen.getByText(/Show sample integrated response/i)).toBeInTheDocument();
    // Multiple choice items are filtered out once the stimulus tab is active.
    expect(screen.queryByText(/What is the opportunity cost\?/i)).not.toBeInTheDocument();
  });

  it('renders both exam practice packs', () => {
    render(
      <MemoryRouter>
        <EconomicsExamPractice />
      </MemoryRouter>,
    );

    expect(screen.getByText('HSC transition practice pack: Economics Stage 6 (2009)')).toBeInTheDocument();
    expect(screen.getByText('New syllabus readiness pack: Economics 11-12 (2025)')).toBeInTheDocument();
  });

  it('links every hub focus-area card to its own page', () => {
    renderAt('/library/economics', <EconomicsHome />, '/library/economics');

    const card = screen.getByRole('link', { name: /Introduction to economics/i });
    expect(card).toHaveAttribute('href', '/library/economics/year-11-introduction-to-economics');
    expect(within(card).getByText('Microeconomic foundations')).toBeInTheDocument();
  });
});
