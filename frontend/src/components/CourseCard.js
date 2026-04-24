import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CourseCard.css';

const LEVEL_BADGE = { beginner: 'green', intermediate: 'amber', advanced: 'red' };
const LEVEL_ICON  = { beginner: '▸', intermediate: '▸▸', advanced: '▸▸▸' };

const PLACEHOLDER_THUMBS = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80',
];

export default function CourseCard({ course, onEnroll, enrolledIds = [], loading }) {
  const navigate = useNavigate();
  const isEnrolled = enrolledIds.includes(course._id);

  const thumb =
    course.thumbnail ||
    PLACEHOLDER_THUMBS[parseInt(course._id?.slice(-1), 16) % PLACEHOLDER_THUMBS.length] ||
    PLACEHOLDER_THUMBS[0];

  const stars = Math.round(course.rating || 4.2);

  return (
    <div className="course-card" onClick={() => navigate(`/courses/${course._id}`)}>
      <div className="course-card-thumb">
        <img src={thumb} alt={course.title} loading="lazy" />
        <div className="course-card-level">
          <span className={`badge badge-${LEVEL_BADGE[course.level] || 'purple'}`}>
            {LEVEL_ICON[course.level]} {course.level}
          </span>
        </div>
        {isEnrolled && <div className="course-card-enrolled-tag">Enrolled ✓</div>}
      </div>

      <div className="course-card-body">
        <div className="course-card-category">{course.category}</div>
        <h3 className="course-card-title">{course.title}</h3>
        <p className="course-card-desc">{course.description}</p>

        <div className="course-card-instructor">
          <span className="instr-avatar">{course.instructor?.name?.[0] || 'I'}</span>
          <span>{course.instructor?.name || 'Instructor'}</span>
        </div>

        <div className="course-card-meta">
          <div className="stars">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</div>
          <span className="course-card-students">{course.enrollmentCount || 0} students</span>
        </div>

        <div className="course-card-footer">
          <div className="course-card-price">
            {course.price === 0 ? (
              <span className="price-free">Free</span>
            ) : (
              <span className="price-paid">₹{course.price}</span>
            )}
          </div>
          <button
            className={`btn btn-sm ${isEnrolled ? 'btn-secondary' : 'btn-primary'}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isEnrolled && onEnroll) onEnroll(course);
              else navigate(`/courses/${course._id}`);
            }}
          >
            {isEnrolled ? 'Continue' : 'Enroll Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
