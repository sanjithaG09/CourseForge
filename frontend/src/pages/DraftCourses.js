import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../utils/api';
import { useToast } from '../components/Toast';
import './InstructorCourses.css';

export default function DraftCourses() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await courseAPI.getMyCourses();
      setDrafts((res.data || []).filter(c => !c.isPublished));
    } catch {
      toast.error('Failed to load draft courses');
    } finally {
      setLoading(false);
    }
  };

  const publishCourse = async (id, e) => {
    e.stopPropagation();
    setPublishingId(id);
    try {
      await courseAPI.publish(id);
      setDrafts(prev => prev.filter(c => c._id !== id));
      toast.success('Course published! Students can now find it in Browse Courses.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish');
    } finally {
      setPublishingId(null);
    }
  };

  if (loading) return (
    <div className="page-inner">
      <div style={{ display: 'grid', gap: 16 }}>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
      </div>
    </div>
  );

  return (
    <div className="page-inner fade-in">
      <div className="ic-header">
        <div>
          <h1 className="ic-title">Draft Courses</h1>
          <p className="ic-sub">{drafts.length} unpublished course{drafts.length !== 1 ? 's' : ''} — not visible to students</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/instructor')}>
          View All Courses
        </button>
      </div>

      {drafts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✓</div>
          <h3>No drafts</h3>
          <p>All your courses are published and visible to students</p>
          <button className="btn btn-primary" onClick={() => navigate('/instructor/create')}>
            Create New Course
          </button>
        </div>
      ) : (
        <div className="ic-list">
          {drafts.map(c => (
            <div key={c._id} className="ic-card" onClick={() => navigate(`/instructor/edit/${c._id}`)}>
              {c.thumbnail && (
                <div className="ic-thumb">
                  <img src={c.thumbnail} alt={c.title} />
                </div>
              )}
              <div className="ic-info">
                <div className="ic-card-header">
                  <h3 className="ic-course-title">{c.title}</h3>
                  <span className="badge badge-amber">○ Draft</span>
                </div>
                <p className="ic-desc">{c.description}</p>
                <div className="ic-meta">
                  <span className="ic-meta-item">📚 {c.modules?.length || 0} modules</span>
                  <span className="ic-meta-item">₹{c.price}</span>
                  <span className="ic-meta-item badge badge-purple">{c.level}</span>
                  <span className="ic-meta-item">{c.category}</span>
                </div>
              </div>
              <div className="ic-actions" onClick={e => e.stopPropagation()}>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/instructor/edit/${c._id}`)}>
                  Edit
                </button>
                <button
                  className="btn btn-sm"
                  style={{ background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(34,211,165,0.25)' }}
                  onClick={e => publishCourse(c._id, e)}
                  disabled={publishingId === c._id}
                >
                  {publishingId === c._id ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
