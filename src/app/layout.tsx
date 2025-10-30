import '@/styles/globals.css';

import { Wrapper } from '@/components/wrapper';
import { fonts } from '@/lib/fonts';
import { cn } from '@/lib/utils';

type RootLayoutProps = {
  readonly children: React.ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={cn('', fonts)}>
        <Wrapper>{children}</Wrapper>
      </body>
    </html>
  );
};

export default RootLayout;
