import React, { useState } from 'react';
import { FinancialState, TransactionType, UserRole, Society } from '../types';
import { IEEE_SOCIETIES, AFFINITY_GROUPS, IEEE_COUNCILS } from '../constants';

interface SocietiesPageProps {
  state: FinancialState;
  onEntry: (societyId: string, type: TransactionType) => void;
  onEditBudget: (soc: Society) => void;
  onManageTeam: (soc: Society) => void;
  onManageMembers: (soc: Society) => void;
  onResetPassword?: (socId: string) => void;
}

const SocietiesPage: React.FC<SocietiesPageProps> = ({ state, onEntry, onEditBudget, onManageTeam, onManageMembers, onResetPassword }) => {
  const [search, setSearch] = useState('');
  const isAdmin = state.currentUser?.role === UserRole.ADMIN;

  // Helper to check visibility permissions
  const isSocietyVisible = (socId: string) => {
    if (isAdmin) return true;
    return state.currentUser?.societyId === socId;
  };

  const filteredSocieties = state.societies.filter(s => 
    isSocietyVisible(s.id) &&
    IEEE_SOCIETIES.some(is => is.id === s.id) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || 
     s.shortName.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredAffinity = state.societies.filter(s => 
    isSocietyVisible(s.id) &&
    AFFINITY_GROUPS.some(ag => ag.id === s.id) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || 
     s.shortName.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredCouncils = state.societies.filter(s => 
    isSocietyVisible(s.id) &&
    IEEE_COUNCILS.some(ic => ic.id === s.id) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || 
     s.shortName.toLowerCase().includes(search.toLowerCase()))
  );

  const canEditEntry = (societyId: string) => {
    return isAdmin || state.currentUser?.societyId === societyId;
  };

  const renderCard = (soc: Society) => {
    const entryEditable = canEditEntry(soc.id);
    const percentLeft = soc.budget > 0 ? Math.round((soc.balance / soc.budget) * 100) : 0;
    
    return (
      <div key={soc.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
        <div className="p-5 flex-1">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 group-hover:bg-blue-600 transition-colors duration-300">
              {soc.logo ? (
                <img src={soc.logo} alt={soc.shortName} className="w-full h-full object-contain p-1 group-hover:invert transition-all" />
              ) : (
                <span className="text-blue-600 font-black text-xs group-hover:text-white transition-colors">
                  {soc.shortName.includes(' ') ? soc.shortName.split(' ').pop()?.charAt(0) : soc.shortName.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <a 
                href="https://www.ieee.org/communities-connection/societies-councils-and-communities/societies"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                title="IEEE Global Society Portal"
              >
                <i className="fa-solid fa-globe"></i>
              </a>
              <a 
                href="https://ieeebangalore.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-400 hover:text-orange-600 transition-colors"
                title="IEEE Bangalore Section"
              >
                <i className="fa-solid fa-map-location-dot"></i>
              </a>
              <button 
                onClick={() => onManageMembers(soc)}
                className="p-1.5 text-slate-400 hover:text-green-600 transition-colors"
                title="Manage Members"
              >
                <i className="fa-solid fa-address-book"></i>
              </button>
              <button 
                onClick={() => onManageTeam(soc)}
                className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                title="Manage Office Bearers"
              >
                <i className="fa-solid fa-user-group"></i>
              </button>
              {isAdmin && (
                <>
                  <button 
                    onClick={() => onResetPassword?.(soc.id)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors"
                    title="Reset Login Credentials"
                  >
                    <i className="fa-solid fa-key"></i>
                  </button>
                  <button 
                    onClick={() => onEditBudget(soc)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                    title="Edit Budget"
                  >
                    <i className="fa-solid fa-gear"></i>
                  </button>
                </>
              )}
              <div className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                percentLeft < 20 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
              }`}>
                {percentLeft}% Avail.
              </div>
            </div>
          </div>
          
          <h4 className="font-bold text-slate-900 leading-tight mb-3 line-clamp-2 h-10" title={soc.name}>
            {soc.name}
          </h4>

          <div className="space-y-2.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Initial Balance</span>
              <span className="font-medium">₹{soc.budget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Current Balance</span>
              <span className="font-black text-slate-900">₹{soc.balance.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${percentLeft < 20 ? 'bg-red-500' : 'bg-blue-600'}`}
                style={{ width: `${Math.min(100, Math.max(0, percentLeft))}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="px-3 py-3 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
          <button
            disabled={!entryEditable}
            onClick={() => onEntry(soc.id, TransactionType.INCOME)}
            className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              entryEditable ? 'text-green-700 bg-green-50 hover:bg-green-100' : 'text-slate-300 bg-slate-100 cursor-not-allowed opacity-50'
            }`}
          >
            <i className="fa-solid fa-circle-plus"></i>
            <span>Income</span>
          </button>
          <button
            disabled={!entryEditable}
            onClick={() => onEntry(soc.id, TransactionType.EXPENSE)}
            className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              entryEditable ? 'text-red-700 bg-red-50 hover:bg-red-100' : 'text-slate-300 bg-slate-100 cursor-not-allowed opacity-50'
            }`}
          >
            <i className="fa-solid fa-circle-minus"></i>
            <span>Expense</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">IEEE Units Management</h2>
          <p className="text-slate-500 text-sm">Managing Societies, Councils and Affinity Groups</p>
        </div>
        <div className="relative">
          <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text"
            placeholder="Search units..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl w-full md:w-80 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Affinity Groups Section */}
      {filteredAffinity.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-1.5 bg-blue-600 rounded-full"></div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Affinity Groups</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredAffinity.map(renderCard)}
          </div>
        </section>
      )}

      {/* Councils Section */}
      {filteredCouncils.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-1.5 bg-indigo-600 rounded-full"></div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">IEEE Councils</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCouncils.map(renderCard)}
          </div>
        </section>
      )}

      {/* Societies Section */}
      {filteredSocieties.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-1.5 bg-blue-600 rounded-full"></div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Technical Societies</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredSocieties.map(renderCard)}
          </div>
        </section>
      )}

      {filteredSocieties.length === 0 && filteredAffinity.length === 0 && filteredCouncils.length === 0 && (
        <div className="py-20 text-center text-slate-400">
          <i className="fa-solid fa-folder-open text-4xl mb-3"></i>
          <p>No matching units found.</p>
        </div>
      )}
    </div>
  );
};

export default SocietiesPage;