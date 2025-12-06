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
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Ghost className="text-primary h-6 w-6" />
          <span>Media Library</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="flex flex-col gap-6">
          {navItems.map((group, index) => (
            <div key={index} className="flex flex-col gap-2">
              <h4 className="text-muted-foreground px-2 text-xs font-semibold tracking-wider uppercase">
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
                      'justify-start gap-3',
                      isActive && 'bg-zinc-800 font-medium text-white'
                    )}
                  >
                    <Link href={item.href}>
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  </Button>
                );
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t p-4 text-center text-xs text-zinc-500">v1.0.0 Alpha</div>
    </div>
  );
}

export function Sidebar() {
  return (
    <div className="sticky top-0 hidden h-screen w-64 border-r bg-zinc-950/50 md:block">
      <SidebarContent />
    </div>
  );
}
