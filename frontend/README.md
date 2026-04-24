# CourseForge Frontend (P1)

## Setup

```bash
npm install
cp .env.example .env
npm start
```

The app runs on http://localhost:3001 by default.

## Project Structure

```
src/
  context/        # AuthContext, SocketContext
  components/     # Sidebar, CourseCard, Toast, Layout, ProtectedRoute
  pages/          # Login, Register, Dashboard, Courses, CourseDetail,
                  # MyLearning, Profile, InstructorCourses, CourseForm
  utils/          # api.js (all axios calls)
  styles/         # global.css
```

## API Integration

All API calls are in `src/utils/api.js`. The base URL is configured via `REACT_APP_API_URL`.

JWT token is auto-attached to every request via axios interceptor.

## Key Features
- JWT auth with role-based routing (student/instructor/admin)
- Course browsing with search, filter, pagination
- Enrollment + progress tracking with module completion
- Instructor dashboard: create/edit/publish/delete courses
- Real-time notifications via Socket.io
- Profile management (name, email, password)