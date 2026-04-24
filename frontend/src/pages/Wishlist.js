import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wishlistAPI } from '../utils/api';
import { useToast } from '../components/Toast';
import './Wishlist.css';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    try {
      const res = await wishlistAPI.getMyWishlist();
      setItems(res.data);
    } catch {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (courseId) => {
    setRemoving(courseId);
    try {
      await wishlistAPI.removeFromWishlist(courseId);
      setItems(prev => prev.filter(item => item.course._id !== courseId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove from wishlist');
    } finally {
      setRemoving(null);
    }
  };

  if (loading) return (
    <div className="page-inner">
      <div className="wl-header">
        <h1 className="wl-title">My Wishlist</h1>
      </div>
      <div className="wl-grid">
        {[1,2,3].map(i => (
          <div key={i} className="skeleton" style={{ height: 220, borderRadius: 16 }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="page-inner fade-in">
      <div className="wl-header">
        <div>
          <h1 className="wl-title">My Wishlist</h1>
          <p className="wl-subtitle">{items.length} {items.length === 1 ? 'course' : 'courses'} saved</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="wl-empty">
          <div className="wl-empty-icon">♡</div>
          <h3>Your wishlist is empty</h3>
          <p>Browse courses and save ones you want to take later.</p>
          <button className="btn btn-primary" onClick={() => navigate('/courses')}>
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="wl-grid">
          {items.map(item => {
            const course = item.course;
            return (
              <div key={item._id} className="wl-card">
                <div className="wl-card-thumb" onClick={() => navigate(`/courses/${course._id}`)}>
                  {course.thumbnail
                    ? <img src={course.thumbnail} alt={course.title} />
                    : <div className="wl-thumb-placeholder"><span>◈</span></div>
                  }
                  <div className="wl-card-level">
                    <span className={`badge badge-${course.level === 'beginner' ? 'green' : course.level === 'intermediate' ? 'amber' : 'red'}`}>
                      {course.level}
                    </span>
                  </div>
                </div>
                <div className="wl-card-body">
                  <div className="wl-card-category">{course.category}</div>
                  <h3 className="wl-card-title" onClick={() => navigate(`/courses/${course._id}`)}>
                    {course.title}
                  </h3>
                  <p className="wl-card-desc">{course.description}</p>
                  <div className="wl-card-meta">
                    {course.instructor?.name && (
                      <span className="wl-instructor">by {course.instructor.name}</span>
                    )}
                    {course.rating > 0 && (
                      <span className="wl-rating">
                        ★ {course.rating.toFixed(1)}
                        {course.ratingCount > 0 && <span className="wl-rating-count"> ({course.ratingCount})</span>}
                      </span>
                    )}
                  </div>
                  <div className="wl-card-footer">
                    <div className="wl-price">
                      {course.price === 0
                        ? <span className="price-free">Free</span>
                        : <span className="price-paid">₹{course.price}</span>
                      }
                    </div>
                    <div className="wl-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/courses/${course._id}`)}
                      >
                        View Course
                      </button>
                      <button
                        className="btn btn-ghost btn-sm wl-remove-btn"
                        disabled={removing === course._id}
                        onClick={() => handleRemove(course._id)}
                      >
                        {removing === course._id ? '...' : '✕ Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
