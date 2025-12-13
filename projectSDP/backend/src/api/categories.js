// Categories Router - API endpoints untuk manajemen kategori produk
// Endpoints: GET /categories, POST /categories, PUT /categories/:id, DELETE /categories/:id

import express from "express";
import { db } from "../firebase.js";
import admin from "firebase-admin";

const router = express.Router();

// Endpoint: GET /api/categories
// Fungsi: Mengambil semua kategori produk
router.get("/", async (req, res) => {
  try {
    const snap = await db.collection("categories").get();
    const cats = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(cats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil kategori" });
  }
});

// Endpoint: POST /api/categories
// Fungsi: Menambahkan kategori baru dengan validasi duplikat
router.post("/", async (req, res) => {
  try {
    const { nama } = req.body;

    // Validasi nama kategori tidak kosong
    if (!nama || nama.trim() === "") {
      return res.status(400).json({ error: "Nama kategori wajib diisi" });
    }

    // Cek duplikat kategori (case-insensitive)
    const existing = await db
      .collection("categories")
      .where("nama", "==", nama.trim())
      .get();

    if (!existing.empty) {
      return res.status(400).json({ error: "Kategori sudah ada" });
    }

    // Simpan kategori baru
    const docRef = await db.collection("categories").add({
      nama: nama.trim(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      message: "Kategori berhasil ditambahkan",
      id: docRef.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menambah kategori" });
  }
});

// Endpoint: PUT /api/categories/:id
// Fungsi: Update nama kategori
router.put("/:id", async (req, res) => {
  try {
    const { nama } = req.body;

    // Validasi nama tidak kosong
    if (!nama || nama.trim() === "") {
      return res.status(400).json({ error: "Nama kategori wajib diisi" });
    }

    // Validasi kategori exists
    const catDoc = await db.collection("categories").doc(req.params.id).get();
    if (!catDoc.exists) {
      return res.status(404).json({ error: "Kategori tidak ditemukan" });
    }

    // Update nama kategori
    await db.collection("categories").doc(req.params.id).update({
      nama: nama.trim(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: "Kategori berhasil diupdate" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal update kategori" });
  }
});

// Endpoint: DELETE /api/categories/:id
// Fungsi: Menghapus kategori (hanya jika tidak digunakan oleh produk)
router.delete("/:id", async (req, res) => {
  try {
    // Cek apakah ada produk yang menggunakan kategori ini
    const productsWithCategory = await db
      .collection("products")
      .where("kategori_id", "==", req.params.id)
      .limit(1)
      .get();

    if (!productsWithCategory.empty) {
      return res.status(400).json({
        error: "Tidak bisa menghapus kategori yang masih digunakan oleh produk",
      });
    }

    // Hapus kategori jika aman
    await db.collection("categories").doc(req.params.id).delete();
    res.json({ message: "Kategori berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal hapus kategori" });
  }
});

export default router;
