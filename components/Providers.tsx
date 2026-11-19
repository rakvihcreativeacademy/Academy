"use client";

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider attribute="class" forcedTheme="light">
    {children}
    <Toaster richColors position="bottom-right" />
  </ThemeProvider>;
}
