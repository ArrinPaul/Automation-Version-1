import React, { useState } from 'react';
import { FinancialState, CalendarEvent, UserRole } from '../types';
import { CALENDAR_STATUSES } from '../constants';

interface CalendarPageProps {
  state: FinancialState;
  onAddEvent: (date?: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ state, onAddEvent, onEditEvent, onDeleteEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterSocietyId, setFilterSocietyId] = useState<string>('all');

  const isAdmin = state.currentUser?.role === UserRole.ADMIN;
  
  // Navigation
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Grid Generation helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return days;
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  // Filtering
  const getFilteredEvents = () => {
    let events = state.calendarEvents;
    
    // Role based filtering
    if (!isAdmin) {
      events = events.filter(e => e.societyId === state.currentUser?.societyId);
    } else if (filterSocietyId !== 'all') {
      events = events.filter(e => e.societyId === filterSocietyId);
    }

    return events;
  };

  const events = getFilteredEvents();
  const daysInMonth = getDaysInMonth(currentDate);
  const startDay = getFirstDayOfMonth(currentDate);
  const totalSlots = Math.ceil((daysInMonth + startDay) / 7) * 7;
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const renderEventBadge = (evt: CalendarEvent) => {
    const statusColor = CALENDAR_STATUSES.find(s => s.value === evt.status)?.color || 'bg-slate-100 text-slate-700';
    const soc = state.societies.find(s => s.id === evt.societyId);
    
    return (
      <button 
        key={evt.id}
        onClick={(e) => { e.stopPropagation(); onEditEvent(evt); }}
        className={`w-full text-left mb-1 p-1.5 rounded-lg text-[10px] font-bold border-l-2 transition-all hover:brightness-95 group ${statusColor.replace('bg-', 'border-').replace('text-', 'bg-').replace('100', '50')}`}
      >
        <div className="flex justify-between items-center">
           <span className="truncate">{evt.time} {evt.title}</span>
           {isAdmin && (
              <span className="text-[8px] uppercase tracking-wider opacity-60 ml-1">{soc?.shortName}</span>
           )}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6 pb-12 h-full flex flex-col">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Activity Calendar</h2>
          <p className="text-slate-500 text-sm">Schedule and track events across all technical societies.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
           {isAdmin && (
             <select 
               value={filterSocietyId}
               onChange={(e) => setFilterSocietyId(e.target.value)}
               className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
             >
               <option value="all">All Societies</option>
               {state.societies.map(s => (
                 <option key={s.id} value={s.id}>{s.shortName}</option>
               ))}
             </select>
           )}
           <button 
             onClick={() => onAddEvent()}
             className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center text-xs"
           >
             <i className="fa-solid fa-plus mr-2"></i>
             Schedule Activity
           </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Calendar Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             <h3 className="text-2xl font-black text-slate-800">
               {monthNames[currentDate.getMonth()]} <span className="text-slate-400 font-medium">{currentDate.getFullYear()}</span>
             </h3>
             <div className="flex items-center space-x-1 bg-slate-50 rounded-lg p-1 border border-slate-200">
               <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-500">
                 <i className="fa-solid fa-chevron-left"></i>
               </button>
               <button onClick={goToToday} className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm rounded-md transition-all">
                 Today
               </button>
               <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-500">
                 <i className="fa-solid fa-chevron-right"></i>
               </button>
             </div>
          </div>
          
          <div className="hidden md:flex gap-3">
             {CALENDAR_STATUSES.map(status => (
               <div key={status.value} className="flex items-center space-x-1.5">
                 <div className={`w-2 h-2 rounded-full ${status.color.split(' ')[1].replace('text-', 'bg-').replace('700', '400')}`}></div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase">{status.label}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto">
           <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
               <div key={day} className="py-3 text-center text-xs font-black text-slate-400 uppercase tracking-widest">
                 {day}
               </div>
             ))}
           </div>
           
           <div className="grid grid-cols-7 auto-rows-fr h-full min-h-[600px]">
             {Array.from({ length: totalSlots }).map((_, index) => {
               const dayNum = index - startDay + 1;
               const isValidDay = dayNum > 0 && dayNum <= daysInMonth;
               
               const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
               // Use local date string construction to avoid timezone shifts
               const isoDate = isValidDay 
                 ? `${currentDayDate.getFullYear()}-${String(currentDayDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}` 
                 : '';

               const dayEvents = isValidDay 
                 ? events.filter(e => e.date === isoDate)
                 : [];

               const isToday = isValidDay && new Date().toDateString() === currentDayDate.toDateString();

               return (
                 <div 
                   key={index} 
                   onClick={() => isValidDay && onAddEvent(isoDate)}
                   className={`min-h-[100px] border-b border-r border-slate-100 p-2 transition-colors relative group ${
                     isValidDay ? 'bg-white hover:bg-slate-50 cursor-pointer' : 'bg-slate-50/30'
                   }`}
                 >
                   {isValidDay && (
                     <>
                       <div className={`text-xs font-bold mb-2 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
                         {dayNum}
                       </div>
                       <div className="space-y-1">
                         {dayEvents.map(renderEventBadge)}
                       </div>
                       {/* Add Button on Hover */}
                       <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="text-blue-400 hover:text-blue-600">
                           <i className="fa-solid fa-plus-circle"></i>
                         </button>
                       </div>
                     </>
                   )}
                 </div>
               );
             })}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;