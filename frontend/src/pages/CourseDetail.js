import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI, enrollmentAPI, reviewAPI, wishlistAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../components/Toast';
import './CourseDetail.css';

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  if (url.includes('youtube.com/embed/')) return url;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  return null;
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-picker">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= (hovered || value) ? 'active' : ''}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
      {value > 0 && <span className="star-label">{value}/5</span>}
    </div>
  );
}

function ReviewForm({ courseId, onSaved }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { toast.error('Please select a rating'); return; }
    if (!comment.trim()) { toast.error('Please write a comment'); return; }
    setSubmitting(true);
    try {
      const res = await reviewAPI.addReview(courseId, { rating, comment });
      toast.success('Review submitted!');
      onSaved(res.data.review);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="review-form-title">Leave a Review</div>
      <StarPicker value={rating} onChange={setRating} />
      <textarea
        className="review-textarea"
        placeholder="Share your experience with this course..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        maxLength={1000}
        rows={4}
      />
      <div className="review-form-footer">
        <span className="review-char-count">{comment.length}/1000</span>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? <><div className="spinner" /> Saving...</> : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}

function ReviewCard({ review, isOwn, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await reviewAPI.deleteReview(review.course || review._id);
      toast.success('Review deleted');
      onDelete(review._id);
    } catch {
      toast.error('Failed to delete review');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={`review-card ${isOwn ? 'review-own' : ''}`}>
      <div className="review-card-header">
        <div className="review-avatar">{review.user?.name?.[0]?.toUpperCase() || 'U'}</div>
        <div className="review-meta">
          <div className="review-author">
            {review.user?.name || 'Student'}
            {isOwn && <span className="review-own-badge">You</span>}
          </div>
          <div className="review-stars">
            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
          </div>
        </div>
        <div className="review-date">{new Date(review.createdAt).toLocaleDateString()}</div>
      </div>
      <p className="review-comment">{review.comment}</p>
      {isOwn && (
        <button
          className="review-delete-btn"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting ? '...' : 'Delete'}
        </button>
      )}
    </div>
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const { isLoggedIn, user } = useAuth();
  const { courseUpdate } = useSocket();
  const toast = useToast();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [completingId, setCompletingId] = useState(null);

  // Wishlist
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => { fetchCourse(); }, [id]);

  useEffect(() => {
    if (!courseUpdate) return;
    const { type, course: updated, courseId } = courseUpdate;
    if (type === 'updated' && updated._id === id) {
      setCourse(prev => ({ ...prev, ...updated }));
    } else if (type === 'deleted' && courseId === id) {
      toast.error('This course has been removed by the instructor.');
      navigate('/courses');
    }
  }, [courseUpdate]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await courseAPI.getById(id);
      setCourse(res.data);

      if (isLoggedIn) {
        // Check enrollment
        try {
          const prog = await enrollmentAPI.getProgress(id);
          setProgress(prog.data);
          setEnrolled(true);
        } catch {}

        // Check wishlist status
        try {
          const wl = await wishlistAPI.checkWishlist(id);
          setWishlisted(wl.data.wishlisted);
        } catch {}
      }

      // Load reviews
      try {
        const rv = await reviewAPI.getCourseReviews(id);
        setReviews(rv.data);
        if (isLoggedIn && user) {
          const mine = rv.data.find(r => r.user?._id === user.id || r.user?.name === user.name);
          if (mine) setMyReview(mine);
        }
      } catch {}

    } catch {
      toast.error('Course not found');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  // Determine if user is the instructor of this course
  const isOwnCourse = course && user && course.instructor?._id === user.id;

  const handleEnroll = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    // Redirect paid courses to payment page
    if (course?.price > 0) {
      navigate(`/payment/${id}`, { state: { course } });
      return;
    }
    // Free course — enroll directly
    setEnrolling(true);
    try {
      await enrollmentAPI.enroll(id);
      setEnrolled(true);
      toast.success('Successfully enrolled!');
      const prog = await enrollmentAPI.getProgress(id);
      setProgress(prog.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const markComplete = async (moduleId) => {
    setCompletingId(moduleId);
    try {
      const res = await enrollmentAPI.markComplete(id, moduleId);
      setProgress(prev => ({
        ...prev,
        progress: res.data.progress,
        isCompleted: res.data.isCompleted,
        completedModules: [...(prev?.completedModules || []), moduleId],
      }));
      toast.success(`Module completed! ${res.data.progress}% done`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark complete');
    } finally {
      setCompletingId(null);
    }
  };

  const handleWishlist = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setWishlistLoading(true);
    try {
      if (wishlisted) {
        await wishlistAPI.removeFromWishlist(id);
        setWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistAPI.addToWishlist(id);
        setWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Wishlist action failed');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleReviewSaved = (savedReview) => {
    setMyReview(savedReview);
    setShowReviewForm(false);
    setReviews(prev => [savedReview, ...prev]);
    // Refresh course to get updated rating
    courseAPI.getById(id).then(res => setCourse(res.data)).catch(() => {});
  };

  const handleReviewDeleted = (reviewId) => {
    setReviews(prev => prev.filter(r => r._id !== reviewId));
    setMyReview(null);
    setShowReviewForm(false);
    courseAPI.getById(id).then(res => setCourse(res.data)).catch(() => {});
  };

  if (loading) return (
    <div className="page-inner">
      <div className="skeleton" style={{ height: 300, borderRadius: 20, marginBottom: 24 }} />
      <div style={{ display: 'grid', gap: 12 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />)}
      </div>
    </div>
  );

  if (!course) return null;

  const isModuleCompleted = (mId) => progress?.completedModules?.includes(mId);

  const avgRating = course.rating || 0;
  const ratingCount = course.ratingCount || 0;

  return (
    <div className="page-inner fade-in">
      <div className="cd-layout">
        <div className="cd-main">
          <div className="cd-hero">
            {course.thumbnail && (
              <div className="cd-thumb"><img src={course.thumbnail} alt={course.title} /></div>
            )}
            <div className="cd-hero-body">
              <div className="cd-meta-row">
                <span className="badge badge-purple">{course.category}</span>
                <span className={`badge badge-${course.level === 'beginner' ? 'green' : course.level === 'intermediate' ? 'amber' : 'red'}`}>{course.level}</span>
                {course.isPublished ? <span className="badge badge-green">Published</span> : <span className="badge badge-amber">Draft</span>}
              </div>
              <h1 className="cd-title">{course.title}</h1>
              <p className="cd-desc">{course.description}</p>
              <div className="cd-instructor-row">
                <div className="cd-instr-avatar">{course.instructor?.name?.[0]}</div>
                <div>
                  <div className="cd-instr-label">Instructor</div>
                  <div className="cd-instr-name">{course.instructor?.name}</div>
                </div>
              </div>
              <div className="cd-stats-row">
                <div className="cd-stat"><span className="cd-stat-value">{course.enrollmentCount || 0}</span><span className="cd-stat-label">Students</span></div>
                <div className="cd-stat"><span className="cd-stat-value">{course.modules?.length || 0}</span><span className="cd-stat-label">Modules</span></div>
                <div className="cd-stat">
                  <span className="cd-stat-value" style={{ color: 'var(--amber)' }}>
                    {avgRating > 0 ? `★ ${avgRating.toFixed(1)}` : '★ —'}
                  </span>
                  <span className="cd-stat-label">{ratingCount > 0 ? `${ratingCount} reviews` : 'No reviews'}</span>
                </div>
              </div>
              {course.tags?.length > 0 && (
                <div className="cd-tags">{course.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
              )}
            </div>
          </div>

          {enrolled && progress && (
            <div className="cd-progress-card">
              <div className="cd-progress-header">
                <span className="cd-progress-label">Your Progress</span>
                <span className="cd-progress-pct">{progress.progress || 0}%</span>
              </div>
              <div className="progress-bar-wrap" style={{ height: 8 }}>
                <div className="progress-bar-fill" style={{ width: `${progress.progress || 0}%` }} />
              </div>
              {progress.isCompleted && <div className="cd-completed-badge">🎉 Course Completed!</div>}
            </div>
          )}

          {activeModule && (
            <div className="cd-player">
              <div className="cd-player-header">
                <h3>{activeModule.title}</h3>
              </div>
              {(() => {
                const embedUrl = getYouTubeEmbedUrl(activeModule.videoUrl);
                return embedUrl ? (
                  <div className="video-wrap">
                    <iframe
                      src={embedUrl}
                      className="video-player"
                      title={activeModule.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="no-video"><span>📹</span><p>No video available for this module</p></div>
                );
              })()}
              {enrolled && !isModuleCompleted(activeModule._id) && (
                <button className="btn btn-primary" disabled={completingId === activeModule._id} onClick={() => markComplete(activeModule._id)}>
                  {completingId === activeModule._id ? <><div className="spinner" /> Marking...</> : '✓ Mark as Complete'}
                </button>
              )}
              {isModuleCompleted(activeModule._id) && <span className="badge badge-green">✓ Completed</span>}
            </div>
          )}

          <div className="cd-modules">
            <h2 className="cd-modules-title">Course Curriculum</h2>
            <div className="cd-modules-count">{course.modules?.length || 0} modules</div>
            {!course.modules?.length ? (
              <div className="empty-state" style={{ padding: '32px 0' }}><p>No modules added yet</p></div>
            ) : (
              <div className="modules-list">
                {course.modules.map((mod, idx) => {
                  const done = isModuleCompleted(mod._id);
                  const isActive = activeModule?._id === mod._id;
                  return (
                    <div key={mod._id} className={`module-item ${isActive ? 'active' : ''} ${done ? 'done' : ''}`}
                      onClick={() => enrolled && setActiveModule(mod)}>
                      <div className="module-num">{done ? '✓' : idx + 1}</div>
                      <div className="module-info">
                        <div className="module-title">{mod.title}</div>
                        {mod.duration && <div className="module-dur">⏱ {mod.duration} min</div>}
                      </div>
                      <div className="module-right">
                        {done && <span className="badge badge-green">Done</span>}
                        {!enrolled && <span className="module-lock">🔒</span>}
                        {enrolled && !done && <span className="module-play">▶</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Reviews Section ────────────────────────────── */}
          <div className="cd-reviews">
            <div className="reviews-header">
              <h2 className="reviews-title">
                Student Reviews
                {ratingCount > 0 && (
                  <span className="reviews-avg">
                    <span className="reviews-avg-star">★</span>
                    {avgRating.toFixed(1)} · {ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}
                  </span>
                )}
              </h2>
                {enrolled && !myReview && !showReviewForm && (
                <button className="btn btn-primary" onClick={() => setShowReviewForm(true)}>
                  Write a Review
                </button>
              )}
            </div>

            {enrolled && !myReview && showReviewForm && (
              <ReviewForm
                courseId={id}
                onSaved={handleReviewSaved}
              />
            )}

            {!isLoggedIn && (
              <div className="reviews-login-prompt">
                <span>Enroll in this course to leave a review.</span>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="reviews-empty">
                <div className="reviews-empty-icon">★</div>
                <p>No reviews yet. Be the first to review this course!</p>
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.map(review => (
                  <ReviewCard
                    key={review._id}
                    review={{ ...review, course: id }}
                    isOwn={myReview?._id === review._id}
                    onDelete={handleReviewDeleted}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="cd-sidebar">
          <div className="cd-enroll-card">
            <div className="cd-price">
              {course.price === 0 ? <span className="price-free">Free</span> : <span className="price-paid">₹{course.price}</span>}
            </div>
            {isOwnCourse ? (
              <div className="cd-own-course-badge">
                <span>📚</span>
                <span>This is your course</span>
              </div>
            ) : enrolled ? (
              <div className="cd-enrolled-state">
                <div className="cd-enrolled-badge">✓ You are enrolled</div>
                <div className="cd-enroll-progress">
                  <span>{progress?.progress || 0}% complete</span>
                  <div className="progress-bar-wrap" style={{ marginTop: 8 }}>
                    <div className="progress-bar-fill" style={{ width: `${progress?.progress || 0}%` }} />
                  </div>
                </div>
                {course.modules?.length > 0 && (
                  <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 12 }}
                    onClick={() => setActiveModule(course.modules[0])}>
                    {progress?.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                  </button>
                )}
              </div>
            ) : (
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={enrolling} onClick={handleEnroll}>
                {enrolling ? <><div className="spinner" /> Processing...</> : course.price === 0 ? 'Enroll for Free' : `Enroll Now — ₹${course.price}`}
              </button>
            )}

            {/* Wishlist button */}
            {isLoggedIn && (
              <button
                className={`wishlist-btn ${wishlisted ? 'wishlisted' : ''}`}
                disabled={wishlistLoading}
                onClick={handleWishlist}
              >
                {wishlistLoading
                  ? '...'
                  : wishlisted
                    ? '♥ Wishlisted'
                    : '♡ Add to Wishlist'
                }
              </button>
            )}

            <div className="divider" />
            <div className="cd-includes">
              <div className="cd-includes-title">This course includes:</div>
              <div className="cd-include-item"><span>📚</span> {course.modules?.length || 0} learning modules</div>
              <div className="cd-include-item"><span>🏆</span> Certificate of completion</div>
              <div className="cd-include-item"><span>♾</span> Full lifetime access</div>
              <div className="cd-include-item"><span>📱</span> Access on any device</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
