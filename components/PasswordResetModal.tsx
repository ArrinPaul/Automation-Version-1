import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onReset: (userId: string, newPassword: string) => void;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ isOpen, onClose, user, onReset }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    onReset(user.id, newPassword);
    onClose();
    alert(`Password for ${user.name} has been updated.`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Secure Access Reset</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <div className="text-[10px] font-black text-blue-600 uppercase mb-1 tracking-widest">Account Details</div>
            <div className="font-bold text-slate-900">{user.name}</div>
            <div className="text-xs text-slate-500 font-mono">{user.email}</div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Access Key</label>
            <div className="relative">
              <i className="fa-solid fa-key absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="password"
                required
                autoFocus
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confirm Access Key</label>
            <div className="relative">
              <i className="fa-solid fa-shield-check absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>
              {error}
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
            <button 
              type="submit" 
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
            >
              Update Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetModal;