// Stock Router - API endpoints untuk manajemen riwayat stok
// Endpoints: GET /stock, POST /stock

import express from "express";
import { db } from "../firebase.js";
import admin from "firebase-admin";

const router = express.Router();

// Endpoint: POST /api/stock
// Fungsi: Menambah entry riwayat stok manual (masuk/keluar)
router.post("/", async (req, res) => {
  try {
    const { produk_id, tipe, jumlah, keterangan } = req.body;

    // Validasi field wajib dan tipe harus 'masuk' atau 'keluar'
    if (!produk_id || !["masuk", "keluar"].includes(tipe) || !jumlah) {
      return res
        .status(400)
        .json({ error: "Data stok tidak lengkap / tidak valid" });
    }

    // Validasi produk exists di database
    const produkRef = db.collection("products").doc(produk_id);
    const produkDoc = await produkRef.get();
    if (!produkDoc.exists) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    // Siapkan object stok untuk disimpan
    const stokData = {
      produk_id,
      tipe,
      jumlah: Number(jumlah),
      keterangan: keterangan || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Simpan ke collection stock
    await db.collection("stock").add(stokData);

    res
      .status(201)
      .json({ message: "Riwayat stok berhasil disimpan", stokData });
  } catch (error) {
    console.error("❌ Error tambah stok:", error);
    res.status(500).json({ error: "Gagal menambah stok" });
  }
});

// Endpoint: GET /api/stock
// Fungsi: Mengambil riwayat stok, bisa difilter by produk_id
router.get("/", async (req, res) => {
  try {
    const { produk_id } = req.query;
    // Base query dengan sorting descending by createdAt
    let query = db.collection("stock").orderBy("createdAt", "desc");
    // Filter by produk_id jika ada parameter
    if (produk_id) query = query.where("produk_id", "==", produk_id);

    const snapshot = await query.get();
    const stocks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(stocks);
  } catch (error) {
    console.error("❌ Error ambil stok:", error);
    res.status(500).json({ error: "Gagal mengambil data stok" });
  }
});

export default router;
