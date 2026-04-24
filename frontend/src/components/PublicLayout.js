import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import './PublicLayout.css';

export default function PublicLayout({ children }) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  if (isLoggedIn) return <Layout>{children}</Layout>;

  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="public-brand" onClick={() => navigate('/courses')}>
          <div className="logo-icon">CF</div>
          <span className="logo-text">CourseForge</span>
        </div>
        <div className="public-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>
            Log In
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>
            Sign Up
          </button>
        </div>
      </header>
      <main className="public-main">
        {children}
      </main>
    </div>
  );
}
