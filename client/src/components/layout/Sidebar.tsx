import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { getPersonaAlias } from '@/lib/persona';
import { LayoutDashboard, ReceiptText, Users, Calendar, Award, Megaphone, Settings, LogOut, FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Sidebar: React.FC = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const personaAlias = getPersonaAlias(profile?.role, profile?.email);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      toast.error('Unable to terminate session. Please retry.');
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['MANAGEMENT', 'FACULTY_ADVISOR', 'SOCIETY_OB', 'MEMBER'] },
    { label: 'Transactions', path: '/transactions', icon: ReceiptText, roles: ['MANAGEMENT'] },
    { label: 'Societies', path: '/societies', icon: Users, roles: ['MANAGEMENT', 'FACULTY_ADVISOR', 'SOCIETY_OB'] },
    { label: 'Events', path: '/events', icon: Calendar, roles: ['MANAGEMENT', 'FACULTY_ADVISOR', 'SOCIETY_OB', 'MEMBER'] },
    { label: 'Calendar', path: '/calendar', icon: Calendar, roles: ['MANAGEMENT', 'FACULTY_ADVISOR', 'SOCIETY_OB', 'MEMBER'] },
    { label: 'Projects', path: '/projects', icon: Award, roles: ['MANAGEMENT', 'FACULTY_ADVISOR', 'SOCIETY_OB'] },
    { label: 'Announcements', path: '/announcements', icon: Megaphone, roles: ['MANAGEMENT', 'FACULTY_ADVISOR', 'SOCIETY_OB', 'MEMBER'] },
    { label: 'Communications', path: '/communications', icon: Megaphone, roles: ['MANAGEMENT', 'FACULTY_ADVISOR', 'SOCIETY_OB', 'MEMBER'] },
    { label: 'User Admin', path: '/admin/users', icon: Settings, roles: ['MANAGEMENT'] },
    { label: 'Registry', path: '/admin/registry', icon: Users, roles: ['MANAGEMENT'] },
    { label: 'Financial Reports', path: '/reports/financial', icon: FileText, roles: ['MANAGEMENT'] },
    { label: 'Quarterly Print', path: '/reports/quarterly-print', icon: Printer, roles: ['MANAGEMENT'] },
  ];

  const filteredNav = navItems.filter(item =>
    !item.roles || (profile && item.roles.includes(profile.role))
  );

  return (
    <aside className="flex w-[72px] sm:w-64 bg-[#0A0A0C]/95 border-r border-white/10 flex-col h-screen sticky top-0 backdrop-blur-xl shrink-0" style={{ borderRightWidth: '0.5px' }}>
      <div className="p-6 border-b border-white/10" style={{ borderBottomWidth: '0.5px' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-display text-xs">I</div>
          <span className="hidden sm:inline font-display text-sm tracking-tighter text-white">IEEE_MANAGER</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {filteredNav.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.25em] transition-all border-l",
              location.pathname === item.path
                ? "bg-white/10 border-white text-white"
                : "border-transparent text-muted-foreground hover:text-white hover:bg-white/5"
            )}
            style={{ borderLeftWidth: '0.5px' }}
          >
            <item.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-white/10 bg-black/20" style={{ borderTopWidth: '0.5px' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center font-mono text-white" style={{ borderWidth: '0.5px' }}>
            {profile?.name?.charAt(0)}
          </div>
          <div className="hidden sm:block overflow-hidden">
            <p className="font-mono text-[10px] text-white truncate">{personaAlias ?? profile?.name}</p>
            <p className="font-mono text-[8px] text-white/70 uppercase">{profile?.role}</p>
            {personaAlias && <p className="font-mono text-[8px] text-muted-foreground uppercase">{profile?.email}</p>}
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full text-[10px] h-8"
          style={{ borderWidth: '0.5px' }}
          onClick={handleSignOut}
        >
          <LogOut className="w-3 h-3 mr-2" />
          Terminate_Session
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
