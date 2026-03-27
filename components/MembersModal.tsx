import React, { useState, useRef } from 'react';
import { Society, Member, UserRole, User } from '../types';

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  society: Society | null;
  currentUser: User | null;
  onUpdate: (societyId: string, members: Member[]) => void;
}

const MembersModal: React.FC<MembersModalProps> = ({ 
  isOpen, onClose, society, currentUser, onUpdate 
}) => {
  const [formData, setFormData] = useState({
    ieeeId: '',
    name: '',
    email: '',
    contactNumber: '',
    grade: 'Student Member'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !society) return null;

  const canEdit = currentUser?.role === UserRole.ADMIN || currentUser?.societyId === society.id;

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ieeeId || !formData.name) return;

    const newMember: Member = {
      id: `mem-${Date.now()}`,
      ...formData
    };

    onUpdate(society.id, [...society.members, newMember]);
    setFormData({ ieeeId: '', name: '', email: '', contactNumber: '', grade: 'Student Member' });
  };

  const removeMember = (id: string) => {
    if (!window.confirm("Remove this member from the registry?")) return;
    onUpdate(society.id, society.members.filter(m => m.id !== id));
  };

  const handleDownloadCSV = () => {
    const headers = ['IEEE Membership ID', 'Full Name', 'Email Address', 'Contact Number', 'Grade'];
    const rows = society.members.map(m => [
      `"${m.ieeeId}"`, // Quote to prevent scientific notation in excel
      `"${m.name}"`,
      m.email,
      m.contactNumber || '',
      m.grade
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${society.shortName}_Members_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleUploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r\n|\n/);
      const newMembers: Member[] = [];
      let successCount = 0;
      
      // Simple heuristic: Skip first line if it looks like a header (contains "Name" or "Email")
      let startIndex = 0;
      if (lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('email')) {
        startIndex = 1;
      }

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Split by comma, handling potential quotes is complex but simple split works for basic CSV
        const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        
        // Expecting: ID, Name, Email, Contact, Grade (at least 2 fields)
        // Adjusted for new Contact field: index 3 is contact, index 4 is grade
        if (parts.length >= 2) {
           newMembers.push({
             id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
             ieeeId: parts[0] || 'N/A',
             name: parts[1] || 'Unknown',
             email: parts[2] || '',
             contactNumber: parts[3] || '',
             grade: parts[4] || 'Student Member'
           });
           successCount++;
        }
      }
      
      if (successCount > 0) {
        onUpdate(society.id, [...society.members, ...newMembers]);
        alert(`Successfully imported ${successCount} members.`);
      } else {
        alert("No valid member data found. Please ensure CSV format: IEEE ID, Name, Email, Contact, Grade");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{society.name} Membership</h3>
            <p className="text-sm text-slate-500">Registry count: {society.members.length} members</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-2">
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Registered Members</h4>
               <div className="flex space-x-2">
                 <button 
                   onClick={handleDownloadCSV}
                   className="text-[10px] font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                 >
                   <i className="fa-solid fa-download mr-1"></i> Export CSV
                 </button>
                 {canEdit && (
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                   >
                     <i className="fa-solid fa-upload mr-1"></i> Import CSV
                   </button>
                 )}
                 <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleUploadCSV} />
               </div>
            </div>
            
            {society.members.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                <i className="fa-solid fa-users text-3xl mb-3"></i>
                <p>No members registered yet.</p>
                <p className="text-xs mt-1">Add manually or upload a CSV file.</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">IEEE ID</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Grade</th>
                      {canEdit && <th className="px-4 py-3 text-center">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {society.members.map(member => (
                      <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-600 text-xs">{member.ieeeId}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{member.name}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{member.email}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{member.contactNumber || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            {member.grade}
                          </span>
                        </td>
                        {canEdit && (
                          <td className="px-4 py-3 text-center">
                            <button 
                              onClick={() => removeMember(member.id)}
                              className="text-red-400 hover:text-red-600 transition-colors p-1"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Form Section */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 h-fit">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
              Add Individual Member
            </h4>
            {!canEdit ? (
              <p className="text-sm text-slate-400 italic">You do not have permissions to modify this registry.</p>
            ) : (
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">IEEE Membership ID</label>
                  <input 
                    type="text" 
                    required
                    value={formData.ieeeId}
                    onChange={(e) => setFormData({...formData, ieeeId: e.target.value})}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. 98765432"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="student@university.edu"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Contact Number</label>
                  <input 
                    type="tel" 
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="+91..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Membership Grade</label>
                  <select 
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Student Member">Student Member</option>
                    <option value="Graduate Student Member">Graduate Student Member</option>
                    <option value="Member">Member</option>
                    <option value="Senior Member">Senior Member</option>
                    <option value="Affiliate">Affiliate</option>
                  </select>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full py-3 mt-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center space-x-2"
                >
                  <i className="fa-solid fa-plus-circle"></i>
                  <span>Register Member</span>
                </button>

                <div className="pt-4 border-t border-slate-200 mt-4">
                  <p className="text-[10px] text-slate-400 leading-relaxed text-center">
                    Pro Tip: Use the <strong>Import CSV</strong> button above to bulk upload members. Format: <code>ID, Name, Email, Contact, Grade</code>.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembersModal;