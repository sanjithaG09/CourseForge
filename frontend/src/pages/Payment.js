import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { paymentAPI, courseAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import './Payment.css';

/* ─── Steps ───────────────────────────────────────────────── */
const STEP_DETAILS = 'details';
const STEP_QR      = 'qr';
const STEP_SUCCESS = 'success';

/* ─── Load qrcode.js from CDN once ───────────────────────── */
function loadQRLib() {
  return new Promise((resolve) => {
    if (window.QRCode) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}

/* ─── Step indicator ──────────────────────────────────────── */
function StepBar({ step }) {
  const steps = [
    { key: STEP_DETAILS, label: 'Details' },
    { key: STEP_QR,      label: 'Pay via QR' },
    { key: STEP_SUCCESS, label: 'Done' },
  ];
  const cur = steps.findIndex(s => s.key === step);
  return (
    <div className="pay-stepbar">
      {steps.map((s, i) => (
        <React.Fragment key={s.key}>
          <div className={`pay-step ${i <= cur ? 'active' : ''} ${i < cur ? 'done' : ''}`}>
            <div className="pay-step-dot">{i < cur ? '✓' : i + 1}</div>
            <span className="pay-step-label">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`pay-step-line ${i < cur ? 'done' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─── Success check icon ──────────────────────────────────── */
function CheckIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <circle cx="36" cy="36" r="36" fill="rgba(16,185,129,0.12)" />
      <circle cx="36" cy="36" r="30" stroke="#10b981" strokeWidth="2.5" />
      <polyline points="22,37 31,46 50,26"
        stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── QR step: renders QR + UTR confirmation ──────────────── */
function QRStep({ upiString, txnRef, amount, upiVpa, courseId, course, onSuccess }) {
  const qrRef  = useRef(null);
  const qrObj  = useRef(null);
  const toast  = useToast();
  const [utr, setUtr]           = useState('');
  const [confirming, setConf]   = useState(false);
  const [timer, setTimer]       = useState(10 * 60); // 10 min countdown
  const [showUTR, setShowUTR]   = useState(false);
  const { user } = useAuth();

  /* Render QR inside the div */
  useEffect(() => {
    let interval;
    loadQRLib().then((ok) => {
      if (!ok || !qrRef.current) return;
      qrRef.current.innerHTML = '';
      qrObj.current = new window.QRCode(qrRef.current, {
        text: upiString,
        width: 220,
        height: 220,
        colorDark: '#1e1b4b',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.M,
      });
    });

    /* Countdown timer */
    interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [upiString]);

  const fmt = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleConfirm = async () => {
    if (!utr.trim() || utr.trim().length < 6) {
      toast.error('Please enter your UTR / Transaction ID (min 6 chars)');
      return;
    }
    setConf(true);
    try {
      await paymentAPI.confirmPayment({ courseId, utrNumber: utr.trim(), txnRef });
      onSuccess(utr.trim().toUpperCase());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Confirmation failed. Please try again.');
    } finally {
      setConf(false);
    }
  };

  return (
    <div className="pay-form">
      <h2 className="pay-form-title">Scan & Pay</h2>
      <p className="pay-form-sub">
        Scan the QR code below with any UPI app to pay <strong>₹{amount}</strong>
      </p>

      {/* QR Code Card */}
      <div className="pay-qr-card">
        <div className="pay-qr-header">
          <span className="pay-qr-logo">💳 CourseForge Pay</span>
          <span className={`pay-qr-timer ${timer < 60 ? 'urgent' : ''}`}>
            ⏱ {fmt(timer)}
          </span>
        </div>

        <div className="pay-qr-body">
          {/* QR rendered here by qrcodejs */}
          <div ref={qrRef} className="pay-qr-canvas" />
          <div className="pay-qr-amount-row">
            <span className="pay-qr-rupee">₹</span>
            <span className="pay-qr-amount-val">{amount}</span>
          </div>
          <div className="pay-qr-vpa">Pay to: <strong>{upiVpa}</strong></div>
        </div>

        <div className="pay-qr-steps">
          <div className="pay-qr-step-item"><span className="pay-qr-num">1</span>Open any UPI app (GPay, PhonePe, Paytm…)</div>
          <div className="pay-qr-step-item"><span className="pay-qr-num">2</span>Tap "Scan QR" and point at the code above</div>
          <div className="pay-qr-step-item"><span className="pay-qr-num">3</span>Confirm ₹{amount} payment in your UPI app</div>
          <div className="pay-qr-step-item"><span className="pay-qr-num">4</span>Enter the UTR / Transaction ID below</div>
        </div>
      </div>

      {/* Deep-link button for mobile */}
      <a
        href={upiString}
        className="pay-upi-deeplink"
        onClick={() => setTimeout(() => setShowUTR(true), 1500)}
      >
        📱 Open UPI App Directly
      </a>

      {/* UTR entry — always visible after a moment, or after clicking deep-link */}
      <div className="pay-utr-section">
        <button
          className="pay-utr-toggle"
          onClick={() => setShowUTR(v => !v)}
          type="button"
        >
          {showUTR ? '▲ Hide' : '▼ I have paid — Enter Transaction ID'}
        </button>

        {showUTR && (
          <div className="pay-utr-box">
            <label className="pay-utr-label">
              UTR / Transaction ID
              <span className="pay-utr-hint">
                (12-digit number from your UPI app's payment receipt)
              </span>
            </label>
            <input
              className="input-field pay-utr-input"
              value={utr}
              onChange={e => setUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 22))}
              placeholder="e.g. 123456789012"
              autoFocus
            />
            <button
              className="btn btn-primary pay-cta"
              onClick={handleConfirm}
              disabled={confirming || !utr.trim()}
              type="button"
            >
              {confirming
                ? <><div className="spinner" /> Verifying...</>
                : '✅ Confirm Payment'}
            </button>
          </div>
        )}
      </div>

      <div className="pay-security-row">
        <span>🔒 256-bit SSL</span>
        <span>🛡️ RBI Compliant UPI</span>
        <span>✅ Secure Checkout</span>
      </div>
    </div>
  );
}

/* ─── Main Payment Page ───────────────────────────────────── */
export default function Payment() {
  const { courseId } = useParams();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();
  const toast     = useToast();

  const [step, setStep]       = useState(STEP_DETAILS);
  const [course, setCourse]   = useState(location.state?.course || null);
  const [loading, setLoading] = useState(!course);
  const [intentData, setIntent] = useState(null);
  const [paidUtr, setPaidUtr]   = useState('');

  const [details, setDetails] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  /* Load course if not passed via router state */
  useEffect(() => {
    if (course) return;
    courseAPI.getById(courseId)
      .then(r => { setCourse(r.data.course || r.data); setLoading(false); })
      .catch(() => { toast.error('Course not found'); navigate('/courses'); });
  }, [courseId]); // eslint-disable-line

  /* ── Step 1 submit: validate details → create intent → show QR ── */
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!details.name.trim())  return toast.error('Please enter your name');
    if (!details.email.trim()) return toast.error('Please enter your email');
    if (!/^\d{10}$/.test(details.phone)) return toast.error('Please enter a valid 10-digit phone number');

    setSubmitting(true);
    try {
      const res = await paymentAPI.createIntent({ courseId });
      setIntent(res.data);
      setStep(STEP_QR);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !course) {
    return (
      <div className="pay-outer">
        <div className="pay-card" style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 220, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 40, borderRadius: 8, marginTop: 20 }} />
        </div>
      </div>
    );
  }

  /* ── Success screen ─────────────────────────────────────── */
  if (step === STEP_SUCCESS) {
    return (
      <div className="pay-outer pay-outer-center">
        <div className="pay-card pay-success-card">
          <CheckIcon />
          <h2 className="pay-success-title">Payment Successful! 🎉</h2>
          <p className="pay-success-sub">
            You are now enrolled in <strong>{course.title}</strong>
          </p>
          <div className="pay-success-details">
            <div className="pay-receipt-row">
              <span>Amount Paid</span>
              <span className="pay-receipt-val">₹{intentData?.amount || course.price}</span>
            </div>
            <div className="pay-receipt-row">
              <span>Paid To</span>
              <span className="pay-receipt-val">{intentData?.upiVpa || 'courseforge@ybl'}</span>
            </div>
            <div className="pay-receipt-row">
              <span>Course</span>
              <span className="pay-receipt-val">{course.title}</span>
            </div>
            <div className="pay-receipt-row">
              <span>UTR / Txn ID</span>
              <span className="pay-receipt-val pay-txn">{paidUtr || '—'}</span>
            </div>
          </div>
          <p className="pay-success-notify">
            📬 Notifications sent to you and the instructor!
          </p>
          <div className="pay-success-btns">
            <button className="btn btn-primary" onClick={() => navigate('/my-learning')}>
              🚀 Start Learning →
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/courses')}>
              Browse More Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pay-outer">
      {/* ── Course sidebar ──────────────────────────────────── */}
      <div className="pay-course-summary">
        {course.thumbnail && (
          <img src={course.thumbnail} alt={course.title} className="pay-course-thumb" />
        )}
        <div className="pay-course-info">
          {course.category && (
            <div className="pay-course-badge">{course.category}</div>
          )}
          <h3 className="pay-course-title">{course.title}</h3>
          <p className="pay-course-instructor">by {course.instructor?.name}</p>
          <div className="pay-course-price">
            <span className="pay-price-label">Total</span>
            <span className="pay-price-amount">₹{course.price}</span>
          </div>
          <div className="pay-secure-badge">🔒 Secure UPI Checkout</div>
        </div>
      </div>

      {/* ── Main flow card ──────────────────────────────────── */}
      <div className="pay-card">
        <StepBar step={step} />

        {/* STEP 1: Details */}
        {step === STEP_DETAILS && (
          <form className="pay-form" onSubmit={handleDetailsSubmit}>
            <h2 className="pay-form-title">Your Details</h2>
            <p className="pay-form-sub">Confirm your info — a QR code will be generated for payment</p>

            <div className="pay-field">
              <label>Full Name</label>
              <input
                className="input-field"
                value={details.name}
                onChange={e => setDetails({ ...details, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="pay-field">
              <label>Email Address</label>
              <input
                className="input-field"
                type="email"
                value={details.email}
                onChange={e => setDetails({ ...details, email: e.target.value })}
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="pay-field">
              <label>Phone Number</label>
              <div className="pay-phone-wrap">
                <span className="pay-phone-code">+91</span>
                <input
                  className="input-field pay-phone-input"
                  type="tel"
                  value={details.phone}
                  onChange={e => setDetails({ ...details, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="9876543210"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div className="pay-order-summary">
              <div className="pay-summary-row">
                <span>Course Price</span><span>₹{course.price}</span>
              </div>
              <div className="pay-summary-row pay-summary-total">
                <span><strong>Total Payable</strong></span><span><strong>₹{course.price}</strong></span>
              </div>
            </div>

            <button className="btn btn-primary pay-cta" type="submit" disabled={submitting}>
              {submitting
                ? <><div className="spinner" /> Generating QR...</>
                : `Generate Payment QR — ₹${course.price} →`}
            </button>
            <button
              type="button"
              className="btn btn-ghost pay-back"
              onClick={() => navigate(`/courses/${courseId}`)}
            >
              ← Back to Course
            </button>

            <div className="pay-security-row">
              <span>🔒 256-bit SSL</span>
              <span>🛡️ RBI Compliant</span>
              <span>✅ No card data stored</span>
            </div>
          </form>
        )}

        {/* STEP 2: QR + UTR */}
        {step === STEP_QR && intentData && (
          <QRStep
            upiString={intentData.upiString}
            txnRef={intentData.txnRef}
            amount={intentData.amount}
            upiVpa={intentData.upiVpa}
            courseId={courseId}
            course={course}
            onSuccess={(utr) => { setPaidUtr(utr); setStep(STEP_SUCCESS); }}
          />
        )}
      </div>
    </div>
  );
}
