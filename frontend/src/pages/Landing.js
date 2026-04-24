import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../utils/api';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    courseAPI.getAll({ limit: 6 }).then(res => setCourses(res.data.courses || [])).catch(() => {});
  }, []);

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="land-nav">
        <div className="land-logo">
          <div className="auth-logo" style={{ width: 36, height: 36, fontSize: 13 }}>CF</div>
          <span>CourseForge</span>
        </div>
        <div className="land-nav-links">
          <button className="btn btn-ghost" onClick={() => navigate('/courses')}>Browse</button>
          <button className="btn btn-secondary" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="land-hero">
        <div className="land-hero-bg">
          <div className="hero-orb orb1" />
          <div className="hero-orb orb2" />
          <div className="hero-orb orb3" />
        </div>
        <div className="land-hero-content">
          <div className="land-hero-badge">🚀 The Future of Learning</div>
          <h1 className="land-hero-title">
            Master Skills That<br />
            <span className="land-gradient-text">Shape Tomorrow</span>
          </h1>
          <p className="land-hero-sub">
            Join thousands of learners on CourseForge — where expert-led courses meet
            AI-powered recommendations and real-time progress tracking.
          </p>
          <div className="land-hero-cta">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Start Learning Free
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/courses')}>
              Browse Courses
            </button>
          </div>
          <div className="land-hero-stats">
            <div className="hs"><div className="hs-val">10k+</div><div className="hs-label">Students</div></div>
            <div className="hs-div" />
            <div className="hs"><div className="hs-val">500+</div><div className="hs-label">Courses</div></div>
            <div className="hs-div" />
            <div className="hs"><div className="hs-val">50+</div><div className="hs-label">Instructors</div></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="land-features">
        <div className="container">
          <h2 className="land-section-title">Why CourseForge?</h2>
          <div className="land-features-grid">
            {[
              { icon: '🤖', title: 'AI Recommendations', desc: 'Our engine learns your interests and suggests courses tailored to you.' },
              { icon: '⚡', title: 'Real-time Progress', desc: 'Socket.io powered live updates keep you informed as you learn.' },
              { icon: '🔒', title: 'Secure Payments', desc: 'ACID-compliant transactions with Stripe — your data is always safe.' },
              { icon: '🎓', title: 'Expert Instructors', desc: 'Learn from industry professionals with proven real-world experience.' },
              { icon: '📊', title: 'Smart Analytics', desc: 'Track completion rates, time spent, and identify where you need help.' },
              { icon: '🚀', title: 'Redis-Powered Speed', desc: 'Lightning-fast course delivery with intelligent caching.' },
            ].map(f => (
              <div key={f.title} className="land-feature-card">
                <div className="lf-icon">{f.icon}</div>
                <h3 className="lf-title">{f.title}</h3>
                <p className="lf-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {courses.length > 0 && (
        <section className="land-courses">
          <div className="container">
            <div className="land-section-header">
              <h2 className="land-section-title">Popular Courses</h2>
              <button className="btn btn-secondary" onClick={() => navigate('/courses')}>View all →</button>
            </div>
            <div className="land-courses-grid">
              {courses.map(c => (
                <div key={c._id} className="land-course-card" onClick={() => navigate(`/courses/${c._id}`)}>
                  <div className="lcc-thumb">
                    {c.thumbnail ? <img src={c.thumbnail} alt={c.title} /> : (
                      <div className="lcc-thumb-ph">{c.title?.[0]}</div>
                    )}
                  </div>
                  <div className="lcc-body">
                    <div className="lcc-cat">{c.category}</div>
                    <div className="lcc-title">{c.title}</div>
                    <div className="lcc-footer">
                      <span className="lcc-price">{c.price === 0 ? 'Free' : `₹${c.price}`}</span>
                      <span className="lcc-students">👥 {c.enrollmentCount || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="land-cta">
        <div className="container">
          <div className="land-cta-card">
            <h2>Ready to start learning?</h2>
            <p>Join CourseForge today — free to get started.</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="land-footer">
        <div className="container" style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>
          © 2025 CourseForge · Built with React, Node.js, MongoDB & Redis
        </div>
      </footer>
    </div>
  );
}
