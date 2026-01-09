'use client';

import { useEffect, useState } from 'react';

// Simple theme provider that initializes theme on mount
// Theme toggle is handled independently by ThemeToggle component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme, default to dark mode
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    
    // Default to dark mode if no saved preference
    const theme = savedTheme || 'dark';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, []);

  // Prevent flash of unstyled content
  if (!mounted) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

