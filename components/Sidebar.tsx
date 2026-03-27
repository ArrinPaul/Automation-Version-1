
import React from 'react';
import { User, UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'societies', label: 'Societies', icon: 'fa-users' },
    { id: 'calendar', label: 'Activity Calendar', icon: 'fa-calendar-days' },
    { id: 'announcements', label: 'Announcements', icon: 'fa-bullhorn' },
    { id: 'transactions', label: 'Transactions', icon: 'fa-receipt' },
    { id: 'events', label: 'Event Reports', icon: 'fa-calendar-check' },
    { id: 'projects', label: 'IEEE Projects', icon: 'fa-diagram-project' },
    { id: 'reports', label: 'Reports', icon: 'fa-file-lines' },
    { id: 'repository', label: 'Repository', icon: 'fa-images' },
    { id: 'sync', label: 'Cloud Sync', icon: 'fa-cloud-arrow-up' },
  ];

  if (user?.role === UserRole.ADMIN) {
    menuItems.push({ id: 'users', label: 'User Access', icon: 'fa-user-lock' });
  }

  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-1">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-bolt text-white text-lg"></i>
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight block leading-none">IEEE MANAGER</span>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">v2.4.0 Pro</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          User Settings
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <i className="fa-solid fa-right-from-bracket w-5"></i>
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
