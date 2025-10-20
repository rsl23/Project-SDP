# 🛡️ Admin Panel Documentation

## 📋 Overview

Admin Panel BJM Parts adalah dashboard terpisah untuk mengelola produk, users, orders, dan konfigurasi aplikasi.

---

## 🚀 Quick Start

### 1. Buat Admin User Pertama Kali

```bash
npm run create-admin
```

**Default Admin Credentials:**

- Email: `admin@bjmparts.com`
- Password: `admin123456`

⚠️ **PENTING:** Ganti password setelah login pertama kali!

### 2. Login ke Admin Panel

```
http://localhost:5173/admin
```

---

## 🏗️ Struktur Folder

```
src/
└── admin/
    ├── AdminLayout.jsx          # Layout utama admin (sidebar + topbar)
    ├── AdminRoute.jsx           # Protected route (cek role admin)
    ├── components/              # Komponen reusable admin
    └── pages/
        ├── AdminDashboard.jsx   # Dashboard overview
        ├── AdminProducts.jsx    # CRUD Produk
        ├── AdminUsers.jsx       # Kelola users
        ├── AdminOrders.jsx      # Kelola orders (coming soon)
        └── AdminSettings.jsx    # Settings (coming soon)
```

---

## 🔐 Authentication & Authorization

### Role-Based Access Control

Admin panel menggunakan **role** di Firestore untuk membedakan admin dan user biasa.

**Struktur User Document di Firestore:**

```javascript
{
  name: "Admin BJM Parts",
  email: "admin@bjmparts.com",
  firebase_uid: "xxx",
  role: "admin",              // 🔑 Role penting!
  auth_provider: "email/password",
  email_verified: true,
  createdAt: timestamp
}
```

### Cara Kerja AdminRoute

```javascript
// src/admin/AdminRoute.jsx
1. Cek apakah user sudah login (Firebase Auth)
2. Cek role di Firestore document user
3. Jika role !== "admin" → Redirect atau tampilkan "Access Denied"
4. Jika role === "admin" → Allow access
```

---

## 🎨 Fitur Admin Panel

### ✅ Dashboard (/)

- **Stats Cards:** Total produk, users, orders, revenue
- **Quick Actions:** Shortcut ke fitur penting
- **Recent Activity:** Activity log (placeholder)

### ✅ Kelola Produk (/admin/products)

- **CRUD Complete:**
  - ✅ Create: Tambah produk baru
  - ✅ Read: Lihat daftar produk
  - ✅ Update: Edit produk existing
  - ✅ Delete: Hapus produk
- **Search:** Cari produk by nama
- **Form Validation:** Validasi input lengkap
- **API Integration:** Connect ke backend REST API

### ✅ Kelola Users (/admin/users)

- **View All Users:** Daftar semua user terdaftar
- **User Info:** Nama, email, role, auth provider, verification status
- **Search:** Cari user by nama atau email
- **Firestore Integration:** Data real-time dari Firestore

### 🚧 Kelola Orders (/admin/orders)

- Status: **Coming Soon**
- Placeholder page tersedia

### 🚧 Settings (/admin/settings)

- Status: **Coming Soon**
- Placeholder page tersedia

---

## 🛠️ Cara Membuat User Menjadi Admin

### Method 1: Via Script (Recommended)

Edit file `create-admin.js` dengan email user yang ingin dijadikan admin:

```javascript
const adminData = {
  name: "Your Name",
  email: "youremail@example.com",
  password: "yourpassword",
};
```

Lalu jalankan:

```bash
npm run create-admin
```

### Method 2: Manual via Firebase Console

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Pilih project **project-sdp-fpw**
3. Masuk ke **Firestore Database**
4. Cari collection `users`
5. Cari document dengan email yang ingin dijadikan admin
6. Edit document, tambahkan field:
   ```
   role: "admin"
   ```
7. Save

### Method 3: Via Code (Update Firestore)

```javascript
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase/config";

const makeUserAdmin = async (userId) => {
  await updateDoc(doc(db, "users", userId), {
    role: "admin",
  });
};
```

---

## 🚦 Routing

### Admin Routes (Terpisah dari User)

```
/admin                  → Dashboard
/admin/products         → Kelola Produk
/admin/users            → Kelola Users
/admin/orders           → Kelola Orders
/admin/settings         → Settings
```

### User Routes (Public + User Biasa)

```
/                       → Home Page
/product                → Product Page
/login                  → Login
/register               → Register
/aboutus                → About Us
```

**Perbedaan:**

- ✅ Admin routes **TIDAK** ada Navbar dan Footer
- ✅ Admin routes **DILINDUNGI** dengan AdminRoute
- ✅ User routes **ADA** Navbar dan Footer
- ✅ Routing **TERPISAH** sepenuhnya

---

## 🔧 Customization

### Mengubah Sidebar Menu

Edit `src/admin/AdminLayout.jsx`:

```javascript
const menuItems = [
  { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/admin/products", icon: Package, label: "Produk" },
  // Tambah menu baru di sini
];
```

### Mengubah Warna Theme

Admin panel menggunakan gradient indigo-purple. Untuk mengubah:

```jsx
// Di AdminLayout.jsx
className = "bg-gradient-to-b from-indigo-900 to-purple-900";
// Ganti dengan warna lain, misal:
className = "bg-gradient-to-b from-blue-900 to-teal-900";
```

### Menambahkan Halaman Baru

1. Buat file baru di `src/admin/pages/`, misal `AdminReports.jsx`
2. Import di `App.jsx`
3. Tambahkan route:
   ```jsx
   <Route path="reports" element={<AdminReports />} />
   ```
4. Tambahkan menu item di `AdminLayout.jsx`

---

## 🎨 UI Components

### Lucide React Icons

Admin panel menggunakan [Lucide React](https://lucide.dev/icons/) untuk icons:

```javascript
import { Package, Users, ShoppingCart, Settings } from "lucide-react";
```

### Tailwind CSS

Styling dengan Tailwind utility classes:

- Colors: `bg-indigo-600`, `text-white`
- Spacing: `p-4`, `mt-6`, `gap-3`
- Shadows: `shadow-md`, `shadow-lg`
- Transitions: `transition`, `hover:bg-indigo-700`

---

## 🐛 Troubleshooting

### Error: "Akses Ditolak"

**Problem:** User tidak punya role admin
**Solution:**

- Pastikan field `role: "admin"` ada di Firestore document user
- Run `npm run create-admin` untuk buat admin baru

### Error: "Cannot read properties of undefined"

**Problem:** Data user di Firestore belum ada
**Solution:**

- Pastikan user sudah register lewat `/register`
- Cek Firestore Console apakah document user sudah dibuat

### Admin Sidebar Tidak Muncul

**Problem:** Route tidak match
**Solution:**

- Pastikan URL dimulai dengan `/admin`
- Cek `App.jsx` apakah routing sudah benar

### CORS Error saat CRUD Produk

**Problem:** Backend server belum running
**Solution:**

```bash
npm run dev:full
# atau jalankan terpisah:
npm run server  # Terminal 1
npm run dev     # Terminal 2
```

---

## 🔒 Security Best Practices

1. ✅ **Jangan commit .env** ke Git
2. ✅ **Ganti default admin password** setelah setup
3. ✅ **Set Firestore Security Rules** dengan benar:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Hanya admin yang bisa edit users
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null &&
                         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
       }
     }
   }
   ```
4. ✅ **Validasi input** di frontend dan backend
5. ✅ **Rate limiting** di API endpoints (implement di backend)

---

## 📊 Next Steps (Future Enhancements)

- [ ] **Dashboard Analytics:** Chart & grafik penjualan
- [ ] **Order Management:** CRUD orders lengkap
- [ ] **Image Upload:** Upload gambar produk
- [ ] **Notification System:** Real-time notifications
- [ ] **Audit Log:** Track semua perubahan admin
- [ ] **Multi-role:** Support role: super-admin, moderator, dll
- [ ] **Export Data:** Export users/products ke CSV/Excel
- [ ] **Dark Mode:** Toggle dark/light theme

---

## 🎓 Learning Resources

- [React Router v6](https://reactrouter.com/)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

## 📞 Support

Jika ada pertanyaan atau issue:

1. Cek dokumentasi ini
2. Cek `DEVELOPMENT_GUIDE.md` untuk setup development
3. Cek Firebase Console untuk debug Firestore/Auth

---

**Made with ❤️ for BJM Parts**
