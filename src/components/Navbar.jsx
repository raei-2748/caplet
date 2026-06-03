import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MoonIcon, SunIcon, XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui';
import { cn } from './ui/utils';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    setIsOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const allNavItems = [
    { path: '/', label: 'Home', publicOnly: true },
    { path: '/dashboard', label: 'Learning hub', privateOnly: true },
    { path: '/courses', label: 'Courses' },
    { path: '/classes', label: 'Classes' },
    { path: '/tools', label: 'Calculators' },
  ];

  const navItems = allNavItems.filter((item) => {
    if (isAuthenticated) return !item.publicOnly;
    return !item.privateOnly;
  });

  const homePath = isAuthenticated ? '/dashboard' : '/';
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  if (['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line-soft bg-surface-body/90 text-text-primary shadow-minimal backdrop-blur-xl dark:bg-surface-body/88">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 lg:px-12">
        <div className="flex h-16 items-center justify-between gap-4 md:h-[72px]">
          <Link
            to={homePath}
            className="group relative z-10 flex shrink-0 items-center gap-3 rounded-full pr-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-body"
            aria-label="Caplet home"
          >
            <img
              src="/logo.png"
              alt=""
              className="h-10 w-10 rounded-full object-contain ring-1 ring-line-soft transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-serif text-2xl font-bold italic tracking-tight">Caplet.</span>
          </Link>

          <nav className="hidden items-center rounded-full border border-line-soft bg-surface-raised/80 p-1 shadow-minimal md:flex">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-semibold tracking-tight transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-body',
                    active
                      ? 'bg-accent-soft text-accent'
                      : 'text-text-muted hover:bg-surface-soft hover:text-text-primary',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="relative z-10 flex shrink-0 items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line-soft bg-surface-raised text-text-muted shadow-minimal transition-all duration-200 hover:-translate-y-0.5 hover:text-text-primary hover:shadow-minimal-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-body"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu((open) => !open)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-accent/20 bg-accent-soft px-4 text-sm font-semibold text-accent transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-body"
                  aria-expanded={showUserMenu}
                  aria-haspopup="menu"
                >
                  {user?.firstName || 'My account'}
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-2xl border border-line-soft bg-surface-raised py-2 shadow-minimal-lg" role="menu">
                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-soft"
                      role="menuitem"
                    >
                      Account settings
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      className="block w-full px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button as={Link} to="/login" className="hidden rounded-full md:inline-flex" size="sm">
                Start learning
              </Button>
            )}

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line-soft bg-surface-raised text-text-muted shadow-minimal transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-body md:hidden"
              onClick={() => setIsOpen((open) => !open)}
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-line-soft py-4 md:hidden">
            <nav className="flex flex-col gap-2 rounded-2xl bg-surface-raised p-2 shadow-minimal">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'rounded-xl px-4 py-3 text-base font-semibold transition-colors',
                      active ? 'bg-accent-soft text-accent' : 'text-text-primary hover:bg-surface-soft',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {!isAuthenticated && (
                <Button as={Link} to="/login" className="mt-2 rounded-xl" fullWidth>
                  Start learning
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
