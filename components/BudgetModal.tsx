
import React, { useState, useEffect } from 'react';
import { Society } from '../types';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  society: Society | null;
  onUpdate: (id: string, newBudget: number) => void;
}

const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, society, onUpdate }) => {
  const [budget, setBudget] = useState<string>('');

  useEffect(() => {
    if (society) setBudget(society.budget.toString());
  }, [society]);

  if (!isOpen || !society) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budget);
    if (!isNaN(val) && val >= 0) {
      onUpdate(society.id, val);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Update Budget</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              {society.name} Allocation (₹)
            </label>
            <input 
              type="number"
              autoFocus
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-slate-500">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
