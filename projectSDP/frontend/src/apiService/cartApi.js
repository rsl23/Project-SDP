// API Service untuk Cart endpoints
// Handle semua operasi cart (add, get, update, delete) dengan auto user ID dari Firebase Auth

import { auth } from "../firebase/config";

const API_URL = "https://backend-dot-storied-courier-479504-q5.et.r.appspot.com/api/cart";

// Helper function untuk mendapatkan user yang sedang login
const getCurrentUser = () => {
  return auth.currentUser; // Return Firebase Auth user object atau null
};

// Function: POST /api/cart
// Menambah produk ke cart atau increment jumlah jika sudah ada
export const addToCart = async (produk_id, jumlah = 1) => {
  const user = getCurrentUser();

  // Validasi user harus sudah login
  if (!user) {
    throw new Error("User belum login");
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      produk_id, // ID produk yang ditambahkan
      jumlah, // Jumlah item (default 1)
      userId: user.uid, // Firebase Auth UID
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Gagal menambah ke keranjang");
  }

  return res.json(); // Return cart item dengan produk data
};

// Function: GET /api/cart?userId=xxx
// Mengambil semua cart items milik user dengan data produk dan stok
export const getCart = async () => {
  const user = getCurrentUser();

  if (!user) {
    throw new Error("User belum login");
  }

  const res = await fetch(`${API_URL}?userId=${user.uid}`);
  if (!res.ok) throw new Error("Gagal mengambil data keranjang");
  return res.json(); // Return array cart items dengan produk data
};

// Function: DELETE /api/cart/:id
// Hapus item dari cart
export const deleteCartItem = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus item keranjang");
  return res.json(); // Return success message
};

// Function: PUT /api/cart/:id
// Update jumlah item di cart
export const updateCartItem = async (id, jumlah) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jumlah: Number(jumlah) }), // Kirim jumlah baru
  });
  if (!res.ok) throw new Error("Gagal update jumlah cart");
  return res.json(); // Return updated cart item
};
