import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { enrollmentAPI } from '../utils/api';
import { useToast } from '../components/Toast';
import './MyLearning.css';

export default function MyLearning() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await enrollmentAPI.getMyEnrollments();
      setEnrollments(res.data || []);
    } catch { toast.error('Failed to load enrollments'); }
    finally { setLoading(false); }
  };

  const filtered = enrollments.filter(e => {
    if (filter === 'completed') return e.isCompleted;
    if (filter === 'inprogress') return !e.isCompleted && (e.progress || 0) > 0;
    if (filter === 'notstarted') return (e.progress || 0) === 0;
    return true;
  });

  if (loading) return (
    <div className="page-inner">
      <div style={{ display: 'grid', gap: 16 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
      </div>
    </div>
  );

  return (
    <div className="page-inner fade-in">
      <div className="ml-header">
        <h1 className="ml-title">My Learning</h1>
        <p className="ml-sub">{enrollments.length} courses enrolled</p>
      </div>
      <div className="ml-filters">
        {[{key:'all',label:'All Courses'},{key:'inprogress',label:'In Progress'},{key:'completed',label:'Completed'},{key:'notstarted',label:'Not Started'}].map(f => (
          <button key={f.key} className={`ml-filter-btn ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎓</div>
          <h3>{filter === 'all' ? 'No courses enrolled yet' : `No ${filter} courses`}</h3>
          <p>Explore our course catalog and start learning</p>
          <button className="btn btn-primary" onClick={() => navigate('/courses')}>Browse Courses</button>
        </div>
      ) : (
        <div className="ml-list">
          {filtered.map(e => (
            <div key={e._id} className="ml-card" onClick={() => navigate(`/courses/${e.course?._id}`)}>
              {e.course?.thumbnail && (
                <div className="ml-thumb"><img src={e.course.thumbnail} alt={e.course.title} /></div>
              )}
              <div className="ml-info">
                <div className="ml-course-title">{e.course?.title}</div>
                <div className="ml-course-inst">{e.course?.instructor?.name}</div>
                <div className="ml-progress-row">
                  <div className="ml-progress-bar">
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{ width: `${e.progress || 0}%` }} />
                    </div>
                    <span className="ml-pct">{e.progress || 0}%</span>
                  </div>
                  <div className="ml-status">
                    {e.isCompleted ? <span className="badge badge-green">Done</span>
                      : e.progress > 0 ? <span className="badge badge-amber">In Progress</span>
                      : <span className="badge" style={{background:'var(--bg4)',color:'var(--text3)'}}>Not Started</span>}
                  </div>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm ml-cta"
                onClick={ev => { ev.stopPropagation(); navigate(`/courses/${e.course?._id}`); }}>
                {e.isCompleted ? 'Review' : e.progress > 0 ? 'Continue' : 'Start'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}