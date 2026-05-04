import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, type Role } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ReceiptText, Users, Calendar, CalendarDays, Award, Megaphone, Settings, LogOut, FileText, Printer, MessageSquare, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ROLE_LABELS: Record<Role, string> = {
  SB_FACULTY: 'SB Faculty',
  SB_OB: 'SB Office Bearer',
  SOCIETY_FACULTY: 'Society Faculty',
  SOCIETY_CHAIR: 'Chairperson',
  SOCIETY_OB: 'Office Bearer',
  MEMBER: 'Member',
};

const ROLE_COLORS: Record<Role, string> = {
  SB_FACULTY: 'text-[hsl(75,100%,50%)]',
  SB_OB: 'text-blue-300',
  SOCIETY_FACULTY: 'text-purple-300',
  SOCIETY_CHAIR: 'text-emerald-300',
  SOCIETY_OB: 'text-white/70',
  MEMBER: 'text-white/50',
};

const Sidebar: React.FC = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    try { await signOut(); }
    catch { toast.error('Unable to terminate session. Please retry.'); }
  };

  const navItems: { label: string; path: string; icon: React.ElementType; roles: Role[] }[] = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['SB_FACULTY', 'SB_OB', 'SOCIETY_FACULTY', 'SOCIETY_CHAIR', 'SOCIETY_OB', 'MEMBER'] },
    { label: 'Transactions', path: '/transactions', icon: ReceiptText, roles: ['SB_FACULTY', 'SB_OB'] },
    { label: 'Societies', path: '/societies', icon: Building2, roles: ['SB_FACULTY', 'SB_OB', 'SOCIETY_FACULTY', 'SOCIETY_CHAIR', 'SOCIETY_OB'] },
    { label: 'Events', path: '/events', icon: CalendarDays, roles: ['SB_FACULTY', 'SB_OB', 'SOCIETY_FACULTY', 'SOCIETY_CHAIR', 'SOCIETY_OB', 'MEMBER'] },
    { label: 'Calendar', path: '/calendar', icon: Calendar, roles: ['SB_FACULTY', 'SB_OB', 'SOCIETY_FACULTY', 'SOCIETY_CHAIR', 'SOCIETY_OB', 'MEMBER'] },
    { label: 'Projects', path: '/projects', icon: Award, roles: ['SB_FACULTY', 'SB_OB', 'SOCIETY_FACULTY', 'SOCIETY_CHAIR', 'SOCIETY_OB'] },
    { label: 'Announcements', path: '/announcements', icon: Megaphone, roles: ['SB_FACULTY', 'SB_OB', 'SOCIETY_FACULTY', 'SOCIETY_CHAIR', 'SOCIETY_OB', 'MEMBER'] },
    { label: 'Communications', path: '/communications', icon: MessageSquare, roles: ['SB_FACULTY', 'SB_OB', 'SOCIETY_FACULTY', 'SOCIETY_CHAIR', 'SOCIETY_OB', 'MEMBER'] },
    { label: 'User Admin', path: '/admin/users', icon: Settings, roles: ['SB_FACULTY'] },
    { label: 'Registry', path: '/admin/registry', icon: Users, roles: ['SB_FACULTY', 'SB_OB'] },
    { label: 'Financial Reports', path: '/reports/financial', icon: FileText, roles: ['SB_FACULTY', 'SB_OB'] },
    { label: 'Quarterly Print', path: '/reports/quarterly-print', icon: Printer, roles: ['SB_FACULTY', 'SB_OB'] },
  ];

  const filteredNav = navItems.filter(item => profile && item.roles.includes(profile.role));

  return (
    <aside className="flex w-[72px] sm:w-64 bg-[#0A0A0C]/95 border-r border-white/10 flex-col h-screen sticky top-0 backdrop-blur-xl shrink-0" style={{ borderRightWidth: '0.5px' }}>
      <div className="p-6 border-b border-white/10" style={{ borderBottomWidth: '0.5px' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-display text-xs font-bold">I</div>
          <div className="hidden sm:block">
            <p className="font-display text-sm tracking-tighter text-white">IEEE_SB</p>
            <p className="font-mono text-[8px] text-white/40 uppercase tracking-widest">Christ University</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 mt-2 overflow-y-auto">
        {filteredNav.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.25em] transition-all border-l",
              location.pathname === item.path
                ? "bg-white/10 border-white text-white"
                : "border-transparent text-muted-foreground hover:text-white hover:bg-white/5"
            )}
            style={{ borderLeftWidth: '0.5px' }}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline truncate">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 bg-black/20" style={{ borderTopWidth: '0.5px' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-white/5 border border-white/10 flex items-center justify-center font-mono text-white text-sm shrink-0" style={{ borderWidth: '0.5px' }}>
            {profile?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="hidden sm:block overflow-hidden flex-1">
            <p className="font-mono text-[10px] text-white truncate">{profile?.name}</p>
            <p className={`font-mono text-[8px] uppercase tracking-widest ${profile?.role ? ROLE_COLORS[profile.role] : 'text-white/50'}`}>
              {profile?.role ? ROLE_LABELS[profile.role] : ''}
            </p>
            {profile?.society && (
              <p className="font-mono text-[8px] text-white/40 truncate">{profile.society.name}</p>
            )}
          </div>
        </div>
        <Button variant="outline" className="w-full text-[10px] h-8 rounded-none" style={{ borderWidth: '0.5px' }} onClick={handleSignOut}>
          <LogOut className="w-3 h-3 mr-2" />
          <span className="hidden sm:inline">Terminate_Session</span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
