
import React from 'react';
import { FinancialState, UserRole, Announcement } from '../types';

interface AnnouncementsPageProps {
  state: FinancialState;
  onAddAnnouncement: () => void;
  onDeleteAnnouncement: (id: string) => void;
}

const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ 
  state, onAddAnnouncement, onDeleteAnnouncement 
}) => {
  const isAdmin = state.currentUser?.role === UserRole.ADMIN;
  const userSocId = state.currentUser?.societyId;

  // Filter announcements relevant to the current user
  const relevantAnnouncements = state.announcements.filter(a => {
    if (isAdmin) return true; // Admins see everything
    if (a.senderName === state.currentUser?.name) return true; // See what you sent
    
    // Logic for recipients
    if (a.targetAudience === 'ALL') return true;
    if (a.targetAudience === 'LEADERSHIP') return true; // Assume all users in this app are leadership
    if (a.targetAudience === 'SOCIETY') return a.societyId === userSocId;
    
    return false;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSendEmail = (ann: Announcement) => {
    const emails = new Set<string>();
    const add = (e?: string) => e && e.includes('@') && emails.add(e.trim());

    if (ann.targetAudience === 'LEADERSHIP' || ann.targetAudience === 'ALL') {
       state.users.forEach(u => add(u.email));
       state.societies.forEach(s => s.officeBearers.forEach(ob => add(ob.email)));
    }

    if (ann.targetAudience === 'SOCIETY' && ann.societyId) {
       const s = state.societies.find(soc => soc.id === ann.societyId);
       if (s) {
         s.officeBearers.forEach(ob => add(ob.email));
         s.members.forEach(m => add(m.email));
         // Also add the chair from users if possible
         const chair = state.users.find(u => u.societyId === ann.societyId);
         if (chair) add(chair.email);
       }
    }

    if (ann.targetAudience === 'ALL') {
       state.societies.forEach(s => s.members.forEach(m => add(m.email)));
    }

    const recipients = Array.from(emails);
    const subject = encodeURIComponent(`[IEEE Announcement] ${ann.title}`);
    const body = encodeURIComponent(`${ann.message}\n\n--\nSent via IEEE Manager`);
    
    if (recipients.length > 0) {
      const bcc = recipients.join(',');
      window.open(`mailto:?bcc=${bcc}&subject=${subject}&body=${body}`);
    } else {
      alert("No email recipients found for this audience.");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Notice Board</h2>
          <p className="text-slate-500 text-sm">Official communications and updates for the IEEE community.</p>
        </div>
        <button 
          onClick={onAddAnnouncement}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center"
        >
          <i className="fa-solid fa-bullhorn mr-2"></i>
          Make Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Timeline */}
        <div className="lg:col-span-2 space-y-6">
           {relevantAnnouncements.length === 0 ? (
             <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 text-slate-400">
               <i className="fa-solid fa-envelope-open-text text-4xl mb-4"></i>
               <p className="font-bold">No announcements yet.</p>
               <p className="text-sm">Create a new broadcast to reach your members.</p>
             </div>
           ) : (
             relevantAnnouncements.map(ann => {
               const canDelete = isAdmin || ann.senderName === state.currentUser?.name;
               const badgeColor = ann.targetAudience === 'ALL' 
                 ? 'bg-purple-100 text-purple-700' 
                 : ann.targetAudience === 'LEADERSHIP' 
                   ? 'bg-amber-100 text-amber-700' 
                   : 'bg-blue-100 text-blue-700';
                
               const badgeLabel = ann.targetAudience === 'ALL' 
                 ? 'Public Broadcast' 
                 : ann.targetAudience === 'LEADERSHIP' 
                   ? 'Leadership Only' 
                   : 'Society Internal';

               return (
                 <div key={ann.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
                   <div className="flex justify-between items-start mb-3">
                     <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                         {ann.senderName.charAt(0)}
                       </div>
                       <div>
                         <div className="font-bold text-slate-900">{ann.senderName}</div>
                         <div className="text-xs text-slate-500">{new Date(ann.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                       </div>
                     </div>
                     <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${badgeColor}`}>
                       {badgeLabel}
                     </span>
                   </div>
                   
                   <h3 className="text-lg font-bold text-slate-800 mb-2">{ann.title}</h3>
                   <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{ann.message}</p>

                   <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                     <button
                       onClick={() => handleSendEmail(ann)}
                       className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center mr-2"
                       title="Send via Email"
                     >
                        <i className="fa-solid fa-paper-plane mr-2"></i> Send Mail
                     </button>
                     {canDelete && (
                       <button 
                         onClick={() => onDeleteAnnouncement(ann.id)}
                         className="p-2 text-red-500 hover:bg-red-50 rounded-lg text-xs font-bold flex items-center"
                         title="Delete Announcement"
                       >
                         <i className="fa-solid fa-trash"></i>
                       </button>
                     )}
                   </div>
                 </div>
               );
             })
           )}
        </div>

        {/* Right Column: Info Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
             <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
               <i className="fa-solid fa-tower-broadcast text-2xl text-indigo-300"></i>
             </div>
             <h3 className="text-xl font-bold mb-2">Communication Hub</h3>
             <p className="text-indigo-200 text-sm leading-relaxed mb-6">
               Use this board to disseminate critical information regarding events, deadlines, and policy changes to your members or fellow office bearers.
             </p>
             <div className="space-y-3">
               <div className="flex items-center space-x-3 text-xs font-bold text-indigo-100/60">
                 <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                 <span>All Members (Public)</span>
               </div>
               <div className="flex items-center space-x-3 text-xs font-bold text-indigo-100/60">
                 <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                 <span>Leadership (Office Bearers)</span>
               </div>
               <div className="flex items-center space-x-3 text-xs font-bold text-indigo-100/60">
                 <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                 <span>Society Specific</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;
