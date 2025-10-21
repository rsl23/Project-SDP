# 🔧 Backend Structure & Debugging Guide

## 📁 Backend File Structure

```
src/server/
├── index.js              # Main Express server (API endpoints)
├── firebase.js           # Firebase Admin SDK configuration
└── serviceAccountKey.json # Firebase credentials (DO NOT COMMIT!)
```

---

## 🛣️ API Endpoints

### **Base URL:** `http://localhost:5000`

| Method | Endpoint            | Description      | Request Body                    | Response          |
| ------ | ------------------- | ---------------- | ------------------------------- | ----------------- |
| GET    | `/api/products`     | Get all products | -                               | Array of products |
| POST   | `/api/products`     | Add new product  | `{nama, kategori, harga, stok}` | Created product   |
| PUT    | `/api/products/:id` | Update product   | `{nama, kategori, harga, stok}` | Updated product   |
| DELETE | `/api/products/:id` | Delete product   | -                               | Success message   |

---

## 📋 API Details

### 1. **GET /api/products**

**Purpose:** Fetch all products from Firestore

**Request:**

```bash
GET http://localhost:5000/api/products
```

**Response (200 OK):**

```json
[
  {
    "id": "abc123",
    "nama": "Spion Kanan",
    "kategori": "Spion",
    "harga": 150000,
    "stok": 20
  },
  ...
]
```

**Error Response (500):**

```json
{
  "error": "Gagal mengambil produk"
}
```

**Console Log:**

```
✅ GET /api/products
📦 Found 10 products
```

---

### 2. **POST /api/products**

**Purpose:** Add new product to Firestore

**Request:**

```bash
POST http://localhost:5000/api/products
Content-Type: application/json

{
  "nama": "Spion Kiri",
  "kategori": "Spion",
  "harga": 150000,
  "stok": 15
}
```

**Response (201 Created):**

```json
{
  "id": "xyz789",
  "nama": "Spion Kiri",
  "kategori": "Spion",
  "harga": 150000,
  "stok": 15
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "Data tidak lengkap"
}
```

**Console Log:**

```
✅ Produk berhasil ditambahkan: xyz789
```

---

### 3. **PUT /api/products/:id**

**Purpose:** Update existing product

**Request:**

```bash
PUT http://localhost:5000/api/products/abc123
Content-Type: application/json

{
  "nama": "Spion Kanan Updated",
  "kategori": "Spion",
  "harga": 180000,
  "stok": 25
}
```

**Response (200 OK):**

```json
{
  "id": "abc123",
  "nama": "Spion Kanan Updated",
  "kategori": "Spion",
  "harga": 180000,
  "stok": 25,
  "message": "Produk berhasil diupdate"
}
```

**Error Response (404 Not Found):**

```json
{
  "error": "Produk tidak ditemukan"
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "Data tidak lengkap"
}
```

**Console Log:**

```
🔄 Updating product abc123: { nama: 'Spion Kanan Updated', ... }
✅ Product abc123 updated successfully
```

---

### 4. **DELETE /api/products/:id**

**Purpose:** Delete product from Firestore

**Request:**

```bash
DELETE http://localhost:5000/api/products/abc123
```

**Response (200 OK):**

```json
{
  "id": "abc123",
  "message": "Produk berhasil dihapus"
}
```

**Error Response (404 Not Found):**

```json
{
  "error": "Produk tidak ditemukan"
}
```

**Console Log:**

```
🗑️ Deleting product abc123
✅ Product abc123 deleted successfully
```

---

## 🐛 Debugging Guide

### **Problem 1: Update/Delete Error (404 Not Found)**

**Symptoms:**

- Admin panel shows error when updating product
- Console: `Product not found`

**Possible Causes:**

1. ❌ Product ID tidak ada di Firestore
2. ❌ Product sudah dihapus sebelumnya
3. ❌ ID format salah

**Solution:**

1. Check Firestore Console → `products` collection
2. Verify document ID matches
3. Check console log di backend server:
   ```
   🔄 Updating product abc123
   ❌ Product abc123 not found
   ```

---

### **Problem 2: CORS Error**

**Symptoms:**

- Console: `CORS policy: No 'Access-Control-Allow-Origin' header`
- Request blocked by browser

**Possible Causes:**

- ❌ Backend server not running
- ❌ CORS not configured
- ❌ Wrong origin

**Solution:**

1. Check backend server is running:
   ```bash
   npm run server
   ```
2. Verify CORS is enabled in `index.js`:
   ```javascript
   app.use(cors());
   ```

---

### **Problem 3: Network Error**

**Symptoms:**

- Frontend: `NetworkError when attempting to fetch`
- No response from backend

**Possible Causes:**

- ❌ Backend server not running
- ❌ Wrong API URL
- ❌ Port 5000 already in use

**Solution:**

1. **Check if backend is running:**

   ```bash
   npm run server
   ```

   Should see:

   ```
   🚀 Server berjalan di http://localhost:5000
   ```

2. **Check port availability:**

   ```bash
   # Windows PowerShell
   netstat -ano | findstr :5000

   # If port is used, kill process or change port
   ```

3. **Verify API URL in frontend:**
   Check `src/apiService/productApi.js`:
   ```javascript
   const API_URL = "http://localhost:5000/api/products";
   ```

---

### **Problem 4: Firebase Admin SDK Error**

**Symptoms:**

- Server crashes on startup
- Error: `Could not load default credentials`

**Possible Causes:**

- ❌ Firebase credentials missing
- ❌ `.env` file not configured
- ❌ Wrong environment variables

**Solution:**

1. Check `.env` file exists and has correct values
2. Check `src/server/firebase.js` loads `.env` correctly
3. Verify Firebase Admin SDK initialized:
   ```
   ✅ Firebase Admin SDK initialized successfully
   ```

---

### **Problem 5: Data Validation Error (400)**

**Symptoms:**

- Error: `Data tidak lengkap`
- Request rejected

**Possible Causes:**

- ❌ Missing required fields
- ❌ Wrong data types
- ❌ Empty values

**Solution:**

1. **Check request payload:**

   ```json
   {
     "nama": "Product Name", // ✅ Required
     "kategori": "Category", // ✅ Required
     "harga": 100000, // ✅ Required (number)
     "stok": 10 // ✅ Required (number)
   }
   ```

2. **Verify all fields present:**
   - Frontend should send all 4 fields
   - Backend validates: `if (!nama || !kategori || !harga || !stok)`

---

## 🔍 How to Debug

### **Method 1: Backend Console Logs**

Backend server has detailed logging:

```javascript
console.log(`🔄 Updating product ${id}`); // Before operation
console.log(`✅ Product ${id} updated`); // Success
console.error(`❌ Error:`, error); // Error
```

**How to use:**

1. Open terminal running backend server
2. Perform action in frontend (update/delete)
3. Watch console output for logs
4. Look for emoji indicators:
   - 🔄 = Processing
   - ✅ = Success
   - ❌ = Error
   - 🗑️ = Deleting

### **Method 2: Browser Network Tab**

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Perform action (update/delete)
4. Find request to `/api/products/:id`
5. Check:
   - **Status Code:** 200 (success), 404 (not found), 500 (server error)
   - **Request Payload:** Data sent to backend
   - **Response:** Data received from backend
   - **Headers:** CORS, Content-Type

### **Method 3: Postman/Thunder Client**

Test endpoints directly:

**Example: Update Product**

```
PUT http://localhost:5000/api/products/abc123
Headers:
  Content-Type: application/json
Body:
{
  "nama": "Test Product",
  "kategori": "Test",
  "harga": 100000,
  "stok": 10
}
```

**Example: Delete Product**

```
DELETE http://localhost:5000/api/products/abc123
```

### **Method 4: Firestore Console**

1. Open [Firebase Console](https://console.firebase.google.com)
2. Go to **Firestore Database**
3. Find `products` collection
4. Verify:
   - ✅ Document exists
   - ✅ Document ID matches
   - ✅ Fields are correct
   - ✅ Data types are correct

---

## 🚀 Quick Testing Guide

### **Test Update Product:**

1. **Start backend:**

   ```bash
   npm run server
   ```

2. **Start frontend:**

   ```bash
   npm run dev
   ```

3. **Login as admin:**

   - URL: `http://localhost:5173/admin`
   - Email: `admin@bjmparts.com`
   - Password: `admin123456`

4. **Go to Products page:**

   - Click "Produk" in sidebar

5. **Click Edit on any product:**

   - Change values
   - Click "Update"
   - ✅ Should see success message
   - ✅ Check backend console for logs

6. **Check backend console:**
   ```
   🔄 Updating product abc123: { nama: '...', ... }
   ✅ Product abc123 updated successfully
   ```

### **Test Delete Product:**

1. **Click Delete (trash icon) on any product**
2. **Confirm deletion**
3. **Check backend console:**
   ```
   🗑️ Deleting product abc123
   ✅ Product abc123 deleted successfully
   ```
4. **Verify product removed from list**

---

## 📊 Error Codes Reference

| Code | Meaning      | Common Cause               |
| ---- | ------------ | -------------------------- |
| 200  | OK           | Success                    |
| 201  | Created      | Product added successfully |
| 400  | Bad Request  | Missing or invalid data    |
| 404  | Not Found    | Product ID doesn't exist   |
| 500  | Server Error | Backend/Firebase error     |

---

## 🔧 Backend Configuration

### **Port Configuration:**

```javascript
const PORT = 5000;
```

Change if port is already in use.

### **CORS Configuration:**

```javascript
app.use(cors());
```

Allow all origins. For production, restrict to specific domain:

```javascript
app.use(cors({ origin: "https://your-domain.com" }));
```

### **Firestore Collection:**

```javascript
db.collection("products");
```

Change collection name if needed.

---

## 📝 Backend File Details

### **index.js** (Main Server File)

```javascript
import express from "express";
import cors from "cors";
import { db } from "./firebase.js";

const app = express();
app.use(cors());
app.use(express.json());

// Routes:
// GET    /api/products
// POST   /api/products
// PUT    /api/products/:id
// DELETE /api/products/:id

app.listen(PORT, () => console.log(...));
```

### **firebase.js** (Firebase Config)

```javascript
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin SDK
// Uses environment variables from .env
```

---

## 🎯 Best Practices

1. **Always check backend console** when debugging
2. **Use browser Network tab** to inspect requests
3. **Verify Firestore data** in Firebase Console
4. **Test endpoints with Postman** before frontend integration
5. **Keep backend running** during development
6. **Restart backend** after code changes

---

## 📚 Related Files

- `src/apiService/productApi.js` - Frontend API service
- `src/admin/pages/AdminProducts.jsx` - Admin product CRUD UI
- `.env` - Environment variables
- `DEVELOPMENT_GUIDE.md` - Development setup

---

## 🆘 Still Having Issues?

1. Check all servers are running:

   ```bash
   npm run dev:full  # Run both frontend & backend
   ```

2. Check console logs in:

   - Backend terminal
   - Browser console (F12)
   - Network tab

3. Verify data in Firestore Console

4. Test endpoint directly with Postman

5. Check this documentation for common issues

---

**Backend is now fully functional with UPDATE and DELETE endpoints! 🎉**
