"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Mic, Users, Shield, Calendar } from 'lucide-react';

const navItems = [
  { href: '/usersDashboard', icon: Home, label: 'Home', exact: true },
  { href: '/usersDashboard/voice-notes', icon: Mic, label: 'Notes' },
  { href: '/usersDashboard/contacts', icon: Users, label: 'Contacts' },
  { href: '/usersDashboard/vault', icon: Shield, label: 'Vault' },
  { href: '/usersDashboard/scheduled', icon: Calendar, label: 'Schedule' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Blur background */}
      <div className="absolute inset-0 bg-white/90 dark:bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800" />

      {/* Safe area padding */}
      <div className="relative flex items-center justify-around px-2 pb-safe"
           style={{ minHeight: '64px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1
                min-w-[56px] min-h-[48px] rounded-2xl
                transition-all duration-200 press-effect
                ${isActive
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-neutral-400 dark:text-neutral-500'
                }
              `}
            >
              <div className={`
                relative p-2 rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-brand-50 dark:bg-brand-950/50'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }
              `}>
                <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-600 dark:bg-brand-400 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] font-medium transition-all duration-200 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
