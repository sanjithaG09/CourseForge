import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../utils/api';
import { useToast } from '../components/Toast';
import './InstructorCourses.css';

export default function InstructorCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('date');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await courseAPI.getMyCourses();
      setCourses((res.data || []).filter(c => c.isPublished));
    } catch { toast.error('Failed to load your courses'); }
    finally { setLoading(false); }
  };

  const deleteCourse = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    try {
      await courseAPI.delete(id);
      setCourses(prev => prev.filter(c => c._id !== id));
      toast.success('Course deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const getSortedCourses = () => {
    const copy = [...courses];
    if (sort === 'a-z') return copy.sort((a, b) => a.title.localeCompare(b.title));
    return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const CATEGORIES = ['Web Development', 'Data Science', 'AI/ML', 'Mobile Dev', 'DevOps', 'Design', 'Business', 'Marketing'];

  const getGroupedByCategory = () => {
    const groups = {};
    courses.forEach(c => {
      const cat = c.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(c);
    });
    return groups;
  };

  const CourseCard = ({ c }) => (
    <div className="ic-card" onClick={() => navigate(`/instructor/edit/${c._id}`)}>
      {c.thumbnail && <div className="ic-thumb"><img src={c.thumbnail} alt={c.title} /></div>}
      <div className="ic-info">
        <div className="ic-card-header">
          <h3 className="ic-course-title">{c.title}</h3>
          <span className={`badge ${c.isPublished ? 'badge-green' : 'badge-amber'}`}>
            {c.isPublished ? '● Published' : '○ Draft'}
          </span>
        </div>
        <p className="ic-desc">{c.description}</p>
        <div className="ic-meta">
          <span className="ic-meta-item">📚 {c.modules?.length || 0} modules</span>
          <span className="ic-meta-item">👥 {c.enrollmentCount || 0} students</span>
          <span className="ic-meta-item">₹{c.price}</span>
          <span className="ic-meta-item badge badge-purple">{c.level}</span>
          <span className="ic-meta-item">{c.category}</span>
        </div>
      </div>
      <div className="ic-actions" onClick={e => e.stopPropagation()}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/instructor/edit/${c._id}`)}>Edit</button>
        <button className="btn btn-danger btn-sm" onClick={e => deleteCourse(c._id, e)}>Delete</button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="page-inner">
      <div style={{display:'grid',gap:16}}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{height:120,borderRadius:16}} />)}
      </div>
    </div>
  );

  const tagGroups = sort === 'tags' ? getGroupedByCategory() : null;
  const sortedCourses = sort !== 'tags' ? getSortedCourses() : [];

  return (
    <div className="page-inner fade-in">
      <div className="ic-header">
        <div>
          <h1 className="ic-title">My Courses</h1>
          <p className="ic-sub">{courses.length} courses created</p>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <select
            className="input-field"
            style={{width:'auto',padding:'8px 12px',fontSize:13}}
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="date">Sort: Date</option>
            <option value="a-z">Sort: A–Z</option>
            <option value="tags">Sort: Tags</option>
          </select>
          <button className="btn btn-primary" onClick={() => navigate('/instructor/create')}>+ Create Course</button>
        </div>
      </div>

      <div className="ic-stats-row">
        <div className="stat-card"><div className="stat-label">Total Courses</div><div className="stat-value">{courses.length}</div></div>
        <div className="stat-card"><div className="stat-label">Published</div><div className="stat-value" style={{color:'var(--green)'}}>{courses.filter(c=>c.isPublished).length}</div></div>
        <div className="stat-card"><div className="stat-label">Total Students</div><div className="stat-value" style={{color:'var(--accent2)'}}>{courses.reduce((a,c)=>a+(c.enrollmentCount||0),0)}</div></div>
        <div className="stat-card"><div className="stat-label">Total Modules</div><div className="stat-value">{courses.reduce((a,c)=>a+(c.modules?.length||0),0)}</div></div>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>No published courses yet</h3>
          <p>Create a course and publish it to see it here</p>
          <button className="btn btn-primary" onClick={() => navigate('/instructor/create')}>Create Course</button>
        </div>
      ) : sort === 'tags' ? (
        <div style={{display:'flex',flexDirection:'column',gap:28}}>
          {[...CATEGORIES, 'Other']
            .filter(cat => tagGroups[cat]?.length > 0)
            .map(cat => (
              <div key={cat}>
                <div style={{fontSize:13,fontWeight:700,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>
                  {cat} <span style={{fontWeight:400,color:'var(--text3)'}}>({tagGroups[cat].length})</span>
                </div>
                <div className="ic-list">
                  {tagGroups[cat].map(c => <CourseCard key={c._id} c={c} />)}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="ic-list">
          {sortedCourses.map(c => <CourseCard key={c._id} c={c} />)}
        </div>
      )}
    </div>
  );
}
