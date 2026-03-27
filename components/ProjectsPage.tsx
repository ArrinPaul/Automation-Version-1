import React, { useState } from 'react';
import { FinancialState, Project, UserRole, ProjectCategory } from '../types';

interface ProjectsPageProps {
  state: FinancialState;
  onAddProject: (category?: ProjectCategory) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ state, onAddProject, onEditProject, onDeleteProject }) => {
  const [search, setSearch] = useState('');

  const filterProjectsByCategory = (category: ProjectCategory) => {
    return state.projects.filter(p => {
      if (p.category !== category) return false;
      
      const soc = state.societies.find(s => s.id === p.societyId);
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                            p.sanctioningBody.toLowerCase().includes(search.toLowerCase()) ||
                            soc?.shortName.toLowerCase().includes(search.toLowerCase());
      
      let isAuthorized = true;
      if (state.currentUser?.role === UserRole.OFFICE_BEARER) {
        isAuthorized = p.societyId === state.currentUser.societyId;
      }

      return isAuthorized && matchesSearch;
    });
  };

  const getStatusBadge = (status: Project['status']) => {
    const styleMap = {
      PROPOSED: 'bg-amber-100 text-amber-700',
      ONGOING: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      ANNOUNCED: 'bg-indigo-100 text-indigo-700',
      AWARDED: 'bg-emerald-100 text-emerald-700'
    };
    return (
      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${styleMap[status]}`}>
        {status}
      </span>
    );
  };

  const canAction = (societyId: string) => {
    return state.currentUser?.role === UserRole.ADMIN || state.currentUser?.societyId === societyId;
  };

  const renderProjectSection = (category: ProjectCategory, title: string, icon: string, colorClass: string) => {
    const projects = filterProjectsByCategory(category);
    
    // Explicit label mapping for buttons
    const labelMap: Record<ProjectCategory, string> = {
      'TECHNICAL_PROJECT': 'Register Projects',
      'TRAVEL_GRANT': 'Register Travel Grants',
      'SCHOLARSHIP': 'Register Scholarships',
      'AWARD': 'Register Awards'
    };
    
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${colorClass} rounded-xl flex items-center justify-center text-white shadow-lg`}>
              <i className={`fa-solid ${icon}`}></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{title}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sanctioned Portals</p>
            </div>
          </div>
          <button 
            onClick={() => onAddProject(category)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <i className="fa-solid fa-plus-circle text-blue-600"></i>
            <span>{labelMap[category]}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
              <p className="text-sm font-medium">No records registered in this category.</p>
            </div>
          ) : (
            projects.map(project => {
              const soc = state.societies.find(s => s.id === project.societyId);
              const editable = canAction(project.societyId);
              
              return (
                <div key={project.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          ID: {project.id.split('-').pop()}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        {editable && (
                          <>
                            <button 
                              onClick={() => onEditProject(project)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button 
                              onClick={() => onDeleteProject(project.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 line-clamp-2" title={project.title}>
                      {project.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {getStatusBadge(project.status)}
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-bold uppercase">
                        {soc?.shortName || project.societyId}
                      </span>
                    </div>

                    <div className="space-y-3 pt-2 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase tracking-widest">Sanctioning Body</span>
                        <span className="text-slate-700 font-bold">{project.sanctioningBody}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase tracking-widest">Sanctioned Amount</span>
                        <span className="text-slate-900 font-black">₹{project.amountSanctioned.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase tracking-widest">Effective Date</span>
                        <span className="text-slate-700 font-medium">{new Date(project.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-50 pt-4">
                      <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-16 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">IEEE Sanctioned Portals</h2>
          <p className="text-slate-500 text-sm">Managing grants, research projects, travel assistance, and accolades.</p>
        </div>
        <div className="relative">
          <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl w-full md:w-80 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="space-y-20">
        {renderProjectSection('TECHNICAL_PROJECT', 'Technical Projects', 'fa-diagram-project', 'bg-blue-600')}
        {renderProjectSection('TRAVEL_GRANT', 'Travel Grants', 'fa-plane-departure', 'bg-purple-600')}
        {renderProjectSection('SCHOLARSHIP', 'Scholarships', 'fa-graduation-cap', 'bg-emerald-600')}
        {renderProjectSection('AWARD', 'Recognition Awards', 'fa-trophy', 'bg-amber-500')}
      </div>
    </div>
  );
};

export default ProjectsPage;