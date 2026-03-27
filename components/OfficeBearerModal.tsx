
import React, { useState } from 'react';
import { Society, OfficeBearer, UserRole, User } from '../types';
import { POSITIONS } from '../constants';

interface OfficeBearerModalProps {
  isOpen: boolean;
  onClose: () => void;
  society: Society | null;
  currentUser: User | null;
  onUpdate: (societyId: string, officeBearers: OfficeBearer[]) => void;
}

const OfficeBearerModal: React.FC<OfficeBearerModalProps> = ({ 
  isOpen, onClose, society, currentUser, onUpdate 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    position: POSITIONS[0],
    email: '',
    phone: ''
  });

  if (!isOpen || !society) return null;

  const canEdit = currentUser?.role === UserRole.ADMIN || currentUser?.societyId === society.id;

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    let updatedList;
    if (editingId) {
      updatedList = society.officeBearers.map(ob => 
        ob.id === editingId ? { ...formData, id: ob.id } : ob
      );
    } else {
      updatedList = [...society.officeBearers, { ...formData, id: `ob-${Date.now()}` }];
    }

    onUpdate(society.id, updatedList);
    setEditingId(null);
    setFormData({ name: '', position: POSITIONS[0], email: '', phone: '' });
  };

  const removeBearer = (id: string) => {
    if (!window.confirm("Remove this office bearer?")) return;
    onUpdate(society.id, society.officeBearers.filter(ob => ob.id !== id));
  };

  const startEdit = (ob: OfficeBearer) => {
    setEditingId(ob.id);
    setFormData({ name: ob.name, position: ob.position, email: ob.email, phone: ob.phone });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{society.name} Team</h3>
            <p className="text-sm text-slate-500">Manage leadership roles and contact information</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List Section */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Current Office Bearers</h4>
            {society.officeBearers.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                <i className="fa-solid fa-user-group text-3xl mb-3"></i>
                <p>No office bearers listed yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {society.officeBearers.map(ob => (
                  <div key={ob.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {ob.name.charAt(0)}
                      </div>
                      {canEdit && (
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(ob)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <i className="fa-solid fa-pen text-xs"></i>
                          </button>
                          <button onClick={() => removeBearer(ob.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <i className="fa-solid fa-trash text-xs"></i>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-slate-900">{ob.name}</div>
                    <div className="text-xs font-black text-blue-600 uppercase mb-3">{ob.position}</div>
                    <div className="space-y-1 text-xs text-slate-500">
                      <div className="flex items-center"><i className="fa-solid fa-envelope w-4"></i> {ob.email}</div>
                      <div className="flex items-center"><i className="fa-solid fa-phone w-4"></i> {ob.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Section */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 h-fit">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
              {editingId ? 'Edit Bearer' : 'Add New Bearer'}
            </h4>
            {!canEdit ? (
              <p className="text-sm text-slate-400 italic">You do not have permissions to modify this team.</p>
            ) : (
              <form onSubmit={handleAddOrUpdate} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Position</label>
                  <select 
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="john@ieee.org"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="+91..."
                  />
                </div>
                <div className="pt-2 flex gap-2">
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                  >
                    {editingId ? 'Update' : 'Add Member'}
                  </button>
                  {editingId && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', position: POSITIONS[0], email: '', phone: '' });
                      }}
                      className="px-4 py-3 bg-slate-200 text-slate-600 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeBearerModal;
