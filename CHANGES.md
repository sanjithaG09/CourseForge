# CourseForge — Changes & New Features

## 1. Payment System (Simulated UPI Flow)
- **New page:** `frontend/src/pages/Payment.js` + `Payment.css`
- 3-step flow: Details → Payment Method → UPI App selection
- Clicking "Enroll Now" on a paid course redirects to `/payment/:courseId`
- UPI deep-link (`upi://pay?...`) is triggered to open installed UPI apps on mobile
- After 5s, payment is confirmed server-side via `/api/payments/confirm`
- **Instructor gets a Socket.io notification:** "₹X received! Student enrolled in Course Y"
- **Student gets a Socket.io notification:** "Payment of ₹X successful! You are enrolled in Course Y"
- No Stripe required — all simulated server-side

## 2. Instructor Cannot Enroll in Their Own Courses
- `CourseDetail.js` now detects if `course.instructor._id === user.id`
- If true, shows "📚 This is your course" badge instead of Enroll button
- Instructors CAN enroll in other instructors' courses

## 3. Duplicate Email / Role Conflict Prevention
- `authController.js signup` now checks if an existing verified account uses the same email with a different role
- Error: "This email is already registered as instructor. You cannot create a student account with the same email."

## 4. Delete Account (Profile → General Tab)
- New "Danger Zone" section at bottom of General settings tab
- Two-step confirmation before deletion
- Calls `DELETE /api/auth/account`, deletes user from DB, logs out
- Backend: `authController.deleteAccount` + route `DELETE /auth/account`

## 5. Purple Theme
- All primary buttons, active nav links, badges, and focus rings now use purple (`#7c3aed`)
- CSS variable overrides in `global.css`: `--accent: #7c3aed`, `--accent2: #a78bfa`

## 6. No Stripe Dependency
- Removed `stripe` from backend `package.json`
- Removed Stripe webhook raw-body middleware from `server.js`
- Payment is confirmed via `POST /api/payments/confirm` after simulated UPI redirect
