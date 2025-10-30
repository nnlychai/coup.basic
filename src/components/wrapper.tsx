import { ThemeProvider } from 'next-themes';

import { Toaster } from '@/components/ui/sonner';

type WrapperProps = {
  readonly children: React.ReactNode;
};

export const Wrapper = ({ children }: WrapperProps) => (
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
