import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { authAPI } from '../utils/api';
import './Auth.css';

// step: 'email' → 'otp' → 'password'
export default function ForgotPassword() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const otpRefs = useRef([]);
  const toast = useToast();
  const navigate = useNavigate();

  // Step 1: Request OTP
  const submitEmail = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      toast.success('OTP sent! Check your email.');
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
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

  // Step 2: Verify OTP
  const submitOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the 6-digit OTP'); return; }
    setError('');
    setLoading(true);
    try {
      await authAPI.verifyResetOTP({ email, otp: code });
      setStep('password');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const submitPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      await authAPI.resetPassword({ email, otp: otp.join(''), newPassword });
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setError('');
    try {
      await authAPI.forgotPassword({ email });
      toast.success('New OTP sent!');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

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

        {/* ── Step indicator ── */}
        <div className="step-indicator">
          {['Email', 'Verify OTP', 'New Password'].map((label, i) => {
            const stepIndex = step === 'email' ? 0 : step === 'otp' ? 1 : 2;
            return (
              <React.Fragment key={label}>
                <div className={`step-dot ${i <= stepIndex ? 'active' : ''}`}>
                  {i < stepIndex ? <CheckIcon /> : i + 1}
                </div>
                {i < 2 && <div className={`step-line ${i < stepIndex ? 'active' : ''}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── Step 1: Email ── */}
        {step === 'email' && (
          <>
            <h1 className="auth-title">Forgot password?</h1>
            <p className="auth-sub">Enter your email and we'll send you a reset code</p>

            <form onSubmit={submitEmail} className="auth-form">
              {error && <div className="auth-error">{error}</div>}
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <button className="btn btn-primary btn-lg auth-submit" type="submit" disabled={loading}>
                {loading ? <><div className="spinner" /> Sending...</> : 'Send OTP'}
              </button>
            </form>
          </>
        )}

        {/* ── Step 2: OTP ── */}
        {step === 'otp' && (
          <>
            <h1 className="auth-title">Enter OTP</h1>
            <p className="auth-sub">We sent a 6-digit code to <strong>{email}</strong></p>

            <form onSubmit={submitOtp} className="auth-form">
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
                {loading ? <><div className="spinner" /> Verifying...</> : 'Verify OTP'}
              </button>
            </form>

            <div className="auth-divider"><span>Didn't receive the code?</span></div>
            <button className="btn btn-secondary btn-lg" style={{ width: '100%', marginTop: 4 }} onClick={resendOTP}>
              Resend OTP
            </button>
          </>
        )}

        {/* ── Step 3: New password ── */}
        {step === 'password' && (
          <>
            <h1 className="auth-title">New password</h1>
            <p className="auth-sub">Choose a strong password for your account</p>

            <form onSubmit={submitPassword} className="auth-form">
              {error && <div className="auth-error">{error}</div>}
              <div className="form-group">
                <label className="form-label">New password</label>
                <div className="input-password-wrap">
                  <input
                    className="input-field"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoFocus
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
              <button className="btn btn-primary btn-lg auth-submit" type="submit" disabled={loading}>
                {loading ? <><div className="spinner" /> Resetting...</> : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        <div className="auth-divider" style={{ marginTop: 20 }} />
        <Link to="/login" className="btn btn-secondary btn-lg" style={{ width: '100%', marginTop: 4 }}>
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
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
