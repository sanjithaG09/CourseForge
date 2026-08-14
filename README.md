# CourseForge

CourseForge is a full-stack online learning platform where students can browse and enroll in courses, track their learning progress, and manage their wishlist, while instructors can create, publish, and manage course content with real-time payment notifications.

## Features

User authentication with JWT, OTP email verification, and password reset.
Role-based access control for students, instructors, and admins.
Course marketplace with search, category filters, and pagination.
Module-level enrollment and progress tracking per student.
Instructor dashboard to create, edit, publish, and delete courses.
Draft course management for unpublished content.
Razorpay payment integration supporting UPI, cards, net banking, and wallets.
Server-side HMAC signature verification for all payments.
Real-time Socket.io notifications for payment confirmations and enrollment events.
Course reviews and ratings.
Wishlist to save courses for later.
User profile management including name, email, password change, and account deletion.
Email service for OTP verification, welcome emails, login alerts, and payment confirmations.
Redis and BullMQ for background job queuing.

## Tech Stack

**Backend**
- Node.js
- Express 5
- MongoDB and Mongoose
- JWT authentication and bcryptjs
- Nodemailer
- Socket.io
- BullMQ and Redis (ioredis)
- Razorpay

**Frontend**
- React 18
- React Router v6
- Socket.io-client
- Axios

## Project Structure

```
CourseForge-qr/
  config/                 MongoDB and Redis connection
  controllers/            Backend request handlers
  middleware/             JWT auth middleware
  models/                 Mongoose schemas
  routes/                 Express route definitions
  utils/                  Email service and helpers
  makeInstructor.js       CLI script to promote a user to instructor
  server.js               Backend entry point
  frontend/
    src/
      context/            AuthContext, SocketContext
      components/         Sidebar, CourseCard, Toast, Layout, ProtectedRoute
      pages/              All page components
      utils/              api.js (Axios wrapper with JWT interceptor)
      styles/             global.css
```

## Important Files

`server.js` mounts middleware, routes, Socket.io, and starts the server.
`routes/authRoutes.js` defines all authentication and account endpoints.
`controllers/authController.js` handles signup, OTP, login, and account deletion.
`routes/paymentRoutes.js` defines payment creation and confirmation endpoints.
`controllers/paymentController.js` creates Razorpay orders and verifies HMAC signatures.
`controllers/enrollmentController.js` enforces payment gate before enrolling students in paid courses.
`models/Order.js` stores Razorpay order IDs for payment reconciliation.
`utils/emailService.js` contains Nodemailer templates and send helpers for all email types.
`frontend/src/pages/Payment.js` loads the Razorpay checkout widget and handles the payment flow.
`frontend/src/pages/CourseDetail.js` shows course info and conditionally renders the enroll or payment button.
`frontend/src/pages/InstructorDashboard.js` powers the instructor content management experience.
`frontend/src/pages/MyLearning.js` displays enrolled courses and module-level progress.

## Engagement and Background Jobs

CourseForge includes an engagement system that tracks user activity and uses background jobs to send automated reminders.

The system records activities such as course views, enrollments, lesson completion, and searches. Scheduled jobs identify inactive students and instructors and queue reminder emails for them.

Redis is used for job storage and BullMQ is used to manage and process the background jobs asynchronously. This keeps reminder processing separate from normal API requests and helps prevent background tasks from blocking the main application.

The main implementation is located in `p6-intelligence/`.

## Database

**MongoDB** is used as the primary database, connected via **Mongoose**. The connection is established in `server.js` using `MONGO_URI` from `.env`, with a fallback to a local instance at `mongodb://127.0.0.1:27017/courseforge`.

### Collections and Schemas

**User**
Stores all registered accounts. The `role` field (`student`, `instructor`, `admin`) controls what each user can access. OTP fields (`signupOTP`, `signupOTPExpires`, `resetPasswordOTP`, `resetPasswordOTPExpires`) are stored directly on the user document and cleared after verification. Email is enforced unique and lowercased.

**Course**
Stores course content and metadata. Each course embeds an array of `modules` (sub-documents with title, video URL, duration, and order) so module data is retrieved in a single query alongside the course. The `instructor` field is a reference to the User collection. A compound text index on `title`, `description`, and `tags` powers the course search endpoint.

**Enrollment**
Tracks which student is enrolled in which course. Stores `completedModules` as an array of module ObjectIds, a `progress` percentage, `isCompleted` flag, and `lastAccessedAt` timestamp. A unique compound index on `(user, course)` prevents duplicate enrollments even under concurrent requests. A single-field index on `user` speeds up dashboard queries.

**Order**
Records payment transactions. Stores the `user`, `course`, `amount`, a `paymentId` (UTR or transaction reference entered by the user), an internal `upiRef`, and a `status` enum (`pending`, `completed`, `failed`). The backend always reads the amount from this collection — never from the client — before enrolling a student.

**Review**
One review per user per course, enforced by a unique compound index on `(user, course)`. Stores a `rating` (1–5) and a `comment` (max 1000 characters). A single-field index on `course` makes loading all reviews for a course page fast.

**Wishlist**
One entry per user per course, enforced by a unique compound index on `(user, course)`. A single-field index on `user` speeds up fetching a user's full wishlist.

**ActivityLog**
Append-only log of user actions (`view`, `enroll`, `complete_lesson`, `search`) with a `metadata` object for flexible extra data and a `timestamp`. Indexed on `userId` for fast per-user analytics queries.

### Indexes Summary

| Collection | Index | Purpose |
|---|---|---|
| User | `email` (unique) | Enforce unique accounts |
| Course | `title, description, tags` (text) | Full-text course search |
| Enrollment | `(user, course)` (unique) | Prevent duplicate enrollments |
| Enrollment | `user` | Fast student dashboard queries |
| Order | `(user, course)` | Payment lookup per student per course |
| Review | `(user, course)` (unique) | One review per student per course |
| Review | `course` | Fast review listing per course page |
| Wishlist | `(user, course)` (unique) | Prevent duplicate wishlist entries |
| Wishlist | `user` | Fast wishlist fetch per user |
| ActivityLog | `userId` | Fast per-user analytics queries |

### Relationships

```
User ──< Enrollment >── Course
User ──< Order     >── Course
User ──< Review    >── Course
User ──< Wishlist  >── Course
User ──< ActivityLog
Course ──[ modules ]   (embedded sub-documents)
```

All cross-collection references use Mongoose `ObjectId` refs and are populated with `.populate()` where needed (for example, `course.instructor` is populated when returning course detail pages).

## Prerequisites

- Node.js and npm
- MongoDB Atlas or local MongoDB connection string
- Redis instance (local or cloud)
- Razorpay account with API keys
- Gmail account with 2-Step Verification enabled for email sending

## Environment Variables

Create a root `.env` file for the backend:

```
PORT=3000
FRONTEND_URL=http://localhost:3001
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
JWT_SECRET=<your-64-char-secret>
REDIS_URL=redis://localhost:6379
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=<your-razorpay-secret>
EMAIL_USER=<your-gmail-address>
EMAIL_PASS=<your-gmail-app-password>
```

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Installation

Install backend dependencies from the project root:

```bash
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Running Locally

Start the backend from the project root:

```bash
npm run dev
```

or:

```bash
npm start
```

Start the frontend in a second terminal:

```bash
cd frontend
npm start
```

Default local URLs:

```
Backend:  http://localhost:3000
Frontend: http://localhost:3001
```

## Promoting a User to Instructor

```bash
node makeInstructor.js <user-email>
```

## API Overview

**Auth**
```
POST /api/auth/signup
POST /api/auth/verify-otp
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/change-password
DELETE /api/auth/account
```

**Courses**
```
GET    /api/courses
GET    /api/courses/:id
POST   /api/courses
PUT    /api/courses/:id
DELETE /api/courses/:id
```

**Enrollment**
```
POST /api/enrollments/:courseId
GET  /api/enrollments/my
```

**Payments**
```
POST /api/payments/create
POST /api/payments/confirm
```

**Trips and Wishlist**
```
POST   /api/wishlist/:courseId
DELETE /api/wishlist/:courseId
GET    /api/wishlist
```

**Reviews**
```
POST   /api/reviews/:courseId
GET    /api/reviews/:courseId
DELETE /api/reviews/:reviewId
```

**Search**
```
GET /api/search?q=<query>
```

## Payment Flow

1. Student clicks Enroll on a paid course and is redirected to `/payment/:courseId`.
2. The frontend calls `POST /api/payments/create` to generate a Razorpay order server-side.
3. The Razorpay checkout widget loads and handles UPI, card, or net banking.
4. On success, the frontend sends the three Razorpay response fields to `POST /api/payments/confirm`.
5. The backend verifies the HMAC-SHA256 signature, marks the order as paid, and enrolls the student.
6. Both the student and instructor receive a real-time Socket.io notification.

Free courses (price = 0) skip this flow and enroll directly.

For testing with `rzp_test_*` keys, use card `4111 1111 1111 1111` with any future expiry and CVV, or UPI VPA `success@razorpay`.

## Email Setup (Gmail)

1. Go to myaccount.google.com/security and enable **2-Step Verification**.
2. Go to myaccount.google.com/apppasswords, create an app password for Mail, and copy the 16-character code.
3. Set `EMAIL_USER` and `EMAIL_PASS` in `.env`.

## Notes

- Do not commit `.env` files.
- Use a Gmail app password, not your normal Gmail password.
- Instructors cannot enroll in their own courses.
- Duplicate email registrations with a conflicting role are blocked at signup.
- Payment amounts are always read from the database server-side — client-sent values are ignored.
- MongoDB connection errors are logged without crashing the backend during local development.
