import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { cn } from '@/lib/utils';

import { MobileNav } from '@/components/layout/mobile-nav';
import { Sidebar } from '@/components/layout/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'MediaLibrary',
  description: 'Personal media aggregator',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          'bg-background text-foreground min-h-screen font-sans antialiased',
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col md:flex-row">
            {/* 1. Sidebar (Desktop) */}
            <Sidebar />

            {/* 2. Main Content Wrapper */}
            <div className="flex min-h-screen flex-1 flex-col">
              <header className="bg-background/95 sticky top-0 z-50 flex h-14 items-center border-b px-4 backdrop-blur md:hidden">
                <MobileNav />
                <span className="ml-4 font-bold">Media Library</span>
              </header>

              <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8 lg:p-10">{children}</main>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
