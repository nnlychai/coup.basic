'use client';

import { ThemeProvider } from 'next-themes';

import { TabTitleChanger } from '@/components/lonely';
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
      <TabTitleChanger />
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
