# BJM Parts - Backend Documentation

## 📋 Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Struktur Direktori](#struktur-direktori)
- [Instalasi dan Menjalankan](#instalasi-dan-menjalankan)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Stock Management System](#stock-management-system)
- [Error Handling](#error-handling)
- [Deployment](#deployment)

---

## 🎯 Gambaran Umum

Backend BJM Parts adalah REST API server yang dibangun dengan Express.js untuk melayani aplikasi e-commerce toko aksesoris sepeda motor. Server ini menangani semua operasi CRUD untuk produk, kategori, pesanan, keranjang, review, dan galeri, serta mengintegrasikan dengan Firebase Admin SDK untuk autentikasi dan database Firestore.

**Base URL:** `http://localhost:5000`

---

## 🛠️ Teknologi yang Digunakan

### Core Technologies

- **Node.js 20.18.3** - JavaScript runtime
- **Express.js 5.1.0** - Web framework
- **Firebase Admin SDK 13.5.0** - Backend Firebase integration

### Middleware & Utilities

- **CORS 2.8.5** - Cross-Origin Resource Sharing
- **dotenv 17.2.3** - Environment variables management

### Development Tools

- **Nodemon 3.1.10** - Auto-restart server pada perubahan file

### Database

- **Firestore** - NoSQL cloud database dari Firebase

---

## 📁 Struktur Direktori

```
backend/
├── src/
│   ├── index.js         # Main server file dengan semua routes
│   └── firebase.js      # Firebase Admin SDK initialization
│
├── .env                 # Environment variables (tidak di-commit)
├── create-admin.js      # Script untuk membuat admin user
├── package.json         # Dependencies dan scripts
└── README.md           # Dokumentasi ini
```

### File Descriptions

#### **src/index.js**

Main server file yang berisi:

- Express app configuration
- CORS setup
- 27 API endpoints untuk:
  - Products (GET, POST, PUT, DELETE)
  - Stock management (GET, POST, PUT)
  - Cart (GET, POST, PUT, DELETE)
  - Orders (GET, POST)
  - Categories (GET, POST, PUT, DELETE)
  - Reviews (GET, POST, DELETE)
  - Gallery (GET, POST, PUT, DELETE)
- Server initialization

#### **src/firebase.js**

Firebase Admin SDK configuration:

- Initialize admin app dengan service account
- Export Firestore database instance
- Export admin object untuk auth operations

#### **create-admin.js**

Utility script untuk membuat admin user pertama kali:

- Create user via Firebase Auth
- Set display name
- Save to Firestore dengan role "admin"

---

## 🚀 Instalasi dan Menjalankan

### Prerequisites

- Node.js 20.18.3 atau lebih tinggi
- npm atau yarn
- Firebase project dengan Firestore enabled
- Firebase service account credentials

### Instalasi

1. **Install dependencies:**

```bash
cd backend
npm install
```

2. **Setup environment variables:**

Buat file `.env` di folder `backend/` dengan isi:

```env
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com

# Server Configuration
PORT=5000
```

**⚠️ Important Notes:**

- Private key harus dalam format string dengan `\n` untuk newlines
- Dapatkan credentials dari Firebase Console → Project Settings → Service Accounts
- Jangan commit file `.env` ke Git!

3. **Membuat Admin User Pertama:**

```bash
npm run create-admin
```

Edit `create-admin.js` terlebih dahulu untuk mengatur email dan password admin.

4. **Menjalankan development server:**

```bash
npm run dev
```

Server akan berjalan di: `http://localhost:5000`

5. **Menjalankan production server:**

```bash
npm start
```

---

## 🌐 API Endpoints

### 📦 Products

#### **GET /api/products**

Mendapatkan semua produk dengan stok terkini.

**Response:**

```json
[
  {
    "id": "prod123",
    "nama": "Velg Racing",
    "kategori_id": "cat123",
    "kategori_nama": "Velg",
    "harga": 500000,
    "stok": 10,
    "img_url": "https://...",
    "deskripsi": "Velg racing ukuran 17",
    "link_tokopedia": "https://...",
    "link_shopee": "https://...",
    "active": true,
    "createdAt": {...}
  }
]
```

**Business Logic:**

- Menghitung stok dari tabel `stock` (masuk - keluar)
- Join dengan tabel `categories` untuk nama kategori
- Hanya menghitung stok keluar dengan status != "returned"

---

#### **POST /api/products**

Membuat produk baru dengan stok awal.

**Request Body:**

```json
{
  "nama": "Velg Racing",
  "kategori_id": "cat123",
  "harga": 500000,
  "img_url": "https://...",
  "deskripsi": "Velg racing ukuran 17",
  "link_tokopedia": "https://...",
  "link_shopee": "https://...",
  "stok": 10
}
```

**Response:**

```json
{
  "message": "Produk berhasil ditambahkan beserta stok awal",
  "id": "prod123",
  "stok": 10
}
```

**Validasi:**

- Nama, kategori_id, harga wajib diisi
- Kategori harus ada di database
- Stok awal (jika ada) akan dicatat sebagai "masuk" di tabel stock

---

#### **PUT /api/products/:id**

Update data produk (tanpa stok).

**Request Body:**

```json
{
  "nama": "Velg Racing Updated",
  "harga": 550000,
  "deskripsi": "Deskripsi baru"
}
```

**Response:**

```json
{
  "message": "Produk berhasil diupdate",
  "id": "prod123"
}
```

---

#### **PUT /api/products/:id/stock**

Update stok produk (reset stok).

**Request Body:**

```json
{
  "stok": 20
}
```

**Business Logic:**

1. Hitung stok saat ini dari tabel stock
2. Jika stok baru > stok lama → tambah entry "masuk"
3. Jika stok baru < stok lama → tambah entry "keluar" dengan status "adjustment"

**Response:**

```json
{
  "message": "Stok berhasil diupdate",
  "stokLama": 10,
  "stokBaru": 20,
  "selisih": 10,
  "tipe": "masuk"
}
```

---

#### **DELETE /api/products/:id**

Soft delete produk (set active = false).

**Response:**

```json
{
  "message": "Produk berhasil dihapus (soft delete)",
  "id": "prod123"
}
```

---

### 📊 Stock Management

#### **POST /api/stock**

Mencatat transaksi stok masuk/keluar manual.

**Request Body:**

```json
{
  "produk_id": "prod123",
  "tipe": "masuk",
  "jumlah": 5,
  "keterangan": "Restock dari supplier"
}
```

**Tipe:**

- `masuk` - Stok masuk (supplier, return, adjustment)
- `keluar` - Stok keluar (manual adjustment, rusak, dll)

**Response:**

```json
{
  "message": "Transaksi stok berhasil dicatat",
  "id": "stock123"
}
```

---

#### **GET /api/stock**

Mendapatkan riwayat transaksi stok.

**Query Parameters:**

- `produk_id` (optional) - Filter by product

**Response:**

```json
[
  {
    "id": "stock123",
    "produk_id": "prod123",
    "produk_nama": "Velg Racing",
    "tipe": "masuk",
    "jumlah": 10,
    "status": null,
    "keterangan": "Stok awal produk",
    "createdAt": {...}
  }
]
```

---

### 🛒 Cart

#### **GET /api/cart**

Mendapatkan keranjang user yang sedang login.

**Headers:**

```
Authorization: Bearer <firebase_id_token>
```

**Response:**

```json
[
  {
    "id": "cart123",
    "user_id": "user123",
    "produk_id": "prod123",
    "jumlah": 2,
    "produk": {
      "id": "prod123",
      "nama": "Velg Racing",
      "harga": 500000,
      "img_url": "https://...",
      "stok": 10,
      "kategori_nama": "Velg"
    },
    "createdAt": {...}
  }
]
```

**Business Logic:**

- Verify user authentication via Firebase token
- Join dengan tabel products untuk data produk lengkap
- Hitung stok terkini dari tabel stock

---

#### **POST /api/cart**

Menambahkan produk ke keranjang.

**Request Body:**

```json
{
  "produk_id": "prod123",
  "jumlah": 2
}
```

**Validasi:**

- User harus login (token valid)
- Produk harus ada dan active
- Stok harus cukup
- Jika produk sudah ada di cart → update jumlah

**Response:**

```json
{
  "message": "Produk berhasil ditambahkan ke keranjang",
  "id": "cart123"
}
```

---

#### **PUT /api/cart/:id**

Update jumlah item di keranjang.

**Request Body:**

```json
{
  "jumlah": 3
}
```

**Validasi:**

- Validasi stok tersedia
- Jumlah harus > 0

**Response:**

```json
{
  "message": "Keranjang berhasil diupdate",
  "id": "cart123"
}
```

---

#### **DELETE /api/cart/:id**

Menghapus item dari keranjang.

**Response:**

```json
{
  "message": "Item berhasil dihapus dari keranjang",
  "id": "cart123"
}
```

---

### 📋 Orders

#### **POST /api/orders**

Membuat order baru dari keranjang.

**Request Body:**

```json
{
  "userId": "user123",
  "items": [
    {
      "produk_id": "prod123",
      "jumlah": 2,
      "harga": 500000
    }
  ],
  "total": 1000000
}
```

**Business Logic:**

1. Validasi semua produk ada dan active
2. Validasi stok mencukupi untuk semua item
3. Buat order dengan status "pending"
4. Buat entry di tabel orders_items
5. **Reserve stok** dengan status "pending" di tabel stock (tipe: keluar)

**Response:**

```json
{
  "message": "Order berhasil dibuat. Stok di-reserve dengan status pending.",
  "orderId": "order123",
  "reservedStock": [...]
}
```

**⚠️ Penting:**

- Stok tidak langsung dikurangi, hanya di-reserve dengan status "pending"
- Admin harus accept/reject order untuk finalisasi stok

---

#### **POST /api/orders/:orderId/return-stock**

Mengembalikan stok jika order ditolak (admin reject).

**Business Logic:**

1. Ubah status semua stock entries order ini menjadi "returned"
2. Update order status menjadi "rejected"
3. Stok otomatis bertambah lagi (returned stock tidak dihitung keluar)

**Response:**

```json
{
  "message": "Stok berhasil dikembalikan untuk order xxx",
  "returnedCount": 3
}
```

---

#### **POST /api/orders/:orderId/confirm-stock**

Mengkonfirmasi stok keluar jika order diterima (admin accept).

**Business Logic:**

1. Ubah status semua stock entries order ini menjadi "confirmed"
2. Update order status menjadi "accepted"
3. Stok definitif berkurang

**Response:**

```json
{
  "message": "Stok berhasil dikonfirmasi untuk order xxx",
  "confirmedCount": 3
}
```

---

#### **GET /api/orders**

Mendapatkan daftar order.

**Query Parameters:**

- `userId` (optional) - Filter by user
- `status` (optional) - Filter by status (pending, accepted, rejected)

**Response:**

```json
[
  {
    "id": "order123",
    "user_id": "user123",
    "user_nama": "John Doe",
    "user_email": "john@example.com",
    "items": [
      {
        "produk_id": "prod123",
        "produk_nama": "Velg Racing",
        "jumlah": 2,
        "harga": 500000,
        "subtotal": 1000000
      }
    ],
    "total": 1000000,
    "status": "pending",
    "createdAt": {...}
  }
]
```

---

### 🏷️ Categories

#### **GET /api/categories**

Mendapatkan semua kategori.

**Response:**

```json
[
  {
    "id": "cat123",
    "nama": "Velg",
    "deskripsi": "Kategori untuk velg motor",
    "createdAt": {...}
  }
]
```

---

#### **POST /api/categories**

Membuat kategori baru.

**Request Body:**

```json
{
  "nama": "Velg",
  "deskripsi": "Kategori untuk velg motor"
}
```

**Response:**

```json
{
  "message": "Kategori berhasil ditambahkan",
  "id": "cat123"
}
```

---

#### **PUT /api/categories/:id**

Update kategori.

**Request Body:**

```json
{
  "nama": "Velg Racing",
  "deskripsi": "Updated description"
}
```

---

#### **DELETE /api/categories/:id**

Menghapus kategori.

**Validasi:**

- Tidak bisa hapus jika ada produk yang menggunakan kategori ini

**Response:**

```json
{
  "error": "Tidak bisa menghapus kategori yang masih digunakan produk"
}
```

atau

```json
{
  "message": "Kategori berhasil dihapus",
  "id": "cat123"
}
```

---

### ⭐ Reviews

#### **POST /api/reviews**

Membuat review produk.

**Request Body:**

```json
{
  "produk_id": "prod123",
  "user_id": "user123",
  "order_id": "order123",
  "rating": 5,
  "komentar": "Produk sangat bagus!"
}
```

**Validasi:**

- User harus sudah membeli produk (ada di order yang accepted)
- Rating 1-5
- Satu user hanya bisa review 1x per produk per order

**Response:**

```json
{
  "message": "Review berhasil ditambahkan",
  "id": "review123"
}
```

---

#### **GET /api/reviews**

Mendapatkan semua review.

**Query Parameters:**

- `userId` (optional) - Filter by user
- `produk_id` (optional) - Filter by product

**Response:**

```json
[
  {
    "id": "review123",
    "produk_id": "prod123",
    "produk_nama": "Velg Racing",
    "user_id": "user123",
    "order_id": "order123",
    "rating": 5,
    "komentar": "Produk sangat bagus!",
    "user": {
      "displayName": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": {...}
  }
]
```

---

#### **GET /api/reviews/product/:produk_id**

Mendapatkan review untuk produk tertentu dengan average rating.

**Response:**

```json
{
  "reviews": [...],
  "averageRating": 4.5,
  "totalReviews": 10
}
```

---

#### **DELETE /api/reviews/:id**

Menghapus review (admin only).

**Response:**

```json
{
  "message": "Review berhasil dihapus",
  "id": "review123"
}
```

---

### 🖼️ Gallery

#### **GET /api/gallery**

Mendapatkan semua gambar galeri.

**Response:**

```json
[
  {
    "id": "gal123",
    "image_url": "https://...",
    "alt_text": "Toko BJM Parts",
    "description": "Foto depan toko",
    "createdAt": {...}
  }
]
```

---

#### **POST /api/gallery**

Menambah gambar galeri baru.

**Request Body:**

```json
{
  "image_url": "https://...",
  "alt_text": "Toko BJM Parts",
  "description": "Foto depan toko"
}
```

---

#### **PUT /api/gallery/:id**

Update data galeri.

**Request Body:**

```json
{
  "alt_text": "Updated alt text",
  "description": "Updated description"
}
```

---

#### **DELETE /api/gallery/:id**

Menghapus gambar galeri.

---

## 📊 Database Schema

### Collections Overview

#### **products**

```javascript
{
  id: string (auto-generated),
  nama: string,
  kategori_id: string (ref: categories),
  harga: number,
  img_url: string,
  deskripsi: string,
  link_tokopedia: string,
  link_shopee: string,
  active: boolean,
  createdAt: timestamp
}
```

**Note:** Stok tidak disimpan di sini, dihitung dari tabel `stock`

---

#### **stock**

```javascript
{
  id: string (auto-generated),
  produk_id: string (ref: products),
  tipe: string, // "masuk" atau "keluar"
  jumlah: number,
  status: string | null, // "pending", "confirmed", "returned", "adjustment", null
  keterangan: string,
  order_id: string | null (ref: orders),
  createdAt: timestamp
}
```

**Status Explanation:**

- `null` - Transaksi manual (stok awal, restock supplier, dll)
- `pending` - Reserve stok untuk order yang belum diapprove
- `confirmed` - Stok keluar final (order accepted)
- `returned` - Stok dikembalikan (order rejected)
- `adjustment` - Adjustment manual admin

**Kalkulasi Stok:**

```
Stok Akhir = SUM(masuk) - SUM(keluar WHERE status != "returned")
```

---

#### **categories**

```javascript
{
  id: string (auto-generated),
  nama: string,
  deskripsi: string,
  createdAt: timestamp
}
```

---

#### **cart**

```javascript
{
  id: string (auto-generated),
  user_id: string (ref: users),
  produk_id: string (ref: products),
  jumlah: number,
  createdAt: timestamp
}
```

---

#### **orders**

```javascript
{
  id: string (auto-generated),
  user_id: string (ref: users),
  total: number,
  status: string, // "pending", "accepted", "rejected"
  createdAt: timestamp
}
```

---

#### **orders_items**

```javascript
{
  id: string (auto-generated),
  order_id: string (ref: orders),
  produk_id: string (ref: products),
  jumlah: number,
  harga: number, // harga saat order dibuat
  subtotal: number, // jumlah * harga
  createdAt: timestamp
}
```

---

#### **reviews**

```javascript
{
  id: string (auto-generated),
  produk_id: string (ref: products),
  user_id: string (ref: users),
  order_id: string (ref: orders),
  rating: number, // 1-5
  komentar: string,
  createdAt: timestamp
}
```

---

#### **gallery**

```javascript
{
  id: string (auto-generated),
  image_url: string,
  alt_text: string,
  description: string,
  createdAt: timestamp
}
```

---

#### **users**

```javascript
{
  id: string (uid from Firebase Auth),
  name: string,
  email: string,
  firebase_uid: string,
  role: string, // "user" atau "admin"
  auth_provider: string, // "email/password"
  email_verified: boolean,
  createdAt: timestamp
}
```

---

## 🔒 Authentication & Authorization

### Firebase Admin SDK

Backend menggunakan Firebase Admin SDK untuk:

- Verify ID tokens dari frontend
- Akses Firestore database
- Manage users

### Token Verification

```javascript
// Middleware untuk verify token (belum implemented di code)
async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
}
```

**Current Implementation:**

- Frontend mengirim Firebase ID token di header
- Backend extract `userId` dari request body atau query
- **⚠️ TODO:** Implement middleware untuk verify token di semua protected routes

### Role-Based Access Control

**User Roles:**

- `user` - Customer biasa
- `admin` - Administrator toko

**Admin Privileges:**

- Manage products (CRUD)
- Manage categories (CRUD)
- Manage orders (approve/reject)
- Manage users
- Manage gallery
- Delete reviews
- View all statistics

**User Privileges:**

- Browse products
- Add to cart
- Checkout
- View order history
- Create reviews (untuk produk yang dibeli)

---

## 📦 Stock Management System

### Stock Flow Diagram

```
1. Product Created
   └─> stock entry: tipe="masuk", status=null, keterangan="Stok awal"

2. Order Created (Checkout)
   └─> stock entry: tipe="keluar", status="pending", order_id=xxx

3a. Order Accepted (Admin)
    └─> Update stock: status="confirmed"
    └─> Stok definitif berkurang

3b. Order Rejected (Admin)
    └─> Update stock: status="returned"
    └─> Stok kembali tersedia

4. Manual Stock Adjustment
   └─> stock entry: tipe="masuk/keluar", status="adjustment"
```

### Stock Calculation Logic

```javascript
// Pseudocode
function calculateStock(produk_id) {
  const stockEntries = db
    .collection("stock")
    .where("produk_id", "==", produk_id)
    .get();

  let totalMasuk = 0;
  let totalKeluar = 0;

  stockEntries.forEach((entry) => {
    if (entry.tipe === "masuk") {
      totalMasuk += entry.jumlah;
    } else if (entry.tipe === "keluar" && entry.status !== "returned") {
      totalKeluar += entry.jumlah;
    }
  });

  return totalMasuk - totalKeluar;
}
```

**Key Points:**

- Stok "returned" tidak dihitung sebagai keluar
- Stok "pending" tetap dihitung keluar (reserved)
- Validasi stok selalu menggunakan kalkulasi real-time

---

## ❌ Error Handling

### Standard Error Responses

**400 Bad Request:**

```json
{
  "error": "Data tidak lengkap",
  "details": "Field xxx wajib diisi"
}
```

**404 Not Found:**

```json
{
  "error": "Produk tidak ditemukan"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Gagal memproses request",
  "details": "Error message..."
}
```

### Error Logging

Semua error di-log ke console dengan format:

```javascript
console.error("❌ Error nama_operasi:", error);
```

### Validation Errors

- Missing required fields
- Invalid data types
- Business rule violations (stok tidak cukup, kategori tidak ada, dll)

---

## 🚀 Deployment

### Environment Setup

**Development:**

```bash
npm run dev  # Menggunakan nodemon untuk auto-reload
```

**Production:**

```bash
npm start  # Menggunakan node langsung
```

### Deployment Options

#### **1. Heroku**

```bash
# Install Heroku CLI
heroku login
heroku create bjm-parts-api

# Set environment variables
heroku config:set FIREBASE_PROJECT_ID=xxx
heroku config:set FIREBASE_PRIVATE_KEY="xxx"
# ... (set semua env vars)

# Deploy
git push heroku main
```

#### **2. Railway**

- Connect GitHub repo
- Set environment variables di dashboard
- Auto-deploy on push

#### **3. Google Cloud Run**

```bash
# Build container
gcloud builds submit --tag gcr.io/PROJECT_ID/bjm-api

# Deploy
gcloud run deploy bjm-api \
  --image gcr.io/PROJECT_ID/bjm-api \
  --platform managed \
  --region asia-southeast1
```

#### **4. VPS (DigitalOcean, AWS EC2, dll)**

```bash
# Install Node.js dan npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
git clone <repo-url>
cd backend
npm install

# Setup PM2 untuk process management
npm install -g pm2
pm2 start src/index.js --name bjm-api
pm2 startup
pm2 save

# Setup Nginx reverse proxy
# Configure SSL dengan Let's Encrypt
```

### Production Checklist

- [ ] Set semua environment variables
- [ ] Enable CORS untuk frontend domain
- [ ] Setup SSL/HTTPS
- [ ] Configure firewall rules
- [ ] Setup monitoring & logging
- [ ] Configure backup untuk Firestore
- [ ] Setup rate limiting
- [ ] Add authentication middleware
- [ ] Enable request logging
- [ ] Setup error tracking (Sentry, etc)

---

## 🔧 Development Tips

### Debugging

```javascript
// Add console logs untuk tracking
console.log("🔍 Checking stock for product:", produk_id);
console.log("📊 Stock calculation:", { totalMasuk, totalKeluar, stokAkhir });
```

### Testing API

Gunakan tools seperti:

- **Postman** - GUI untuk testing API
- **Thunder Client** - VS Code extension
- **curl** - Command line

Example curl request:

```bash
curl -X GET http://localhost:5000/api/products
```

### Database Queries

Firestore queries menggunakan Firebase Admin SDK:

```javascript
// Get all
const snapshot = await db.collection("products").get();

// Get by ID
const doc = await db.collection("products").doc(id).get();

// Where clause
const snapshot = await db
  .collection("stock")
  .where("produk_id", "==", id)
  .get();

// Order by
const snapshot = await db
  .collection("products")
  .orderBy("createdAt", "desc")
  .get();
```

---

## 📝 Scripts

```json
{
  "dev": "nodemon src/index.js", // Development dengan auto-reload
  "start": "node src/index.js", // Production server
  "create-admin": "node create-admin.js" // Buat admin user
}
```

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is private and proprietary to BJM Parts.

---

## 🐛 Known Issues & TODO

### Known Issues

- [ ] Token verification middleware belum diimplementasi
- [ ] Tidak ada rate limiting
- [ ] Tidak ada request validation middleware
- [ ] Tidak ada pagination untuk large datasets

### TODO

- [ ] Implement authentication middleware untuk semua protected routes
- [ ] Add input validation dengan library seperti Joi
- [ ] Add pagination untuk GET endpoints
- [ ] Implement rate limiting dengan express-rate-limit
- [ ] Add request logging middleware
- [ ] Setup automated testing (Jest, Mocha)
- [ ] Add API documentation dengan Swagger/OpenAPI
- [ ] Implement caching untuk frequently accessed data
- [ ] Add webhook untuk notifikasi order status
- [ ] Setup automated database backup

---

**Last Updated:** November 27, 2025  
**Version:** 1.0.0  
**API Version:** v1
