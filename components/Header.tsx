
import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INSTITUTION_NAME, SCHOOL_NAME } from '../constants';

interface HeaderProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onChangePassword?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, activeTab, setActiveTab, onLogout, onChangePassword }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const activeItem = menuItems.find(item => item.id === activeTab) || menuItems[0];

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-2 sm:px-6 sticky top-0 z-50">
      <div className="flex items-center space-x-2 sm:space-x-6 min-w-0">
        
        {/* Global Navigation Dropdown */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-50 hover:bg-slate-100 px-1.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl border border-slate-200 transition-all active:scale-95"
          >
            <i className={`fa-solid ${activeItem.icon} text-blue-600 text-xs sm:text-base`}></i>
            <span className="font-bold text-slate-700 text-[11px] sm:text-sm hidden md:inline">{activeItem.label}</span>
            <i className={`fa-solid fa-chevron-down text-[8px] sm:text-[10px] text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                Main Portal
              </div>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 transition-colors ${
                    activeTab === item.id 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
                  <span className="font-bold text-sm">{item.label}</span>
                  {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>}
                </button>
              ))}

              <div className="my-2 border-t border-slate-100"></div>
              
              <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                Account Settings
              </div>
              <button 
                onClick={() => {
                  onChangePassword?.();
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <i className="fa-solid fa-shield-halved w-5 text-center"></i>
                <span className="font-bold text-sm">Change Password</span>
              </button>
              <button 
                onClick={() => {
                  onLogout();
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
              >
                <i className="fa-solid fa-right-from-bracket w-5 text-center"></i>
                <span className="font-bold text-sm">Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Branding (Fully Visible) */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-100 shrink-0">
            <i className="fa-solid fa-bolt text-white text-base sm:text-xl"></i>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center space-x-2">
               <span className="text-[10px] sm:text-lg font-bold text-slate-800 leading-none whitespace-nowrap">IEEE MANAGER</span>
            </div>
            <span className="text-[6px] xs:text-[7px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">
              {INSTITUTION_NAME}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1.5 sm:space-x-4 ml-1 shrink-0">
        <div className="flex flex-col items-end">
          <span className="text-[9px] sm:text-sm font-bold text-slate-900 leading-none mb-0.5 sm:mb-1 text-right line-clamp-1 max-w-[60px] xs:max-w-none">{user.name}</span>
          <span className="text-[7px] sm:text-[10px] font-black text-blue-600 uppercase tracking-wider">
            {user.role === UserRole.ADMIN ? (user.email === 'admin@ieee.org' ? 'Branch Counselor' : 'Executive Admin') : user.role.replace('_', ' ')}
          </span>
        </div>
        <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-200 shrink-0">
          <span className="text-blue-700 font-black text-xs sm:text-base">{user.name.charAt(0)}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
