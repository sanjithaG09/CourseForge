import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('cf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cf_token');
      localStorage.removeItem('cf_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  signup: (data) => API.post('/auth/signup', data),
  verifySignupOTP: (data) => API.post('/auth/verify-signup-otp', data),
  resendSignupOTP: (data) => API.post('/auth/resend-signup-otp', data),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  verifyResetOTP: (data) => API.post('/auth/verify-reset-otp', data),
  resetPassword: (data) => API.post('/auth/reset-password', data),
  googleAuth: (data) => API.post('/auth/google', data),
  logout: () => API.post('/auth/logout'),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
  changeEmail: (data) => API.put('/auth/change-email', data),
  deleteAccount: () => API.delete('/auth/account'),
};

// ── Courses ─────────────────────────────────────────────────
export const courseAPI = {
  getAll: (params) => API.get('/courses', { params }),
  getById: (id) => API.get(`/courses/${id}`),
  getMyCourses: () => API.get('/courses/my/courses'),
  create: (data) => API.post('/courses', data),
  update: (id, data) => API.put(`/courses/${id}`, data),
  delete: (id) => API.delete(`/courses/${id}`),
  publish: (id) => API.put(`/courses/${id}/publish`),
};

// ── Search ──────────────────────────────────────────────────
export const searchAPI = {
  advanced: (params) => API.get('/search/courses', { params }),
  categories: () => API.get('/search/categories'),
  dashboard: () => API.get('/search/dashboard'),
};

// ── Enrollment ──────────────────────────────────────────────
export const enrollmentAPI = {
  enroll: (courseId) => API.post(`/enrollments/${courseId}`),
  getMyEnrollments: () => API.get('/enrollments/my'),
  markComplete: (courseId, moduleId) =>
    API.put(`/enrollments/${courseId}/modules/${moduleId}/complete`),
  getProgress: (courseId) => API.get(`/enrollments/${courseId}/progress`),
};

// ── Payments ────────────────────────────────────────────────
export const paymentAPI = {
  createIntent: (data) => API.post('/payments/create', data),
  confirmPayment: (data) => API.post('/payments/confirm', data),
  getMyOrders: () => API.get('/payments/my-orders'),
};

// ── Reviews ──────────────────────────────────────────────────
export const reviewAPI = {
  getCourseReviews: (courseId) => API.get(`/reviews/${courseId}`),
  addReview: (courseId, data) => API.post(`/reviews/${courseId}`, data),
  deleteReview: (courseId) => API.delete(`/reviews/${courseId}`),
};

// ── Wishlist ─────────────────────────────────────────────────
export const wishlistAPI = {
  getMyWishlist: () => API.get('/wishlist/my'),
  checkWishlist: (courseId) => API.get(`/wishlist/check/${courseId}`),
  addToWishlist: (courseId) => API.post(`/wishlist/${courseId}`),
  removeFromWishlist: (courseId) => API.delete(`/wishlist/${courseId}`),
};

export default API;
