import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/services/apiClient';
import { formatCurrency, normalizeCollection } from './phase4Helpers';

interface TransactionRecord {
  id: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  amount: number | string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
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

const FinancialReportsPage: React.FC = () => {
  const transactionsQuery = useQuery<TransactionRecord[]>({
    queryKey: ['financial-reports-transactions'],
    queryFn: async () => {
      const response = await apiClient.get<unknown>('/transactions');
      return normalizeCollection<TransactionRecord>(response.data);
    },
  });

  const transactions = transactionsQuery.data ?? [];

  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter((transaction) => transaction.type === 'INCOME')
      .reduce((accumulator, transaction) => accumulator + toAmountNumber(transaction.amount), 0);

    const totalExpense = transactions
      .filter((transaction) => transaction.type === 'EXPENSE')
      .reduce((accumulator, transaction) => accumulator + toAmountNumber(transaction.amount), 0);

    return {
      totalIncome,
      totalExpense,
      netFlow: totalIncome - totalExpense,
      transactionCount: transactions.length,
    };
  }, [transactions]);

  const downloadFinancialCsv = async () => {
    try {
      const response = await apiClient.get('/reports/financial-csv', {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
      const downloadUrl = globalThis.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = `financial-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      globalThis.URL.revokeObjectURL(downloadUrl);

      toast.success('Financial CSV export downloaded.');
    } catch {
      toast.error('Unable to download financial CSV export.');
    }
  };

  return (
    <div className="space-y-8 p-8 technical-grid min-h-screen">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tighter text-white">Financial_Reports</h1>
          <p className="mt-3 text-muted-foreground font-mono text-sm">
            Confidential branch reporting with server-generated CSV exports.
          </p>
        </div>
        <Button
          type="button"
          className="rounded-none border border-white bg-white text-black text-[10px] uppercase tracking-[0.25em] hover:bg-white/90"
          onClick={() => {
            void downloadFinancialCsv();
          }}
        >
          <Download className="mr-2 h-3 w-3" /> Export Financial CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="brutalist-surface rounded-none">
          <CardHeader>
            <CardTitle className="text-xs font-mono uppercase text-white/70">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl text-white">{summary.transactionCount}</p>
          </CardContent>
        </Card>
        <Card className="brutalist-surface rounded-none">
          <CardHeader>
            <CardTitle className="text-xs font-mono uppercase text-white/70">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl text-emerald-300">{formatCurrency(summary.totalIncome)}</p>
          </CardContent>
        </Card>
        <Card className="brutalist-surface rounded-none">
          <CardHeader>
            <CardTitle className="text-xs font-mono uppercase text-white/70">Total Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl text-red-300">{formatCurrency(summary.totalExpense)}</p>
          </CardContent>
        </Card>
        <Card className="brutalist-surface rounded-none">
          <CardHeader>
            <CardTitle className="text-xs font-mono uppercase text-white/70">Net Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl text-white">{formatCurrency(summary.netFlow)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="brutalist-surface rounded-none">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="font-display text-sm uppercase tracking-[0.25em] text-white inline-flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" /> Latest Ledger Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="font-mono text-[10px] uppercase tracking-[0.2em]">Date</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-[0.2em]">Society</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-[0.2em]">Category</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-[0.2em]">Type</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-[0.2em] text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 10).map((transaction) => (
                <TableRow key={transaction.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-mono text-xs text-white/80">{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-mono text-xs text-white/80">{transaction.society?.shortName ?? transaction.society?.name ?? 'N/A'}</TableCell>
                  <TableCell className="font-mono text-xs text-white/80">{transaction.category}</TableCell>
                  <TableCell className="font-mono text-xs text-white/80">{transaction.type}</TableCell>
                  <TableCell className="font-mono text-xs text-right text-white">{formatCurrency(transaction.amount)}</TableCell>
                </TableRow>
              ))}
              {!transactions.length && !transactionsQuery.isLoading && (
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableCell colSpan={5} className="font-mono text-xs text-center text-muted-foreground">
                    No transactions available for preview.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReportsPage;
