# 🚀 Quick Start Guide

Panduan cepat untuk menjalankan aplikasi BJM Parts.

## ⚡ 60 Detik Setup

### 1️⃣ Install Dependencies (10 detik)

```bash
npm install --workspaces
```

### 2️⃣ Setup Environment (20 detik)

**Backend:**

```bash
# File sudah ada di backend/.env
# Pastikan Firebase credentials sudah terisi
```

**Frontend:**

```bash
# File sudah ada di frontend/.env
# Pastikan VITE_API_URL = http://localhost:5000
```

### 3️⃣ Run Application (30 detik)

```bash
# Jalankan keduanya sekaligus
npm run dev
```

**Akses:**

- 🌐 Frontend: http://localhost:5173
- 🔌 Backend: http://localhost:5000

---

## 🎯 Common Tasks

### Run Backend Only

```bash
npm run dev:backend
# Atau
cd backend && npm run dev
```

### Run Frontend Only

```bash
npm run dev:frontend
# Atau
cd frontend && npm run dev
```

### Build for Production

```bash
npm run build:frontend
# Output: frontend/dist/
```

### Create Admin User

```bash
node create-admin.js
```

---

## 📁 Struktur Project

```
projectSDP/
├── frontend/        ← React + Vite
├── backend/         ← Express + Firebase Admin
└── package.json     ← Workspace config
```

---

## 🔑 Default Admin Credentials

```
Email: admin@bjmparts.com
Password: admin123456
```

**⚠️ GANTI PASSWORD SETELAH LOGIN!**

---

## 🐛 Troubleshooting

### Port sudah digunakan?

```bash
# Kill process di port 5000
netstat -ano | findstr :5000
taskkill /PID <process-id> /F
```

### Backend error?

```bash
# Cek apakah .env sudah benar
cd backend
cat .env
```

### Frontend tidak connect ke backend?

```bash
# Cek VITE_API_URL di frontend/.env
cd frontend
cat .env | findstr VITE_API_URL
# Harus: VITE_API_URL=http://localhost:5000
```

---

## 📚 Dokumentasi Lengkap

- **README.md** - Setup & Features
- **DEPLOYMENT_GUIDE.md** - Deploy to production
- **REFACTORING_SUMMARY.md** - What changed
- **ADMIN_PANEL_GUIDE.md** - Admin features

---

**Happy coding! 🚀**
