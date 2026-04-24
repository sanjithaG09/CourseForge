import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { searchAPI, enrollmentAPI, courseAPI } from '../utils/api';
import { useToast } from '../components/Toast';
import CourseCard from '../components/CourseCard';
import './Dashboard.css';

export default function Dashboard() {
  const { user, isInstructor } = useAuth();
  const [stats, setStats] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, enrollRes] = await Promise.all([
        searchAPI.dashboard(),
        enrollmentAPI.getMyEnrollments(),
      ]);
      setStats(dashRes.data);
      setEnrollments(enrollRes.data || []);

      if (isInstructor) {
        const myRes = await courseAPI.getMyCourses();
        setMyCourses(myRes.data || []);
      }
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const greetTime = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return (
    <div className="page-inner">
      <div style={{ display: 'grid', gap: 16 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16 }} />)}
      </div>
    </div>
  );

  return (
    <div className="page-inner fade-in">
      {/* Header */}
      <div className="dash-header">
        <div>
          <div className="dash-greeting">{greetTime()},</div>
          <h1 className="dash-name">{user?.name} 👋</h1>
          <p className="dash-sub">
            {isInstructor
              ? 'Manage your courses and track student progress'
              : "Here's what's happening with your learning today"}
          </p>
        </div>
        {isInstructor && (
          <button className="btn btn-primary" onClick={() => navigate('/instructor/create')}>
            + Create Course
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="dash-stats">
        {isInstructor ? (
          <>
            <div className="stat-card">
              <div className="stat-label">Total Courses</div>
              <div className="stat-value">{myCourses.length}</div>
              <div className="stat-sub">courses created</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Published</div>
              <div className="stat-value" style={{ color: 'var(--green)' }}>
                {myCourses.filter(c => c.isPublished).length}
              </div>
              <div className="stat-sub">live courses</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Students</div>
              <div className="stat-value" style={{ color: 'var(--accent2)' }}>
                {myCourses.reduce((a, c) => a + (c.enrollmentCount || 0), 0)}
              </div>
              <div className="stat-sub">across all courses</div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-label">Enrolled Courses</div>
              <div className="stat-value" style={{ color: 'var(--accent2)' }}>{enrollments.length}</div>
              <div className="stat-sub">courses in progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Completed</div>
              <div className="stat-value" style={{ color: 'var(--green)' }}>
                {enrollments.filter(e => e.isCompleted).length}
              </div>
              <div className="stat-sub">courses finished</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Avg Progress</div>
              <div className="stat-value">
                {enrollments.length
                  ? Math.round(enrollments.reduce((a, e) => a + (e.progress || 0), 0) / enrollments.length)
                  : 0}%
              </div>
              <div className="stat-sub">completion rate</div>
            </div>
          </>
        )}
      </div>

      {/* Instructor: My Courses */}
      {isInstructor && (
        <section className="dash-section">
          <div className="section-header">
            <h2 className="section-title">Your Courses</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/instructor')}>View all</button>
          </div>
          {myCourses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <h3>No courses yet</h3>
              <p>Create your first course to get started</p>
              <button className="btn btn-primary" onClick={() => navigate('/instructor/create')}>Create Course</button>
            </div>
          ) : (
            <div className="course-grid">
              {myCourses.slice(0, 3).map(c => (
                <div key={c._id} className="instr-course-card card" onClick={() => navigate(`/instructor/edit/${c._id}`)}>
                  <div className="icc-header">
                    <h3 className="icc-title">{c.title}</h3>
                    <span className={`badge ${c.isPublished ? 'badge-green' : 'badge-amber'}`}>
                      {c.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="icc-desc">{c.description}</p>
                  <div className="icc-footer">
                    <span className="icc-stat">👥 {c.enrollmentCount || 0} students</span>
                    <span className="icc-stat">📚 {c.modules?.length || 0} modules</span>
                    <span className="icc-stat">₹{c.price}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Student: My Enrollments */}
      {!isInstructor && (
        <section className="dash-section">
          <div className="section-header">
            <h2 className="section-title">Continue Learning</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/my-learning')}>View all</button>
          </div>
          {enrollments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎓</div>
              <h3>No courses yet</h3>
              <p>Browse courses and start learning today</p>
              <button className="btn btn-primary" onClick={() => navigate('/courses')}>Browse Courses</button>
            </div>
          ) : (
            <div className="dash-enrollments">
              {enrollments.slice(0, 4).map(e => (
                <div
                  key={e._id}
                  className="enroll-card card"
                  onClick={() => navigate(`/courses/${e.course?._id}`)}
                >
                  <div className="enroll-info">
                    <div className="enroll-title">{e.course?.title}</div>
                    <div className="enroll-instructor">{e.course?.instructor?.name}</div>
                  </div>
                  <div className="enroll-progress-wrap">
                    <div className="enroll-progress-label">
                      <span>{e.progress || 0}% complete</span>
                      {e.isCompleted && <span className="badge badge-green">Done ✓</span>}
                    </div>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{ width: `${e.progress || 0}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Quick links */}
      <section className="dash-section">
        <h2 className="section-title">Quick Access</h2>
        <div className="quick-links">
          <div className="ql-card" onClick={() => navigate('/courses')}>
            <div className="ql-icon">◈</div>
            <div className="ql-label">Browse Courses</div>
          </div>
          {isInstructor && (
            <div className="ql-card" onClick={() => navigate('/instructor/create')}>
              <div className="ql-icon">+</div>
              <div className="ql-label">Create Course</div>
            </div>
          )}
          <div className="ql-card" onClick={() => navigate('/profile')}>
            <div className="ql-icon">◉</div>
            <div className="ql-label">Edit Profile</div>
          </div>
          <div className="ql-card" onClick={() => navigate('/my-learning')}>
            <div className="ql-icon">▶</div>
            <div className="ql-label">My Learning</div>
          </div>
        </div>
      </section>
    </div>
  );
}
