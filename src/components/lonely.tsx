'use client';

import { useEffect, useRef } from 'react';

interface TabTitleChangerProps {
  awayTitle?: string;
}

export function TabTitleChanger({
  awayTitle = "I'm a lonely tab :(",
}: TabTitleChangerProps) {
  const originalTitle = useRef<string | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        originalTitle.current = document.title;
        document.title = awayTitle;
      } else if (originalTitle.current) {
        document.title = originalTitle.current;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [awayTitle]);

  return null;
}
