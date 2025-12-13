// Products Router - API endpoints untuk manajemen produk
// Endpoints: GET /products, POST /products, PUT /products/:id, PUT /products/:id/stock, DELETE /products/:id

import express from "express";
import { db } from "../firebase.js";
import admin from "firebase-admin";

const router = express.Router();

// Endpoint: GET /api/products
// Fungsi: Mengambil semua produk dengan kalkulasi stok real-time dan data kategori
router.get("/", async (req, res) => {
  try {
    // Ambil semua dokumen produk dari Firestore
    const snapshot = await db.collection("products").get();
    const products = [];

    // Iterasi setiap produk untuk menghitung stok real-time
    for (const doc of snapshot.docs) {
      const data = doc.data();

      console.log(
        `\n🔍 Calculating stock for product: ${data.nama} (${doc.id})`
      );

      // Kalkulasi stok dari tabel stock (masuk - keluar)
      const stockSnap = await db
        .collection("stock")
        .where("produk_id", "==", doc.id)
        .get();

      let totalMasuk = 0; // Total stok masuk
      let totalKeluar = 0; // Total stok keluar yang sudah dikonfirmasi

      // Hitung total masuk dan keluar
      stockSnap.forEach((s) => {
        const st = s.data();

        if (st.tipe === "masuk") {
          totalMasuk += st.jumlah;
          console.log(`➕ MASUK: ${st.jumlah} - ${st.keterangan}`);
        } else if (st.tipe === "keluar") {
          // Hanya hitung stok keluar yang bukan status 'returned' (dibatalkan)
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

      // Stok akhir = total masuk - total keluar
      const stokAkhir = totalMasuk - totalKeluar;

      console.log(
        `📊 Total MASUK: ${totalMasuk}, Total KELUAR: ${totalKeluar}, STOK AKHIR: ${stokAkhir}`
      );

      // Join dengan tabel kategori untuk mendapatkan nama kategori
      let kategoriData = null;
      if (data.kategori_id) {
        const kategoriDoc = await db
          .collection("categories")
          .doc(data.kategori_id)
          .get();
        if (kategoriDoc.exists) {
          kategoriData = kategoriDoc.data();
        }
      }

      // Gabungkan data produk dengan stok dan kategori
      products.push({
        id: doc.id,
        ...data,
        stok: stokAkhir,
        kategori_nama: kategoriData ? kategoriData.nama : "Tidak ada kategori",
        kategori_id: data.kategori_id || null,
      });
    }

    // Return array produk dengan status 200 OK
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Gagal mengambil produk" });
  }
});

// Endpoint: POST /api/products
// Fungsi: Menambah produk baru beserta stok awal ke database
router.post("/", async (req, res) => {
  try {
    const {
      nama,
      kategori_id,
      harga,
      img_url,
      deskripsi,
      link_tokopedia,
      link_shopee,
      stok,
    } = req.body;

    // Validasi field wajib: nama, kategori_id, harga
    if (!nama || !kategori_id || !harga) {
      return res.status(400).json({ error: "Data produk tidak lengkap" });
    }

    // Validasi kategori exists di database
    const kategoriDoc = await db
      .collection("categories")
      .doc(kategori_id)
      .get();
    if (!kategoriDoc.exists) {
      return res.status(400).json({ error: "Kategori tidak ditemukan" });
    }

    // Siapkan object produk baru dengan default values
    const newProduct = {
      nama,
      kategori_id,
      harga,
      img_url: img_url || "",
      deskripsi: deskripsi || "",
      link_tokopedia: link_tokopedia || "",
      link_shopee: link_shopee || "",
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Simpan produk ke Firestore collection 'products'
    const productRef = await db.collection("products").add(newProduct);

    // Jika ada stok awal, tambahkan entry ke tabel stock dengan tipe 'masuk'
    if (stok && Number(stok) > 0) {
      await db.collection("stock").add({
        produk_id: productRef.id,
        tipe: "masuk",
        jumlah: Number(stok),
        keterangan: "Stok awal produk",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Return produk yang baru dibuat dengan status 201 Created
    res.status(201).json({
      message: "Produk berhasil ditambahkan beserta stok awal",
      id: productRef.id,
      ...newProduct,
      stok: Number(stok) || 0,
    });
  } catch (error) {
    console.error("❌ Error tambah produk:", error);
    res.status(500).json({ error: "Gagal menambah produk" });
  }
});

// Endpoint: PUT /api/products/:id
// Fungsi: Update data produk berdasarkan ID (tidak termasuk stok)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Jika update kategori_id, validasi kategori exists
    if (updateData.kategori_id) {
      const kategoriDoc = await db
        .collection("categories")
        .doc(updateData.kategori_id)
        .get();
      if (!kategoriDoc.exists) {
        return res.status(400).json({ error: "Kategori tidak ditemukan" });
      }
    }

    // Validasi produk exists di database
    const productRef = db.collection("products").doc(id);
    const doc = await productRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    // Update dokumen produk dengan data baru
    await productRef.update(updateData);

    res.status(200).json({
      id,
      ...updateData,
      message: "Produk berhasil diupdate",
    });
  } catch (error) {
    console.error("Error update produk:", error);
    res
      .status(500)
      .json({ error: "Gagal update produk", details: error.message });
  }
});

// Endpoint: PUT /api/products/:id/stock
// Fungsi: Update stok produk dengan memodifikasi entry stok awal
router.put("/:id/stock", async (req, res) => {
  try {
    const { id } = req.params;
    const { stok } = req.body;

    // Validasi stok harus integer positif
    if (!Number.isInteger(stok) || stok < 0)
      return res.status(400).json({ error: "Stok tidak valid" });

    console.log(`🔄 Updating stock for product ${id} to ${stok}`);

    // Hitung stok akhir saat ini dari tabel stock
    const stockSnap = await db
      .collection("stock")
      .where("produk_id", "==", id)
      .get();

    let totalMasuk = 0;
    let totalKeluar = 0;

    // Kalkulasi total masuk dan keluar yang sudah confirmed
    stockSnap.forEach((doc) => {
      const data = doc.data();
      if (data.tipe === "masuk") {
        totalMasuk += data.jumlah;
      } else if (data.tipe === "keluar" && data.status !== "returned") {
        totalKeluar += data.jumlah;
      }
    });

    console.log(
      `📊 Current - Masuk: ${totalMasuk}, Keluar: ${totalKeluar}, Stok Akhir: ${
        totalMasuk - totalKeluar
      }`
    );

    const stokAkhirSekarang = totalMasuk - totalKeluar;
    const selisihStok = stok - stokAkhirSekarang;

    console.log(`🎯 Target stok: ${stok}, Selisih: ${selisihStok}`);

    if (selisihStok !== 0) {
      // Cari entry stok awal yang sudah ada
      const stokAwalSnap = await db
        .collection("stock")
        .where("produk_id", "==", id)
        .where("keterangan", "==", "Stok awal produk")
        .get();

      let stokAwalDoc = null;
      stokAwalSnap.forEach((doc) => {
        stokAwalDoc = { ref: doc.ref, data: doc.data() };
      });

      // Jika sudah ada entry stok awal, update jumlahnya
      if (stokAwalDoc) {
        const newStokAwal = stokAwalDoc.data.jumlah + selisihStok;
        // Validasi tidak boleh negatif
        if (newStokAwal < 0) {
          return res.status(400).json({
            error: `Tidak dapat mengurangi stok. Stok minimum: ${
              stokAkhirSekarang + stokAwalDoc.data.jumlah
            }`,
          });
        }

        // Update entry stok awal yang ada
        await stokAwalDoc.ref.update({
          jumlah: newStokAwal,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(
          `📝 Updated existing stok awal: ${stokAwalDoc.data.jumlah} → ${newStokAwal}`
        );
      } else {
        // Jika belum ada entry stok awal, buat baru (hanya untuk penambahan stok)
        if (selisihStok > 0) {
          await db.collection("stock").add({
            produk_id: id,
            tipe: "masuk",
            jumlah: selisihStok,
            keterangan: "Stok awal produk",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`📝 Created new stok awal: ${selisihStok}`);
        } else {
          return res.status(400).json({
            error:
              "Tidak dapat mengurangi stok karena tidak ada stok awal yang bisa dikurangi",
          });
        }
      }
    }

    // Verifikasi stok akhir setelah update dengan query ulang
    const updatedStockSnap = await db
      .collection("stock")
      .where("produk_id", "==", id)
      .get();

    let updatedTotalMasuk = 0;
    let updatedTotalKeluar = 0;

    // Kalkulasi ulang stok akhir setelah update
    updatedStockSnap.forEach((doc) => {
      const data = doc.data();
      if (data.tipe === "masuk") {
        updatedTotalMasuk += data.jumlah;
      } else if (data.tipe === "keluar" && data.status !== "returned") {
        updatedTotalKeluar += data.jumlah;
      }
    });

    const stokAkhirBaru = updatedTotalMasuk - updatedTotalKeluar;
    console.log(
      `✅ Updated - Masuk: ${updatedTotalMasuk}, Keluar: ${updatedTotalKeluar}, Stok Akhir: ${stokAkhirBaru}`
    );

    res.status(200).json({
      message: "Stok berhasil diperbarui",
      stok: stokAkhirBaru,
      previous_stock: stokAkhirSekarang,
      adjustment: selisihStok,
    });
  } catch (error) {
    console.error("Error update stok:", error);
    res
      .status(500)
      .json({ error: "Gagal update stok", details: error.message });
  }
});

// Endpoint: DELETE /api/products/:id
// Fungsi: Soft delete produk dan hapus semua entry stok terkait
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting product ${id}`);

    // Validasi produk exists
    const productRef = db.collection("products").doc(id);
    const doc = await productRef.get();

    if (!doc.exists) {
      console.log(`❌ Product ${id} not found`);
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    // Hapus semua entry stok yang berkaitan dengan produk ini
    const stockSnap = await db
      .collection("stock")
      .where("produk_id", "==", id)
      .get();

    if (!stockSnap.empty) {
      // Batch delete untuk efisiensi
      const batch = db.batch();
      stockSnap.forEach((stockDoc) => batch.delete(stockDoc.ref));
      await batch.commit();
      console.log(`🧹 ${stockSnap.size} stok entry deleted for product ${id}`);
    } else {
      console.log(`ℹ️ No stock found for product ${id}`);
    }

    // Hapus dokumen produk
    await productRef.delete();

    console.log(`✅ Product ${id} and related stock deleted successfully`);
    res.status(200).json({
      id,
      message: "Produk dan stok terkait berhasil dihapus",
    });
  } catch (error) {
    console.error("❌ Error delete produk:", error);
    res.status(500).json({
      error: "Gagal menghapus produk dan stok terkait",
      details: error.message,
    });
  }
});

export default router;
