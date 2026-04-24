import React, { useEffect, useState, useCallback } from 'react';
import { courseAPI, searchAPI, enrollmentAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import './Courses.css';

const CATEGORIES = ['Web Development', 'Data Science', 'AI/ML', 'Mobile Dev', 'DevOps', 'Design', 'Business', 'Marketing'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function Courses() {
  const { isLoggedIn } = useAuth();
  const { courseUpdate } = useSocket();
  const toast = useToast();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [enrolledIds, setEnrolledIds] = useState([]);

  const [filters, setFilters] = useState({
    search: '', category: '', level: '', minPrice: '', maxPrice: '',
  });
  const [applied, setApplied] = useState({});

  useEffect(() => {
    if (isLoggedIn) fetchEnrollments();
  }, [isLoggedIn]);

  useEffect(() => {
    fetchCourses();
  }, [applied, page]);

  useEffect(() => {
    if (!courseUpdate) return;
    const { type, course, courseId } = courseUpdate;
    if (type === 'updated') {
      setCourses(prev => prev.map(c => c._id === course._id ? { ...c, ...course } : c));
    } else if (type === 'published') {
      setCourses(prev => {
        if (prev.some(c => c._id === course._id)) return prev;
        return [course, ...prev];
      });
      setTotal(prev => prev + 1);
    } else if (type === 'deleted') {
      setCourses(prev => prev.filter(c => c._id !== courseId));
      setTotal(prev => Math.max(0, prev - 1));
    }
  }, [courseUpdate]);

  const fetchEnrollments = async () => {
    try {
      const res = await enrollmentAPI.getMyEnrollments();
      setEnrolledIds((res.data || []).map(e => e.course?._id).filter(Boolean));
    } catch {}
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, ...applied };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await courseAPI.getAll(params);
      setCourses(res.data.courses || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => { setApplied({ ...filters }); setPage(1); };
  const clearFilters = () => {
    const empty = { search: '', category: '', level: '', minPrice: '', maxPrice: '' };
    setFilters(empty); setApplied({}); setPage(1);
  };

  const handleEnroll = async (course) => {
    if (!isLoggedIn) { navigate('/login'); return; }
    try {
      await enrollmentAPI.enroll(course._id);
      setEnrolledIds(prev => [...prev, course._id]);
      toast.success(`Enrolled in "${course.title}"!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const hasFilters = Object.values(applied).some(Boolean);

  return (
    <div className="page-inner fade-in">
      <div className="courses-header">
        <div>
          <h1 className="courses-title">Browse Courses</h1>
          <p className="courses-sub">{total} courses available for you</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="search-bar-wrap">
        <div className="search-input-wrap">
          <span className="search-icon">⌕</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search courses, topics, instructors..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && applyFilters()}
          />
          {filters.search && (
            <button className="search-clear" onClick={() => setFilters({ ...filters, search: '' })}>✕</button>
          )}
        </div>
        <button className="btn btn-primary" onClick={applyFilters}>Search</button>
      </div>

      <div className="courses-layout">
        {/* Filters sidebar */}
        <aside className="filters-panel">
          <div className="filters-header">
            <span className="filters-title">Filters</span>
            {hasFilters && <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear all</button>}
          </div>

          <div className="filter-group">
            <div className="filter-label">Category</div>
            <div className="filter-options">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`filter-chip ${filters.category === cat ? 'active' : ''}`}
                  onClick={() => setFilters({ ...filters, category: filters.category === cat ? '' : cat })}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-divider" />

          <div className="filter-group">
            <div className="filter-label">Level</div>
            <div className="filter-options">
              {LEVELS.map(lvl => (
                <button
                  key={lvl}
                  className={`filter-chip ${filters.level === lvl ? 'active' : ''}`}
                  onClick={() => setFilters({ ...filters, level: filters.level === lvl ? '' : lvl })}
                >
                  {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-divider" />

          <div className="filter-group">
            <div className="filter-label">Price Range (₹)</div>
            <div className="price-range">
              <input className="input-field" type="number" placeholder="Min" value={filters.minPrice}
                onChange={e => setFilters({ ...filters, minPrice: e.target.value })} />
              <span className="price-sep">—</span>
              <input className="input-field" type="number" placeholder="Max" value={filters.maxPrice}
                onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} />
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={applyFilters}>
            Apply Filters
          </button>
        </aside>

        {/* Course grid */}
        <div className="courses-main">
          {loading ? (
            <div className="courses-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 380, borderRadius: 20 }} />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No courses found</h3>
              <p>Try adjusting your filters or search term</p>
              <button className="btn btn-secondary" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="courses-grid">
                {courses.map(course => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    onEnroll={handleEnroll}
                    enrolledIds={enrolledIds}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button className="btn btn-secondary btn-sm" disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}>← Prev</button>
                  <div className="page-numbers">
                    {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          className={`page-btn ${page === p ? 'active' : ''}`}
                          onClick={() => setPage(p)}
                        >{p}</button>
                      );
                    })}
                  </div>
                  <button className="btn btn-secondary btn-sm" disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
