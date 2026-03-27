
import React from 'react';
import { FinancialState, Transaction, TransactionType, UserRole } from '../types';

interface TransactionsPageProps {
  state: FinancialState;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({ state, onEdit, onDelete }) => {
  const filteredTransactions = state.currentUser?.societyId 
    ? state.transactions.filter(t => t.societyId === state.currentUser?.societyId)
    : state.transactions;

  const canAction = (societyId: string) => {
    return state.currentUser?.role === UserRole.ADMIN || state.currentUser?.societyId === societyId;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Financial Records</h2>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Society</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">No transactions recorded yet.</td>
                </tr>
              ) : (
                filteredTransactions.map(t => {
                  const soc = state.societies.find(s => s.id === t.societyId);
                  const editable = canAction(t.societyId);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4"><span className="font-medium text-slate-900">{soc?.shortName || t.societyId}</span></td>
                      <td className="px-6 py-4 text-slate-600">{t.description}</td>
                      <td className="px-6 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-medium uppercase">{t.category}</span></td>
                      <td className={`px-6 py-4 text-right font-bold ${t.type === TransactionType.EXPENSE ? 'text-red-600' : 'text-green-600'}`}>
                        {t.type === TransactionType.EXPENSE ? '-' : '+'}₹{t.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button 
                            disabled={!editable}
                            onClick={() => onEdit(t)}
                            className={`p-2 rounded-lg transition-colors ${editable ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-300'}`}
                            title="Edit Transaction"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button 
                            disabled={!editable}
                            onClick={() => onDelete(t.id)}
                            className={`p-2 rounded-lg transition-colors ${editable ? 'text-red-600 hover:bg-red-50' : 'text-slate-300'}`}
                            title="Delete Transaction"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
