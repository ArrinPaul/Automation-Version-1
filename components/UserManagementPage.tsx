
import React, { useState } from 'react';
import { FinancialState, User, UserRole } from '../types';

interface UserManagementPageProps {
  state: FinancialState;
  onResetPassword: (user: User) => void;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ state, onResetPassword }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'society' | 'admin'>('all');

  const filtered = state.users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' 
      ? true 
      : filterType === 'admin' 
        ? u.role === UserRole.ADMIN 
        : u.role === UserRole.OFFICE_BEARER;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: state.users.length,
    societies: state.users.filter(u => u.role === UserRole.OFFICE_BEARER).length,
    admins: state.users.filter(u => u.role === UserRole.ADMIN).length
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Branch Counselor Command Header */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200 border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Credential Control Center</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight">Access Management</h2>
            <p className="text-slate-400 text-sm mt-1">Branch Counselor Portal for 40+ Technical Society Credentials</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl text-center">
              <div className="text-2xl font-black">{stats.societies}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Societies</div>
            </div>
            <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl text-center">
              <div className="text-2xl font-black">{stats.admins}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admins</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Filters & Help */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Search & Filter</h4>
            <div className="space-y-4">
              <div className="relative">
                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text"
                  placeholder="ID, Name or Email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                {(['all', 'society', 'admin'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all capitalize ${
                      filterType === type ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {type} Access Keys
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Counselor Tip</h4>
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              Standard credentials follow the pattern: <br/>
              <code className="bg-blue-100 px-1 rounded font-bold">society_id@ieee.org</code>. 
              Only share specific Access Keys with authorized Office Bearers.
            </p>
          </div>
        </div>

        {/* Right: Credential Table */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-5">Full Name / Society</th>
                    <th className="px-6 py-5">Portal Email</th>
                    <th className="px-6 py-5">Access Level</th>
                    <th className="px-6 py-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-slate-400">
                        <i className="fa-solid fa-user-slash block text-3xl mb-3"></i>
                        No matching credentials found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${
                              user.role === UserRole.ADMIN ? 'bg-indigo-600 text-white' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {user.name.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-600 font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                            {user.email}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.role === UserRole.ADMIN ? (
                            <span className="text-indigo-600 font-black text-[10px] uppercase tracking-wider flex items-center">
                              <i className="fa-solid fa-shield-halved mr-1.5"></i> {user.email === 'admin@ieee.org' ? 'Counselor' : 'Executive'}
                            </span>
                          ) : (
                            <span className="text-blue-600 font-black text-[10px] uppercase tracking-wider flex items-center">
                              <i className="fa-solid fa-user-tie mr-1.5"></i> Office Bearer
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => onResetPassword(user)}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center mx-auto"
                          >
                            <i className="fa-solid fa-key mr-2 opacity-70"></i>
                            Override Key
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
