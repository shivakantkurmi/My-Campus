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
5. [UI & Animation System](#ui--animation-system)
6. [API Reference](#api-reference)
7. [Environment Variables](#environment-variables)
8. [Getting Started](#getting-started)
9. [Deployment](#deployment)
10. [Security Design](#security-design)
11. [Database Models](#database-models)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                     Browser                          │
│   React + Vite  (port 5173)                          │
│   Zustand state │ React Router │ Tailwind CSS v4     │
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
- The frontend reads the backend URL from `VITE_API_BASE_URL` in its own `.env`.
- The backend reads all secrets (DB URI, JWT secret) from its own `.env`.
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
| dotenv | `.env` file loading |
| crypto (built-in Node.js) | `randomUUID()` for QR tokens — no external package |
| cors | Cross-origin request control |

---

## Folder Structure

```
My-Campus/
├── .gitignore
├── README.md
│
├── Frontend/
│   ├── .env                        ← VITE_ public keys (not committed)
│   ├── .env.example
│   ├── .gitignore
│   ├── vite.config.js
│   └── src/
│       ├── api/
│       │   └── axios.js            ← Axios instance (reads VITE_API_BASE_URL)
│       ├── store/
│       │   ├── authStore.js        ← Zustand: user, token, logout
│       │   ├── cabinsStore.js      ← Zustand: cabin cache (load-once + refresh)
│       │   └── themeStore.js       ← Zustand: dark/light mode
│       ├── components/
│       │   ├── common/
│       │   │   ├── Avatar.jsx      ← Initials avatar with gradient (no photo)
│       │   │   ├── Modal.jsx       ← Portal modal (renders to <body>)
│       │   │   ├── Spinner.jsx
│       │   │   └── ProtectedRoute.jsx
│       │   └── layout/
│       │       ├── Layout.jsx      ← App shell (sidebar + header + outlet)
│       │       ├── Sidebar.jsx     ← Role-filtered navigation
│       │       └── Header.jsx      ← Page title + dark mode toggle
│       ├── index.css               ← Global animation library (15+ keyframes)
│       └── pages/
│           ├── landing/            ← Public landing page (default route /)
│           ├── auth/               ← Login, Register, BlockedPage
│           ├── dashboard/          ← Stats cards + quick access grid
│           ├── notes/              ← Notes list, search, add/edit modal
│           ├── faculty-cabins/     ← Cabin finder + feedback modal
│           ├── attendance/
│           │   ├── Attendance.jsx         ← Role dispatcher
│           │   ├── FacultyAttendance.jsx  ← Session management
│           │   └── StudentAttendance.jsx  ← QR scanner + device lock
│           ├── cgpa/               ← GPA + CGPA calculator
│           ├── admin/              ← User management, notes, complaints
│           └── profile/            ← Edit profile (name, dept, password)
│
└── Backend/
    ├── .env                        ← secrets (not committed)
    ├── .env.example
    ├── .gitignore
    ├── server.js                   ← Express app + auto-seeds admin on startup
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── User.js
    │   ├── Note.js
    │   ├── FacultyCabin.js
    │   ├── Feedback.js
    │   ├── AttendanceSession.js
    │   └── Attendance.js
    ├── middleware/
    │   ├── auth.js                 ← JWT protect middleware
    │   ├── roleMiddleware.js       ← restrictTo(...roles) guard
    │   └── upload.js
    ├── routes/
    │   ├── auth.js
    │   ├── notes.js
    │   ├── cabins.js
    │   ├── feedback.js
    │   ├── attendance.js
    │   ├── admin.js
    │   └── stats.js
    └── scripts/
        └── seedCabins.js           ← Seeds 371 VIT Bhopal faculty cabin records
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
| `admin` | **Auto-created on first server start** from env vars — exactly one can ever exist | All of the above + full admin panel |

**Single-Admin enforcement — three independent layers:**
```
Layer 1 — API (routes/auth.js)
    POST /api/auth/register rejects any request where role = "admin"
    with HTTP 403 before the document reaches the database.

Layer 2 — Mongoose model (models/User.js)
    pre('validate') hook: if another admin already exists, save is rejected.
    pre('save') hook: if role = admin and isBlocked = true,
    isBlocked is silently reset to false — admin can never be locked out.

Layer 3 — Block endpoint (routes/admin.js)
    PATCH /api/admin/users/:id/block returns 403 if target.role === 'admin'.
```

**Avatar logic:** No profile photo is stored. The UI always generates an initials circle (e.g. "Shivakant Kurmi" → "SK") with a deterministic color gradient based on the name hash.

---

### 2. Notes Sharing

- Users submit a **Google Drive / OneDrive URL** along with metadata (no file upload).
- **Edit / Delete** allowed only to the note owner or admin.
- The Notes form opens in a **portal modal** (`Modal.jsx`) so it always appears above layout animation stacking contexts.

```
GET    /api/notes          → all notes (populated with uploader name)
POST   /api/notes          → create (auth required)
PUT    /api/notes/:id      → update (owner or admin)
DELETE /api/notes/:id      → delete (owner or admin)
```

---

### 3. Faculty Cabin Finder

- **371 VIT Bhopal cabin records** are pre-seeded via `node scripts/seedCabins.js`.
- Cabin records store: faculty name, cabin number, contact. **Department is optional.**
- The Department field was removed from the Add/Edit form — only faculty name + cabin number are required.
- **Write** restricted to admin only; **Read** open to all authenticated users.
- **Client-side caching** via `cabinsStore.js` — all 371 records are fetched **once** on first visit and stored in Zustand. Navigating away and back is instant (no re-fetch). Cache is invalidated and refreshed only when an admin adds, edits, or deletes a cabin.
- **Pagination** — 30 cabins per page. Search runs across **all** 371 records (not just the current page), then the matching results are paginated. Page resets to 1 on every new search.
- Search matches on faculty name, cabin number, or department.
- Both the Add/Edit and Report Issue modals use the `Modal` portal component.

```
GET    /api/cabins          → list all (auth required)
POST   /api/cabins          → create (admin only)
PUT    /api/cabins/:id      → update (admin only)
DELETE /api/cabins/:id      → delete (admin only)
POST   /api/feedback        → submit feedback (any auth user)
```

---

### 4. Anti-Proxy Attendance System

**Faculty flow:**
```
1. Upload Excel (auto-detects any column order) or add students manually.
2. Start Session → server creates AttendanceSession with UUID qrToken, expiresAt = now+10s.
3. QR image displayed and refreshed every 10 seconds automatically.
4. Faculty sees live attendance list, can manually toggle Present/Absent.
5. End Session → presentCount saved.
6. Download Excel of results.
```

**Student flow:**
```
1. Enter Registration Number (case-insensitive — 23BCE0001 == 23bce0001).
2. Open camera → scan QR → POST /api/attendance/mark { token, regNo, deviceId }
   deviceId = hardware fingerprint derived from GPU renderer + canvas + screen metrics.
   This is computed from physical hardware — CANNOT be changed by clearing any storage.
3. Server checks: global 20-min device lock → token validity → regNo membership → duplicate.
4. On success → name shown ("Attendance marked present for Shivakant Kurmi!").
   Client-side lock timer stored in both localStorage AND cookie (20 min).
```

**Anti-proxy protections:**
| Protection | How |
|---|---|
| QR refresh every 10s | Old screenshots are useless |
| Token expiry (server-side) | Tokens older than 10s are rejected |
| Hardware device ID | `getHardwareDeviceId()` — GPU/canvas/screen hash, storage-independent |
| Global 20-min device lock | Server checks `deviceId` across ALL sessions before processing |
| Case-insensitive regNo | Server normalises to uppercase — typos like `23bce0001` accepted |
| Duplicate regNo | DB unique index on `(sessionId, studentRegNo)` |
| Duplicate device | DB unique index on `(sessionId, deviceId)` |
| Client-side lock UI | Both localStorage + cookie — survives single-storage clears |
| Success shows name | Server returns `studentName` confirming whose attendance was marked |

---

### 5. GPA & CGPA Calculator

Runs entirely on the frontend — no API calls.

**VIT Bhopal grade → points:**

| Grade | Meaning | Points |
|---|---|---|
| S | Outstanding | 10 |
| A | Excellent | 9 |
| B | Good | 8 |
| C | Average | 7 |
| D | Pass | 6 |
| E | Pass (low) | 5 |
| F | Fail | 0 |
| N1 | Failed a component | 0 |
| N2 | Debarred: attendance | 0 |
| N3 | Absent in FAT | 0 |
| N4 | Debarred: malpractice | 0 |
| P | Pass/Fail course | **Excluded entirely** |

**Supported credit values:** 1, 1.5, 2, 3, 4, 5, 6, 10, 20, 40

```
GPA  = Σ(gradePoints × credits) / Σcredits
CGPA = Σ(gradePoints × credits across all semesters) / Σcredits
```

**GPA Tab** — single semester. **CGPA Tab** — multiple semesters, each with an editable label and its own per-semester GPA badge.

**Result display:**
- Score is color-coded: ≥ 8.5 emerald, ≥ 7 indigo, ≥ 5.5 amber, < 5.5 red
- Performance label shown below the score: Outstanding 🏆 / Excellent 🌟 / Good 👍 / Average / Needs improvement
- Grade reference badge strip always visible so users can check point values at a glance
- Each course row previews the weighted points it contributes before the total is computed

---

### 6. Admin Dashboard

**Access:** Single admin auto-created on first server startup.

| Panel | Capabilities |
|---|---|
| Users | Filter by role, search, Block / Unblock |
| Notes | View all, delete any |
| Complaints | View all feedback, mark resolved |

Stat cards show counts for Students, Faculty, Admin, Notes, Open Complaints.

---

## UI & Animation System

All animation classes are defined in `Frontend/src/index.css`.

### Animation Classes

| Class | Effect |
|---|---|
| `mc-page` | Fade + slide up on page enter |
| `mc-fade-up` | Fade in from below (supports stagger) |
| `mc-flip-up` | 3D flip card entrance |
| `mc-bounce-drop` | Drop in with bounce |
| `mc-rubber-in` | Rubber-band scale entrance |
| `mc-scale-in` | Scale pop-in (used by modals) |
| `mc-slide-bounce` | Slide from left with bounce |
| `mc-float` | Gentle 4px vertical bob (4s loop) |
| `mc-drift` | Slow circular orbit (6–11s, decorative dots) |
| `mc-nudge` | Horizontal nudge (arrow icons) |
| `mc-gradient-text` | Animated gradient text fill |
| `mc-glow-border` | Animated indigo glow border |
| `mc-card-hover` | Lift + shadow on hover |
| `mc-btn` | Shine sweep on hover |
| `mc-pulse-glow` | Pulsing glow ring (avatar) |
| `mc-heartbeat` | Heartbeat scale pulse |
| `mc-skeleton` | Shimmer loading skeleton |
| `mc-stagger-1` … `mc-stagger-8` | Animation delay helpers |

### Portal Modal (`Modal.jsx`)

All modals render via `ReactDOM.createPortal` directly to `<body>`. This escapes the CSS stacking context created by layout animation transforms (`transform: translateY(0)` with `fill-mode: both`), preventing modals from appearing behind the sticky header. Features: backdrop-click dismiss, body scroll lock, `z-index: 9999`.

### Avatar (`Avatar.jsx`)

Profile photos removed. Always renders initials with deterministic gradient background (8 options, chosen by name hash). Uses inline `style={{ width, height }}` to avoid Tailwind JIT dynamic-class limitations.

### Responsive Design

- **Admin Dashboard** — tabs scroll horizontally; role filter buttons wrap; user table `min-w-[640px]` with `overflow-x-auto`
- **Faculty Cabins** — `grid sm:grid-cols-2 lg:grid-cols-3`
- **CGPA Calculator** — course rows use `grid grid-cols-2` for grade/credit inputs
- **Notes** — `grid sm:grid-cols-2 lg:grid-cols-3`
- **Attendance** — student panel `max-w-md mx-auto`; faculty table `overflow-x-auto`

---

## API Reference

All routes prefixed with `/api`. 🔒 = JWT required. 👑 = admin only.

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register student or faculty |
| POST | `/auth/login` | — | Login, returns JWT + user |
| GET | `/auth/me` | 🔒 | Current user info |
| PUT | `/auth/profile` | 🔒 | Update name, department, password |

### Notes
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/notes` | 🔒 | Get all notes |
| POST | `/notes` | 🔒 | Create note |
| PUT | `/notes/:id` | 🔒 | Update (owner or admin) |
| DELETE | `/notes/:id` | 🔒 | Delete (owner or admin) |

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
| POST | `/attendance/session` | 🔒 | Start session |
| POST | `/attendance/session/:id/refresh` | 🔒 | Refresh QR token |
| GET | `/attendance/session/:id` | 🔒 | Live attendance list |
| PATCH | `/attendance/session/:id/manual` | 🔒 | Toggle student manually |
| POST | `/attendance/session/:id/end` | 🔒 | End session |
| GET | `/attendance/history` | 🔒 | Past sessions |
| POST | `/attendance/mark` | 🔒 | Mark attendance via QR |

### Admin
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/users` | 👑 | List all non-admin users |
| PATCH | `/admin/users/:id/block` | 👑 | Block / unblock user |
| GET | `/admin/complaints` | 👑 | All feedback/complaints |
| PATCH | `/admin/complaints/:id/resolve` | 👑 | Mark resolved |

### Misc
| Method | Path | Description |
|---|---|---|
| GET | `/stats` | 🔒 Counts by role, notes, cabins |
| GET | `/health` | Server health check |

---

## Environment Variables

### Frontend — `Frontend/.env`
```env
VITE_APP_NAME=My-Campus
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend — `Backend/.env`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/mycampus
JWT_SECRET=CHANGE_THIS_TO_A_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Admin credentials — auto-seeded on first server startup
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@mycampus.edu
ADMIN_PASSWORD=CHANGE_BEFORE_DEPLOYING
ADMIN_DEPT=Administration
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)

### 1 — Clone & install
```bash
git clone <repo-url>
cd "My Campus"
cd Frontend && npm install
cd ../Backend && npm install
```

### 2 — Configure environment
```bash
cp Backend/.env.example Backend/.env
# Set MONGO_URI, JWT_SECRET, ADMIN_PASSWORD

cp Frontend/.env.example Frontend/.env
# Set VITE_API_BASE_URL=http://localhost:5000/api
```

### 3 — Seed cabin data (run once)
```bash
cd Backend
node scripts/seedCabins.js
# Inserts 371 VIT Bhopal faculty cabin records
```

### 4 — Start servers

**Backend:**
```bash
cd Backend
npm run dev    # nodemon
```
On first start the server **automatically creates the admin account** from `ADMIN_*` env vars if none exists. Watch for `✅ Admin auto-seeded` in the console.

**Frontend:**
```bash
cd Frontend
npm run dev    # http://localhost:5173
```

### 5 — Build for production
```bash
cd Frontend
npm run build   # outputs to Frontend/dist/
```

---

## Deployment

### Backend → Render

1. Push to GitHub.
2. New **Web Service** → root directory: `Backend` → Start command: `node server.js`
3. Add environment variables:

| Key | Value |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string |
| `ADMIN_EMAIL` | e.g. `admin@mycampus.edu` |
| `ADMIN_PASSWORD` | Strong password |
| `ADMIN_NAME` | `Admin` |
| `CLIENT_URL` | Your Vercel frontend URL |

Admin is auto-seeded on first deploy. No manual commands needed.

### Frontend → Vercel

1. Import repo → Root Directory: `Frontend`
2. Add environment variable:

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | e.g. `https://my-campus-api.onrender.com/api` |

### Seed cabins on production

Run once after deploying the backend (from Render Shell or locally with Atlas URI):
```bash
node scripts/seedCabins.js
```

---

## Security Design

| Concern | Implementation |
|---|---|
| Password storage | bcryptjs, 12 salt rounds |
| API authentication | JWT (HS256), 7-day expiry |
| Route protection | `protect` middleware on every private route |
| Role-based access | `restrictTo(role)` middleware |
| Single admin — Layer 1 | Register API rejects `role=admin` with 403 |
| Single admin — Layer 2 | Mongoose `pre('validate')` hook blocks second admin |
| Single admin — Layer 3 | Block endpoint returns 403 for admin target |
| Admin unblockable | `pre('save')` resets `isBlocked` to false for admin role |
| Admin credentials | Auto-seeded from `.env` — never hardcoded |
| Blocked users | `protect` middleware checks and returns 403 |
| QR proxy prevention | Token expires server-side every 10s + hardware device lock |
| Hardware device ID | `getHardwareDeviceId()` — WebGL GPU + canvas + screen hash, never stored in browser |
| Global device lock | Server queries MongoDB for any attendance from same `deviceId` in last 20 min before processing |
| Case-insensitive regNo | Server normalises to uppercase on both mark and session-list lookup |
| Client lock persistence | Lock timer in both localStorage + cookie — survives clearing either one |
| CORS | Restricted to `CLIENT_URL` env value |
| Modal z-index | Portal renders to `<body>` — immune to layout stacking contexts |
| Secrets | Never in source code — only read from `.env` at runtime |

---

## Database Models

```
User
  name, email, password (hashed), role, department, isBlocked
  (profilePhoto removed)

Note
  title, driveURL, subject, courseCode, faculty, slot, module, description
  uploadedBy → ref User

FacultyCabin
  facultyName, cabinNumber, contact, department (optional, default '')
  (371 VIT Bhopal records pre-seeded)

Feedback
  userId → ref User, message, type, status

AttendanceSession
  facultyId → ref User, qrToken, expiresAt, students[], ended, presentCount, totalStudents

Attendance
  sessionId → ref AttendanceSession, studentRegNo (normalised UPPERCASE), deviceId (hardware fingerprint), timestamp
  unique indexes: (sessionId + deviceId), (sessionId + studentRegNo)
```
