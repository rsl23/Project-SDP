# 🚀 Development Guide - BJM Parts

## 📋 Cara Menjalankan Project

Project ini memiliki **2 bagian** yang harus dijalankan bersamaan:

1. **Frontend** (React + Vite) - Port 5173
2. **Backend** (Express + Firebase) - Port 3000

---

## 🎯 Quick Start

### **Opsi 1: Run Frontend & Backend Bersamaan (RECOMMENDED)**

```bash
npm run dev:full
```

Ini akan menjalankan:

- ✅ Backend server di `http://localhost:3000`
- ✅ Frontend dev server di `http://localhost:5173`

---

### **Opsi 2: Run Secara Terpisah**

**Terminal 1 - Backend:**

```bash
npm run server
```

**Terminal 2 - Frontend:**

```bash
npm run dev
```

---

## 📝 Available Scripts

| Command            | Deskripsi                           |
| ------------------ | ----------------------------------- |
| `npm run dev`      | Run frontend saja (Vite dev server) |
| `npm run server`   | Run backend saja (Express server)   |
| `npm run dev:full` | Run frontend + backend bersamaan    |
| `npm run build`    | Build frontend untuk production     |
| `npm run preview`  | Preview production build            |
| `npm run lint`     | Run ESLint                          |

---

## 🔧 Server Endpoints

### **Backend API (Port 3000)**

| Method | Endpoint            | Deskripsi        |
| ------ | ------------------- | ---------------- |
| GET    | `/api/products`     | Get all products |
| POST   | `/api/products`     | Add new product  |
| PUT    | `/api/products/:id` | Update product   |
| DELETE | `/api/products/:id` | Delete product   |

### **Frontend (Port 5173)**

- `http://localhost:5173/` - Home page
- `http://localhost:5173/login` - Login page
- `http://localhost:5173/register` - Register page
- `http://localhost:5173/products` - Products page

---

## 🛠️ Tech Stack

### **Frontend:**

- React 19.1
- Vite 7.1
- React Router DOM 7.9
- Tailwind CSS 4.1
- Framer Motion 12.23
- Firebase 12.3 (Client SDK)
- Joi 18.0 (Validation)

### **Backend:**

- Node.js + Express 5.1
- Firebase Admin SDK 13.5
- CORS 2.8
- dotenv 17.2

---

## ⚙️ Environment Setup

### **1. Install Dependencies**

```bash
npm install
```

### **2. Setup Environment Variables**

Buat file `.env` di root project:

```env
FIREBASE_PROJECT_ID=project-sdp-fpw
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@project-sdp-fpw.iam.gserviceaccount.com
```

Lihat `FIREBASE_ENV_SETUP.md` untuk detail lengkap.

### **3. Test Firebase Configuration**

```bash
node test-firebase-env.js
node test-firebase-init.js
```

---

## 🐛 Troubleshooting

### **Error: CORS request did not succeed**

**Penyebab:** Backend server belum running

**Solusi:**

```bash
# Terminal terpisah atau:
npm run dev:full
```

### **Error: Cannot find module 'dotenv'**

**Solusi:**

```bash
npm install
```

### **Error: Missing required environment variable**

**Solusi:** Cek file `.env` dan pastikan semua required variables ada

```bash
node test-firebase-env.js
```

### **Error: Port 3000 already in use**

**Solusi:** Kill process yang menggunakan port 3000

```powershell
# Windows PowerShell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### **Frontend bisa akses tapi data kosong**

**Cek:**

1. ✅ Backend server running? (`http://localhost:3000/api/products`)
2. ✅ Firestore sudah ada data?
3. ✅ Firebase rules allow read?

---

## 📦 Project Structure

```
projectSDP/
├── src/
│   ├── server/              # Backend server
│   │   ├── index.js         # Express server & routes
│   │   └── firebase.js      # Firebase Admin SDK
│   ├── apiService/          # Frontend API calls
│   │   └── productApi.js    # Product API functions
│   ├── components/          # Reusable components
│   ├── firebase/            # Firebase client config
│   │   └── config.js        # Firebase client SDK
│   ├── login/               # Login page
│   ├── register/            # Register page
│   ├── product/             # Product page
│   └── ...
├── .env                     # Environment variables (DO NOT COMMIT)
├── .env.example             # Template untuk .env
├── package.json             # Dependencies & scripts
└── vite.config.js           # Vite configuration
```

---

## 🔒 Security Notes

- ❌ **NEVER** commit `.env` to Git
- ❌ **NEVER** commit `serviceAccountKey.json` to Git
- ✅ Use `.env.example` as template
- ✅ Firebase credentials di `.env` sudah di-ignore
- ✅ Check `.gitignore` before pushing

---

## 🚀 Deployment

### **Frontend (Vercel/Netlify):**

1. Build: `npm run build`
2. Deploy folder: `dist/`
3. Set environment variables di hosting platform

### **Backend (Railway/Render/Heroku):**

1. Set environment variables (dari `.env`)
2. Start command: `node src/server/index.js`
3. Port: 3000 (atau dari `process.env.PORT`)

---

## 📚 Documentation

- [Firebase Setup Guide](./FIREBASE_ENV_SETUP.md)
- [API Documentation](./API_DOCUMENTATION.md) (buat jika perlu)
- [Deployment Guide](./DEPLOYMENT.md) (buat jika perlu)

---

## 🤝 Development Workflow

1. **Pull latest code:**

   ```bash
   git pull origin main
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Setup environment:**

   ```bash
   cp .env.example .env
   # Edit .env dengan credentials yang benar
   ```

4. **Run development servers:**

   ```bash
   npm run dev:full
   ```

5. **Test API:**

   - Backend: http://localhost:3000/api/products
   - Frontend: http://localhost:5173

6. **Make changes & test**

7. **Commit & push:**
   ```bash
   git add .
   git commit -m "Your message"
   git push origin your-branch
   ```

---

## 💡 Tips

- 💾 **Auto-save on edit:** Vite HMR (Hot Module Replacement) otomatis reload
- 🔍 **Debug:** Buka browser DevTools (F12) → Console/Network tab
- 📊 **Monitor backend:** Lihat terminal backend untuk logs
- 🔥 **Firebase Console:** https://console.firebase.google.com
- 📖 **React DevTools:** Install extension untuk debug React components

---

**Happy Coding! 🎉**

Need help? Check documentation atau tanya ke team!
