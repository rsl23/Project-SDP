// Reviews Router - API endpoints untuk manajemen review produk
// Endpoints: POST /reviews, GET /reviews, GET /reviews/product/:produk_id, DELETE /reviews/:id

import express from "express";
import { db } from "../firebase.js";
import admin from "firebase-admin";

const router = express.Router();

// Endpoint: POST /api/reviews
// Fungsi: Menambahkan review baru dengan validasi kepemilikan dan duplikat
router.post("/", async (req, res) => {
  try {
    const { userId, produk_id, rating, komentar, userName, userPhotoURL } =
      req.body;

    // Validasi field wajib
    if (!userId || !produk_id || !rating) {
      return res.status(400).json({
        error: "userId, produk_id, dan rating wajib diisi",
      });
    }

    // Validasi range rating (1-5)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Rating harus antara 1-5",
      });
    }

    // Cek apakah user sudah pernah review produk ini (mencegah duplikat)
    const existingReview = await db
      .collection("reviews")
      .where("userId", "==", userId)
      .where("produk_id", "==", produk_id)
      .get();

    if (!existingReview.empty) {
      return res.status(400).json({
        error: "Anda sudah memberikan review untuk produk ini",
      });
    }

    // Cek apakah user pernah membeli produk ini (harus ada order accepted)
    const ordersSnap = await db
      .collection("orders")
      .where("userId", "==", userId)
      .where("status", "==", "accepted")
      .get();

    // Loop cari order yang mengandung produk_id
    let hasPurchased = false;
    ordersSnap.forEach((orderDoc) => {
      const order = orderDoc.data();
      if (order.items?.some((item) => item.produk_id === produk_id)) {
        hasPurchased = true;
      }
    });

    // Block review jika belum pernah beli
    if (!hasPurchased) {
      return res.status(403).json({
        error:
          "Anda hanya dapat memberikan review untuk produk yang sudah dibeli dan diterima",
      });
    }

    // Simpan review baru
    const reviewRef = await db.collection("reviews").add({
      userId,
      produk_id,
      rating: Number(rating),
      komentar: komentar || "",
      userName: userName || "Anonymous",
      userPhotoURL: userPhotoURL || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      message: "Review berhasil ditambahkan",
      id: reviewRef.id,
    });
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).json({ error: "Gagal menambah review" });
  }
});

// Endpoint: GET /api/reviews
// Fungsi: Mengambil semua review dengan filter opsional
router.get("/", async (req, res) => {
  try {
    const { produk_id, userId, sort } = req.query;

    const snap = await db.collection("reviews").get();
    let reviews = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Filter by produk_id jika ada
    if (produk_id) {
      reviews = reviews.filter((r) => r.produk_id === produk_id);
    }

    // Filter by userId jika ada
    if (userId) {
      reviews = reviews.filter((r) => r.userId === userId);
    }

    // Sort by rating jika diminta
    if (sort === "rating_desc") {
      reviews.sort((a, b) => b.rating - a.rating);
    } else if (sort === "rating_asc") {
      reviews.sort((a, b) => a.rating - b.rating);
    } else {
      // Default sort by createdAt descending
      reviews.sort((a, b) => {
        const dateA = a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
    }

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil review" });
  }
});

// Endpoint: GET /api/reviews/product/:produk_id
// Fungsi: Mengambil review untuk produk tertentu dengan rata-rata rating
router.get("/product/:produk_id", async (req, res) => {
  try {
    const { produk_id } = req.params;

    const snap = await db.collection("reviews").get();
    // Filter manual by produk_id
    const reviews = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((r) => r.produk_id === produk_id);

    // Hitung rata-rata rating
    const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const averageRating =
      reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.json({
      reviews,
      averageRating: Number(averageRating),
      totalReviews: reviews.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil review produk" });
  }
});

// Endpoint: DELETE /api/reviews/:id
// Fungsi: Menghapus review (hanya admin atau pemilik review)
router.delete("/:id", async (req, res) => {
  try {
    const { userId, isAdmin } = req.query;
    const reviewId = req.params.id;

    // Ambil data review
    const reviewDoc = await db.collection("reviews").doc(reviewId).get();

    if (!reviewDoc.exists) {
      return res.status(404).json({ error: "Review tidak ditemukan" });
    }

    const review = reviewDoc.data();

    // Validasi hanya pemilik atau admin yang bisa hapus
    if (review.userId !== userId && isAdmin !== "true") {
      return res.status(403).json({
        error: "Anda tidak memiliki izin untuk menghapus review ini",
      });
    }

    // Hapus review
    await db.collection("reviews").doc(reviewId).delete();

    res.json({ message: "Review berhasil dihapus" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ error: "Gagal menghapus review" });
  }
});

export default router;
