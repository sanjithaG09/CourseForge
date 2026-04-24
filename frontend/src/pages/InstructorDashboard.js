import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../utils/api';
import { useToast } from '../components/Toast';
import './InstructorDashboard.css';

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [publishingId, setPublishingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await courseAPI.getMyCourses();
      setCourses(res.data || []);
    } catch {
      toast.error('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (course) => {
    if (course.isPublished) return;
    setPublishingId(course._id);
    try {
      await courseAPI.publish(course._id);
      toast.success(`"${course.title}" is now live!`);
      setCourses(prev => prev.map(c => c._id === course._id ? { ...c, isPublished: true } : c));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Publish failed');
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (courseId) => {
    setDeletingId(courseId);
    try {
      await courseAPI.delete(courseId);
      toast.success('Course deleted');
      setCourses(prev => prev.filter(c => c._id !== courseId));
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const totalStudents = courses.reduce((a, c) => a + (c.enrollmentCount || 0), 0);
  const published = courses.filter(c => c.isPublished).length;

  return (
    <div className="page-inner fade-in">
      {/* Header */}
      <div className="id-header">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Instructor Portal</h1>
          <p style={{ color: 'var(--text2)', marginTop: 6 }}>Manage your courses and track performance</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/instructor/create')}>
          + Create New Course
        </button>
      </div>

      {/* Stats */}
      <div className="id-stats">
        <div className="stat-card">
          <div className="stat-label">Total Courses</div>
          <div className="stat-value">{courses.length}</div>
          <div className="stat-sub">created</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Published</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{published}</div>
          <div className="stat-sub">live courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Draft</div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>{courses.length - published}</div>
          <div className="stat-sub">not live</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Students</div>
          <div className="stat-value" style={{ color: 'var(--accent2)' }}>{totalStudents}</div>
          <div className="stat-sub">enrolled</div>
        </div>
      </div>

      {/* Course table */}
      <div className="id-table-wrap">
        <div className="id-table-header">
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Your Courses</h2>
        </div>

        {loading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📘</div>
            <h3>No courses yet</h3>
            <p>Create your first course to start teaching</p>
            <button className="btn btn-primary" onClick={() => navigate('/instructor/create')}>
              Create Course
            </button>
          </div>
        ) : (
          <div className="id-table">
            <div className="id-table-head">
              <div>Course</div>
              <div>Category</div>
              <div>Price</div>
              <div>Students</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {courses.map(c => (
              <div key={c._id} className="id-table-row">
                <div className="id-course-info">
                  <div className="id-course-avatar">{c.title?.[0]}</div>
                  <div>
                    <div className="id-course-name">{c.title}</div>
                    <div className="id-course-meta">{c.modules?.length || 0} modules · {c.level}</div>
                  </div>
                </div>
                <div className="id-td id-category">{c.category}</div>
                <div className="id-td">
                  {c.price === 0 ? <span style={{ color: 'var(--green)' }}>Free</span> : `₹${c.price}`}
                </div>
                <div className="id-td">👥 {c.enrollmentCount || 0}</div>
                <div className="id-td">
                  <span className={`badge ${c.isPublished ? 'badge-green' : 'badge-amber'}`}>
                    {c.isPublished ? '● Live' : '○ Draft'}
                  </span>
                </div>
                <div className="id-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/instructor/edit/${c._id}`)}
                  >Edit</button>

                  {!c.isPublished && (
                    <button
                      className="btn btn-sm"
                      style={{ background: 'var(--green-dim)', color: 'var(--green)' }}
                      onClick={() => handlePublish(c)}
                      disabled={publishingId === c._id}
                    >
                      {publishingId === c._id ? '...' : 'Publish'}
                    </button>
                  )}

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setConfirmDelete(c)}
                  >Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title">Delete Course</div>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--text2)', marginBottom: 24 }}>
              Are you sure you want to delete <strong>"{confirmDelete.title}"</strong>?
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(confirmDelete._id)}
                disabled={deletingId === confirmDelete._id}
              >
                {deletingId === confirmDelete._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
