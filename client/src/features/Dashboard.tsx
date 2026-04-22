import React, { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, Gauge } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, subMonths, startOfMonth } from 'date-fns';
import { formatCompactCurrency, formatCurrency, MONTH_WINDOW, normalizeCollection, normalizeRecord } from './phase4Helpers';

globalThis.ResizeObserver ??= class ResizeObserverShim {
  observe() {
    return undefined;
  }

  unobserve() {
    return undefined;
  }

  disconnect() {
    return undefined;
  }
} as unknown as typeof ResizeObserver;

interface TransactionRecord {
  date: string;
  amount: string | number;
  type: 'INCOME' | 'EXPENSE';
}

interface SocietyRecord {
  id: string;
  name: string;
  shortName: string;
  budget?: string | number;
  balance?: string | number;
  logoUrl?: string | null;
  advisorSigUrl?: string | null;
}

interface AuditApiResponse {
  success?: boolean;
  data?: {
    analysis?: string;
    wordCount?: number;
  };
  audit?: string;
}

interface SocietyBalanceResponse {
  societyId: string;
  balance: string | number;
}

const buildMonthlySeries = (transactions: TransactionRecord[]) => {
  const months = Array.from({ length: MONTH_WINDOW }, (_, index) => {
    const monthDate = startOfMonth(subMonths(new Date(), MONTH_WINDOW - 1 - index));
    return {
      key: format(monthDate, 'yyyy-MM'),
      label: format(monthDate, 'MMM'),
      income: 0,
      expense: 0,
      flow: 0,
    };
  });

  const monthLookup = new Map(months.map((month) => [month.key, month] as const));

  transactions.forEach((transaction) => {
    const parsedDate = new Date(transaction.date);
    const monthKey = format(parsedDate, 'yyyy-MM');
    const month = monthLookup.get(monthKey);
    if (!month) return;

    const amount = Number.parseFloat(String(transaction.amount));
    if (!Number.isFinite(amount)) return;

    if (transaction.type === 'INCOME') {
      month.income += amount;
    } else {
      month.expense += amount;
    }
    month.flow = month.income - month.expense;
  });

  return months.map((month) => ({
    ...month,
    income: Number(month.income.toFixed(2)),
    expense: Number(month.expense.toFixed(2)),
    flow: Number(month.flow.toFixed(2)),
  }));
};

const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  const societyQuery = useQuery<SocietyRecord[]>({
    queryKey: ['dashboard-societies', profile?.role],
    queryFn: async () => {
      const response = await apiClient.get<unknown>('/societies');
      return normalizeCollection<SocietyRecord>(response.data);
    },
  });

  const societyBalanceQuery = useQuery<SocietyBalanceResponse | null>({
    queryKey: ['dashboard-society-balance', profile?.societyId],
    queryFn: async () => {
      if (!profile?.societyId || profile.role === 'MEMBER') {
        return null;
      }

      const response = await apiClient.get<unknown>(`/societies/${profile.societyId}/balance`);
      return normalizeRecord<SocietyBalanceResponse>(response.data);
    },
    enabled: Boolean(profile?.societyId && profile.role !== 'MEMBER' && profile.role !== 'MANAGEMENT'),
  });

  const transactionsQuery = useQuery<TransactionRecord[]>({
    queryKey: ['dashboard-transactions', profile?.role, profile?.societyId],
    queryFn: async () => {
      const response = await apiClient.get<unknown>('/transactions');
      return normalizeCollection<TransactionRecord>(response.data);
    },
    enabled: profile?.role === 'MANAGEMENT',
  });

  const societyList = societyQuery.data ?? [];
  const transactions = transactionsQuery.data ?? [];

  const auditQuery = useQuery<{ analysis: string; wordCount: number }>({
    queryKey: ['dashboard-financial-audit', profile?.role, profile?.societyId],
    queryFn: async () => {
      const response = await apiClient.get<AuditApiResponse>('/audit/financial-insights');
      const analysis = response.data.data?.analysis ?? response.data.audit ?? 'Financial analysis is currently unavailable.';
      const wordCount = response.data.data?.wordCount ?? analysis.trim().split(/\s+/).filter(Boolean).length;
      return {
        analysis,
        wordCount,
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  const scopedSociety = useMemo(() => {
    if (profile?.societyId) {
      return societyList.find((society) => society.id === profile.societyId) ?? societyList[0] ?? null;
    }

    return societyList[0] ?? null;
  }, [profile?.societyId, societyList]);

  const hasTransactionAccess = profile?.role === 'MANAGEMENT';
  const hasBalanceAccess = profile?.role === 'MANAGEMENT' || profile?.role === 'FACULTY_ADVISOR' || profile?.role === 'SOCIETY_OB';

  const currentBalance = useMemo(() => {
    if (profile?.role === 'MANAGEMENT') {
      return societyList.reduce((sum, society) => sum + Number.parseFloat(String(society.balance ?? 0)), 0);
    }

    if (societyBalanceQuery.data?.balance !== undefined) {
      return Number.parseFloat(String(societyBalanceQuery.data.balance));
    }

    return Number.parseFloat(String(profile?.society?.balance ?? scopedSociety?.balance ?? 0));
  }, [profile?.role, profile?.society?.balance, scopedSociety?.balance, societyBalanceQuery.data, societyList]);

  const currentBudget = useMemo(() => {
    if (profile?.role === 'MANAGEMENT') {
      return societyList.reduce((sum, society) => sum + Number.parseFloat(String(society.budget ?? 0)), 0);
    }

    return Number.parseFloat(String(scopedSociety?.budget ?? 0));
  }, [profile?.role, scopedSociety?.budget, societyList]);

  const transactionTotals = useMemo(() => {
    return transactions.reduce(
      (totals, transaction) => {
        const amount = Number.parseFloat(String(transaction.amount));
        if (!Number.isFinite(amount)) {
          return totals;
        }

        if (transaction.type === 'INCOME') {
          totals.income += amount;
        } else {
          totals.expense += amount;
        }

        return totals;
      },
      { income: 0, expense: 0 }
    );
  }, [transactions]);

  const utilization = useMemo(() => {
    if (currentBudget <= 0) {
      return 0;
    }

    const spentAmount = hasTransactionAccess ? transactionTotals.expense : Math.max(currentBudget - currentBalance, 0);
    return Number(((spentAmount / currentBudget) * 100).toFixed(1));
  }, [currentBalance, currentBudget, hasTransactionAccess, transactionTotals.expense]);

  const utilizationTone = utilization > 80 ? 'bg-red-500' : 'bg-[#C1FF00]';
  const monthlySeries = useMemo(() => buildMonthlySeries(transactions), [transactions]);

  const kpis = [
    { title: 'Total Balance', value: hasBalanceAccess ? formatCurrency(currentBalance) : 'Restricted', icon: Wallet, accent: 'text-white' },
    { title: 'Income', value: hasTransactionAccess ? formatCurrency(transactionTotals.income) : 'Restricted', icon: TrendingUp, accent: 'text-emerald-300' },
    { title: 'Expenditure', value: hasTransactionAccess ? formatCurrency(transactionTotals.expense) : 'Restricted', icon: TrendingDown, accent: 'text-red-300' },
    { title: 'Utilization %', value: hasBalanceAccess ? `${utilization.toFixed(1)}%` : 'Restricted', icon: Gauge, accent: utilization > 80 ? 'text-red-300' : 'text-[#C1FF00]' },
  ];

  let auditContent = (
    <div className="space-y-3 border border-white/10 bg-white/5 p-4">
      <p className="font-mono text-sm leading-relaxed text-white/90">{auditQuery.data?.analysis}</p>
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">
        WORD_COUNT: {auditQuery.data?.wordCount ?? 0}
      </p>
    </div>
  );

  if (auditQuery.isLoading) {
    auditContent = (
      <div className="border border-white/10 bg-white/5 p-4 font-mono text-xs text-muted-foreground">
        Generating institutional audit narrative using Gemini 1.5 Flash...
      </div>
    );
  } else if (auditQuery.isError) {
    auditContent = (
      <div className="border border-red-500/30 bg-red-500/10 p-4 font-mono text-xs text-red-200">
        AI audit insight could not be generated right now. Please retry.
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 technical-grid min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tighter text-white">Terminal_Dashboard</h1>
          <p className="text-muted-foreground font-mono text-sm">System Status: <span className="text-white">ONLINE</span> | Welcome, {profile?.name}</p>
        </div>
        <div className="text-right font-mono text-xs text-muted-foreground">
          {new Date().toISOString()}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-black/40 border-white/10 backdrop-blur-md rounded-none border-l-2 border-l-white/40 group hover:border-l-white transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-mono uppercase text-muted-foreground">{kpi.title}</CardTitle>
                <kpi.icon className={`h-4 w-4 ${kpi.accent}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-display text-white">{kpi.value}</div>
                {kpi.title === 'Utilization %' && hasBalanceAccess && (
                  <div className="mt-4 h-2 w-full overflow-hidden bg-white/10">
                    <div className={`h-full ${utilizationTone}`} style={{ width: `${Math.min(utilization, 100)}%` }} />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-black/40 border-white/10 rounded-none">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase text-white">Monthly_Flow_Analytics</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] border-t border-white/5 pt-4">
              {import.meta.env.MODE === 'test' ? (
              <div className="flex h-full items-center justify-center rounded-none border border-white/10 bg-white/5 text-center">
                <div>
                  <p className="font-display text-sm uppercase tracking-[0.25em] text-white">Chart_Render_Safe_Mode</p>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">Monthly flow data is ready for rendering.</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
                <AreaChart data={monthlySeries}>
                  <defs>
                    <linearGradient id="flowFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00629B" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#00629B" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 11 }} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 11 }} tickFormatter={(value) => formatCompactCurrency(value)} />
                  <Tooltip
                    contentStyle={{ background: '#0A0A0C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 0 }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="flow" stroke="#00629B" fill="url(#flowFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10 rounded-none">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase text-white">Operational_Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border border-white/5 bg-white/5 font-mono text-[10px] leading-relaxed">
              <p className="text-muted-foreground mb-2">&gt; SYNCHRONIZING DASHBOARD COUNTERS...</p>
              <p className="text-white">
                {hasTransactionAccess
                  ? 'Management view shows branch-wide inflow, outflow, balance, and utilization based on transaction records.'
                  : hasBalanceAccess
                    ? 'Society-scoped roles are limited to balance and utilization summaries while line-item income and expense stay restricted.'
                    : 'Member access excludes financial line items. Dashboard financial cards remain restricted by design.'}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-none border-white/10 bg-transparent text-[10px] uppercase tracking-[0.25em] text-white hover:bg-white/5"
              onClick={() => {
                void Promise.all([
                  societyQuery.refetch(),
                  societyBalanceQuery.refetch(),
                  transactionsQuery.refetch(),
                ]);
              }}
            >
              Refresh Financial View
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/40 border-white/10 rounded-none">
        <CardHeader className="border-b border-white/10">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-sm font-mono uppercase text-white">AI_Financial_Auditor_Gemini_1_5_Flash</CardTitle>
            <Button
              type="button"
              variant="outline"
              className="rounded-none border-white/10 bg-transparent text-[10px] uppercase tracking-[0.25em] text-white hover:bg-white/5"
              onClick={() => {
                void auditQuery.refetch();
              }}
            >
              Refresh Insight
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
            Target length: ~200 words • Generated from scoped balance and transactions
          </p>

          {auditContent}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
