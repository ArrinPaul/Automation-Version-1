import React, { useState, useEffect, useRef } from 'react';
import { FinancialState, EventReport, UserRole, Speaker } from '../types';
import { EVENT_TYPES } from '../constants';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: FinancialState;
  addEvent: (e: Omit<EventReport, 'id'>) => void;
  updateEvent: (id: string, e: Partial<EventReport>) => void;
  editingEvent: EventReport | null;
}

const EventModal: React.FC<EventModalProps> = ({ 
  isOpen, onClose, state, addEvent, updateEvent, editingEvent 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Speaker Form State
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [newSpeaker, setNewSpeaker] = useState<Omit<Speaker, 'id'>>({
    name: '', designation: '', organization: '', presentationTitle: '', profileText: ''
  });
  const [isAddingSpeaker, setIsAddingSpeaker] = useState(false);

  const [formData, setFormData] = useState({
    societyId: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    venue: '',
    collaboration: '',
    type: EVENT_TYPES[0],
    participants: '',
    participantType: '',
    description: '', // Summary
    highlights: '',
    takeaways: '',
    followUpPlan: '',
    organizerName: '',
    organizerDesignation: '',
    images: [] as string[]
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
          collaboration: editingEvent.collaboration || '',
          type: editingEvent.type,
          participants: editingEvent.participants.toString(),
          participantType: editingEvent.participantType || '',
          description: editingEvent.description,
          highlights: editingEvent.highlights || '',
          takeaways: editingEvent.takeaways || '',
          followUpPlan: editingEvent.followUpPlan || '',
          organizerName: editingEvent.organizerName || '',
          organizerDesignation: editingEvent.organizerDesignation || '',
          images: editingEvent.images || []
        });
        setSpeakers(editingEvent.speakers || []);
      } else {
        setFormData({
          societyId: state.currentUser?.societyId || state.societies[0].id,
          title: '',
          date: new Date().toISOString().split('T')[0],
          time: '',
          venue: '',
          collaboration: '',
          type: EVENT_TYPES[0],
          participants: '',
          participantType: '',
          description: '',
          highlights: '',
          takeaways: '',
          followUpPlan: '',
          organizerName: '',
          organizerDesignation: '',
          images: []
        });
        setSpeakers([]);
      }
      setIsAddingSpeaker(false);
      setNewSpeaker({ name: '', designation: '', organization: '', presentationTitle: '', profileText: '' });
    }
  }, [isOpen, state.currentUser, state.societies, editingEvent]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = 5 - formData.images.length;
      if (remainingSlots <= 0) return;

      // Explicitly cast to File[] to avoid 'unknown' type inference issue
      const filesToProcess = Array.from(files).slice(0, remainingSlots) as File[];
      
      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ 
            ...prev, 
            images: [...prev.images, reader.result as string] 
          }));
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddSpeaker = () => {
    if (newSpeaker.name) {
      setSpeakers([...speakers, { ...newSpeaker, id: `spk-${Date.now()}` }]);
      setNewSpeaker({ name: '', designation: '', organization: '', presentationTitle: '', profileText: '' });
      setIsAddingSpeaker(false);
    }
  };

  const removeSpeaker = (id: string) => {
    setSpeakers(speakers.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Omit<EventReport, 'id'> = {
      societyId: formData.societyId,
      title: formData.title,
      date: formData.date,
      time: formData.time,
      venue: formData.venue,
      collaboration: formData.collaboration,
      type: formData.type,
      participants: parseInt(formData.participants) || 0,
      participantType: formData.participantType,
      description: formData.description,
      outcome: formData.highlights, // mapping highlights to outcome for backward compatibility
      highlights: formData.highlights,
      takeaways: formData.takeaways,
      followUpPlan: formData.followUpPlan,
      organizerName: formData.organizerName,
      organizerDesignation: formData.organizerDesignation,
      images: formData.images,
      speakers: speakers
    };

    if (editingEvent) {
      updateEvent(editingEvent.id, data);
    } else {
      addEvent(data);
    }
    onClose();
  };

  const isAdmin = state.currentUser?.role === UserRole.ADMIN;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">
            {editingEvent ? 'Edit Event Report' : 'New Event Report'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Section 1: General Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">General Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Society</label>
                <select 
                  disabled={!isAdmin}
                  value={formData.societyId}
                  onChange={(e) => setFormData({...formData, societyId: e.target.value})}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 font-medium"
                >
                  {state.societies.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.shortName})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type of Activity</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                >
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title of the Activity</label>
              <input 
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Annual IEEE Xtreme Programming Contest"
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                <input 
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time</label>
                <input 
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
               <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Venue</label>
                <input 
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({...formData, venue: e.target.value})}
                  placeholder="e.g. Auditorium"
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Collaboration / Sponsor (if any)</label>
              <input 
                type="text"
                value={formData.collaboration}
                onChange={(e) => setFormData({...formData, collaboration: e.target.value})}
                placeholder="e.g. IEEE Bangalore Section, Tech Corp"
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Section 2: Speaker Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Speaker / Guest Details</h4>
              <button 
                type="button" 
                onClick={() => setIsAddingSpeaker(true)}
                className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
              >
                <i className="fa-solid fa-plus mr-1"></i> Add Speaker
              </button>
            </div>
            
            {speakers.map(spk => (
              <div key={spk.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-start group">
                <div>
                  <div className="font-bold text-sm text-slate-900">{spk.name}</div>
                  <div className="text-xs text-slate-500">{spk.designation}, {spk.organization}</div>
                  <div className="text-[10px] text-slate-400 italic mt-1">Topic: {spk.presentationTitle}</div>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeSpeaker(spk.id)} 
                  className="text-slate-400 hover:text-red-600 p-2"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            ))}

            {isAddingSpeaker && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" placeholder="Speaker Name" className="p-2 rounded-lg border border-blue-200 text-sm" value={newSpeaker.name} onChange={e => setNewSpeaker({...newSpeaker, name: e.target.value})} />
                  <input type="text" placeholder="Title/Position" className="p-2 rounded-lg border border-blue-200 text-sm" value={newSpeaker.designation} onChange={e => setNewSpeaker({...newSpeaker, designation: e.target.value})} />
                  <input type="text" placeholder="Organization" className="p-2 rounded-lg border border-blue-200 text-sm" value={newSpeaker.organization} onChange={e => setNewSpeaker({...newSpeaker, organization: e.target.value})} />
                  <input type="text" placeholder="Presentation Title" className="p-2 rounded-lg border border-blue-200 text-sm" value={newSpeaker.presentationTitle} onChange={e => setNewSpeaker({...newSpeaker, presentationTitle: e.target.value})} />
                </div>
                <textarea placeholder="Profile / Biography (Annexure Text)" className="w-full p-2 rounded-lg border border-blue-200 text-sm" rows={2} value={newSpeaker.profileText} onChange={e => setNewSpeaker({...newSpeaker, profileText: e.target.value})} />
                <div className="flex gap-2 justify-end">
                   <button type="button" onClick={() => setIsAddingSpeaker(false)} className="text-xs font-bold text-slate-500 px-3 py-2">Cancel</button>
                   <button type="button" onClick={handleAddSpeaker} className="text-xs font-bold bg-blue-600 text-white px-4 py-2 rounded-lg">Add to List</button>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Participants Profile */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Participants Profile</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type of Participants</label>
                <input 
                  type="text"
                  value={formData.participantType}
                  onChange={(e) => setFormData({...formData, participantType: e.target.value})}
                  placeholder="e.g. IEEE Members, Students, Faculty"
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">No. of Participants</label>
                <input 
                  type="number"
                  required
                  value={formData.participants}
                  onChange={(e) => setFormData({...formData, participants: e.target.value})}
                  placeholder="0"
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Synopsis */}
          <div className="space-y-4">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Synopsis of the Activity</h4>
             
             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Highlights of the Activity</label>
               <textarea 
                 rows={2}
                 value={formData.highlights}
                 onChange={(e) => setFormData({...formData, highlights: e.target.value})}
                 className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Key Takeaways</label>
               <textarea 
                 rows={2}
                 value={formData.takeaways}
                 onChange={(e) => setFormData({...formData, takeaways: e.target.value})}
                 className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Summary of the Activity</label>
               <textarea 
                 rows={3}
                 required
                 value={formData.description}
                 onChange={(e) => setFormData({...formData, description: e.target.value})}
                 className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Follow-up Plan</label>
               <textarea 
                 rows={2}
                 value={formData.followUpPlan}
                 onChange={(e) => setFormData({...formData, followUpPlan: e.target.value})}
                 className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
               />
             </div>
          </div>

          {/* Section 5: Organizer & Images */}
          <div className="space-y-4">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Report Details</h4>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name of Organizer</label>
                  <input 
                    type="text"
                    value={formData.organizerName}
                    onChange={(e) => setFormData({...formData, organizerName: e.target.value})}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Designation/Title</label>
                  <input 
                    type="text"
                    value={formData.organizerDesignation}
                    onChange={(e) => setFormData({...formData, organizerDesignation: e.target.value})}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
               </div>
             </div>

             <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Event Photographs (Max 5)</label>
                    <span className="text-[10px] text-slate-400">{formData.images.length}/5 Uploaded</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                   {/* Existing Images */}
                   {formData.images.map((img, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden group bg-slate-100 border border-slate-200">
                         <img src={img} alt={`Event ${index}`} className="w-full h-full object-cover" />
                         <button 
                           type="button"
                           onClick={() => removeImage(index)}
                           className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                         >
                           <i className="fa-solid fa-xmark text-xs w-4 h-4 flex items-center justify-center"></i>
                         </button>
                      </div>
                   ))}

                   {/* Add Button */}
                   {formData.images.length < 5 && (
                     <button
                       type="button"
                       onClick={() => fileInputRef.current?.click()}
                       className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/30 transition-all group"
                     >
                        <i className="fa-solid fa-plus text-2xl mb-1 group-hover:scale-110 transition-transform"></i>
                        <span className="text-[10px] font-bold">Add Photo</span>
                     </button>
                   )}
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
            </div>
          </div>

        </form>

        <div className="p-4 border-t border-slate-100 bg-white flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
          <button 
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
          >
            {editingEvent ? 'Update Report' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;