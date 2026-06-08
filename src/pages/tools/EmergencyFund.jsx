import { useState } from 'react';
import { Link } from 'react-router-dom';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(value);

const EmergencyFund = () => {
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [monthsCoverage, setMonthsCoverage] = useState('6');
  const [currentSavings, setCurrentSavings] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const expenses = parseFloat(monthlyExpenses) || 0;
    const months = parseFloat(monthsCoverage) || 6;
    const current = parseFloat(currentSavings) || 0;

    if (expenses <= 0) {
      setResult({ error: 'Please enter valid monthly expenses.' });
      return;
    }

    const recommended = expenses * months;
    const shortfall = Math.max(0, recommended - current);
    const percentage = current > 0 ? (current / recommended) * 100 : 0;

    setResult({
      recommended,
      current,
      shortfall,
      percentage,
      months,
      monthlyExpenses: expenses,
    });
  };

  return (
    <div className="min-h-screen bg-surface-body py-32 selection:bg-accent selection:text-white">
      <div className="container-custom">
        <header className="mb-24 reveal-text">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <span className="section-kicker">Tools</span>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Emergency Fund
              </h1>
              <p className="text-base text-text-muted leading-relaxed max-w-xl">
                Find out how much you need saved for unexpected expenses or job loss.
              </p>
            </div>
            <Link to="/tools" className="btn-secondary text-sm px-8">
              &larr; Back to tools
            </Link>
          </div>
          <div className="h-px w-full bg-line-soft" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-line-soft border border-line-soft reveal-text stagger-1">
          <div className="lg:col-span-7 bg-surface-body p-12 lg:p-20">
            <h2 className="text-base font-semibold text-text-muted mb-16">Your details</h2>
            <form onSubmit={handleSubmit} className="space-y-16">
              <div>
                <label className="text-base font-semibold text-text-dim mb-4 block">
                  Monthly expenses (AUD)
                </label>
                <div className="relative border-b-2 border-line-soft focus-within:border-accent transition-colors">
                  <span className="absolute left-0 bottom-4 text-text-dim font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent pl-8 pr-4 py-4 text-2xl font-bold text-text-primary outline-none placeholder:text-text-dim/20"
                  />
                </div>
                <p className="text-sm font-medium text-text-dim mt-4">
                  Include rent, food, bills, and other essentials.
                </p>
              </div>

              <div>
                <label className="text-base font-semibold text-text-dim mb-4 block">
                  Months of coverage
                </label>
                <select
                  value={monthsCoverage}
                  onChange={(e) => setMonthsCoverage(e.target.value)}
                  className="w-full bg-surface-raised border border-line-soft px-6 py-4 text-xs font-bold outline-none focus:border-accent appearance-none cursor-pointer"
                >
                  <option value="3">3 Months (Standard)</option>
                  <option value="6">6 Months (Recommended)</option>
                  <option value="9">9 Months (Conservative)</option>
                  <option value="12">12 Months (Maximum)</option>
                </select>
              </div>

              <div>
                <label className="text-base font-semibold text-text-dim mb-4 block">
                  Current savings
                </label>
                <div className="relative border-b border-line-soft focus-within:border-accent transition-colors">
                  <span className="absolute left-0 bottom-2 text-text-dim font-bold text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(e.target.value)}
                    placeholder="0"
                    className="w-full bg-transparent pl-6 pr-4 py-2 text-lg font-bold text-text-primary outline-none placeholder:text-text-dim/20"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-6 text-sm mt-8">
                Calculate
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 bg-surface-raised p-12 lg:p-20 flex flex-col min-h-full relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] grid-technical !bg-[size:30px_30px] pointer-events-none" />
            <h2 className="text-base font-semibold text-text-muted mb-16 relative z-10">Results</h2>

            {result ? (
              result.error ? (
                <p className="text-sm font-medium text-accent relative z-10">{result.error}</p>
              ) : (
                <div className="space-y-12 relative z-10">
                  <div>
                    <p className="text-sm font-medium text-text-dim mb-4">Target amount</p>
                    <p className="text-5xl font-black tracking-tighter text-text-primary">
                      {formatCurrency(result.recommended)}
                    </p>
                    <p className="text-xs font-bold text-text-dim mt-4">
                      Covers {result.months} months at {formatCurrency(result.monthlyExpenses)}
                    </p>
                  </div>

                  {result.current > 0 && (
                    <div className="pt-10 border-t border-line-soft space-y-10">
                      <div>
                        <p className="text-sm font-medium text-text-dim mb-4">Current savings</p>
                        <div className="flex items-end justify-between mb-3">
                          <p className="text-2xl font-bold">{formatCurrency(result.current)}</p>
                          <p className="text-xs font-bold text-accent">{result.percentage.toFixed(1)}%</p>
                        </div>
                        <div className="w-full bg-surface-soft h-1.5 overflow-hidden">
                          <div
                            className="bg-accent h-full transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min(100, result.percentage)}%` }}
                          />
                        </div>
                      </div>

                      {result.shortfall > 0 ? (
                        <div>
                          <p className="text-sm font-medium text-text-dim mb-2">Amount still needed</p>
                          <p className="text-xl font-bold text-text-primary">{formatCurrency(result.shortfall)}</p>
                        </div>
                      ) : (
                        <div className="p-8 bg-accent/5 border border-accent/20">
                          <p className="text-sm font-black text-accent">
                            ✓ Target reached
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-12 border-t border-line-soft space-y-6">
                    {[
                      'Keep it in a high-interest savings account',
                      'Only count essential expenses',
                      'Review when your expenses change'
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-center gap-4 text-xs font-medium text-text-dim">
                        <div className="w-1 h-1 bg-accent" />
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 relative z-10">
                <div className="w-12 h-12 border border-line-soft flex items-center justify-center text-4xl font-serif italic mb-8">!</div>
                <p className="text-sm font-medium">Enter your details to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyFund;

