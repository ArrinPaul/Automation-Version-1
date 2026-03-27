import React, { useState, useMemo, useEffect } from 'react';
import { FinancialState, TransactionType, UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { getFinancialInsights } from '../services/geminiService';

interface DashboardProps {
  state: FinancialState;
  onQuickEntry: () => void;
}

const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

const Dashboard: React.FC<DashboardProps> = ({ state, onQuickEntry }) => {
  const isSocietyView = state.currentUser?.role === UserRole.OFFICE_BEARER;
  const targetSocId = state.currentUser?.societyId;
  const targetSociety = state.societies.find(s => s.id === targetSocId);
  
  const [selectedMonthlySocId, setSelectedMonthlySocId] = useState<string>(targetSocId || 'sb');
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Fetch AI Insights on mount or when transactions change significantly
  const fetchInsights = async () => {
    setIsAiLoading(true);
    try {
      const result = await getFinancialInsights(state, isSocietyView ? targetSocId : undefined);
      setAiInsights(result);
    } catch (err) {
      setAiInsights("AI Auditor is currently unavailable. Please check your network connection.");
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [state.transactions.length]); // Re-fetch if a new transaction is added

  // Calculations for current view
  const displaySocieties = isSocietyView && targetSociety ? [targetSociety] : state.societies;
  const displayTransactions = isSocietyView 
    ? state.transactions.filter(t => t.societyId === targetSocId)
    : state.transactions;

  const totalBalance = displaySocieties.reduce((acc, s) => acc + s.balance, 0);
  const totalAllocated = displaySocieties.reduce((acc, s) => acc + s.budget, 0);
  
  const totalIncome = displayTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpenditure = displayTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => acc + t.amount, 0);

  // Global specific data
  const topSocietiesData = useMemo(() => {
    if (isSocietyView) return [];
    return state.societies
      .sort((a, b) => b.budget - a.budget)
      .slice(0, 10) 
      .map(s => ({
        name: s.shortName,
        budget: s.budget,
        balance: s.balance
      }));
  }, [state.societies, isSocietyView]);

  // Society specific data
  const categoryData = useMemo(() => {
    if (!isSocietyView) return [];
    const expenses = displayTransactions.filter(t => t.type === TransactionType.EXPENSE);
    const cats: Record<string, number> = {};
    expenses.forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.keys(cats).map(name => ({ name, value: cats[name] }));
  }, [displayTransactions, isSocietyView]);

  const monthlyFlowData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const activeSocId = isSocietyView ? targetSocId : selectedMonthlySocId;
    
    const soc = state.societies.find(s => s.id === activeSocId);
    let runningBalance = soc?.budget || 0;

    return months.map((month, index) => {
      const socTx = state.transactions.filter(t => {
        const d = new Date(t.date);
        return t.societyId === activeSocId && 
               d.getMonth() === index && 
               d.getFullYear() === currentYear;
      });

      const income = socTx.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
      const expense = socTx.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);

      runningBalance = runningBalance + income - expense;

      return {
        name: month,
        income,
        expense,
        balance: runningBalance
      };
    });
  }, [state.transactions, state.societies, selectedMonthlySocId, isSocietyView, targetSocId]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isSocietyView ? `${targetSociety?.shortName} Dashboard` : 'Financial Snapshot'}
          </h2>
          {isSocietyView && <p className="text-slate-500 text-sm">{targetSociety?.name}</p>}
        </div>
        <button 
          onClick={onQuickEntry}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center"
        >
          <i className="fa-solid fa-plus-circle mr-2"></i>
          New Entry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            {isSocietyView ? 'Available Funds' : 'Total Balance'}
          </div>
          <div className="text-2xl font-black text-slate-900">₹{totalBalance.toLocaleString()}</div>
          <div className="mt-2 text-xs text-blue-600 font-medium">Net liquidity</div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Income</div>
          <div className="text-2xl font-black text-green-600">₹{totalIncome.toLocaleString()}</div>
          <div className="mt-2 text-xs text-green-500 font-medium flex items-center">
            <i className="fa-solid fa-arrow-trend-up mr-1"></i>
            Revenue & Grants
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Expenditure</div>
          <div className="text-2xl font-black text-red-600">₹{totalExpenditure.toLocaleString()}</div>
          <div className="mt-2 text-xs text-red-500 font-medium flex items-center">
            <i className="fa-solid fa-arrow-trend-down mr-1"></i>
            Activity costs
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Utilization</div>
          <div className="text-2xl font-black text-slate-900">
            {totalAllocated > 0 ? Math.round(((totalAllocated - totalBalance) / totalAllocated) * 100) : 0}%
          </div>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-1000" 
              style={{ width: `${totalAllocated > 0 ? ((totalAllocated - totalBalance) / totalAllocated) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* AI Financial Review Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center shrink-0 border border-blue-100">
            {isAiLoading ? (
              <div className="relative">
                <i className="fa-solid fa-robot text-blue-600 text-2xl animate-bounce"></i>
                <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full"></div>
              </div>
            ) : (
              <i className="fa-solid fa-wand-magic-sparkles text-blue-600 text-2xl"></i>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  AI Financial Audit & Strategic Insights
                  <span className="ml-3 px-2 py-0.5 bg-green-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">Online</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Real-time analysis powered by Gemini 3 Flash</p>
              </div>
              <button 
                onClick={fetchInsights}
                disabled={isAiLoading}
                className={`text-xs font-bold flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all ${
                  isAiLoading ? 'bg-slate-200 text-slate-400' : 'bg-white text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 shadow-sm active:scale-95'
                }`}
              >
                <i className={`fa-solid fa-arrows-rotate ${isAiLoading ? 'fa-spin' : ''}`}></i>
                <span>Refresh Audit</span>
              </button>
            </div>

            <div className="bg-white/60 rounded-2xl p-5 border border-white/80 min-h-[100px] relative">
              {isAiLoading ? (
                <div className="space-y-3">
                  <div className="h-3 bg-slate-200 rounded-full w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-slate-200 rounded-full w-full animate-pulse"></div>
                  <div className="h-3 bg-slate-200 rounded-full w-5/6 animate-pulse"></div>
                </div>
              ) : (
                <div className="text-slate-700 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                  {aiInsights || "Recording first transaction to generate strategic AI audit report..."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isSocietyView ? (
        <div className="w-full">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
            <h3 className="text-lg font-bold mb-6 text-slate-800 flex justify-between items-center">
              <span>Balance Allocation Status</span>
              <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase tracking-widest">Top 10 by Initial Balance</span>
            </h3>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={topSocietiesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" height={36}/>
                <Bar dataKey="budget" name="Initial Balance" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="balance" name="Current Balance" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
            <h3 className="text-lg font-bold mb-6 text-slate-800">Expense Category Breakdown</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">No expenses recorded yet.</div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
            <h3 className="text-lg font-bold mb-6 text-slate-800">Income vs Expenditure Ratio</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={[{ name: 'Society Flow', income: totalIncome, expense: totalExpenditure }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="income" name="Income" fill="#22c55e" radius={[10, 10, 0, 0]} barSize={50} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[10, 10, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Monthly Financial Flow</h3>
            <p className="text-xs text-slate-500">Transaction and balance trends for the current calendar year</p>
          </div>
          {!isSocietyView && (
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">View Society:</label>
              <select 
                value={selectedMonthlySocId}
                onChange={(e) => setSelectedMonthlySocId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              >
                {state.societies.map(s => (
                  <option key={s.id} value={s.id}>{s.shortName} - {s.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyFlowData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Area 
                type="monotone" 
                dataKey="balance" 
                name="Balance" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorBalance)" 
                strokeWidth={3}
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                name="Income" 
                stroke="#22c55e" 
                fillOpacity={1} 
                fill="url(#colorIncome)" 
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                name="Expense" 
                stroke="#ef4444" 
                fillOpacity={1} 
                fill="url(#colorExpense)" 
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;