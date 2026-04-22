import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency, normalizeCollection } from './phase4Helpers';

interface TransactionRecord {
  id: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  amount: string | number;
  society?: {
    shortName?: string;
    name?: string;
  };
}

const toAmountNumber = (value: string | number) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const QuarterlyStatementPage: React.FC = () => {
  const transactionsQuery = useQuery<TransactionRecord[]>({
    queryKey: ['quarterly-statement-transactions'],
    queryFn: async () => {
      const response = await apiClient.get<unknown>('/transactions');
      return normalizeCollection<TransactionRecord>(response.data);
    },
  });

  const transactions = transactionsQuery.data ?? [];

  const quarterlyWindow = useMemo(() => {
    const now = new Date();
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    const start = new Date(now.getFullYear(), quarterStartMonth, 1);
    const end = new Date(now.getFullYear(), quarterStartMonth + 3, 0);
    return { start, end };
  }, []);

  const quarterlyTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= quarterlyWindow.start && transactionDate <= quarterlyWindow.end;
    });
  }, [transactions, quarterlyWindow]);

  const summary = useMemo(() => {
    const income = quarterlyTransactions
      .filter((transaction) => transaction.type === 'INCOME')
      .reduce((accumulator, transaction) => accumulator + toAmountNumber(transaction.amount), 0);
    const expense = quarterlyTransactions
      .filter((transaction) => transaction.type === 'EXPENSE')
      .reduce((accumulator, transaction) => accumulator + toAmountNumber(transaction.amount), 0);

    return {
      income,
      expense,
      net: income - expense,
      entries: quarterlyTransactions.length,
    };
  }, [quarterlyTransactions]);

  return (
    <div className="space-y-8 p-8 technical-grid min-h-screen print-report-root">
      <div className="no-print flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tighter text-white">Quarterly_Statement</h1>
          <p className="mt-3 text-muted-foreground font-mono text-sm">
            Board-ready quarterly statement optimized for professional print output.
          </p>
        </div>
        <Button
          type="button"
          className="rounded-none border border-white bg-white text-black text-[10px] uppercase tracking-[0.25em] hover:bg-white/90"
          onClick={() => {
            globalThis.print();
          }}
        >
          <Printer className="mr-2 h-3 w-3" /> Print Statement
        </Button>
      </div>

      <section className="quarterly-print-sheet space-y-6 bg-white p-8 text-black">
        <header className="border-b border-black/20 pb-4">
          <h2 className="text-xl font-semibold">IEEE Student Branch Christ University</h2>
          <p className="mt-1 text-sm">Quarterly Board Financial Statement</p>
          <p className="mt-1 text-xs text-black/60">
            Period: {format(quarterlyWindow.start, 'dd MMM yyyy')} – {format(quarterlyWindow.end, 'dd MMM yyyy')}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="rounded-none border border-black/15 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-[0.2em] text-black/60">Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{summary.entries}</p>
            </CardContent>
          </Card>
          <Card className="rounded-none border border-black/15 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-[0.2em] text-black/60">Income</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-emerald-700">{formatCurrency(summary.income)}</p>
            </CardContent>
          </Card>
          <Card className="rounded-none border border-black/15 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-[0.2em] text-black/60">Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-rose-700">{formatCurrency(summary.expense)}</p>
            </CardContent>
          </Card>
          <Card className="rounded-none border border-black/15 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-[0.2em] text-black/60">Net</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatCurrency(summary.net)}</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-black/70">Ledger Detail</h3>
          <Table className="border border-black/15">
            <TableHeader>
              <TableRow className="border-black/15 hover:bg-transparent">
                <TableHead className="text-black/70">Date</TableHead>
                <TableHead className="text-black/70">Society</TableHead>
                <TableHead className="text-black/70">Type</TableHead>
                <TableHead className="text-black/70">Category</TableHead>
                <TableHead className="text-black/70 text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quarterlyTransactions.slice(0, 25).map((transaction) => (
                <TableRow key={transaction.id} className="border-black/10 hover:bg-black/5">
                  <TableCell>{format(new Date(transaction.date), 'dd MMM yyyy')}</TableCell>
                  <TableCell>{transaction.society?.shortName ?? transaction.society?.name ?? 'N/A'}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
                </TableRow>
              ))}
              {!quarterlyTransactions.length && !transactionsQuery.isLoading && (
                <TableRow className="border-black/10 hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center text-black/50">
                    No quarterly transactions available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
};

export default QuarterlyStatementPage;
