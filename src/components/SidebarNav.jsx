import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { NAV_ITEMS, NAV_HIDE_PATHS, filterNavItems, isNavActive } from '../config/navItems';

const ICONS = {
  '/': null,
  '/dashboard': (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  '/courses': (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  '/classes': (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  '/tools': (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  '/editor': (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  '/revision': (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  ),
};

const BOTTOM_ICONS = {
  settings: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  sun: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  moon: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  logout: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

const SidebarNav = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme, isSidebarCollapsed, toggleSidebarCollapsed } = useTheme();

  if (NAV_HIDE_PATHS.includes(location.pathname)) return null;

  const navItems = filterNavItems(
    NAV_ITEMS.filter(item => item.path !== '/'),
    isAuthenticated
  );

  const isActive = (path) => isNavActive(path, location.pathname);

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U'
    : 'U';

  const collapsed = isSidebarCollapsed;
  const navItemClass = (path) =>
    `flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap ${
      isActive(path)
        ? 'bg-surface-inverse text-surface-body'
        : 'text-text-muted hover:text-text-primary hover:bg-surface-soft'
    }`;

  return (
    <aside
      className={`fixed left-0 inset-y-0 z-50 hidden md:flex flex-col bg-surface-body border-r border-line-soft transition-all duration-300 ${collapsed ? 'w-14' : 'w-[220px]'}`}
    >
      {/* Logo */}
      <Link
        to={isAuthenticated ? '/dashboard' : '/'}
        className="flex items-center gap-3 px-3 h-[60px] shrink-0 border-b border-line-soft overflow-hidden"
      >
        <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-line-soft shrink-0">
          <img src="/logo.png" alt="Caplet" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <span className="text-lg font-serif italic font-bold tracking-tight text-text-primary whitespace-nowrap">
            Caplet.
          </span>
        )}
      </Link>

      {/* Nav items */}
      <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto overflow-x-visible">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={navItemClass(item.path)}
          >
            <span className="shrink-0">{ICONS[item.path]}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-line-soft px-2 py-3 flex flex-col gap-0.5">
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Light mode' : 'Dark mode'}
          className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-surface-soft transition-all whitespace-nowrap w-full text-left"
        >
          <span className="shrink-0">{isDark ? BOTTOM_ICONS.sun : BOTTOM_ICONS.moon}</span>
          {!collapsed && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
        </button>

        {isAuthenticated && (
          <Link
            to="/settings"
            title={collapsed ? 'Settings' : undefined}
            className={navItemClass('/settings')}
          >
            <span className="shrink-0">{BOTTOM_ICONS.settings}</span>
            {!collapsed && <span>Settings</span>}
          </Link>
        )}

        {isAuthenticated && (
          <>
            {/* User identity row */}
            <div className={`flex items-center gap-2 px-2.5 py-1.5 mt-1 ${collapsed ? 'justify-center' : ''}`}>
              <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold font-mono shrink-0">
                {initials}
              </div>
              {!collapsed && (
                <span className="text-sm font-medium text-text-primary truncate">
                  {user?.firstName || 'User'}
                </span>
              )}
            </div>
            {/* Logout — always accessible, degrades to icon-only when collapsed */}
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-error hover:bg-surface-error transition-all whitespace-nowrap w-full text-left`}
            >
              <span className="shrink-0">{BOTTOM_ICONS.logout}</span>
              {!collapsed && <span>Sign out</span>}
            </button>
          </>
        )}

        {!isAuthenticated && (
          <Link
            to="/register"
            className="mt-1 flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg bg-accent hover:bg-accent-strong text-white text-sm font-semibold transition-all"
            title={collapsed ? 'Get started' : undefined}
          >
            {collapsed ? (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            ) : (
              'Get started'
            )}
          </Link>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={toggleSidebarCollapsed}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-[76px] w-6 h-6 rounded-full bg-surface-raised border border-line-soft flex items-center justify-center text-text-dim hover:text-text-primary hover:border-text-dim transition-all shadow-sm z-10"
      >
        <svg
          className={`w-3 h-3 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </aside>
  );
};

export default SidebarNav;
