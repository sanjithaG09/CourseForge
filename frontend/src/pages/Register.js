import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { authAPI } from '../utils/api';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // OTP step state
  const [otpStep, setOtpStep] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resending, setResending] = useState(false);
  const otpRefs = useRef([]);

  const { signup, verifySignupOTP } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const result = await signup(form.name, form.email, form.password, form.role);
      if (result.requiresOTP) {
        setPendingEmail(result.email);
        setOtpStep(true);
        toast.success('OTP sent! Check your email.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the 6-digit OTP'); return; }
    setError('');
    setLoading(true);
    try {
      const user = await verifySignupOTP(pendingEmail, code);
      toast.success(`Welcome to CourseForge, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setResending(true);
    setError('');
    try {
      await authAPI.resendSignupOTP({ email: pendingEmail });
      toast.success('New OTP sent to your email!');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  if (otpStep) {
    return (
      <div className="auth-page">
        <div className="auth-bg">
          <div className="auth-orb auth-orb1" />
          <div className="auth-orb auth-orb2" />
        </div>

        <div className="auth-card fade-in">
          <div className="auth-brand">
            <div className="auth-logo">CF</div>
            <span>CourseForge</span>
          </div>

          <h1 className="auth-title">Verify your email</h1>
          <p className="auth-sub">
            We sent a 6-digit code to <strong>{pendingEmail}</strong>
          </p>

          <form onSubmit={verifyOTP} className="auth-form">
            {error && <div className="auth-error">{error}</div>}

            <div className="otp-row" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  className="otp-box"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <button className="btn btn-primary btn-lg auth-submit" type="submit" disabled={loading}>
              {loading ? <><div className="spinner" /> Verifying...</> : 'Verify Email'}
            </button>
          </form>

          <div className="auth-divider"><span>Didn't receive the code?</span></div>
          <button
            className="btn btn-secondary btn-lg"
            style={{ width: '100%', marginTop: 4 }}
            onClick={resendOTP}
            disabled={resending}
          >
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb1" />
        <div className="auth-orb auth-orb2" />
      </div>

      <div className="auth-card fade-in">
        <div className="auth-brand">
          <div className="auth-logo">CF</div>
          <span>CourseForge</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Start your learning journey today</p>

        <form onSubmit={submit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Full name</label>
            <input className="input-field" type="text" name="name" placeholder="Your name"
              value={form.name} onChange={handle} required />
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="input-field" type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handle} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-password-wrap">
              <input
                className="input-field"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handle}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff /> : <EyeOn />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">I am joining as</label>
            <div className="role-toggle">
              <button
                type="button"
                className={`role-btn ${form.role === 'student' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'student' })}
              >
                <span>🎓</span> Student
              </button>
              <button
                type="button"
                className={`role-btn ${form.role === 'instructor' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'instructor' })}
              >
                <span>🏫</span> Instructor
              </button>
            </div>
          </div>

          <button className="btn btn-primary btn-lg auth-submit" type="submit" disabled={loading}>
            {loading ? <><div className="spinner" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider"><span>Already have an account?</span></div>
        <Link to="/login" className="btn btn-secondary btn-lg" style={{ width: '100%', marginTop: 4 }}>
          Sign in
        </Link>
      </div>
    </div>
  );
}

function EyeOn() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}
