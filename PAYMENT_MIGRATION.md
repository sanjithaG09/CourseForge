# Payment Migration Guide — Simulated → Razorpay

## What changed in this patch

### 1. `.env` — credentials scrubbed & Razorpay keys added
- **MongoDB password was exposed** in the original zip. The URI now uses
  `<DB_USER>:<DB_PASSWORD>` placeholders. Fill in your real (rotated) credentials.
- `JWT_SECRET` was a weak placeholder. Replace with a random 64-char string:
  ```
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- Two new keys needed:
  ```
  RAZORPAY_KEY_ID=rzp_test_REPLACE_WITH_YOUR_KEY
  RAZORPAY_KEY_SECRET=REPLACE_WITH_YOUR_SECRET
  ```
  Get them at https://dashboard.razorpay.com → Settings → API Keys.

### 2. `controllers/paymentController.js` — real Razorpay orders
- `createPaymentIntent` now creates a real Razorpay order and returns its `orderId`.
- `confirmPayment` now **verifies the HMAC-SHA256 signature** Razorpay returns.
  No signature = 400 error, no enrollment. The `amount` is always read from the
  database — the client-sent amount is ignored entirely.

### 3. `controllers/enrollmentController.js` — payment gate added
- `POST /enrollments/:courseId` now checks for a completed `Order` document
  before enrolling anyone in a paid course. Without a verified order it returns
  `403 Payment required`. Free courses (price = 0) still enroll directly.

### 4. `models/Order.js` — `razorpayOrderId` field added
- Stores the Razorpay `order_id` alongside the `paymentId` for reconciliation.

### 5. `frontend/src/pages/Payment.js` — Razorpay checkout widget
- Simulated UPI deep-link + 5-second auto-confirm is **removed**.
- The Razorpay checkout script is loaded on demand (no extra bundle weight).
- The widget handles UPI, cards, net banking, and wallets natively — including
  the real UPI payment redirect on mobile.
- `handler` callback only fires after Razorpay's own payment verification;
  it then calls `POST /payments/confirm` with the three Razorpay response fields.

## Setup steps

```bash
# 1. Install new backend dependency
npm install razorpay

# 2. Fill in your .env
#    - Rotate MongoDB password first, then paste the new URI
#    - Generate a new JWT_SECRET
#    - Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET

# 3. Start as usual
npm run dev
```

## Testing with Razorpay test mode

Use `rzp_test_*` keys. Test card: `4111 1111 1111 1111`, any future expiry, any CVV.
UPI test VPA: `success@razorpay`.

Full test credentials: https://razorpay.com/docs/payments/payments/test-card-upi-details/
