
import React, { useRef, useState } from 'react';
import { FinancialState, Society, UserRole } from '../types';

interface RepositoryPageProps {
  state: FinancialState;
  onUpdateLogo: (societyId: string, logoBase64: string | undefined) => void;
  onUpdateSignature: (societyId: string, signatureBase64: string | undefined) => void;
  onUpdateInstitutionLogo: (logoBase64: string | undefined) => void;
}

const RepositoryPage: React.FC<RepositoryPageProps> = ({ state, onUpdateLogo, onUpdateSignature, onUpdateInstitutionLogo }) => {
  const [search, setSearch] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);
  const instLogoInputRef = useRef<HTMLInputElement>(null);
  const [selectedSocId, setSelectedSocId] = useState<string | null>(null);

  const isAdmin = state.currentUser?.role === UserRole.ADMIN;
  const currentUserSocId = state.currentUser?.societyId;

  // Filter logic: Admins see all matching search, Office Bearers see ONLY their assigned society
  const filtered = state.societies.filter(s => {
    if (!isAdmin) {
      // Office Bearer: Strict filter to their own society only
      return s.id === currentUserSocId;
    }
    // Admin: Filter by search across all societies
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.shortName.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedSocId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateLogo(selectedSocId, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    setSelectedSocId(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedSocId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateSignature(selectedSocId, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    setSelectedSocId(null);
    if (sigInputRef.current) sigInputRef.current.value = '';
  };

  const handleInstitutionLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateInstitutionLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (instLogoInputRef.current) instLogoInputRef.current.value = '';
  };

  const triggerLogoUpload = (socId: string) => {
    setSelectedSocId(socId);
    setTimeout(() => logoInputRef.current?.click(), 10);
  };

  const triggerSignatureUpload = (socId: string) => {
    setSelectedSocId(socId);
    setTimeout(() => sigInputRef.current?.click(), 10);
  };

  const downloadAsset = (base64: string, filename: string) => {
    const link = document.createElement("a");
    link.href = base64;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Branding Repository</h2>
          <p className="text-slate-500 text-sm">
            {isAdmin 
              ? "Global repository of IEEE technical unit assets and institutional identity." 
              : "Official branding portal for your society documentation and reports."}
          </p>
        </div>
        {isAdmin && (
          <div className="relative">
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text"
              placeholder="Filter technical units..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl w-full md:w-80 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
            />
          </div>
        )}
      </div>

      {/* Hidden Inputs for File Uploads */}
      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
      <input type="file" ref={sigInputRef} className="hidden" accept="image/*" onChange={handleSignatureChange} />
      <input type="file" ref={instLogoInputRef} className="hidden" accept="image/*" onChange={handleInstitutionLogoChange} />

      {/* Institutional Branding Section (Centralized Authority - Admin Only) */}
      {isAdmin && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl shadow-slate-200">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group w-32 h-32 bg-white/5 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden shrink-0 transition-all hover:border-blue-500/50">
              {state.institutionLogo ? (
                <img src={state.institutionLogo} alt="Institution Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <i className="fa-solid fa-university text-3xl text-white/20"></i>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <button type="button" onClick={() => instLogoInputRef.current?.click()} className="p-2 bg-white text-slate-900 rounded-lg text-xs font-black uppercase tracking-widest">Update</button>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-500/20">
                <i className="fa-solid fa-shield-halved"></i>
                <span>Institutional Master Assets</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">University Corporate Identity</h3>
              <p className="text-slate-400 text-sm max-w-lg mb-6 leading-relaxed">
                Primary branding for CHRIST (Deemed to be University). These assets are automatically embedded in high-level audit reports and executive activity summaries.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <button 
                  type="button"
                  onClick={() => instLogoInputRef.current?.click()}
                  className="bg-blue-600 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                >
                  {state.institutionLogo ? 'Replace Identity Logo' : 'Initialize Identity Logo'}
                </button>
                {state.institutionLogo && (
                  <>
                    <button 
                      type="button"
                      onClick={() => downloadAsset(state.institutionLogo!, 'university_logo.png')}
                      className="bg-white/10 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-white/20 transition-all text-white border border-white/10"
                    >
                      <i className="fa-solid fa-download mr-2"></i> Download
                    </button>
                    <button 
                      type="button"
                      onClick={() => onUpdateInstitutionLogo(undefined)}
                      className="bg-red-500/10 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all text-red-400 border border-red-500/10"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Society Specific Branding Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filtered.map(soc => {
          const canManage = isAdmin || currentUserSocId === soc.id;
          return (
            <div key={soc.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black">
                    {soc.shortName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{soc.shortName} Branding</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate max-w-[150px]">{soc.name}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                  soc.logo && soc.advisorSignature ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {soc.logo && soc.advisorSignature ? 'Compliance Met' : 'Action Required'}
                </span>
              </div>

              <div className="p-8 flex flex-col sm:flex-row gap-8 items-center sm:items-stretch">
                {/* Logo Section */}
                <div className="flex-1 flex flex-col items-center text-center">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Official Logo</div>
                  <div className="relative w-32 h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-colors hover:bg-slate-100">
                    {soc.logo ? (
                      <img src={soc.logo} alt="Logo" className="w-full h-full object-contain p-3" />
                    ) : (
                      <i className="fa-solid fa-image text-3xl text-slate-200"></i>
                    )}
                  </div>
                  {canManage && (
                    <div className="mt-4 flex flex-col gap-2 w-full">
                      <button 
                        type="button"
                        onClick={() => triggerLogoUpload(soc.id)}
                        className="text-[11px] font-bold text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg transition-colors"
                      >
                        <i className="fa-solid fa-upload mr-1.5"></i>
                        {soc.logo ? 'Change' : 'Upload'}
                      </button>
                      {soc.logo && (
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => downloadAsset(soc.logo!, `${soc.shortName}_logo.png`)}
                            className="flex-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 py-1.5 rounded-lg transition-colors"
                          >
                            <i className="fa-solid fa-download"></i>
                          </button>
                          <button 
                            type="button"
                            onClick={() => onUpdateLogo(soc.id, undefined)} 
                            className="flex-1 text-[11px] font-bold text-red-400 hover:bg-red-50 py-1.5 rounded-lg transition-colors"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="hidden sm:block w-px bg-slate-100"></div>

                {/* Signature Section */}
                <div className="flex-1 flex flex-col items-center text-center">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Advisor Signature</div>
                  <div className="relative w-full sm:w-48 h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-colors hover:bg-slate-100">
                    {soc.advisorSignature ? (
                      <img src={soc.advisorSignature} alt="Signature" className="max-w-full max-h-full object-contain p-3" />
                    ) : (
                      <i className="fa-solid fa-file-signature text-3xl text-slate-200"></i>
                    )}
                  </div>
                  {canManage && (
                    <div className="mt-4 flex flex-col gap-2 w-full">
                      <button 
                        type="button"
                        onClick={() => triggerSignatureUpload(soc.id)}
                        className="text-[11px] font-bold text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg transition-colors"
                      >
                        <i className="fa-solid fa-upload mr-1.5"></i>
                        {soc.advisorSignature ? 'Update' : 'Upload'}
                      </button>
                      {soc.advisorSignature && (
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => downloadAsset(soc.advisorSignature!, `${soc.shortName}_signature.png`)}
                            className="flex-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 py-1.5 rounded-lg transition-colors"
                          >
                            <i className="fa-solid fa-download"></i>
                          </button>
                          <button 
                            type="button"
                            onClick={() => onUpdateSignature(soc.id, undefined)} 
                            className="flex-1 text-[11px] font-bold text-red-400 hover:bg-red-50 py-1.5 rounded-lg transition-colors"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
            <i className="fa-solid fa-folder-open text-4xl mb-4 block"></i>
            <p className="text-lg font-medium">No branding records found.</p>
            {isAdmin ? (
              <p className="text-sm">Adjust your filter to find specific societies.</p>
            ) : (
              <p className="text-sm">Contact Branch Counselor if your society profile is missing.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RepositoryPage;
