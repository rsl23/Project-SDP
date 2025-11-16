# BJM Parts - E-commerce Platform Sparepart Motor 🏍️

Platform e-commerce modern untuk penjualan sparepart motor dengan sistem manajemen inventory terintegrasi.

## 📋 Daftar Isi

- [Struktur Project](#struktur-project)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [Features](#features)
- [API Documentation](#api-documentation)

## 🏗️ Struktur Project

Project ini menggunakan **Monorepo Architecture** dengan struktur:

```
bjm-parts/
├── frontend/                 # React + Vite Frontend
│   ├── src/
│   │   ├── admin/           # Admin Panel Components
│   │   ├── cart/            # Shopping Cart
│   │   ├── product/         # Product Pages
│   │   ├── login/           # Authentication
│   │   ├── firebase/        # Firebase Config (Client SDK)
│   │   └── ...
│   ├── public/              # Static Assets
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Express.js Backend
│   ├── src/
│   │   ├── index.js         # Main API Server
│   │   └── firebase.js      # Firebase Admin SDK
│   ├── package.json
│   └── .env
│
├── package.json             # Root Workspace Config
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - UI Framework
- **Vite 7.1.7** - Build Tool & Dev Server
- **Tailwind CSS 4.1.14** - Styling
- **React Router 7.9.3** - Routing
- **Firebase Client SDK 12.3.0** - Authentication & Firestore
- **Framer Motion 12.23.22** - Animations
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

### Backend
- **Express.js 5.1.0** - REST API Server
- **Firebase Admin SDK 13.5.0** - Server-side Firebase Operations
- **CORS** - Cross-Origin Resource Sharing
- **Joi** - Input Validation
- **dotenv** - Environment Variables

### Database
- **Firebase Firestore** - NoSQL Database
- **Firebase Authentication** - User Management

## ✅ Prerequisites

Sebelum memulai, pastikan Anda sudah install:

- **Node.js** (v18 atau lebih tinggi)
- **npm** atau **yarn**
- **Git**
- **Firebase Account** dengan project aktif

## 📦 Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd projectSDP
```

### 2. Setup Environment Variables

#### Backend (.env)
Buat file `.env` di folder `backend/`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url
FIREBASE_UNIVERSE_DOMAIN=googleapis.com

PORT=5000
```

#### Frontend (.env)
Buat file `.env` di folder `frontend/`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

VITE_API_URL=http://localhost:5000
```

### 3. Install Dependencies

Dari root folder, jalankan:

```bash
npm install
npm install --workspaces
```

Atau install secara terpisah:

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

## 🚀 Running the Application

### Development Mode

#### Opsi 1: Run Semua Sekaligus (Recommended)
```bash
# Dari root folder
npm run dev
```

#### Opsi 2: Run Terpisah

**Terminal 1 - Backend:**
```bash
npm run dev:backend
# Backend akan jalan di http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
# Frontend akan jalan di http://localhost:5173
```

### Production Build

```bash
# Build frontend
npm run build:frontend

# Output ada di frontend/dist/
```

## 🌐 Deployment

### Frontend Deployment (Vercel/Netlify)

**Vercel:**
```bash
cd frontend
vercel --prod

# Atau via Vercel Dashboard:
# - Root Directory: frontend/
# - Build Command: npm run build
# - Output Directory: dist
```

**Netlify:**
```bash
cd frontend
netlify deploy --prod

# Atau via Netlify Dashboard:
# - Base directory: frontend/
# - Build command: npm run build
# - Publish directory: frontend/dist
```

### Backend Deployment (Railway/Render)

**Railway:**
```bash
cd backend
railway up

# Atau via Railway Dashboard:
# - Root Directory: backend/
# - Start Command: npm start
# - Port: 5000
```

**Render:**
```yaml
# render.yaml
services:
  - type: web
    name: bjm-parts-backend
    env: node
    rootDir: backend
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: PORT
        value: 5000
```

## ✨ Features

### User Features
- ✅ **Authentication** - Register, Login, Google OAuth
- ✅ **Product Catalog** - Browse sparepart dengan kategori
- ✅ **Product Detail** - Deskripsi lengkap, harga, stok
- ✅ **Shopping Cart** - Tambah, update, hapus item
- ✅ **Checkout** - Order placement dengan validasi stok
- ✅ **Order History** - Tracking status pesanan
- ✅ **Profile Management** - Update password, view info
- ✅ **Testimonials** - Lihat & submit review
- ✅ **External Links** - Tokopedia & Shopee integration

### Admin Features
- ✅ **Dashboard** - Overview statistics
- ✅ **Product Management** - CRUD operations
- ✅ **Stock Management** - Inventory ledger system
- ✅ **Order Management** - Accept/reject orders
- ✅ **User Management** - View users, role management
- ✅ **Testimonial Moderation** - Approve/reject reviews

### System Features
- ✅ **Inventory Ledger System** - Track stock movements
- ✅ **Real-time Stock Calculation** - masuk - keluar formula
- ✅ **Order Status Tracking** - pending → confirmed/returned
- ✅ **Role-based Access Control** - Admin vs User
- ✅ **API Fallback Mechanism** - Graceful error handling

## 📚 API Documentation

### Base URL
```
Development: http://localhost:5000
Production: <your-backend-url>
```

### Endpoints

#### Products
```http
GET    /api/products           # List all products dengan stok
POST   /api/products           # Create product
PUT    /api/products/:id       # Update product
DELETE /api/products/:id       # Delete product
PUT    /api/products/:id/stock # Update stock
```

#### Categories
```http
GET    /api/categories         # List all categories
POST   /api/categories         # Create category
PUT    /api/categories/:id     # Update category
DELETE /api/categories/:id     # Delete category
```

#### Orders
```http
GET    /api/orders             # List all orders (admin)
GET    /api/orders/user/:userId # User orders
POST   /api/orders             # Create order
POST   /api/orders/:id/confirm-stock  # Accept order
POST   /api/orders/:id/return-stock   # Reject order
```

#### Cart
```http
GET    /api/cart/:userId       # Get user cart
POST   /api/cart               # Add to cart
PUT    /api/cart/:id           # Update cart item
DELETE /api/cart/:id           # Remove from cart
```

#### Testimonials
```http
GET    /api/testimonials       # Approved testimonials
GET    /api/testimonials/all   # All (admin)
POST   /api/testimonials       # Submit testimonial
PUT    /api/testimonials/:id/approve # Approve
DELETE /api/testimonials/:id   # Delete
```

## 👥 User Roles

### Admin
- Email: `admin@bjmparts.com`
- Password: `admin123456` (Ganti setelah deploy!)
- Create via: `node create-admin.js`

### Regular User
- Register via `/register` page
- Login via `/login` page

## 🔒 Security Notes

1. **Ganti Admin Password** setelah deployment
2. **Jangan commit** file `.env` ke Git
3. **Gunakan HTTPS** di production
4. **Enable Firebase Security Rules**
5. **Rotate Firebase Keys** secara berkala

## 🐛 Troubleshooting

### Backend tidak jalan
```bash
# Cek port 5000 sudah dipakai?
netstat -ano | findstr :5000

# Kill process kalau perlu
taskkill /PID <process-id> /F

# Restart backend
npm run dev:backend
```

### Frontend tidak connect ke backend
- Cek `VITE_API_URL` di `frontend/.env`
- Pastikan backend jalan di port yang sama
- Cek CORS settings di `backend/src/index.js`

### Firebase errors
- Verify semua env variables sudah benar
- Cek Firebase Console untuk service account key
- Pastikan Firestore rules sudah di-setup

## 📄 License

ISC License

## 👨‍💻 Developer

BJM Parts Development Team

---

**Untuk pertanyaan atau issue, silakan buat GitHub Issue atau hubungi tim development.**
