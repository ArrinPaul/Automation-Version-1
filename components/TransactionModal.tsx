
import React, { useState, useEffect } from 'react';
import { FinancialState, Transaction, TransactionType, UserRole } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: FinancialState;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  editingTransaction: Transaction | null;
  prefill?: {
    societyId?: string;
    type?: TransactionType;
  };
}

const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, onClose, state, addTransaction, updateTransaction, editingTransaction, prefill 
}) => {
  const [formData, setFormData] = useState({
    societyId: '',
    amount: '',
    type: TransactionType.EXPENSE,
    category: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setFormData({
          societyId: editingTransaction.societyId,
          amount: editingTransaction.amount.toString(),
          type: editingTransaction.type,
          category: editingTransaction.category,
          description: editingTransaction.description
        });
      } else {
        const type = prefill?.type || TransactionType.EXPENSE;
        const defaultCategory = type === TransactionType.INCOME 
          ? INCOME_CATEGORIES[0] 
          : EXPENSE_CATEGORIES[0];

        setFormData({
          societyId: prefill?.societyId || state.currentUser?.societyId || state.societies[0].id,
          amount: '',
          type: type,
          category: defaultCategory,
          description: ''
        });
      }
    }
  }, [isOpen, prefill, state.currentUser, state.societies, editingTransaction]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.category) return;

    const data = {
      societyId: formData.societyId,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      description: formData.description,
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data);
    } else {
      addTransaction({
        ...data,
        date: new Date().toISOString(),
        approvedBy: state.currentUser?.name
      });
    }
    onClose();
  };

  const isAdmin = state.currentUser?.role === UserRole.ADMIN;
  const categories = formData.type === TransactionType.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">
            {editingTransaction ? 'Edit' : 'Record'} {formData.type === TransactionType.INCOME ? 'Income' : 'Expenditure'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Society</label>
            <select 
              disabled={!isAdmin}
              value={formData.societyId}
              onChange={(e) => setFormData({...formData, societyId: e.target.value})}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-500 font-medium"
            >
              {state.societies.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.shortName})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
              <input 
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0.00"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
            <input 
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="e.g. Workshop Registration Fees"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
            <button 
              type="submit"
              className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 ${
                formData.type === TransactionType.INCOME ? 'bg-green-600 hover:bg-green-700 shadow-green-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'
              }`}
            >
              {editingTransaction ? 'Update Entry' : 'Confirm Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
