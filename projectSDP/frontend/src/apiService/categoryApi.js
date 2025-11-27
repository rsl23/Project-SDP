// API Service untuk Category endpoints
// Centralized module untuk operasi CRUD kategori produk

const CATEGORY_API_URL = "http://localhost:5000/api/categories";

// Mengambil semua kategori yang tersedia
// @returns Array kategori dengan id dan nama_kategori
export async function getCategories() {
  try {
    const response = await fetch(CATEGORY_API_URL);
    console.log("Ambil Kategori");

    if (!response.ok) throw new Error("Gagal mengambil kategori");
    return await response.json();
  } catch (error) {
    console.error("Error di getCategories:", error);
    throw error;
  }
}

// Menambah kategori baru
// @param categoryData - Object dengan properti nama_kategori
// @returns Object kategori baru dengan id
export async function addCategory(categoryData) {
  try {
    const response = await fetch(CATEGORY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) throw new Error("Gagal menambah kategori");
    return await response.json();
  } catch (error) {
    console.error("Error di addCategory:", error);
    throw error;
  }
}

// Update data kategori
// @param id - ID kategori yang akan diupdate
// @param updatedData - Object dengan properti yang akan diupdate (nama_kategori)
// @returns Object kategori yang sudah diupdate
export async function updateCategory(id, updatedData) {
  try {
    const response = await fetch(`${CATEGORY_API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) throw new Error("Gagal update kategori");
    return await response.json();
  } catch (error) {
    console.error("Error di updateCategory:", error);
    throw error;
  }
}

// Hapus kategori berdasarkan ID
// @param id - ID kategori yang akan dihapus
// @returns Object dengan success message
// Note: Hanya bisa hapus jika tidak ada produk yang menggunakan kategori ini
export async function deleteCategory(id) {
  try {
    const response = await fetch(`${CATEGORY_API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Gagal menghapus kategori");
    return await response.json();
  } catch (error) {
    console.error("Error di deleteCategory:", error);
    throw error;
  }
}
