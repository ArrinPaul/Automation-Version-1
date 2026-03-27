
import React, { useState } from 'react';
import { FinancialState, Announcement, UserRole } from '../types';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: FinancialState;
  addAnnouncement: (a: Omit<Announcement, 'id'>) => void;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ 
  isOpen, onClose, state, addAnnouncement 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetAudience: 'ALL' as 'ALL' | 'LEADERSHIP' | 'SOCIETY'
  });
  const [sendEmail, setSendEmail] = useState(false);

  if (!isOpen) return null;

  const isAdmin = state.currentUser?.role === UserRole.ADMIN;
  const userSoc = state.societies.find(s => s.id === state.currentUser?.societyId);

  const getRecipients = (audience: string) => {
    const emails = new Set<string>();
    const add = (e?: string) => e && e.includes('@') && emails.add(e.trim());
    
    // For Society-specific targeting
    const socId = state.currentUser?.societyId;

    if (audience === 'LEADERSHIP' || audience === 'ALL') {
       state.users.forEach(u => add(u.email));
       state.societies.forEach(s => s.officeBearers.forEach(ob => add(ob.email)));
    }

    if (audience === 'SOCIETY') {
       if (socId) {
          const s = state.societies.find(soc => soc.id === socId);
          if (s) {
            s.officeBearers.forEach(ob => add(ob.email));
            s.members.forEach(m => add(m.email));
             // Also add the chair from users if possible
            const chair = state.users.find(u => u.societyId === socId);
            if (chair) add(chair.email);
          }
       }
    }

    if (audience === 'ALL') {
       state.societies.forEach(s => s.members.forEach(m => add(m.email)));
    }

    return Array.from(emails);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return;

    // Force SOCIETY audience if not admin
    const finalAudience = !isAdmin ? 'SOCIETY' : formData.targetAudience;

    addAnnouncement({
      title: formData.title,
      message: formData.message,
      date: new Date().toISOString().split('T')[0],
      senderName: state.currentUser?.name || 'Unknown',
      societyId: state.currentUser?.societyId,
      targetAudience: finalAudience
    });

    if (sendEmail) {
      const recipients = getRecipients(finalAudience);
      const subject = encodeURIComponent(`[IEEE Announcement] ${formData.title}`);
      const body = encodeURIComponent(`${formData.message}\n\n--\nSent via IEEE Manager`);
      
      if (recipients.length > 0) {
        const bcc = recipients.join(',');
        window.open(`mailto:?bcc=${bcc}&subject=${subject}&body=${body}`);
      } else {
        alert("No email recipients found for the selected audience.");
      }
    }

    setFormData({ title: '', message: '', targetAudience: 'ALL' });
    setSendEmail(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">
            <i className="fa-solid fa-bullhorn mr-2 text-blue-600"></i>
            Broadcast Announcement
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Audience</label>
            <select 
              value={formData.targetAudience}
              onChange={(e) => setFormData({...formData, targetAudience: e.target.value as any})}
              disabled={!isAdmin}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium disabled:bg-slate-100"
            >
              <option value="ALL">All IEEE Members</option>
              <option value="LEADERSHIP">All Office Bearers</option>
              <option value="SOCIETY">
                {isAdmin ? 'Current Context Members Only' : `Members of ${userSoc?.shortName || 'My Society'}`}
              </option>
            </select>
            {!isAdmin && (
               <p className="text-[10px] text-slate-400 mt-1">
                 As a society chair, you can only broadcast to your own registered members.
               </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject / Title</label>
            <input 
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Urgent Meeting"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message</label>
            <textarea 
              rows={4}
              required
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="Type your announcement here..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
             <input 
               id="sendEmail" 
               type="checkbox" 
               checked={sendEmail} 
               onChange={(e) => setSendEmail(e.target.checked)}
               className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
             />
             <label htmlFor="sendEmail" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
               Draft email to recipients
               <p className="text-[10px] text-slate-400 font-normal">Opens your default mail app with recipients BCC'd</p>
             </label>
          </div>

          <div className="bg-blue-50 p-3 rounded-xl flex items-start gap-3">
             <i className="fa-solid fa-circle-info text-blue-500 mt-0.5"></i>
             <div className="text-xs text-blue-800">
               <strong>Note:</strong> This will appear on the dashboard of all targeted users immediately. {isAdmin && "Since you are an Admin, you can broadcast to the entire branch."}
             </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
            >
              Post Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementModal;
