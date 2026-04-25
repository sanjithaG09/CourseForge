import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import './Sidebar.css';

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
  const toast = useToast();
  const navigate = useNavigate();

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
        {/* Logout */}
        <button className="logout-btn" onClick={handleLogout}>
          <span>⇤</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
