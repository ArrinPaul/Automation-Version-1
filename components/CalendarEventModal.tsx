import React, { useState, useEffect } from 'react';
import { FinancialState, CalendarEvent, UserRole, CalendarEventStatus } from '../types';
import { CALENDAR_STATUSES } from '../constants';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: FinancialState;
  addEvent: (e: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, e: Partial<CalendarEvent>) => void;
  onDeleteEvent: (id: string) => void;
  editingEvent: CalendarEvent | null;
  selectedDate?: string;
}

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({ 
  isOpen, onClose, state, addEvent, updateEvent, onDeleteEvent, editingEvent, selectedDate
}) => {
  const [formData, setFormData] = useState({
    societyId: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    venue: '',
    status: 'PROPOSED' as CalendarEventStatus,
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (editingEvent) {
        setFormData({
          societyId: editingEvent.societyId,
          title: editingEvent.title,
          date: editingEvent.date,
          time: editingEvent.time || '',
          venue: editingEvent.venue || '',
          status: editingEvent.status,
          description: editingEvent.description
        });
      } else {
        setFormData({
          societyId: state.currentUser?.societyId || state.societies[0].id,
          title: '',
          date: selectedDate || new Date().toISOString().split('T')[0],
          time: '09:00',
          venue: '',
          status: 'PROPOSED',
          description: ''
        });
      }
    }
  }, [isOpen, editingEvent, selectedDate, state.currentUser, state.societies]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      societyId: formData.societyId,
      title: formData.title,
      date: formData.date,
      time: formData.time,
      venue: formData.venue,
      status: formData.status,
      description: formData.description
    };

    if (editingEvent) {
      updateEvent(editingEvent.id, data);
    } else {
      addEvent(data);
    }
    onClose();
  };

  const handleDelete = () => {
    if (editingEvent) {
      onDeleteEvent(editingEvent.id);
      onClose();
    }
  };

  const isAdmin = state.currentUser?.role === UserRole.ADMIN;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">
            {editingEvent ? 'Edit Activity' : 'Schedule Activity'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Organizing Society</label>
            <select 
              disabled={!isAdmin}
              value={formData.societyId}
              onChange={(e) => setFormData({...formData, societyId: e.target.value})}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 font-medium"
            >
              {state.societies.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.shortName})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Event Title</label>
            <input 
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Annual Tech Symposium"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
              <input 
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time</label>
              <input 
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Venue / Location</label>
            <input 
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({...formData, venue: e.target.value})}
              placeholder="e.g. Block 4 Seminar Hall"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {CALENDAR_STATUSES.map(status => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setFormData({...formData, status: status.value})}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all border ${
                    formData.status === status.value 
                      ? status.color + ' border-current shadow-sm ring-2 ring-offset-1 ring-blue-100' 
                      : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief details about the event agenda..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <div className="pt-4 flex gap-3">
            {editingEvent && (
               <button 
                  type="button"
                  onClick={handleDelete}
                  className="px-5 py-3 bg-red-50 text-red-500 font-bold rounded-xl hover:bg-red-100 transition-colors"
                  title="Delete Activity"
               >
                  <i className="fa-solid fa-trash"></i>
               </button>
            )}
            <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
            >
              {editingEvent ? 'Update Event' : 'Schedule Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarEventModal;