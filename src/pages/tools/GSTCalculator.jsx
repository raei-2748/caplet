import { useState } from 'react';
import { Link } from 'react-router-dom';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(value);

const GSTCalculator = () => {
  const [amount, setAmount] = useState('');
  const [calculationType, setCalculationType] = useState('add'); // 'add' or 'remove'
  const [result, setResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(amount) || 0;

    if (amountNum <= 0) {
      setResult({ error: 'Please enter a valid amount.' });
      return;
    }

    const GST_RATE = 0.10; // 10% GST in Australia

    if (calculationType === 'add') {
      const gst = amountNum * GST_RATE;
      const total = amountNum + gst;
      setResult({
        originalAmount: amountNum,
        gst,
        total,
        type: 'add',
      });
    } else {
      const gst = amountNum * (GST_RATE / (1 + GST_RATE));
      const base = amountNum - gst;
      setResult({
        originalAmount: amountNum,
        gst,
        base,
        type: 'remove',
      });
    }
  };

  return (
    <div className="min-h-screen bg-surface-body py-32 selection:bg-accent selection:text-white">
      <div className="container-custom">
        <header className="mb-24 reveal-text">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <span className="section-kicker">Tools</span>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                GST Calculator
              </h1>
              <p className="text-base text-text-muted leading-relaxed max-w-xl">
                Add or remove 10% GST from any amount.
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
                  Amount (AUD)
                </label>
                <div className="relative border-b-2 border-line-soft focus-within:border-accent transition-colors">
                  <span className="absolute left-0 bottom-4 text-text-dim font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent pl-8 pr-4 py-4 text-2xl font-bold text-text-primary outline-none placeholder:text-text-dim/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-base font-semibold text-text-dim mb-8 block">
                  Calculation type
                </label>
                <div className="flex gap-12">
                  {[
                    { id: 'add', label: 'Add GST' },
                    { id: 'remove', label: 'Remove GST' }
                  ].map((type) => (
                    <label key={type.id} className="flex items-center gap-4 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${calculationType === type.id ? 'border-accent bg-accent' : 'border-line-soft group-hover:border-text-dim'}`}>
                        {calculationType === type.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <input
                        type="radio"
                        name="type"
                        value={type.id}
                        checked={calculationType === type.id}
                        onChange={(e) => setCalculationType(e.target.value)}
                        className="hidden"
                      />
                      <span className={`text-xs font-bold transition-colors ${calculationType === type.id ? 'text-text-primary' : 'text-text-dim group-hover:text-text-muted'}`}>
                        {type.label}
                      </span>
                    </label>
                  ))}
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
                  <div className="space-y-8">
                    <div>
                      <p className="text-sm font-medium text-text-dim mb-2">Amount entered</p>
                      <p className="text-2xl font-bold tracking-tight">{formatCurrency(result.originalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-dim mb-2">GST (10%)</p>
                      <p className="text-2xl font-bold tracking-tight">{formatCurrency(result.gst)}</p>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-line-soft">
                    <p className="text-sm font-bold text-accent mb-4">
                      {result.type === 'add' ? 'Total with GST' : 'Amount before GST'}
                    </p>
                    <p className="text-5xl font-black tracking-tighter text-text-primary">
                      {formatCurrency(result.type === 'add' ? result.total : result.base)}
                    </p>
                  </div>

                </div>
              )
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 relative z-10">
                <div className="w-12 h-12 border border-line-soft flex items-center justify-center text-xs font-bold font-serif italic mb-8">GST</div>
                <p className="text-sm font-medium">Enter an amount to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GSTCalculator;

