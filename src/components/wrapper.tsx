'use client';

import { ThemeProvider } from 'next-themes';

import { Toaster } from '@/components/ui/sonner';

type WrapperProps = {
  readonly children: React.ReactNode;
};

export function Wrapper({ children }: WrapperProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
    >
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
