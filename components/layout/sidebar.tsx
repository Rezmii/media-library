'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { navItems } from '@/config/nav';
import { Ghost } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full flex-col gap-4 border-r bg-zinc-950/95 py-4 shadow-2xl backdrop-blur-xl">
      <div className="flex h-16 items-center px-6">
        <Link
          href="/"
          className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white"
        >
          <Ghost className="text-primary h-8 w-8" />
          <span>Media Library</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="flex flex-col gap-8">
          {navItems.map((group, index) => (
            <div key={index} className="flex flex-col gap-3">
              <h4 className="text-muted-foreground text-md px-2 font-semibold tracking-wider uppercase">
                {group.title}
              </h4>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Button
                    key={item.href}
                    variant={isActive ? 'secondary' : 'ghost'}
                    asChild
                    className={cn(
                      'h-12 justify-start gap-4 px-4 text-lg font-medium transition-all',
                      isActive && 'bg-zinc-800 font-medium text-white shadow-sm'
                    )}
                  >
                    <Link href={item.href}>
                      <Icon className="!h-6 !w-6 shrink-0 stroke-[1.5]" />
                      {item.title}
                    </Link>
                  </Button>
                );
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-white/5 p-4 text-center text-xs text-zinc-500">
        v1.0.0 Alpha
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="group pointer-events-none fixed top-0 left-0 z-[100] hidden h-screen w-72 flex-col md:flex">
      <div
        className={cn(
          'pointer-events-auto absolute top-0 left-0 z-40 h-full bg-transparent transition-all',
          'w-2',
          'xl:w-16'
        )}
      />

      <div className="pointer-events-auto z-50 h-full w-full -translate-x-full transition-transform duration-300 ease-in-out group-hover:translate-x-0">
        <SidebarContent />
      </div>

      <div className="absolute top-1/2 left-0 -mt-10 h-20 w-1 rounded-r-full bg-zinc-400/50 opacity-50 transition-opacity group-hover:opacity-0" />
    </aside>
  );
}
