// Cart Router - API endpoints untuk manajemen keranjang belanja
// Endpoints: GET /cart, POST /cart, PUT /cart/:id, DELETE /cart/:id

import express from "express";
import { db } from "../firebase.js";
import admin from "firebase-admin";

const router = express.Router();

// Endpoint: GET /api/cart
// Fungsi: Mengambil cart items milik user dengan data produk dan stok real-time
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    // Validasi userId wajib ada
    if (!userId) {
      return res.status(400).json({ error: "userId diperlukan" });
    }

    // Query cart berdasarkan userId
    const snapshot = await db
      .collection("cart")
      .where("userId", "==", userId)
      .get();

    const cartItems = [];
    console.log(snapshot.docs);

    // Iterasi setiap cart item untuk join dengan data produk dan hitung stok
    for (const doc of snapshot.docs) {
      const data = doc.data();
      // Join dengan tabel products untuk data produk
      const produkDoc = await db
        .collection("products")
        .doc(data.produk_id)
        .get();
      const produkData = produkDoc.exists ? produkDoc.data() : null;
      console.log(produkData);

      // Hitung stok real-time dari tabel stock
      const stockSnap = await db
        .collection("stock")
        .where("produk_id", "==", data.produk_id)
        .get();

      let totalMasuk = 0;
      let totalKeluar = 0;

      stockSnap.forEach((s) => {
        const st = s.data();

        if (st.tipe === "masuk") {
          totalMasuk += st.jumlah;
          console.log(`➕ MASUK: ${st.jumlah} - ${st.keterangan}`);
        } else if (st.tipe === "keluar") {
          if (st.status !== "returned") {
            totalKeluar += st.jumlah;
            console.log(
              `➖ KELUAR: ${st.jumlah} - ${st.status} - ${st.keterangan}`
            );
          } else {
            console.log(
              `⏸️  KELUAR RETURNED (skip): ${st.jumlah} - ${st.keterangan}`
            );
          }
        }
      });

      const stokAkhir = totalMasuk - totalKeluar;
      console.log(`Ini stok akhir ${stokAkhir}`);
      if (produkData) {
        produkData.stok = stokAkhir;
      }

      // Push cart item dengan data produk dan stok
      cartItems.push({
        id: doc.id,
        produk_id: data.produk_id,
        jumlah: data.jumlah,
        createdAt: data.createdAt,
        produk: produkData
          ? {
              nama: produkData.nama,
              harga: produkData.harga,
              img_url: produkData.img_url,
              stok: produkData.stok,
            }
          : null,
      });
    }

    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Gagal mengambil cart" });
  }
});

// Endpoint: POST /api/cart
// Fungsi: Menambah produk ke cart, update jumlah jika sudah ada
router.post("/", async (req, res) => {
  try {
    const { produk_id, jumlah, userId } = req.body;

    // Validasi field wajib
    if (!produk_id || !jumlah || !userId) {
      return res
        .status(400)
        .json({ error: "produk_id, jumlah, dan userId wajib diisi" });
    }

    // Validasi produk exists
    const produkRef = db.collection("products").doc(produk_id);
    const produkDoc = await produkRef.get();

    if (!produkDoc.exists) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    // Cek apakah produk sudah ada di cart user
    const existingCart = await db
      .collection("cart")
      .where("userId", "==", userId)
      .where("produk_id", "==", produk_id)
      .get();

    let cartItem;

    // Jika sudah ada, update jumlahnya (increment)
    if (!existingCart.empty) {
      const existingDoc = existingCart.docs[0];
      const existingData = existingDoc.data();
      const newJumlah = existingData.jumlah + jumlah;

      await existingDoc.ref.update({ jumlah: newJumlah });
      cartItem = { id: existingDoc.id, jumlah: newJumlah };
    } else {
      // Jika belum ada, buat cart item baru
      const newCart = await db.collection("cart").add({
        produk_id,
        jumlah,
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      cartItem = { id: newCart.id, jumlah };
    }

    const produkData = produkDoc.data();
    res.status(201).json({
      ...cartItem,
      produk_id,
      produk: {
        nama: produkData.nama,
        harga: produkData.harga,
        img_url: produkData.img_url,
      },
    });
  } catch (error) {
    console.error("Error tambah cart:", error);
    res
      .status(500)
      .json({ error: "Gagal menambah ke cart", details: error.message });
  }
});

// Endpoint: PUT /api/cart/:id
// Fungsi: Update jumlah item di cart
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const jumlah = Number(req.body.jumlah);

    // Validasi jumlah harus integer >= 1
    if (!Number.isInteger(jumlah) || jumlah < 1) {
      return res.status(400).json({ error: "Jumlah tidak valid" });
    }

    // Validasi cart item exists
    const cartRef = db.collection("cart").doc(id);
    const doc = await cartRef.get();

    if (!doc.exists)
      return res.status(404).json({ error: "Item cart tidak ditemukan" });

    // Update jumlah
    await cartRef.update({ jumlah });

    res
      .status(200)
      .json({ id, jumlah, message: "Jumlah item berhasil diperbarui" });
  } catch (error) {
    console.error("Error update cart:", error);
    res
      .status(500)
      .json({ error: "Gagal update cart", details: error.message });
  }
});

// Endpoint: DELETE /api/cart/:id
// Fungsi: Hapus item dari cart
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Validasi cart item exists
    const cartRef = db.collection("cart").doc(id);
    const doc = await cartRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Item cart tidak ditemukan" });
    }

    await cartRef.delete();
    res.status(200).json({ id, message: "Item cart berhasil dihapus" });
  } catch (error) {
    console.error("Error delete cart:", error);
    res
      .status(500)
      .json({ error: "Gagal menghapus cart", details: error.message });
  }
});

export default router;
