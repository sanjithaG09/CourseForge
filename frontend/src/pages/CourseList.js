import React, { useEffect, useState, useCallback } from 'react';
import { courseAPI, enrollmentAPI, searchAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../components/Toast';
import CourseCard from '../components/CourseCard';
import './CourseList.css';

const LEVELS = ['', 'beginner', 'intermediate', 'advanced'];
const SORTS = [
  { value: '', label: 'Latest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

export default function CourseList() {
  const { isLoggedIn } = useAuth();
  const { courseUpdate } = useSocket();
  const toast = useToast();

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);

  const [filters, setFilters] = useState({
    search: '', category: '', level: '', minPrice: '', maxPrice: '', sort: '', page: 1,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchCategories();
    if (isLoggedIn) fetchEnrolled();
  }, [isLoggedIn]);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

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

  const fetchCategories = async () => {
    try {
      const res = await searchAPI.categories();
      setCategories(res.data || []);
    } catch {}
  };

  const fetchEnrolled = async () => {
    try {
      const res = await enrollmentAPI.getMyEnrollments();
      setEnrolledIds((res.data || []).map(e => e.course?._id));
    } catch {}
  };

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: 12,
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.level && { level: filters.level }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      };
      const res = await courseAPI.getAll(params);
      let data = res.data.courses || [];
      if (filters.sort === 'price_asc') data.sort((a, b) => a.price - b.price);
      if (filters.sort === 'price_desc') data.sort((a, b) => b.price - a.price);
      if (filters.sort === 'popular') data.sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0));
      setCourses(data);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  const handleSearch = (e) => {
    e.preventDefault();
    setFilter('search', searchInput);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', level: '', minPrice: '', maxPrice: '', sort: '', page: 1 });
    setSearchInput('');
  };

  const handleEnroll = async (course) => {
    if (!isLoggedIn) { toast.error('Please login to enroll'); return; }
    if (enrollingId) return;
    setEnrollingId(course._id);
    try {
      await enrollmentAPI.enroll(course._id);
      setEnrolledIds(prev => [...prev, course._id]);
      toast.success(`Enrolled in "${course.title}"!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrollingId(null);
    }
  };

  const activeFilters = [filters.search, filters.category, filters.level, filters.minPrice, filters.maxPrice]
    .filter(Boolean).length;

  return (
    <div className="page-inner fade-in">
      <div className="cl-header">
        <div>
          <h1 className="section-title" style={{ fontSize: 28, marginBottom: 6 }}>Browse Courses</h1>
          <p style={{ color: 'var(--text2)' }}>{total} courses available</p>
        </div>
      </div>

      {/* Search bar */}
      <form className="cl-search-bar" onSubmit={handleSearch}>
        <div className="cl-search-input-wrap">
          <span className="cl-search-icon">⌕</span>
          <input
            className="input-field cl-search-input"
            placeholder="Search courses, topics, instructors..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

      <div className="cl-body">
        {/* Filters sidebar */}
        <aside className="cl-filters">
          <div className="cf-header">
            <span className="cf-title">Filters {activeFilters > 0 && <span className="cf-count">{activeFilters}</span>}</span>
            {activeFilters > 0 && <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear all</button>}
          </div>

          {/* Sort */}
          <div className="filter-group">
            <div className="filter-label">Sort by</div>
            <select className="input-field" value={filters.sort} onChange={e => setFilter('sort', e.target.value)}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Category */}
          <div className="filter-group">
            <div className="filter-label">Category</div>
            <div className="filter-chips">
              <button
                className={`chip ${!filters.category ? 'active' : ''}`}
                onClick={() => setFilter('category', '')}
              >All</button>
              {categories.slice(0, 8).map(cat => (
                <button
                  key={cat._id}
                  className={`chip ${filters.category === cat._id ? 'active' : ''}`}
                  onClick={() => setFilter('category', cat._id)}
                >{cat._id} ({cat.count})</button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div className="filter-group">
            <div className="filter-label">Level</div>
            <div className="filter-chips">
              {LEVELS.map(l => (
                <button
                  key={l}
                  className={`chip ${filters.level === l ? 'active' : ''}`}
                  onClick={() => setFilter('level', l)}
                >{l || 'All'}</button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div className="filter-group">
            <div className="filter-label">Price range (₹)</div>
            <div className="price-inputs">
              <input className="input-field" type="number" placeholder="Min"
                value={filters.minPrice} onChange={e => setFilter('minPrice', e.target.value)} />
              <span style={{ color: 'var(--text3)' }}>–</span>
              <input className="input-field" type="number" placeholder="Max"
                value={filters.maxPrice} onChange={e => setFilter('maxPrice', e.target.value)} />
            </div>
          </div>
        </aside>

        {/* Course Grid */}
        <div className="cl-main">
          {loading ? (
            <div className="cl-grid">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 340, borderRadius: 20 }} />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No courses found</h3>
              <p>Try adjusting your search or filters</p>
              <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="cl-grid">
                {courses.map(course => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    enrolledIds={enrolledIds}
                    onEnroll={handleEnroll}
                  />
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="cl-pagination">
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={filters.page <= 1}
                    onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                  >← Prev</button>
                  <span className="cl-page-info">Page {filters.page} of {totalPages}</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={filters.page >= totalPages}
                    onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                  >Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
