import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, Search, Trash2, CheckCircle, XCircle, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { normalizeCollection, formatCurrency } from './phase4Helpers';
import axios from 'axios';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  amount: string | number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  society?: { id?: string; shortName?: string; name?: string } | null;
  createdBy?: { name?: string } | null;
}

interface SocietyOption { id: string; name: string; shortName: string; }

const txSchema = z.object({
  amount: z.string().min(1, 'Required').refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Must be positive'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Required').max(100),
  description: z.string().min(1, 'Required').max(500),
  date: z.string().min(1, 'Required'),
  societyId: z.string().uuid('Select a society'),
  receiptUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});
type TxFormValues = z.infer<typeof txSchema>;

const CATEGORIES = ['Registration', 'Equipment', 'Venue', 'Catering', 'Travel', 'Sponsorship', 'Membership', 'Awards', 'Marketing', 'Miscellaneous'];

const TransactionsPage: React.FC = () => {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const canView = profile?.role === 'SB_FACULTY' || profile?.role === 'SB_OB';

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await apiClient.get<unknown>('/transactions');
      return normalizeCollection<Transaction>(res.data);
    },
    enabled: canView,
  });

  const { data: societies = [] } = useQuery<SocietyOption[]>({
    queryKey: ['societies-for-tx'],
    queryFn: async () => {
      const res = await apiClient.get<unknown>('/societies');
      return normalizeCollection<SocietyOption>(res.data);
    },
    enabled: canView,
  });

  const form = useForm<TxFormValues>({
    resolver: zodResolver(txSchema),
    defaultValues: { type: 'EXPENSE', date: new Date().toISOString().slice(0, 10) },
  });

  const createMutation = useMutation({
    mutationFn: (data: TxFormValues) => apiClient.post('/transactions', {
      ...data,
      amount: parseFloat(data.amount),
      date: new Date(data.date).toISOString(),
    }),
    onSuccess: () => {
      toast.success('Transaction recorded.');
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard-transactions'] });
      setShowCreate(false);
      form.reset();
    },
    onError: (err) => {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message ?? err.message) : 'Failed to create transaction';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/transactions/${id}`),
    onSuccess: () => {
      toast.success('Transaction deleted.');
      qc.invalidateQueries({ queryKey: ['transactions'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete transaction.'),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/transactions/${id}/approve`),
    onSuccess: () => {
      toast.success('Transaction approved.');
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: () => toast.error('Failed to approve transaction.'),
  });

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const matchSearch = !search || tx.description.toLowerCase().includes(search.toLowerCase()) || tx.category.toLowerCase().includes(search.toLowerCase()) || (tx.society?.shortName ?? '').toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'ALL' || tx.type === typeFilter;
      const matchStatus = statusFilter === 'ALL' || tx.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [transactions, search, typeFilter, statusFilter]);

  const totals = useMemo(() => ({
    income: filtered.filter(t => t.type === 'INCOME').reduce((s, t) => s + parseFloat(String(t.amount)), 0),
    expense: filtered.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + parseFloat(String(t.amount)), 0),
  }), [filtered]);

  if (!canView) {
    return (
      <div className="p-8 technical-grid min-h-screen flex items-center justify-center">
        <Card className="bg-black/40 border-destructive/50 border-l-4 p-8 max-w-md rounded-none">
          <h1 className="text-destructive font-display text-xl uppercase mb-2">Access_Denied</h1>
          <p className="text-muted-foreground font-mono text-sm leading-relaxed">
            Transaction details are restricted to <span className="text-white">SB_FACULTY / SB_OB</span> only.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8 technical-grid min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tighter text-white">Financial_Ledger</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">SECURE TRANSACTION HISTORY // AUDIT LOG</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="rounded-none font-mono text-xs uppercase tracking-[0.25em]">
          <Plus className="w-4 h-4 mr-2" /> New Transaction
        </Button>
      </motion.div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Filtered Income', value: formatCurrency(totals.income), color: 'text-emerald-300' },
          { label: 'Filtered Expense', value: formatCurrency(totals.expense), color: 'text-red-300' },
          { label: 'Net Flow', value: formatCurrency(totals.income - totals.expense), color: 'text-white' },
        ].map(k => (
          <Card key={k.label} className="bg-black/40 border-white/10 rounded-none p-4">
            <p className="font-mono text-[10px] uppercase text-muted-foreground">{k.label}</p>
            <p className={`font-display text-xl mt-1 ${k.color}`}>{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search description, category, society..."
            className="w-full bg-white/5 border border-white/10 pl-8 pr-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>
        <div className="flex gap-0 border border-white/10">
          {(['ALL', 'INCOME', 'EXPENSE'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${typeFilter === t ? 'bg-white text-black' : 'text-muted-foreground hover:text-white'}`}>{t}</button>
          ))}
        </div>
        <div className="flex gap-0 border border-white/10">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${statusFilter === s ? 'bg-white text-black' : 'text-muted-foreground hover:text-white'}`}>{s}</button>
          ))}
        </div>
      </div>

      <Card className="bg-black/40 border-white/10 rounded-none overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="font-mono text-[10px] uppercase text-accent">Date</TableHead>
              <TableHead className="font-mono text-[10px] uppercase text-accent">Society</TableHead>
              <TableHead className="font-mono text-[10px] uppercase text-accent">Description</TableHead>
              <TableHead className="font-mono text-[10px] uppercase text-accent">Category</TableHead>
              <TableHead className="font-mono text-[10px] uppercase text-accent">Status</TableHead>
              <TableHead className="font-mono text-[10px] uppercase text-accent">Type</TableHead>
              <TableHead className="font-mono text-[10px] uppercase text-accent text-right">Amount</TableHead>
              <TableHead className="font-mono text-[10px] uppercase text-accent text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-white/5">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-white/5 animate-pulse rounded" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center font-mono py-12 text-muted-foreground">
                  {transactions.length === 0 ? 'No transactions yet. Create one to get started.' : 'No transactions match your filters.'}
                </TableCell>
              </TableRow>
            ) : filtered.map((tx, i) => (
              <motion.tr key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-white/5 hover:bg-white/5 transition-colors group">
                <TableCell className="font-mono text-[10px] text-muted-foreground">{format(new Date(tx.date), 'dd MMM yyyy')}</TableCell>
                <TableCell className="font-mono text-xs text-white">{tx.society?.shortName ?? 'BRANCH'}</TableCell>
                <TableCell className="text-xs text-muted-foreground group-hover:text-white transition-colors max-w-[200px] truncate">{tx.description}</TableCell>
                <TableCell><Badge variant="outline" className="rounded-none border-white/20 text-muted-foreground text-[10px]">{tx.category}</Badge></TableCell>
                <TableCell>
                  <Badge className={`rounded-none text-[10px] ${tx.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : tx.status === 'REJECTED' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                    {tx.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`rounded-none text-[10px] ${tx.type === 'INCOME' ? 'bg-accent text-accent-foreground' : 'bg-destructive/20 text-red-300 border border-destructive/30'}`}>{tx.type}</Badge>
                </TableCell>
                <TableCell className={`font-display text-right ${tx.type === 'INCOME' ? 'text-accent' : 'text-white'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {tx.status === 'PENDING' && (
                      <button onClick={() => approveMutation.mutate(tx.id)} className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors" title="Approve">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => setDeleteId(tx.id)} className="p-1 text-red-400 hover:text-red-300 transition-colors" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
        {filtered.length > 0 && (
          <div className="px-4 py-2 border-t border-white/5 font-mono text-[10px] text-muted-foreground">
            Showing {filtered.length} of {transactions.length} transactions
          </div>
        )}
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record_Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Amount (₹)</label>
                <input {...form.register('amount')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="0.00" />
                {form.formState.errors.amount && <p className="text-destructive text-[10px] font-mono">{form.formState.errors.amount.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Type</label>
                <select {...form.register('type')} className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary">
                  <option value="INCOME">INCOME</option>
                  <option value="EXPENSE">EXPENSE</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Category</label>
                <select {...form.register('category')} className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary">
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {form.formState.errors.category && <p className="text-destructive text-[10px] font-mono">{form.formState.errors.category.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-accent">Date</label>
                <input {...form.register('date')} type="date" className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" />
                {form.formState.errors.date && <p className="text-destructive text-[10px] font-mono">{form.formState.errors.date.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-accent">Society</label>
              <select {...form.register('societyId')} className="w-full bg-[#0A0A0C] border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary">
                <option value="">Select society</option>
                {societies.map(s => <option key={s.id} value={s.id}>{s.shortName} — {s.name}</option>)}
              </select>
              {form.formState.errors.societyId && <p className="text-destructive text-[10px] font-mono">{form.formState.errors.societyId.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-accent">Description</label>
              <textarea {...form.register('description')} rows={3} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary resize-none" placeholder="Transaction description..." />
              {form.formState.errors.description && <p className="text-destructive text-[10px] font-mono">{form.formState.errors.description.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-accent">Receipt URL (optional)</label>
              <input {...form.register('receiptUrl')} className="w-full bg-white/5 border border-white/10 p-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="https://..." />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 rounded-none" onClick={() => { setShowCreate(false); form.reset(); }}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending} className="flex-1 rounded-none">
                {createMutation.isPending ? 'Recording...' : 'Record Transaction'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirm_Delete</DialogTitle></DialogHeader>
          <p className="font-mono text-sm text-muted-foreground mb-6">This will permanently delete the transaction and reverse the balance impact. This cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-none" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1 rounded-none" disabled={deleteMutation.isPending} onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionsPage;
