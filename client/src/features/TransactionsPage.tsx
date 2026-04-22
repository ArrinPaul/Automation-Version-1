import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  amount: string | number;
  society?: {
    shortName?: string;
  } | null;
}

const TransactionsPage: React.FC = () => {
  const { profile } = useAuth();
  const canViewTransactions = profile?.role === 'MANAGEMENT';

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await apiClient.get<Transaction[]>('/transactions');
      return res.data;
    },
    enabled: canViewTransactions,
  });

  if (!canViewTransactions) {
      return (
          <div className="p-8 technical-grid min-h-screen flex items-center justify-center">
              <Card className="bg-black/40 border-destructive/50 border-l-4 p-8 max-w-md">
                  <h1 className="text-destructive font-display text-xl uppercase mb-2">Access_Denied</h1>
                  <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                      Detailed transaction line items are restricted to <span className="text-white">MANAGEMENT</span> role only.
                      Your current balance is visible on the dashboard.
                  </p>
              </Card>
          </div>
      );
  }

  return (
    <div className="space-y-8 p-8 technical-grid min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-display uppercase tracking-tighter text-white">Financial_Ledger</h1>
        <p className="text-muted-foreground font-mono text-sm">SECURE TRANSACTION HISTORY // AUDIT LOG</p>
      </motion.div>

      <Card className="bg-black/40 border-white/10 rounded-none overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase text-accent">Timestamp</TableHead>
              <TableHead className="font-mono text-xs uppercase text-accent">Society</TableHead>
              <TableHead className="font-mono text-xs uppercase text-accent">Description</TableHead>
              <TableHead className="font-mono text-xs uppercase text-accent">Category</TableHead>
              <TableHead className="font-mono text-xs uppercase text-accent">Type</TableHead>
              <TableHead className="font-mono text-xs uppercase text-accent text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={6} className="text-center font-mono py-8 animate-pulse text-muted-foreground">FETCHING_DATA...</TableCell></TableRow>
            ) : transactions?.map((tx, i: number) => (
              <motion.tr
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="border-white/5 hover:bg-white/5 transition-colors group"
              >
                <TableCell className="font-mono text-[10px] text-muted-foreground">
                  {format(new Date(tx.date), 'yyyy-MM-dd HH:mm')}
                </TableCell>
                <TableCell className="font-mono text-xs text-white">
                  {tx.society?.shortName || 'BRANCH'}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground group-hover:text-white transition-colors">
                  {tx.description}
                </TableCell>
                <TableCell className="font-mono text-[10px]">
                   <Badge variant="outline" className="rounded-none border-white/20 text-muted-foreground">
                     {tx.category}
                   </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`rounded-none ${tx.type === 'INCOME' ? 'bg-accent text-accent-foreground' : 'bg-destructive text-white'}`}>
                    {tx.type}
                  </Badge>
                </TableCell>
                <TableCell className={`font-display text-right ${tx.type === 'INCOME' ? 'text-accent' : 'text-white'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{tx.amount}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default TransactionsPage;
