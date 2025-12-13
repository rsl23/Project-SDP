// API Service untuk Review endpoints
// Handle operasi reviews produk (submit, get user reviews, get product reviews)

const API_BASE_URL = "http://localhost:3000/api";

// Mengirim review baru untuk produk
// @param reviewData - Object dengan userId, produk_id, rating (1-5), dan review_text
// @returns Object review yang baru dibuat dengan id
// Validasi: user harus pernah order produk ini dan belum pernah review
export const submitReview = async (reviewData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Gagal mengirim review");
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
};

// Mengambil semua review yang dibuat oleh user tertentu
// @param userId - ID user dari Firebase Auth
// @returns Array reviews dengan data produk join (nama, gambar)
export const getUserReviews = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews?userId=${userId}`);
    if (!response.ok) {
      throw new Error("Gagal mengambil reviews");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    throw error;
  }
};

// Mengambil semua review untuk produk tertentu beserta rating rata-rata
// @param produkId - ID produk
// @returns Object dengan averageRating, totalReviews, dan array reviews
// Data reviews include username, rating, review_text, createdAt
export const getProductReviews = async (produkId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/product/${produkId}`);
    if (!response.ok) {
      throw new Error("Gagal mengambil reviews produk");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    throw error;
  }
};
