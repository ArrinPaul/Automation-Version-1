import React, { useState, useEffect } from 'react';
import { FinancialState, Project, UserRole, ProjectStatus, ProjectCategory } from '../types';
import { PROJECT_STATUSES, PROJECT_CATEGORIES } from '../constants';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: FinancialState;
  addProject: (p: Omit<Project, 'id'>) => void;
  updateProject: (id: string, p: Partial<Project>) => void;
  editingProject: Project | null;
  prefillCategory?: ProjectCategory;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ 
  isOpen, onClose, state, addProject, updateProject, editingProject, prefillCategory
}) => {
  const [formData, setFormData] = useState({
    societyId: '',
    category: 'TECHNICAL_PROJECT' as ProjectCategory,
    title: '',
    sanctioningBody: '',
    amountSanctioned: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'PROPOSED' as ProjectStatus,
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (editingProject) {
        setFormData({
          societyId: editingProject.societyId,
          category: editingProject.category || 'TECHNICAL_PROJECT',
          title: editingProject.title,
          sanctioningBody: editingProject.sanctioningBody,
          amountSanctioned: editingProject.amountSanctioned.toString(),
          startDate: editingProject.startDate,
          status: editingProject.status,
          description: editingProject.description
        });
      } else {
        const initialCategory = prefillCategory || 'TECHNICAL_PROJECT';
        const initialStatus = (initialCategory === 'TECHNICAL_PROJECT') ? 'PROPOSED' : 'ANNOUNCED';
        
        setFormData({
          societyId: state.currentUser?.societyId || state.societies[0].id,
          category: initialCategory,
          title: '',
          sanctioningBody: '',
          amountSanctioned: '',
          startDate: new Date().toISOString().split('T')[0],
          status: initialStatus as ProjectStatus,
          description: ''
        });
      }
    }
  }, [isOpen, state.currentUser, state.societies, editingProject, prefillCategory]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      societyId: formData.societyId,
      category: formData.category,
      title: formData.title,
      sanctioningBody: formData.sanctioningBody,
      amountSanctioned: parseFloat(formData.amountSanctioned) || 0,
      startDate: formData.startDate,
      status: formData.status,
      description: formData.description
    };

    if (editingProject) {
      updateProject(editingProject.id, data);
    } else {
      addProject(data);
    }
    onClose();
  };

  const isAdmin = state.currentUser?.role === UserRole.ADMIN;

  const getTitlePlaceholder = () => {
    switch(formData.category) {
      case 'TRAVEL_GRANT': return "e.g. Travel to IEEE Global Event...";
      case 'SCHOLARSHIP': return "e.g. Richard E. Merwin Scholarship...";
      case 'AWARD': return "e.g. Outstanding Student Volunteer Award...";
      default: return "e.g. AI for Healthcare Research...";
    }
  };

  const getModalTitle = () => {
    if (editingProject) return 'Edit Record';
    const cat = PROJECT_CATEGORIES.find(c => c.value === formData.category);
    return `Register ${cat?.label || 'Sanctioned Record'}`;
  }

  // Determine allowed statuses based on the category
  const getStatusOptions = () => {
    if (formData.category === 'TECHNICAL_PROJECT') {
      return PROJECT_STATUSES.filter(s => ['PROPOSED', 'ONGOING', 'COMPLETED', 'CANCELLED'].includes(s.value));
    } else {
      // For Travel Grants, Scholarships, and Awards
      return PROJECT_STATUSES.filter(s => ['ANNOUNCED', 'AWARDED', 'CANCELLED'].includes(s.value));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">
            {getModalTitle()}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Record Category</label>
              <select 
                disabled={!!prefillCategory && !editingProject}
                value={formData.category}
                onChange={(e) => {
                  const newCat = e.target.value as ProjectCategory;
                  const newStatus = (newCat === 'TECHNICAL_PROJECT') ? 'PROPOSED' : 'ANNOUNCED';
                  setFormData({...formData, category: newCat, status: newStatus as ProjectStatus});
                }}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium disabled:bg-slate-100 disabled:text-slate-600"
              >
                {PROJECT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Affiliated Society</label>
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
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title / Purpose</label>
            <input 
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder={getTitlePlaceholder()}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sanctioning Body</label>
              <input 
                type="text"
                required
                value={formData.sanctioningBody}
                onChange={(e) => setFormData({...formData, sanctioningBody: e.target.value})}
                placeholder="e.g. IEEE HQ / R10 / Section"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sanctioned Amount (₹)</label>
              <input 
                type="number"
                required
                value={formData.amountSanctioned}
                onChange={(e) => setFormData({...formData, amountSanctioned: e.target.value})}
                placeholder="0.00"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start / Effective Date</label>
              <input 
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as ProjectStatus})}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              >
                {getStatusOptions().map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes / Description</label>
            <textarea 
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Provide more details about the sanction, goals or purpose..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
            >
              {editingProject ? 'Update Record' : 'Register Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;