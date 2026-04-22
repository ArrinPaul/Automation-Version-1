import React from 'react';

const FinancialReportsPage: React.FC = () => {
  return (
    <div className="p-8 technical-grid min-h-screen">
      <h1 className="text-4xl font-display uppercase tracking-tighter text-white">Financial_Reports</h1>
      <p className="mt-3 text-muted-foreground font-mono text-sm">
        Financial reporting route is active. CSV export and analytics cards will be integrated next.
      </p>
    </div>
  );
};

export default FinancialReportsPage;
