export const NAV_ITEMS = [
  { path: '/', label: 'Home', publicOnly: true },
  { path: '/dashboard', label: 'Dashboard', privateOnly: true },
  { path: '/courses', label: 'Curriculum' },
  { path: '/classes', label: 'Academy' },
  { path: '/tools', label: 'Instruments' },
  { path: '/editor', label: 'Editor', privateOnly: true },
  { path: '/revision', label: 'Revision', privateOnly: true },
];

// Routes where the chrome (top nav / sidebar / content offset) is hidden entirely.
export const NAV_HIDE_PATHS = ['/login', '/register'];

export const filterNavItems = (items, isAuthenticated) =>
  items.filter(item => {
    if (isAuthenticated) return !item.publicOnly;
    return !item.privateOnly;
  });

export const isNavActive = (path, pathname) => {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
};
