// apiService/reviewApi.js
const API_BASE_URL = "http://localhost:5000/api";

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