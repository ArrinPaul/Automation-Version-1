
import React, { useState } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Attempt to load current user list from localStorage to reflect password resets
    let userList = MOCK_USERS;
    const saved = localStorage.getItem('ieee_finance_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.users && parsed.users.length > 0) {
          // Merge logic: existing persisted users + new static users (Deans/Directors) if missing
          const persistedUsers = parsed.users;
          const existingIds = new Set(persistedUsers.map((u: any) => u.id));
          const missingStaticUsers = MOCK_USERS.filter(u => !existingIds.has(u.id));
          
          userList = [...persistedUsers, ...missingStaticUsers];
        }
      } catch (err) {}
    }

    const user = userList.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.password === password) {
      onLogin(user);
    } else if (user && user.password !== password) {
      setError('Incorrect password. Contact your CHRIST SBC Counselor for a reset.');
    } else {
      setError('Invalid email address.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-xl border-4 border-blue-500/30">
            <i className="fa-solid fa-bolt text-white text-4xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">IEEE MANAGER</h1>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-800/10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Office Email</label>
              <div className="relative group">
                <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="society_id@ieee.org"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Access Key</label>
              <div className="relative group">
                <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100 flex items-center">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
            >
              Sign In to Portal
            </button>
          </form>
        </div>
        
        <p className="text-center text-slate-500 text-xs mt-10 font-bold uppercase tracking-widest">
          &copy; {new Date().getFullYear()} IEEE Student Branch Finance Committee &bull; v2.4.0
        </p>
      </div>
    </div>
  );
};

export default Login;
