'use strict';

import { FileText, Printer, Users, Mail, Menu, ChevronLeft, ChevronRight, ChevronDown, Settings, LogOut, Clipboard, TrendingUp, DollarSign, Box, User, RefreshCw, Server, Code, Database, Lock, AlertTriangle, GraduationCap, BookOpen } from '/src/utils/icons.js';

export const menuConfig = [
  { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, permission: 'dashboard' },
  {
    id: 'transaksi',
    label: 'Transaksi',
    icon: Clipboard,
    permission: 'transaksi',
    children: [
      { id: 'sales', label: 'Penjualan', permission: 'sales' },
      { id: 'paper', label: 'Kertas', permission: 'paper' },
      { id: 'denda', label: 'Denda', permission: 'denda' },
    ]
  },
  { id: 'inventory', label: 'Stok', icon: Box, permission: 'inventory' },
  {
    id: 'masterData',
    label: 'Master Data',
    icon: Database,
    permission: 'masterData', // Custom permission key for the group
    children: [
      { id: 'teachers', label: 'Daftar Guru', permission: 'teachers' },
      { id: 'students', label: 'Daftar Siswa', icon: GraduationCap, permission: 'students' },
    ]
  },
  {
    id: 'persuratan',
    label: 'Persuratan',
    icon: Mail,
    permission: 'persuratan', // Custom permission key for the group
    children: [
      { id: 'surat', label: 'Nomor Surat', permission: 'surat' },
      { id: 'generate_surat', label: 'Generate Surat', permission: 'generate_surat' },
    ]
  },
  {
    id: 'report',
    label: 'Laporan',
    icon: FileText,
    permission: 'report',
    children: [
      { id: 'paper', label: 'Laporan Kertas', report: true },
      { id: 'sales', label: 'Laporan Penjualan', report: true },
      { id: 'surat', label: 'Laporan Nomor Surat', report: true },
      { id: 'inventory_log', label: 'Laporan Stok', report: true },
      { id: 'simk', label: 'Laporan Surat Izin', report: true },
      { id: 'tunggakan_denda', label: 'Laporan Tunggakan Denda', report: true },
      { id: 'denda', label: 'Laporan Denda Lunas', report: true },
    ]
  },
  { id: 'settings', label: 'Pengaturan', icon: Settings, permission: 'settings' },
];

/**
 * Filters the menu configuration based on user permissions.
 * @param {object} user - The current user object with roles and permissions.
 * @returns {Array} The filtered menu configuration.
 */
function getFilteredMenu(user) {
  if (user.role === 'admin') {
    return menuConfig; // Admin gets all menus without filtering
  }

  return menuConfig.map(item => {
    if (!item.children) {
      return user.permissions?.[item.permission]?.view ? item : null;
    }

    // For non-admin users, filter children based on permissions
    const visibleChildren = item.children.filter(child => {
      const hasGeneralViewPermission = user.permissions?.[child.permission]?.view;
      const isReportChildWithParentView = child.report && user.permissions?.report?.view;
      return hasGeneralViewPermission || isReportChildWithParentView;
    });
    return visibleChildren.length > 0 ? { ...item, children: visibleChildren } : null;
  }).filter(Boolean);
}

export function Sidebar({ currentView, setCurrentView, reportType, setReportType, isOpen, setIsOpen, isCollapsed, setIsCollapsed, user, handleLogout, onHardRefresh, openModal }) {
  const [activeMenu, setActiveMenu] = React.useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const profileMenuRef = React.useRef(null);
  const popupMenuRef = React.useRef(null);

  // Effect to handle closing the profile menu when clicking outside of it.
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (popupMenuRef.current && !popupMenuRef.current.contains(event.target)) {
        setActiveMenu(null); // Close submenu popup
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuRef, popupMenuRef]);

  const filteredMenu = getFilteredMenu(user);

  const handleMenuClick = (menuId) => {
    if (activeMenu === menuId) {
      setActiveMenu(null); // Close if already open
    } else {
      setActiveMenu(menuId); // Open the new one
    }
  };


  // The main sidebar container. Its width and translation are controlled by state.
  return React.createElement('div', {
    className: `fixed inset-y-0 left-0 bg-white shadow-2xl z-40 transform transition-all duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 ${isCollapsed ? 'lg:w-24' : 'lg:w-72'}`
  },
    React.createElement('div', { className: 'flex-1 flex flex-col min-h-0' },
      // Header section with logo and collapse button.
      React.createElement('div', { className: `flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 h-20 border-b` },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('div', { className: 'bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-500/50' }, React.createElement(BookOpen, { className: 'text-white', size: 24 })),
          !isCollapsed && React.createElement('div', null,
            React.createElement('h1', { className: 'text-xl font-bold text-gray-800' }, 'Admin SPB')
          )
        ),
        React.createElement('button', {
          onClick: () => setIsCollapsed(!isCollapsed),
          className: `hidden lg:flex items-center justify-center w-8 h-8 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${isCollapsed ? 'absolute right-0 translate-x-1/2 bg-white border' : ''}`
        },
          isCollapsed
            ? React.createElement(ChevronRight, { size: 20 })
            : React.createElement(ChevronLeft, { size: 20 })
        )
      ),
      // Main navigation links.
      React.createElement('nav', { className: 'flex-grow p-4 space-y-2' },
        filteredMenu.map(item => {
          if (!item.children) {
            // Regular menu item
            return React.createElement('button', { key: item.id, onClick: () => { setCurrentView(item.id); if (window.innerWidth < 1024) setIsOpen(false); }, className: `w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 text-left ${isCollapsed ? 'justify-center' : ''} ${currentView === item.id ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/50' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}` }, React.createElement(item.icon, { size: 24 }), !isCollapsed && React.createElement('span', { className: 'font-semibold' }, item.label));
          }

          // Accordion menu item
          const isOpen = activeMenu === item.id;
          const isReportActive = currentView === 'report' && item.children.some(child => child.id === reportType);
          return React.createElement('div', { key: item.id, className: 'relative', ref: isOpen && isCollapsed ? popupMenuRef : null },
            React.createElement('button', { onClick: () => handleMenuClick(item.id), className: `w-full flex items-center justify-between gap-4 px-4 py-3 rounded-xl transition-all duration-300 text-left ${isCollapsed ? 'justify-center' : ''} ${(isOpen || isReportActive) ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}` },
              React.createElement('div', { className: 'flex items-center gap-4' }, React.createElement(item.icon, { size: 24 }), !isCollapsed && React.createElement('span', { className: 'font-semibold' }, item.label)),
              !isCollapsed && React.createElement(ChevronDown, { size: 16, className: `transition-transform ${isOpen ? 'rotate-180' : ''}` })
            ),
            // Popup menu for collapsed sidebar
            isOpen && isCollapsed && React.createElement('div', { className: 'absolute left-full ml-4 top-0 w-56 bg-white rounded-xl shadow-2xl border p-2 z-50' },
              item.children.map(child => React.createElement('button', {
                key: child.id,
                onClick: () => {
                  if (child.report) {
                    setCurrentView('report');
                    setReportType(child.id);
                  } else {
                    setCurrentView(child.id);
                  }
                },
                className: `w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${ (currentView === child.id || (currentView === 'report' && reportType === child.id)) ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'}`
              }, child.label))
            ),
            // Inline accordion for expanded sidebar
            isOpen && !isCollapsed && React.createElement('div', { className: 'pl-12 mt-2 space-y-1' },
              item.children.map(child => React.createElement('button', {
                key: child.id,
                onClick: () => {
                  if (child.report) {
                    setCurrentView('report');
                    setReportType(child.id);
                  } else {
                    setCurrentView(child.id);
                  }
                  if (window.innerWidth < 1024) setIsOpen(false);
                },
                className: `w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${ (currentView === child.id || (currentView === 'report' && reportType === child.id)) ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'}`
              }, child.label))
            )
          );
        })
      ),
    ),
    // Bottom section of the sidebar containing the user profile menu.
    React.createElement('div', { className: 'border-t p-4 relative', ref: profileMenuRef },
      // The profile pop-up menu, visible when `isProfileMenuOpen` is true.
      isProfileMenuOpen && React.createElement('div', { className: `absolute bottom-full mb-2 w-full left-0 bg-white rounded-xl shadow-2xl border p-2 transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:left-full lg:bottom-0 lg:top-auto lg:ml-4 lg:w-64' : ''}` },
        React.createElement('div', { className: 'p-2' },
          React.createElement('div', { className: 'font-bold text-gray-800' }, user.username),
          React.createElement('div', { className: 'text-sm text-gray-500 capitalize' }, user.role)
        ),
        // --- START: Environment Switcher (Admin Only) ---
        user.role === 'admin' && React.createElement('div', null,
          React.createElement('div', { className: 'my-2 border-t' }),
          React.createElement('div', { className: 'px-3 pt-2 pb-1 text-xs font-semibold text-gray-400' }, 'Ganti Lingkungan'),
          React.createElement('button', {
            onClick: () => { localStorage.setItem('supabaseEnv', 'dev'); window.location.reload(); },
            className: `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${localStorage.getItem('supabaseEnv') !== 'prod' ? 'bg-blue-100 text-blue-700' : ''}`
          }, React.createElement(Code, { size: 20 }), 'Development'),
          React.createElement('button', {
            onClick: () => { localStorage.setItem('supabaseEnv', 'prod'); window.location.reload(); },
            className: `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${localStorage.getItem('supabaseEnv') === 'prod' ? 'bg-green-100 text-green-700' : ''}`
          }, React.createElement(Server, { size: 20 }), 'Production')
        ),
        // --- END: Environment Switcher ---
        React.createElement('button', {
          onClick: () => { onHardRefresh(); setIsProfileMenuOpen(false); },
          className: 'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }, React.createElement(RefreshCw, { size: 20 }), 'Refresh Data'),
        React.createElement('div', { className: 'my-2 border-t' }),
        React.createElement('button', {
          onClick: () => { openModal('change-password'); setIsProfileMenuOpen(false); },
          className: 'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }, React.createElement(Lock, { size: 20 }), 'Ubah Password'),
        React.createElement('button', {
          onClick: () => { handleLogout(); setIsProfileMenuOpen(false); },
          className: 'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-100 hover:text-red-700'
        }, React.createElement(LogOut, { size: 20 }), 'Logout')
      ),
      // The button that toggles the profile menu.
      React.createElement('button', {
        onClick: () => setIsProfileMenuOpen(!isProfileMenuOpen),
        className: `w-full flex items-center gap-4 p-2 rounded-xl transition-all text-left ${isCollapsed ? 'justify-center' : ''} hover:bg-gray-100`
      },
        React.createElement('div', { className: 'w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center' },
          React.createElement(User, { size: 24, className: 'text-indigo-600' })
        ),
        !isCollapsed && React.createElement('div', { className: 'flex-1' },
          React.createElement('div', { className: 'font-semibold text-gray-800' }, user.username),
          React.createElement('div', { className: 'text-xs text-gray-500 capitalize' }, user.role)
        )
      )
    )
  );
}