import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const navItems = [
  { to: '/',             icon: '🏠', label: 'Home' },
  { to: '/feed',         icon: '📰', label: 'Community Feed' },
  { to: '/events',       icon: '📅', label: 'Events' },
  { to: '/projects',     icon: '🚀', label: 'Projects' },
  { to: '/announcements',icon: '📢', label: 'Announcements' },
  { to: '/opportunities',icon: '🎓', label: 'Opportunities' },
];

const authItems = [
  { to: '/dashboard',    icon: '📊', label: 'My Dashboard' },
  { to: '/notifications',icon: '🔔', label: 'Notifications', badge: true },
];

const adminItems = [
  { to: '/admin',        icon: '⚙️',  label: 'Admin Panel' },
];

const SidebarLink = ({ item, unreadCount, collapsed, onClick }) => {
  const location = useLocation();
  const isActive = item.to === '/'
    ? location.pathname === '/'
    : location.pathname.startsWith(item.to);

  return (
    <Link
      to={item.to}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
        isActive
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className="text-lg shrink-0">{item.icon}</span>
      {!collapsed && <span className="truncate">{item.label}</span>}
      {item.badge && unreadCount > 0 && (
        <span className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0 ${isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
      {collapsed && (
        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 transition-opacity">
          {item.label}
        </span>
      )}
    </Link>
  );
};

const Sidebar = ({ collapsed, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  return (
    <aside className={`flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-gray-100 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">CP</span>
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-gray-900 leading-tight">CampusPilot</p>
            <p className="text-xs text-gray-400">Campus Ecosystem</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <SidebarLink key={item.to} item={item} collapsed={collapsed} onClick={onClose} />
        ))}

        {user && (
          <>
            <div className={`pt-3 pb-1 ${collapsed ? '' : 'px-1'}`}>
              {!collapsed && <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">My Space</p>}
              {collapsed && <div className="border-t border-gray-200" />}
            </div>
            {authItems.map((item) => (
              <SidebarLink key={item.to} item={item} unreadCount={unreadCount} collapsed={collapsed} onClick={onClose} />
            ))}
          </>
        )}

        {isAdmin && (
          <>
            <div className={`pt-3 pb-1 ${collapsed ? '' : 'px-1'}`}>
              {!collapsed && <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</p>}
              {collapsed && <div className="border-t border-gray-200" />}
            </div>
            {adminItems.map((item) => (
              <SidebarLink key={item.to} item={item} collapsed={collapsed} onClick={onClose} />
            ))}
          </>
        )}
      </nav>

      {/* Quick Actions */}
      {!collapsed && user && (
        <div className="px-3 pb-3 space-y-1">
          <div className="pt-2 border-t border-gray-100 mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-1">Quick Create</p>
          </div>
          {[
            { to: '/events/create',       label: '+ New Event',       color: 'text-purple-600 hover:bg-purple-50' },
            { to: '/projects/create',     label: '+ Submit Project',  color: 'text-green-600 hover:bg-green-50' },
            { to: '/feed/create',         label: '+ Create Post',     color: 'text-blue-600 hover:bg-blue-50' },
          ].map((a) => (
            <Link key={a.to} to={a.to} onClick={onClose} className={`block px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${a.color}`}>
              {a.label}
            </Link>
          ))}
        </div>
      )}

      {/* User profile at bottom */}
      {user ? (
        <div className={`border-t border-gray-100 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <button onClick={() => { logout(); navigate('/'); }} title="Logout" className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
              {user.avatar
                ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                : <span className="text-blue-600 font-bold text-sm">{user.name[0].toUpperCase()}</span>}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  : <span className="text-blue-600 font-bold text-sm">{user.name[0].toUpperCase()}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize truncate">{user.role}</p>
              </div>
              <button onClick={() => { logout(); navigate('/'); }} title="Logout" className="text-gray-400 hover:text-red-500 transition-colors p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      ) : (
        !collapsed && (
          <div className="border-t border-gray-100 p-3 space-y-2">
            <Link to="/login" onClick={onClose} className="block w-full text-center py-2 px-4 border border-blue-600 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">Login</Link>
            <Link to="/register" onClick={onClose} className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">Sign Up</Link>
          </div>
        )
      )}
    </aside>
  );
};

export default Sidebar;
