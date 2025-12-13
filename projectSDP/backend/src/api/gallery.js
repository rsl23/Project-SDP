// Gallery Router - API endpoints untuk manajemen galeri gambar
// Endpoints: GET /gallery, POST /gallery, PUT /gallery/:id, DELETE /gallery/:id

import express from "express";
import { db } from "../firebase.js";
import admin from "firebase-admin";

const router = express.Router();

// Endpoint: GET /api/gallery
// Fungsi: Mengambil semua item galeri, diurutkan berdasarkan createdAt descending
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("gallery").get();

    let items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort by createdAt descending (manual sort untuk hindari composite index)
    items.sort((a, b) => {
      const dateA = a.createdAt?.toDate
        ? a.createdAt.toDate()
        : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate
        ? b.createdAt.toDate()
        : new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    res.json(items);
  } catch (err) {
    console.error("Error fetching gallery:", err);
    res.status(500).json({ error: "Gagal mengambil galeri" });
  }
});

// Endpoint: POST /api/gallery
// Fungsi: Menambahkan item baru ke galeri
router.post("/", async (req, res) => {
  try {
    const { imageUrl, caption, description } = req.body;

    // Validasi imageUrl wajib diisi
    if (!imageUrl || imageUrl.trim() === "") {
      return res.status(400).json({ error: "Image URL wajib diisi" });
    }

    // Simpan item galeri baru
    const docRef = await db.collection("gallery").add({
      imageUrl: imageUrl.trim(),
      caption: caption || "",
      description: description || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      message: "Gambar berhasil ditambahkan ke galeri",
      id: docRef.id,
    });
  } catch (err) {
    console.error("Error adding to gallery:", err);
    res.status(500).json({ error: "Gagal menambah ke galeri" });
  }
});

// Endpoint: PUT /api/gallery/:id
// Fungsi: Update item galeri (caption, description, imageUrl)
router.put("/:id", async (req, res) => {
  try {
    const { imageUrl, caption, description } = req.body;
    const galleryId = req.params.id;

    // Validasi item exists
    const galleryDoc = await db.collection("gallery").doc(galleryId).get();
    if (!galleryDoc.exists) {
      return res.status(404).json({ error: "Item galeri tidak ditemukan" });
    }

    // Build update object (hanya field yang dikirim)
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (caption !== undefined) updateData.caption = caption;
    if (description !== undefined) updateData.description = description;

    // Update galeri
    await db.collection("gallery").doc(galleryId).update(updateData);

    res.json({ message: "Item galeri berhasil diupdate" });
  } catch (err) {
    console.error("Error updating gallery:", err);
    res.status(500).json({ error: "Gagal update item galeri" });
  }
});

// Endpoint: DELETE /api/gallery/:id
// Fungsi: Menghapus item dari galeri
router.delete("/:id", async (req, res) => {
  try {
    const galleryId = req.params.id;

    // Validasi item exists
    const galleryDoc = await db.collection("gallery").doc(galleryId).get();
    if (!galleryDoc.exists) {
      return res.status(404).json({ error: "Item galeri tidak ditemukan" });
    }

    // Hapus item
    await db.collection("gallery").doc(galleryId).delete();

    res.json({ message: "Item galeri berhasil dihapus" });
  } catch (err) {
    console.error("Error deleting gallery item:", err);
    res.status(500).json({ error: "Gagal hapus item galeri" });
  }
});

export default router;
