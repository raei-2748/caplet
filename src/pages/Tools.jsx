import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  BanknotesIcon,
  CalculatorIcon,
  ChartPieIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Badge, Button, Card, EmptyState, Input, PageHeader, PageShell, SectionHeader } from '../components/ui';

const tools = [
  {
    title: 'Income Tax Calculator',
    description: 'Estimate your annual Australian income tax, Medicare levy, and net pay.',
    path: '/tools/tax-calculator',
    category: 'Tax',
    level: 'Start here',
  },
  {
    title: 'Budget Planner',
    description: 'Plan your monthly budget and track spending across different categories.',
    path: '/tools/budget-planner',
    category: 'Budgeting',
    level: 'Beginner',
  },
  {
    title: 'Savings Goal Calculator',
    description: 'Calculate how long it will take to reach your savings goal with contributions and interest.',
    path: '/tools/savings-goal',
    category: 'Saving',
    level: 'Beginner',
  },
  {
    title: 'Loan Repayment Calculator',
    description: 'Calculate monthly loan repayments, total interest, and total amount payable.',
    path: '/tools/loan-repayment',
    category: 'Borrowing',
    level: 'Guided',
  },
  {
    title: 'Compound Interest Calculator',
    description: 'See how your money grows with compound interest and regular contributions.',
    path: '/tools/compound-interest',
    category: 'Investing basics',
    level: 'Guided',
  },
  {
    title: 'Mortgage Calculator',
    description: 'Calculate home loan repayments, total interest, and explore different payment frequencies.',
    path: '/tools/mortgage',
    category: 'Home loans',
    level: 'Guided',
  },
  {
    title: 'Super Contribution Calculator',
    description: 'Project your superannuation balance with employer and personal contributions.',
    path: '/tools/super-contribution',
    category: 'Super',
    level: 'Planning',
  },
  {
    title: 'GST Calculator',
    description: 'Add or remove GST (10%) from amounts for Australian Goods and Services Tax calculations.',
    path: '/tools/gst',
    category: 'Tax',
    level: 'Quick check',
  },
  {
    title: 'Salary Calculator',
    description: 'Calculate your take-home pay from gross salary, including tax, Medicare, and superannuation.',
    path: '/tools/salary',
    category: 'Income',
    level: 'Start here',
  },
  {
    title: 'Emergency Fund Calculator',
    description: 'Calculate how much you should have in your emergency fund to cover unexpected expenses.',
    path: '/tools/emergency-fund',
    category: 'Safety net',
    level: 'Beginner',
  },
];

const highlights = [
  { label: 'Australian context', icon: BanknotesIcon },
  { label: 'Plain-language steps', icon: SparklesIcon },
  { label: 'Free to explore', icon: ShieldCheckIcon },
];

const categoryIcons = {
  Budgeting: ChartPieIcon,
  Borrowing: BanknotesIcon,
  'Home loans': HomeIcon,
  default: CalculatorIcon,
};

const Tools = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return tools;

    return tools.filter((tool) => (
      tool.title.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query)
    ));
  }, [searchQuery]);

  return (
    <PageShell className="overflow-hidden" spacing="lg">
      <PageHeader
        eyebrow="Financial calculators"
        title="Choose a money tool, then learn by doing."
        actions={(
          <Button as={Link} to="/courses" variant="secondary">
            Browse lessons
          </Button>
        )}
      >
        Beginner-friendly calculators for tax, budgeting, loans, super, saving goals, and everyday Australian money decisions.
      </PageHeader>

      <section className="mb-14 grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.label} className="flex items-center gap-4" padding="md" variant="soft">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <item.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-bold tracking-tight text-text-primary">{item.label}</span>
          </Card>
        ))}
      </section>

      <section className="mb-10 rounded-3xl border border-line-soft bg-surface-raised p-5 shadow-minimal md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <SectionHeader eyebrow="Find a calculator" title="What are you working out today?" className="mb-0">
              Search by topic, category, or the decision you are trying to make.
            </SectionHeader>
          </div>
          <div className="w-full md:max-w-md">
            <Input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search tax, budget, mortgage…"
              label="Search calculators"
              leading={<MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />}
              trailing={searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-semibold text-text-dim transition-colors hover:text-accent"
                >
                  Clear
                </button>
              ) : null}
            />
          </div>
        </div>
      </section>

      {filteredTools.length > 0 ? (
        <section aria-label="Calculator catalogue" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTools.map((tool) => {
            const Icon = categoryIcons[tool.category] || categoryIcons.default;
            return (
              <Card
                key={tool.path}
                as={Link}
                to={tool.path}
                interactive
                className="group flex min-h-[300px] flex-col overflow-hidden"
                padding="lg"
              >
                <div className="mb-8 flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <Badge variant="accent">{tool.level}</Badge>
                </div>
                <div className="flex-1">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-text-dim">{tool.category}</p>
                  <h3 className="text-2xl font-bold tracking-tight text-text-primary transition-colors group-hover:text-accent">
                    {tool.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-text-muted">{tool.description}</p>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-accent">
                  Open calculator
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Card>
            );
          })}
        </section>
      ) : (
        <EmptyState icon={CalculatorIcon} title="No calculators found" className="reveal-text">
          Try a broader term such as “tax”, “saving”, “loan”, or “budget”.
        </EmptyState>
      )}
    </PageShell>
  );
};

export default Tools;
