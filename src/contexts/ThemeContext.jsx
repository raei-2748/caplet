import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

/* eslint-disable-next-line react-refresh/only-export-components */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isSidebar, setIsSidebar] = useState(() => localStorage.getItem('navLayout') === 'sidebar');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('navLayout', isSidebar ? 'sidebar' : 'horizontal');
  }, [isSidebar]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isSidebarCollapsed ? 'true' : 'false');
  }, [isSidebarCollapsed]);

  const toggleTheme = () => setIsDark(prev => !prev);
  const toggleNavLayout = () => setIsSidebar(prev => !prev);
  const toggleSidebarCollapsed = () => setIsSidebarCollapsed(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, isSidebar, toggleNavLayout, isSidebarCollapsed, toggleSidebarCollapsed }}>
      {children}
    </ThemeContext.Provider>
  );
};
