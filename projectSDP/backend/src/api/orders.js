// Orders Router - API endpoints untuk manajemen pesanan
// Endpoints: GET /orders, POST /orders, PATCH /orders/:orderId, POST /orders/:orderId/return-stock, POST /orders/:orderId/confirm-stock

import express from "express";
import { db } from "../firebase.js";
import admin from "firebase-admin";

const router = express.Router();

// Endpoint: POST /api/orders
// Fungsi: Checkout - buat order baru dengan validasi dan reservasi stok
router.post("/", async (req, res) => {
  try {
    console.log("📦 Received order request:", req.body);

    const { userId, items, total } = req.body;

    // Validasi field wajib
    if (!userId) {
      return res.status(400).json({ error: "userId wajib diisi" });
    }

    // Validasi items harus array dan tidak kosong
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: "Items wajib diisi dan harus array" });
    }

    // Validasi total harus number
    if (!total || isNaN(total)) {
      return res
        .status(400)
        .json({ error: "Total wajib diisi dan harus angka" });
    }

    console.log("🔍 Validating stock for", items.length, "items...");

    // Loop setiap item untuk validasi produk dan stok
    for (const item of items) {
      console.log("📋 Checking item:", item);

      // Validasi produk_id wajib
      if (!item.produk_id) {
        return res
          .status(400)
          .json({ error: "produk_id wajib diisi untuk setiap item" });
      }

      // Validasi jumlah harus >= 1
      if (!item.jumlah || item.jumlah < 1) {
        return res
          .status(400)
          .json({ error: "Jumlah item harus lebih dari 0" });
      }

      // Validasi produk exists di database
      const produkDoc = await db
        .collection("products")
        .doc(item.produk_id)
        .get();
      if (!produkDoc.exists) {
        return res.status(404).json({
          error: `Produk dengan ID ${item.produk_id} tidak ditemukan`,
        });
      }

      // Hitung stok tersedia dari tabel stock
      const stockSnap = await db
        .collection("stock")
        .where("produk_id", "==", item.produk_id)
        .get();

      let totalMasuk = 0;
      let totalKeluar = 0;

      // Kalkulasi stok (masuk - keluar yang bukan returned)
      stockSnap.forEach((s) => {
        const st = s.data();
        if (st.tipe === "masuk") totalMasuk += st.jumlah;
        else if (st.tipe === "keluar" && st.status !== "returned")
          totalKeluar += st.jumlah;
      });

      const stokAkhir = totalMasuk - totalKeluar;
      console.log(
        `📊 Stock for ${item.produk_id}: ${stokAkhir} (needed: ${item.jumlah})`
      );

      // Validasi stok cukup untuk order
      if (stokAkhir < item.jumlah) {
        const produkData = produkDoc.data();
        return res.status(400).json({
          error: `Stok tidak cukup untuk produk "${produkData.nama}". Stok tersedia: ${stokAkhir}, dibutuhkan: ${item.jumlah}`,
        });
      }

      // Reservasi stok dengan status 'pending' (belum confirmed)
      await db.collection("stock").add({
        produk_id: item.produk_id,
        tipe: "keluar",
        jumlah: item.jumlah,
        keterangan: "Stok dikurangi untuk order pending",
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ Stock reduced for product ${item.produk_id}`);
    }

    // Simpan order ke database dengan status 'pending'
    console.log("💾 Saving order to database...");
    const newOrder = await db.collection("orders").add({
      userId,
      items,
      total: Number(total),
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("🎉 Order created successfully:", newOrder.id);

    res.status(201).json({
      message: "Order berhasil dibuat",
      orderId: newOrder.id,
    });
  } catch (err) {
    console.error("❌ Error create order:", err);
    res.status(500).json({
      error: "Gagal membuat order",
      details: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});

// Endpoint: POST /api/orders/:orderId/return-stock
// Fungsi: Kembalikan stok ketika order ditolak (ubah status pending jadi returned)
router.post("/:orderId/return-stock", async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(`🔄 Processing stock return for order: ${orderId}`);
    // Validasi order exists
    const orderDoc = await db.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: "Order tidak ditemukan" });
    }

    const order = orderDoc.data();
    console.log(`📦 Order found with ${order.items?.length} items`);
    // Loop setiap item untuk kembalikan stok
    const stockReturnPromises = order.items?.map(async (item) => {
      console.log(
        `🔄 Returning stock for product: ${item.produk_id}, quantity: ${item.jumlah}`
      );

      try {
        // Cari entry stock dengan status 'pending' untuk produk ini
        const stockSnap = await db
          .collection("stock")
          .where("produk_id", "==", item.produk_id)
          .where("status", "==", "pending")
          .get();

        console.log(
          `📊 Found ${stockSnap.size} pending stock records for product ${item.produk_id}`
        );

        if (!stockSnap.empty) {
          // Cari entry paling baru (latest)
          let latestStock = null;
          let latestDate = null;

          stockSnap.forEach((doc) => {
            const data = doc.data();
            const date = data.createdAt?.toDate();
            if (!latestDate || date > latestDate) {
              latestDate = date;
              latestStock = { doc, data };
            }
          });

          if (latestStock) {
            console.log(`📝 Latest stock record to update:`, latestStock.data);
            // Update status dari 'pending' ke 'returned' (stok dikembalikan)
            await latestStock.doc.ref.update({
              status: "returned",
              returned_at: admin.firestore.FieldValue.serverTimestamp(),
              keterangan: "Stok dikembalikan - order ditolak",
            });

            console.log(
              `✅ Stock returned for product ${item.produk_id} (status updated to returned)`
            );
            return {
              success: true,
              product_id: item.produk_id,
              quantity: item.jumlah,
            };
          }
        } else {
          console.log(
            `⚠️ No pending stock found for product ${item.produk_id}`
          );
          return {
            success: false,
            product_id: item.produk_id,
            error: "No pending stock found",
          };
        }
      } catch (error) {
        console.error(
          `❌ Error returning stock for product ${item.produk_id}:`,
          error
        );
        return {
          success: false,
          product_id: item.produk_id,
          error: error.message,
        };
      }
    });

    const results = await Promise.all(stockReturnPromises);
    const successfulReturns = results.filter((r) => r.success);
    const failedReturns = results.filter((r) => !r.success);

    console.log(
      `📊 Stock return results: ${successfulReturns.length} success, ${failedReturns.length} failed`
    );

    if (failedReturns.length > 0) {
      return res.status(207).json({
        message: "Stok sebagian berhasil dikembalikan",
        successful: successfulReturns,
        failed: failedReturns,
      });
    }

    console.log(`🎉 All stock successfully returned for order ${orderId}`);
    res.status(200).json({
      message: "Stok berhasil dikembalikan untuk semua item",
      returned_items: successfulReturns,
    });
  } catch (err) {
    console.error("❌ Error return stock:", err);
    res.status(500).json({
      error: "Gagal mengembalikan stok",
      details: err.message,
    });
  }
});

// Endpoint: POST /api/orders/:orderId/confirm-stock
// Fungsi: Konfirmasi stok ketika order diterima (ubah status pending jadi confirmed)
router.post("/:orderId/confirm-stock", async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(`🔒 Confirming stock for order: ${orderId}`);

    // Validasi order exists
    const orderDoc = await db.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: "Order tidak ditemukan" });
    }

    const order = orderDoc.data();
    console.log(`📦 Order found with ${order.items?.length} items`);

    const confirmPromises = order.items?.map(async (item) => {
      console.log(`🔒 Confirming stock for product: ${item.produk_id}`);

      try {
        const stockSnap = await db
          .collection("stock")
          .where("produk_id", "==", item.produk_id)
          .where("status", "==", "pending")
          .get();

        console.log(
          `📊 Found ${stockSnap.size} pending stock records for product ${item.produk_id}`
        );

        if (!stockSnap.empty) {
          let latestStock = null;
          let latestDate = null;

          stockSnap.forEach((doc) => {
            const data = doc.data();
            const date = data.createdAt?.toDate();
            if (!latestDate || date > latestDate) {
              latestDate = date;
              latestStock = doc;
            }
          });

          if (latestStock) {
            await latestStock.ref.update({
              status: "confirmed",
              confirmed_at: admin.firestore.FieldValue.serverTimestamp(),
              keterangan: "Stok terkonfirmasi - order diterima",
            });

            console.log(`✅ Stock confirmed for product ${item.produk_id}`);
            return { success: true, product_id: item.produk_id };
          }
        } else {
          console.log(
            `⚠️ No pending stock found for product ${item.produk_id}`
          );
          return {
            success: false,
            product_id: item.produk_id,
            error: "No pending stock found",
          };
        }
      } catch (error) {
        console.error(
          `❌ Error confirming stock for product ${item.produk_id}:`,
          error
        );
        return {
          success: false,
          product_id: item.produk_id,
          error: error.message,
        };
      }
    });

    const results = await Promise.all(confirmPromises);
    const successfulConfirms = results.filter((r) => r.success);
    const failedConfirms = results.filter((r) => !r.success);

    console.log(
      `📊 Stock confirm results: ${successfulConfirms.length} success, ${failedConfirms.length} failed`
    );

    if (failedConfirms.length > 0) {
      return res.status(207).json({
        message: "Stok sebagian berhasil dikonfirmasi",
        successful: successfulConfirms,
        failed: failedConfirms,
      });
    }

    res.status(200).json({
      message: "Stok berhasil dikonfirmasi untuk semua item",
      confirmed_items: successfulConfirms,
    });
  } catch (err) {
    console.error("❌ Error confirm stock:", err);
    res.status(500).json({
      error: "Gagal mengonfirmasi stok",
      details: err.message,
    });
  }
});

// Endpoint: GET /api/orders
// Fungsi: Mengambil daftar order, bisa difilter by userId
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    // Ambil semua orders dulu
    let query = db.collection("orders");
    const snapshot = await query.get();

    let orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter by userId jika ada (manual karena avoid composite index)
    if (userId) {
      orders = orders.filter((order) => order.userId === userId);
    }

    // Sort by createdAt descending (manual sort)
    orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate
        ? a.createdAt.toDate()
        : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate
        ? b.createdAt.toDate()
        : new Date(b.createdAt);
      return dateB - dateA;
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil order" });
  }
});

// Endpoint: PATCH /api/orders/:orderId
// Fungsi: Update status order (pending, accepted, rejected)
router.patch("/:orderId", async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;

    // Validasi status harus salah satu dari 3 opsi
    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status tidak valid" });
    }

    await db.collection("orders").doc(orderId).update({ status });
    res.json({ message: "Status order diperbarui" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal update status order" });
  }
});

export default router;
