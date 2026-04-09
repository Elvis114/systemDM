# 🏫 SchoolMS — Complete School Management System

A full-stack school management system built with **React**, **Node.js/Express**, and **MongoDB**.

---

## 🚀 Quick Start (3 steps)

### Step 1 — Install all dependencies
```bash
npm run install-all
```

### Step 2 — Set up your database
```bash
# Copy environment file
cp server/.env.example server/.env

# Edit server/.env and add your MongoDB connection string:
# MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/schoolDB

# Seed the database with sample Ghanaian school data
npm run seed
```

### Step 3 — Start the app
```bash
npm run dev
```

For local development, create `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

Open **http://localhost:3000**

---

## 🌐 Live Demo

The app is deployed and live!

- **Frontend**: https://elvis114.github.io/systemDM/
- **Backend API**: https://systemdm.onrender.com

Use the same login credentials above to test the live version.

---

## 🔐 Login Credentials

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@school.com       | admin123    |
| Teacher | teacher1@school.com    | teacher123  |
| Student | student1@school.com    | student123  |

---

## 📦 Modules

| Module        | Features                                                    |
|---------------|-------------------------------------------------------------|
| Dashboard     | Stats, bar/line/pie charts, announcements, events           |
| Students      | CRUD, search, filter, pagination, CSV export, detail view   |
| Teachers      | CRUD, assign subjects and class                             |
| Classes       | Card grid, create/edit/delete, view students                |
| Subjects      | Link to class and teacher                                   |
| Grades        | Record/edit grades, filter by term, auto letter grade       |
| Attendance    | Bulk mark per class, history view, summary stats            |
| Fees          | Record payments, summary cards, filter by status/term       |
| Events        | Add/edit school events, color-coded by type                 |
| Announcements | Post with priority, target by role                          |
| Settings      | Change password, view account info                          |

---

## 🗂 Project Structure

```
school-ms/
├── package.json          ← root scripts
├── server/               ← Express API (port 5000)
│   ├── index.js
│   ├── models/           ← 9 Mongoose schemas
│   ├── routes/           ← 10 route files
│   ├── controllers/      ← business logic
│   ├── middleware/        ← JWT auth, roles, errors
│   └── seed.js           ← sample data
│
└── client/               ← React app (port 3000)
    └── src/
        ├── pages/        ← 15 pages
        ├── components/   ← Layout, Modal, Badge, etc.
        ├── context/      ← AuthContext
        ├── hooks/        ← useFetch, useForm
        └── services/     ← Axios instance
```

---

## 🛠 Tech Stack

| Layer    | Technology                            |
|----------|---------------------------------------|
| Frontend | React 18, Vite, React Router v6, Recharts |
| Backend  | Node.js, Express.js                   |
| Database | MongoDB, Mongoose                     |
| Auth     | JWT, bcryptjs                         |
| Styling  | Inline styles (no CSS framework)      |
| Toasts   | react-hot-toast                       |

---

## 📝 Available Scripts

```bash
npm run dev          # Run both frontend and backend
npm run server       # Run backend only (port 5000)
npm run client       # Run frontend only (port 3000)
npm run seed         # Seed database with sample data
npm run install-all  # Install all dependencies
```

---

## 🌱 Seed Data Generated

- 1 Admin user
- 5 Teachers with different subjects
- 4 Classes (Grade 1A, 2B, 3C, 4D)
- 24 Subjects (6 per class)
- 30 Students with Ghanaian names
- Full Term 1 & Term 2 grade records
- Last 30 days attendance records
- Mix of Paid/Pending/Overdue fee records
- 5 School events
- 3 Active announcements

---

## ⚙️ Environment Variables

Create `server/.env`:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/schoolDB
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

---

## 🔑 User Roles & Permissions

| Feature       | Admin | Teacher | Student |
|---------------|-------|---------|---------|
| Students CRUD | ✅    | 👁 View | ❌      |
| Teachers CRUD | ✅    | ❌      | ❌      |
| Classes CRUD  | ✅    | 👁 View | ❌      |
| Grades CRUD   | ✅    | ✅      | 👁 Own  |
| Attendance    | ✅    | ✅      | 👁 Own  |
| Fees          | ✅    | ❌      | 👁 Own  |
| Events        | ✅    | ✅ Add  | 👁 View |
| Announcements | ✅    | ✅ Add  | 👁 View |
| Settings      | ✅    | ❌      | ❌      |
