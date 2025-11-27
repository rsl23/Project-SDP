// API Service untuk Product endpoints
// Centralized module untuk semua operasi CRUD products dengan backend

// Base URL untuk product API endpoints
const API_URL = "http://localhost:5000/api/products";

// Function: GET /api/products
// Mengambil semua produk dengan stok real-time dan data kategori
export async function getProducts() {
  try {
    const response = await fetch(API_URL);
    console.log("Ambil Produk");

    if (!response.ok) throw new Error("Gagal mengambil produk");
    return await response.json(); // Return array of products
  } catch (error) {
    console.error("Error di getProducts:", error);
    throw error; // Re-throw untuk ditangani di component
  }
}

// Function: POST /api/products
// Menambah produk baru beserta stok awal
export async function addProduct(productData) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData), // { nama, kategori_id, harga, img_url, deskripsi, stok }
    });
    if (!response.ok) throw new Error("Gagal menambah produk");
    return await response.json(); // Return created product dengan ID
  } catch (error) {
    console.error("Error di addProduct:", error);
    throw error;
  }
}

// Function: PUT /api/products/:id
// Update data produk (tidak termasuk stok)
export async function updateProduct(id, updatedData) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData), // Partial update: hanya field yang dikirim
    });
    if (!response.ok) throw new Error("Gagal update produk");
    return await response.json(); // Return updated product data
  } catch (error) {
    console.error("Error di updateProduct:", error);
    throw error;
  }
}

// Function: DELETE /api/products/:id
// Hapus produk dan semua stock entries terkait
export async function deleteProduct(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Gagal menghapus produk");
    return await response.json(); // Return success message
  } catch (error) {
    console.error("Error di deleteProduct:", error);
    throw error;
  }
}

// Function: PUT /api/products/:id/stock
// Update stok produk dengan mengubah entry stok awal
export async function updateProductStock(id, stockData) {
  try {
    const response = await fetch(`${API_URL}/${id}/stock`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stockData), // { stok: number }
    });
    if (!response.ok) throw new Error("Gagal update stok produk");
    return await response.json(); // Return { stok, previous_stock, adjustment }
  } catch (error) {
    console.error("Error di updateProductStock:", error);
    throw error;
  }
}
