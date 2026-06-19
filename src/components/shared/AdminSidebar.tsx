import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Users, Trophy, Settings, LogOut, Dog, Tent } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Events', href: '/admin/events', icon: Calendar },
    { name: 'Clubs', href: '/admin/clubs', icon: Tent },
    { name: 'Club Categories', href: '/admin/club-categories', icon: Tent },
    { name: 'Club Events', href: '/admin/club-events', icon: Tent },
    { name: 'Club Committee', href: '/admin/club-committees', icon: Tent },
    { name: 'Club Gallery', href: '/admin/club-galleries', icon: Tent },
    { name: 'Judges', href: '/admin/judges', icon: Users },
    { name: 'Judges Bulk Upload', href: '/admin/judges/bulk-upload', icon: Users },
    { name: 'Users & Roles', href: '/admin/users', icon: Users },
    { name: 'Competition Engine', href: '/admin/competition', icon: Trophy },
    { name: 'Dog Database', href: '/admin/dogs', icon: Dog },
    { name: 'FCI Groups', href: '/admin/fci-groups', icon: Trophy },
    { name: 'Breeds Master', href: '/admin/breeds', icon: Dog },
    { name: 'Age Classes', href: '/admin/age-classes', icon: Calendar },
    {
      name: 'CMS Gallery',
      icon: LayoutDashboard,
      subItems: [
        { name: 'Media Gallery', href: '/admin/gallery' },
        { name: 'Featured Clubs', href: '/admin/cms/featured-clubs' },
        { name: 'Show Photos', href: '/admin/cms/show-photos' },
        { name: 'Outdoor Photos', href: '/admin/cms/outdoor-photos' },
        { name: 'Sliding Photo Sections', href: '/admin/cms/sliding-sections' },
        { name: 'About Home Section', href: '/admin/cms/about' },
      ]
    },
    { name: 'Settings & CMS', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-card text-foreground hidden md:flex flex-col border-r border-border fixed left-0 top-0 z-40 shadow-xl">
      <div className="h-[72px] flex items-center px-6 border-b border-border">
        <Link href="/admin">
          <img src="/Untitled-1.png" alt="JuzDog Admin" className="h-[46px] w-auto transition-all hover:opacity-90" />
        </Link>
      </div>

      <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto">
        {navItems.map((item) => {
          if (item.subItems) {
            return (
              <details key={item.name} className="group">
                <summary className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium flex-1">{item.name}</span>
                  <span className="text-[10px] transition-transform duration-200 group-open:rotate-180">▼</span>
                </summary>
                <div className="ml-6 mt-1 flex flex-col gap-1 border-l-2 border-border pl-2">
                  {item.subItems.map((subItem) => {
                    const isSubActive = pathname === subItem.href || pathname.startsWith(`${subItem.href}/`);
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${isSubActive
                          ? 'bg-brand-orange text-foreground font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                      >
                        {subItem.name}
                      </Link>
                    )
                  })}
                </div>
              </details>
            );
          }

          const isActive = item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.name}
              href={item.href!}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                ? 'bg-brand-orange text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border">
        <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
