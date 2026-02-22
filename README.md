# 🎓 My-Campus

A production-ready full-stack campus management web application built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend).

---

## 📑 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [How Each Feature Works](#how-each-feature-works)
   - [Authentication & Role System](#1-authentication--role-system)
   - [Notes Sharing](#2-notes-sharing)
   - [Faculty Cabin Finder](#3-faculty-cabin-finder)
   - [Anti-Proxy Attendance](#4-anti-proxy-attendance-system)
   - [CGPA Calculator](#5-gpa--cgpa-calculator)
   - [Admin Dashboard](#6-admin-dashboard)
5. [API Reference](#api-reference)
6. [Environment Variables](#environment-variables)
7. [Getting Started](#getting-started)
8. [Security Design](#security-design)
9. [Database Models](#database-models)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                     Browser                          │
│   React + Vite  (port 5173)                          │
│   Zustand state │ React Router │ Tailwind CSS        │
└──────────────┬───────────────────────────────────────┘
               │  HTTP/JSON  (VITE_API_BASE_URL)
               ▼
┌──────────────────────────────────────────────────────┐
│           Node.js + Express  (port 5000)             │
│   JWT Auth Middleware  │  Role Middleware             │
│   /api/auth  /api/notes  /api/cabins                 │
│   /api/attendance  /api/admin  /api/stats            │
└──────────────┬───────────────────────────────────────┘
               │  Mongoose ODM
               ▼
┌──────────────────────────────────────────────────────┐
│              MongoDB                                 │
│   Users │ Notes │ FacultyCabins │ Feedback           │
│   AttendanceSessions │ Attendances                   │
└──────────────────────────────────────────────────────┘
```

- Frontend and Backend are **completely decoupled** — no proxy server.  
- The frontend reads the backend URL from `VITE_API_BASE_URL` in its own `.env` file.  
- The backend reads all secrets (DB URI, JWT secret) from its own `.env` file.  
- The two apps can be deployed independently on different hosts/ports/domains.

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 + Vite 7 | UI framework + lightning-fast dev server |
| React Router DOM | Client-side routing & protected routes |
| Zustand | Lightweight global state (auth, theme) |
| Axios | HTTP client with JWT interceptors |
| Tailwind CSS v4 | Utility-first responsive styling |
| React Hook Form + Yup | Form management and validation |
| html5-qrcode | Camera-based QR code scanning |
| XLSX (SheetJS) | Excel upload/download for attendance |
| Lucide React | Icon library |

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server & REST API |
| MongoDB + Mongoose | NoSQL database + ODM |
| bcryptjs | Password hashing (salt rounds = 12) |
| jsonwebtoken | JWT creation & verification |
| Multer | Profile photo uploads |
| dotenv | `.env` file loading |
| uuid | Cryptographically random QR tokens |
| cors | Cross-origin request control |

---

## Folder Structure

```
My-Campus/
├── .gitignore                    ← root gitignore
├── README.md
│
├── Frontend/
│   ├── .env                      ← VITE_ public keys (not committed)
│   ├── .env.example              ← safe template to commit
│   ├── .gitignore
│   ├── vite.config.js            ← no proxy — direct API calls
│   └── src/
│       ├── api/
│       │   └── axios.js          ← Axios instance (reads VITE_API_BASE_URL)
│       ├── store/
│       │   ├── authStore.js      ← Zustand: user, token, logout
│       │   └── themeStore.js     ← Zustand: dark/light mode
│       ├── components/
│       │   ├── common/
│       │   │   ├── Avatar.jsx    ← Initials circle avatar
│       │   │   ├── Spinner.jsx
│       │   │   └── ProtectedRoute.jsx
│       │   └── layout/
│       │       ├── Layout.jsx    ← App shell (sidebar + header + outlet)
│       │       ├── Sidebar.jsx   ← Role-filtered navigation
│       │       └── Header.jsx    ← Page title + dark mode toggle
│       └── pages/
│           ├── auth/             ← Login, Register, BlockedPage
│           ├── dashboard/        ← Stats cards + quick access grid
│           ├── notes/            ← Notes list, search, add/edit modal
│           ├── faculty-cabins/   ← Cabin finder + feedback modal
│           ├── attendance/
│           │   ├── Attendance.jsx         ← Role dispatcher
│           │   ├── FacultyAttendance.jsx  ← Session management
│           │   └── StudentAttendance.jsx  ← QR scanner + device lock
│           ├── cgpa/             ← GPA + CGPA calculator
│           ├── admin/            ← User management, notes, complaints
│           └── profile/          ← Edit profile + photo upload
│
└── Backend/
    ├── .env                      ← secrets (not committed)
    ├── .env.example              ← safe template to commit
    ├── .gitignore
    ├── server.js                 ← Express app entry point
    ├── config/
    │   └── db.js                 ← Mongoose connection
    ├── models/
    │   ├── User.js
    │   ├── Note.js
    │   ├── FacultyCabin.js
    │   ├── Feedback.js
    │   ├── AttendanceSession.js
    │   └── Attendance.js
    ├── middleware/
    │   ├── auth.js               ← JWT protect middleware
    │   ├── roleMiddleware.js     ← restrictTo(...roles) guard
    │   └── upload.js             ← Multer profile photo handler
    ├── routes/
    │   ├── auth.js
    │   ├── notes.js
    │   ├── cabins.js
    │   ├── feedback.js
    │   ├── attendance.js
    │   ├── admin.js
    │   └── stats.js
    ├── scripts/
    │   └── seedAdmin.js          ← One-time admin account seed
    └── uploads/                  ← Profile photos (git-ignored)
```

---

## How Each Feature Works

### 1. Authentication & Role System

**Flow:**
```
User fills Register form
    → POST /api/auth/register
    → Server validates, hashes password (bcryptjs, 12 rounds)
    → Saves User document in MongoDB
    → Returns 201

User fills Login form
    → POST /api/auth/login
    → Server finds user by email, compares bcrypt hash
    → Signs a JWT (payload: {id}, secret from JWT_SECRET env)
    → Returns { token, user }

Frontend (authStore.js)
    → Stores token in localStorage (mc_token)
    → Stores user object in localStorage (mc_user)
    → Axios interceptor attaches "Authorization: Bearer <token>" to every request

Protected routes
    → ProtectedRoute.jsx checks token + user from Zustand store
    → Redirects to /login if missing, /blocked if user.isBlocked === true
    → Role-specific routes (e.g. /admin) redirect to /dashboard if wrong role
```

**Roles:**
| Role | Registration | Capabilities |
|---|---|---|
| `student` | Public register form | Notes, cabins (read), attendance scan, CGPA |
| `faculty` | Public register form | Notes, cabins (read), attendance host, CGPA |
| `admin` | Seed script only (one exists) | All of the above + full admin panel |

**Avatar logic:** If `profilePhoto` is empty, the UI generates an initials circle (e.g. "Shivakant Kurmi" → "SK") with a deterministic colour based on the name hash.

---

### 2. Notes Sharing

**How it works:**
- Users submit a **Google Drive / OneDrive URL** (not an actual file upload) along with metadata.
- Notes are stored in MongoDB with a reference to `uploadedBy` (User ObjectId).
- The list is publicly readable by all authenticated users.
- **Edit / Delete** is allowed only to the note's owner or an Admin.

**API flow:**
```
GET    /api/notes          → returns all notes (populated with uploader name)
POST   /api/notes          → create note (auth required)
PUT    /api/notes/:id      → update note (owner or admin)
DELETE /api/notes/:id      → delete note (owner or admin)
```

**Frontend:** Subject filter chips + text search runs entirely on the client side against the fetched list for instant filtering with no extra API calls.

---

### 3. Faculty Cabin Finder

**How it works:**
- Cabin records store: faculty name, cabin number, contact, department.
- **Read** is open to all authenticated users (students, faculty, admin).
- **Write (Add / Edit / Delete)** is restricted to `admin` only via `restrictTo('admin')` middleware.
- Any user can submit a **feedback/complaint** (wrong cabin info, missing faculty, etc.) via the Report Issue modal, which posts to `/api/feedback`.

**API flow:**
```
GET    /api/cabins          → list all (auth required)
POST   /api/cabins          → create (admin only)
PUT    /api/cabins/:id      → update (admin only)
DELETE /api/cabins/:id      → delete (admin only)
POST   /api/feedback        → submit feedback (any auth user)
```

---

### 4. Anti-Proxy Attendance System

This is the most complex feature. It prevents students from sharing screenshots or tokens to mark attendance on behalf of others.

**Faculty flow:**
```
1. Faculty uploads Excel (Col A = Reg No, Col B = Name)
   OR manually adds students one by one

2. Clicks "Start Session"
   → POST /api/attendance/session
   → Server creates AttendanceSession with:
       - a UUID qrToken
       - expiresAt = now + 10 seconds
       - list of students

3. Frontend displays QR image (built from qrToken JSON)
   setInterval every 10 seconds:
   → POST /api/attendance/session/:id/refresh
   → Server generates new UUID qrToken, updates expiresAt
   → Frontend regenerates QR image

4. Faculty sees live attendance list (green = present)
   Can manually toggle any student Present/Absent

5. Clicks "End Session"
   → POST /api/attendance/session/:id/end
   → Session marked ended, presentCount saved
   
6. Downloads Excel sheet of results
```

**Student flow:**
```
1. Opens /attendance page
   → Sees "StudentAttendance" component (role-dispatched)

2. Enters Registration Number

3. Clicks "Open Camera & Scan"
   → html5-qrcode opens device camera
   → Scans the QR code displayed by faculty

4. QR decoded → POST /api/attendance/mark with:
   { token, regNo, deviceId }
   
   deviceId = stable fingerprint stored in localStorage
              (navigator.userAgent + random UUID, set once)

5. Server validates:
   ✅ Token matches an active session qrToken
   ✅ Session not ended
   ✅ Token not expired (within 10s window)
   ✅ regNo is in the session's student list
   ✅ deviceId not seen in last 20 minutes (any session)
   ✅ regNo not already present in this session

6. On success:
   → Attendance record created in DB
   → Frontend sets localStorage lock (mc_attendance_lock)
     with until = now + 20 minutes
   → UI shows "Device Locked — try after 20 min"
```

**Anti-proxy protections:**
| Protection | How |
|---|---|
| QR refresh every 10s | Old screenshots are useless |
| Token expiry (server-side) | Server rejects tokens older than 10s |
| Device lock (20 min) | `deviceId` checked in Attendance collection |
| Duplicate regNo block | DB unique index on (sessionId, studentRegNo) |
| Duplicate device block | DB unique index on (sessionId, deviceId) |

---

### 5. GPA & CGPA Calculator

**Runs entirely on the frontend — no API calls needed.**

**Grade → Points mapping:**

| Grade | Points | Note |
|---|---|---|
| S | 10 | |
| A | 9 | |
| B | 8 | |
| C | 7 | |
| D | 6 | |
| E | 5 | |
| F | 0 | |
| N1 | 0 | |
| N2 | 0 | |
| P | — | **Skipped** (Pass/Fail, non-graded) |

**Formula:**
```
GPA  = Σ(gradePoints × credits) / Σcredits
CGPA = Σ(gradePoints × credits across all semesters) / Σcredits
```

Credits allowed: `1, 1.5, 2, 3, 4, 5, 6, 10, 20, 40`

**GPA Tab** — calculates GPA for a single semester.  
**CGPA Tab** — add multiple semesters dynamically; CGPA auto-recalculates across all.

---

### 6. Admin Dashboard

**Access:** Only the single `admin` account (seeded via `scripts/seedAdmin.js`). The Register page blocks `role = admin` submissions.

**Capabilities:**

| Panel | What Admin Can Do |
|---|---|
| Users | View all users, search by name/email, Block / Unblock |
| Notes | View all notes, delete any note |
| Complaints | See all feedback/complaints submitted by users, mark resolved |

**Blocking flow:**
```
Admin blocks user
    → PATCH /api/admin/users/:id/block  { isBlocked: true }
    → User's next request hits protect middleware
    → Middleware checks user.isBlocked → returns 403
    → Axios 401 interceptor redirects to /login
    → ProtectedRoute checks isBlocked → redirects to /blocked

User on /blocked page
    → Submits an appeal message
    → POST /api/feedback  { type: 'unblock_appeal', message }
    → Admin sees it in Complaints panel
    → Admin resolves it + manually unblocks the user
```

---

## API Reference

All routes are prefixed with `/api`.  
Routes marked 🔒 require `Authorization: Bearer <token>` header.  
Routes marked 👑 require `role = admin`.

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register student or faculty |
| POST | `/auth/login` | — | Login, returns JWT + user |
| GET | `/auth/me` | 🔒 | Current user info |
| PUT | `/auth/profile` | 🔒 | Update name, department, password |
| PUT | `/auth/profile/photo` | 🔒 | Upload profile photo (multipart) |

### Notes
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/notes` | 🔒 | Get all notes |
| POST | `/notes` | 🔒 | Create note |
| PUT | `/notes/:id` | 🔒 | Update note (owner or admin) |
| DELETE | `/notes/:id` | 🔒 | Delete note (owner or admin) |

### Faculty Cabins
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/cabins` | 🔒 | List all cabins |
| POST | `/cabins` | 👑 | Add cabin |
| PUT | `/cabins/:id` | 👑 | Update cabin |
| DELETE | `/cabins/:id` | 👑 | Delete cabin |

### Feedback
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/feedback` | 🔒 | Submit feedback or appeal |

### Attendance
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/attendance/session` | 🔒 faculty | Start session + initial QR |
| POST | `/attendance/session/:id/refresh` | 🔒 faculty | Refresh QR token |
| GET | `/attendance/session/:id` | 🔒 faculty | Live attendance list |
| PATCH | `/attendance/session/:id/manual` | 🔒 faculty | Toggle student manually |
| POST | `/attendance/session/:id/end` | 🔒 faculty | End session |
| GET | `/attendance/history` | 🔒 faculty | Past sessions |
| POST | `/attendance/mark` | 🔒 student | Mark attendance via QR token |

### Admin
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/users` | 👑 | List all non-admin users |
| PATCH | `/admin/users/:id/block` | 👑 | Block / unblock user |
| GET | `/admin/complaints` | 👑 | All feedback/complaints |
| PATCH | `/admin/complaints/:id/resolve` | 👑 | Mark complaint resolved |

### Misc
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/stats` | 🔒 | Notes, users, cabins counts |
| GET | `/health` | — | Server health check |

---

## Environment Variables

### Frontend — `Frontend/.env`
```env
VITE_APP_NAME=My-Campus
VITE_API_BASE_URL=http://localhost:5000/api
```
> `VITE_` prefix makes the variable accessible in browser code via `import.meta.env.VITE_*`.  
> For production, change `VITE_API_BASE_URL` to your deployed backend URL.

### Backend — `Backend/.env`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/mycampus
JWT_SECRET=CHANGE_THIS_TO_A_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
> `JWT_SECRET` and `MONGO_URI` must never be committed to git.  
> Use `.env.example` files as safe templates.

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally or a MongoDB Atlas cluster

### 1 — Clone & install
```bash
git clone <repo-url>
cd "My Campus"

# Install frontend dependencies
cd Frontend
npm install

# Install backend dependencies
cd ../Backend
npm install
```

### 2 — Configure environment
```bash
# Backend
cp Backend/.env.example Backend/.env
# Edit Backend/.env → set MONGO_URI and a strong JWT_SECRET

# Frontend
cp Frontend/.env.example Frontend/.env
# Edit Frontend/.env → VITE_API_BASE_URL=http://localhost:5000/api
```

### 3 — Seed the admin account (run once)
```bash
cd Backend
node scripts/seedAdmin.js
# Credentials: admin@mycampus.edu / Admin@123  ← change after first login
```

### 4 — Start the servers

**Backend (terminal 1):**
```bash
cd Backend
npm run dev          # uses nodemon — auto-restarts on file changes
# or: npm start      # production start
```

**Frontend (terminal 2):**
```bash
cd Frontend
npm run dev          # Vite dev server at http://localhost:5173
```

### 5 — Build for production
```bash
cd Frontend
npm run build        # outputs to Frontend/dist/
```
Serve `dist/` with any static host (Vercel, Netlify, Nginx).  
Deploy the Backend to Railway, Render, or any Node.js host.

---

## Security Design

| Concern | Implementation |
|---|---|
| Password storage | bcryptjs, 12 salt rounds |
| API authentication | JWT (HS256), 7-day expiry |
| Route protection | `protect` middleware on every private route |
| Role-based access | `restrictTo(role)` middleware after `protect` |
| Admin isolation | Single admin, seed-only, register route blocks `admin` role |
| Blocked users | Checked inside `protect` — returns 403 immediately |
| QR proxy prevention | Token expires server-side every 10s + device lock |
| Device lock | `deviceId` fingerprint + 20-minute cooldown checked in DB |
| File uploads | Multer: image-only, 2 MB limit, stored server-side |
| CORS | Restricted to `CLIENT_URL` env value |
| Secrets | Never in code — only read from `.env` at runtime |

---

## Database Models

```
User
  name, email, password (hashed), role, department, profilePhoto, isBlocked

Note
  title, driveURL, subject, courseCode, faculty, slot, module, description
  uploadedBy → ref User

FacultyCabin
  facultyName, cabinNumber, contact, department

Feedback
  userId → ref User, message, type, status

AttendanceSession
  facultyId → ref User, qrToken, expiresAt, students[], ended, presentCount, totalStudents

Attendance
  sessionId → ref AttendanceSession, studentRegNo, deviceId, timestamp
  unique indexes: (sessionId + deviceId), (sessionId + studentRegNo)
```
