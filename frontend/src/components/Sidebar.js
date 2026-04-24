import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from './Toast';
import './Sidebar.css';

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const StudentLinks = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/courses', icon: '◈', label: 'Browse Courses' },
  { to: '/my-learning', icon: '▶', label: 'My Learning' },
  { to: '/wishlist', icon: '♡', label: 'Wishlist' },
  { to: '/profile', icon: '◉', label: 'Profile' },
];

const InstructorLinks = [
  { to: '/courses', icon: '◈', label: 'Browse Courses' },
  { to: '/instructor', icon: '◎', label: 'My Courses' },
  { to: '/instructor/drafts', icon: '○', label: 'Drafts' },
  { to: '/instructor/create', icon: '+', label: 'Create Course' },
  { to: '/profile', icon: '◉', label: 'Profile' },
];

export default function Sidebar() {
  const { user, isInstructor, logout } = useAuth();
  const { notifications, unreadCount, markRead, clearAll } = useSocket() || {};
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);
  const toast = useToast();
  const navigate = useNavigate();

  // Close panel when clicking outside
  useEffect(() => {
    if (!showNotif) return;
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotif]);

  const links = isInstructor ? InstructorLinks : StudentLinks;

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo" onClick={() => navigate('/')}>
        <div className="logo-icon">CF</div>
        <span className="logo-text">CourseForge</span>
      </div>

      {/* User info */}
      <div className="sidebar-user">
        <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
        <div className="user-info">
          <div className="user-name">{user?.name || 'User'}</div>
          <div className={`user-role badge badge-${isInstructor ? 'purple' : 'green'}`}>
            {user?.role || 'student'}
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {/* Notifications */}
        <div className="notif-wrap" ref={notifRef}>
          <button className="notif-btn" onClick={() => setShowNotif(!showNotif)}>
            <span>🔔</span>
            <span>Notifications</span>
            {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          {showNotif && (
            <div className="notif-panel">
              <div className="notif-header">
                <span>Notifications {notifications?.length > 0 && `(${notifications.length})`}</span>
                <div className="notif-header-actions">
                  {unreadCount > 0 && (
                    <button className="notif-action-btn" onClick={() => notifications?.forEach(n => markRead(n.id))}>
                      Mark all read
                    </button>
                  )}
                  {notifications?.length > 0 && (
                    <button className="notif-action-btn notif-clear-btn" onClick={clearAll}>
                      Clear
                    </button>
                  )}
                  <button className="notif-close-btn" onClick={() => setShowNotif(false)}>✕</button>
                </div>
              </div>
              {!notifications?.length ? (
                <div className="notif-empty">
                  <div className="notif-empty-icon">🔔</div>
                  <div>No notifications yet</div>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notif-item ${!n.read ? 'unread' : ''}`}
                    onClick={() => markRead(n.id)}
                  >
                    <div className="notif-msg">{n.message || n.type}</div>
                    <div className="notif-time">{timeAgo(n.id)}</div>
                    {!n.read && <div className="notif-dot" />}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Logout */}
        <button className="logout-btn" onClick={handleLogout}>
          <span>⇤</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
