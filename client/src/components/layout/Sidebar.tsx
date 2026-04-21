import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ReceiptText, Users, Calendar, Award, Megaphone, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Sidebar: React.FC = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['MANAGEMENT', 'FACULTY_ADVISOR', 'SOCIETY_OB', 'MEMBER'] },
    { label: 'Transactions', path: '/transactions', icon: ReceiptText, roles: ['MANAGEMENT'] },
    { label: 'Societies', path: '/societies', icon: Users, roles: ['MANAGEMENT', 'FACULTY_ADVISOR', 'SOCIETY_OB'] },
    { label: 'Events', path: '/events', icon: Calendar, roles: ['MANAGEMENT', 'FACULTY_ADVISOR', 'SOCIETY_OB', 'MEMBER'] },
    { label: 'Projects', path: '/projects', icon: Award, roles: ['MANAGEMENT', 'FACULTY_ADVISOR', 'SOCIETY_OB'] },
    { label: 'Announcements', path: '/announcements', icon: Megaphone, roles: ['MANAGEMENT', 'FACULTY_ADVISOR', 'SOCIETY_OB', 'MEMBER'] },
  ];

  const filteredNav = navItems.filter(item =>
    !item.roles || (profile && item.roles.includes(profile.role))
  );

  return (
    <aside className="w-64 bg-black/60 border-r border-white/10 flex flex-col h-screen sticky top-0 backdrop-blur-xl">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary flex items-center justify-center font-display text-white text-xs">I</div>
          <span className="font-display text-sm tracking-tighter text-white">IEEE_MANAGER</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {filteredNav.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 font-mono text-[11px] uppercase tracking-wider transition-all border-l-2",
              location.pathname === item.path
                ? "bg-primary/10 border-primary text-white"
                : "border-transparent text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-white/10 bg-black/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center font-mono text-accent">
            {profile?.name?.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="font-mono text-[10px] text-white truncate">{profile?.name}</p>
            <p className="font-mono text-[8px] text-accent uppercase">{profile?.role}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full text-[10px] h-8"
          onClick={signOut}
        >
          <LogOut className="w-3 h-3 mr-2" />
          Terminate_Session
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
