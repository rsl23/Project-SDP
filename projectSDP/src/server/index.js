import express from "express";
import cors from "cors";
import { db } from "./firebase.js";
import { img, u } from "framer-motion/client";
import admin from "firebase-admin";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/products", async (req, res) => {
  try {
    const snapshot = await db.collection("products").get();
    const products = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      console.log(
        `\n🔍 Calculating stock for product: ${data.nama} (${doc.id})`
      );

      // Hitung stok dari tabel stock
      const stockSnap = await db
        .collection("stock")
        .where("produk_id", "==", doc.id)
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

      console.log(
        `📊 Total MASUK: ${totalMasuk}, Total KELUAR: ${totalKeluar}, STOK AKHIR: ${stokAkhir}`
      );

      // Ambil data kategori
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

      products.push({
        id: doc.id,
        ...data,
        stok: stokAkhir,
        kategori_nama: kategoriData ? kategoriData.nama : "Tidak ada kategori",
        kategori_id: data.kategori_id || null,
      });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Gagal mengambil produk" });
  }
});

app.post("/api/products", async (req, res) => {
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

    if (!nama || !kategori_id || !harga) {
      return res.status(400).json({ error: "Data produk tidak lengkap" });
    }

    // Validasi kategori exists
    const kategoriDoc = await db
      .collection("categories")
      .doc(kategori_id)
      .get();
    if (!kategoriDoc.exists) {
      return res.status(400).json({ error: "Kategori tidak ditemukan" });
    }

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

    const productRef = await db.collection("products").add(newProduct);

    if (stok && Number(stok) > 0) {
      await db.collection("stock").add({
        produk_id: productRef.id,
        tipe: "masuk",
        jumlah: Number(stok),
        keterangan: "Stok awal produk",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

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

app.put("/api/products/:id", async (req, res) => {
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

    const productRef = db.collection("products").doc(id);
    const doc = await productRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

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

app.put("/api/products/:id/stock", async (req, res) => {
  try {
    const { id } = req.params;
    const { stok } = req.body;

    if (!Number.isInteger(stok) || stok < 0)
      return res.status(400).json({ error: "Stok tidak valid" });

    console.log(`🔄 Updating stock for product ${id} to ${stok}`);

    const stockSnap = await db
      .collection("stock")
      .where("produk_id", "==", id)
      .get();

    let totalMasuk = 0;
    let totalKeluar = 0;

    stockSnap.forEach((doc) => {
      const data = doc.data();
      if (data.tipe === "masuk") {
        totalMasuk += data.jumlah;
      } else if (data.tipe === "keluar" && data.status !== "returned") {
        totalKeluar += data.jumlah;
      }
    });

    console.log(
      `📊 Current - Masuk: ${totalMasuk}, Keluar: ${totalKeluar}, Stok Akhir: ${totalMasuk - totalKeluar
      }`
    );

    const stokAkhirSekarang = totalMasuk - totalKeluar;
    const selisihStok = stok - stokAkhirSekarang;

    console.log(`🎯 Target stok: ${stok}, Selisih: ${selisihStok}`);

    if (selisihStok !== 0) {
      const stokAwalSnap = await db
        .collection("stock")
        .where("produk_id", "==", id)
        .where("keterangan", "==", "Stok awal produk")
        .get();

      let stokAwalDoc = null;
      stokAwalSnap.forEach((doc) => {
        stokAwalDoc = { ref: doc.ref, data: doc.data() };
      });

      if (stokAwalDoc) {
        const newStokAwal = stokAwalDoc.data.jumlah + selisihStok;
        if (newStokAwal < 0) {
          return res.status(400).json({
            error: `Tidak dapat mengurangi stok. Stok minimum: ${stokAkhirSekarang + stokAwalDoc.data.jumlah
              }`,
          });
        }

        await stokAwalDoc.ref.update({
          jumlah: newStokAwal,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(
          `📝 Updated existing stok awal: ${stokAwalDoc.data.jumlah} → ${newStokAwal}`
        );
      } else {
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

    const updatedStockSnap = await db
      .collection("stock")
      .where("produk_id", "==", id)
      .get();

    let updatedTotalMasuk = 0;
    let updatedTotalKeluar = 0;

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

app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting product ${id}`);

    const productRef = db.collection("products").doc(id);
    const doc = await productRef.get();

    if (!doc.exists) {
      console.log(`❌ Product ${id} not found`);
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    const stockSnap = await db
      .collection("stock")
      .where("produk_id", "==", id)
      .get();

    if (!stockSnap.empty) {
      const batch = db.batch();
      stockSnap.forEach((stockDoc) => batch.delete(stockDoc.ref));
      await batch.commit();
      console.log(`🧹 ${stockSnap.size} stok entry deleted for product ${id}`);
    } else {
      console.log(`ℹ️ No stock found for product ${id}`);
    }

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

app.post("/api/stock", async (req, res) => {
  try {
    const { produk_id, tipe, jumlah, keterangan } = req.body;

    if (!produk_id || !["masuk", "keluar"].includes(tipe) || !jumlah) {
      return res
        .status(400)
        .json({ error: "Data stok tidak lengkap / tidak valid" });
    }

    const produkRef = db.collection("products").doc(produk_id);
    const produkDoc = await produkRef.get();
    if (!produkDoc.exists) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    const stokData = {
      produk_id,
      tipe,
      jumlah: Number(jumlah),
      keterangan: keterangan || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("stock").add(stokData);

    res
      .status(201)
      .json({ message: "Riwayat stok berhasil disimpan", stokData });
  } catch (error) {
    console.error("❌ Error tambah stok:", error);
    res.status(500).json({ error: "Gagal menambah stok" });
  }
});

app.get("/api/stock", async (req, res) => {
  try {
    const { produk_id } = req.query;
    let query = db.collection("stock").orderBy("createdAt", "desc");
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

app.get("/api/cart", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId diperlukan" });
    }

    const snapshot = await db
      .collection("cart")
      .where("userId", "==", userId)
      .get();

    const cartItems = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const produkDoc = await db
        .collection("products")
        .doc(data.produk_id)
        .get();
      const produkData = produkDoc.exists ? produkDoc.data() : null;
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
      produkData.stok = stokAkhir;

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

app.post("/api/cart", async (req, res) => {
  try {
    const { produk_id, jumlah, userId } = req.body;

    if (!produk_id || !jumlah || !userId) {
      return res
        .status(400)
        .json({ error: "produk_id, jumlah, dan userId wajib diisi" });
    }

    const produkRef = db.collection("products").doc(produk_id);
    const produkDoc = await produkRef.get();

    if (!produkDoc.exists) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    const existingCart = await db
      .collection("cart")
      .where("userId", "==", userId)
      .where("produk_id", "==", produk_id)
      .get();

    let cartItem;

    if (!existingCart.empty) {
      const existingDoc = existingCart.docs[0];
      const existingData = existingDoc.data();
      const newJumlah = existingData.jumlah + jumlah;

      await existingDoc.ref.update({ jumlah: newJumlah });
      cartItem = { id: existingDoc.id, jumlah: newJumlah };
    } else {
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

app.put("/api/cart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const jumlah = Number(req.body.jumlah);

    if (!Number.isInteger(jumlah) || jumlah < 1) {
      return res.status(400).json({ error: "Jumlah tidak valid" });
    }

    const cartRef = db.collection("cart").doc(id);
    const doc = await cartRef.get();

    if (!doc.exists)
      return res.status(404).json({ error: "Item cart tidak ditemukan" });

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

app.delete("/api/cart/:id", async (req, res) => {
  try {
    const { id } = req.params;
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

app.post("/api/orders", async (req, res) => {
  try {
    console.log("📦 Received order request:", req.body);

    const { userId, items, total } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId wajib diisi" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: "Items wajib diisi dan harus array" });
    }

    if (!total || isNaN(total)) {
      return res
        .status(400)
        .json({ error: "Total wajib diisi dan harus angka" });
    }

    console.log("🔍 Validating stock for", items.length, "items...");

    for (const item of items) {
      console.log("📋 Checking item:", item);

      if (!item.produk_id) {
        return res
          .status(400)
          .json({ error: "produk_id wajib diisi untuk setiap item" });
      }

      if (!item.jumlah || item.jumlah < 1) {
        return res
          .status(400)
          .json({ error: "Jumlah item harus lebih dari 0" });
      }

      const produkDoc = await db
        .collection("products")
        .doc(item.produk_id)
        .get();
      if (!produkDoc.exists) {
        return res.status(404).json({
          error: `Produk dengan ID ${item.produk_id} tidak ditemukan`,
        });
      }

      const stockSnap = await db
        .collection("stock")
        .where("produk_id", "==", item.produk_id)
        .get();

      let totalMasuk = 0;
      let totalKeluar = 0;

      stockSnap.forEach((s) => {
        const st = s.data();
        if (st.tipe === "masuk") totalMasuk += st.jumlah;
        else if (st.tipe === "keluar" && st.status !== "returned")
          totalKeluar += st.jumlah; // PASTIKAN SAMA
      });

      const stokAkhir = totalMasuk - totalKeluar;
      console.log(
        `📊 Stock for ${item.produk_id}: ${stokAkhir} (needed: ${item.jumlah})`
      );

      if (stokAkhir < item.jumlah) {
        const produkData = produkDoc.data();
        return res.status(400).json({
          error: `Stok tidak cukup untuk produk "${produkData.nama}". Stok tersedia: ${stokAkhir}, dibutuhkan: ${item.jumlah}`,
        });
      }

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

app.post("/api/orders/:orderId/return-stock", async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(`🔄 Processing stock return for order: ${orderId}`);
    const orderDoc = await db.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: "Order tidak ditemukan" });
    }

    const order = orderDoc.data();
    console.log(`📦 Order found with ${order.items?.length} items`);
    const stockReturnPromises = order.items?.map(async (item) => {
      console.log(
        `🔄 Returning stock for product: ${item.produk_id}, quantity: ${item.jumlah}`
      );

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
              latestStock = { doc, data };
            }
          });

          if (latestStock) {
            console.log(`📝 Latest stock record to update:`, latestStock.data);
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

app.post("/api/orders/:orderId/confirm-stock", async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(`🔒 Confirming stock for order: ${orderId}`);

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

app.get("/api/orders", async (req, res) => {
  try {
    const { userId } = req.query;

    let query = db.collection("orders");
    const snapshot = await query.get();

    let orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply user filter manually
    if (userId) {
      orders = orders.filter(order => order.userId === userId);
    }

    // Sort by createdAt manually
    orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA;
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil order" });
  }
});

app.patch("/api/orders/:orderId", async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;

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

app.get("/api/categories", async (req, res) => {
  try {
    const snapshot = await db
      .collection("categories")
      .orderBy("nama", "asc")
      .get();

    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Gagal mengambil kategori" });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const { nama } = req.body;

    if (!nama || nama.trim() === "") {
      return res
        .status(400)
        .json({ error: "Nama kategori tidak boleh kosong" });
    }

    // Cek apakah kategori sudah ada
    const existingCategory = await db
      .collection("categories")
      .where("nama", "==", nama.trim())
      .get();

    if (!existingCategory.empty) {
      return res.status(400).json({ error: "Kategori sudah ada" });
    }

    const newCategory = {
      nama: nama.trim(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const categoryRef = await db.collection("categories").add(newCategory);

    res.status(201).json({
      id: categoryRef.id,
      ...newCategory,
      message: "Kategori berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ error: "Gagal menambah kategori" });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const productsUsingCategory = await db
      .collection("products")
      .where("kategori_id", "==", id)
      .get();

    if (!productsUsingCategory.empty) {
      return res.status(400).json({
        error:
          "Tidak dapat menghapus kategori karena masih digunakan oleh produk",
        productCount: productsUsingCategory.size,
      });
    }

    await db.collection("categories").doc(id).delete();

    res.status(200).json({
      message: "Kategori berhasil dihapus",
      id,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Gagal menghapus kategori" });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nama } = req.body;

    if (!nama || nama.trim() === "") {
      return res
        .status(400)
        .json({ error: "Nama kategori tidak boleh kosong" });
    }

    const existingCategory = await db
      .collection("categories")
      .where("nama", "==", nama.trim())
      .get();

    const isDuplicate = existingCategory.docs.some((doc) => doc.id !== id);
    if (isDuplicate) {
      return res.status(400).json({ error: "Kategori sudah ada" });
    }

    await db.collection("categories").doc(id).update({
      nama: nama.trim(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({
      id,
      nama: nama.trim(),
      message: "Kategori berhasil diupdate",
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Gagal mengupdate kategori" });
  }
});


//---------------- Review APIs ----------------
app.post("/api/reviews", async (req, res) => {
  try {
    const { userId, produk_id, order_id, rating, komentar } = req.body;

    if (!userId || !produk_id || !order_id || !rating) {
      return res.status(400).json({ error: "Data review tidak lengkap" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating harus antara 1-5" });
    }

    // Cek apakah user sudah memberikan review untuk produk ini di order yang sama
    // Simplified query tanpa composite index
    const reviewsSnapshot = await db.collection("reviews").get();
    const existingReview = reviewsSnapshot.docs.find(doc => {
      const data = doc.data();
      return data.userId === userId &&
        data.produk_id === produk_id &&
        data.order_id === order_id;
    });

    if (existingReview) {
      return res.status(400).json({ error: "Anda sudah memberikan review untuk produk ini" });
    }

    // Validasi order exists dan milik user
    const orderDoc = await db.collection("orders").doc(order_id).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: "Order tidak ditemukan" });
    }

    const orderData = orderDoc.data();
    if (orderData.userId !== userId) {
      return res.status(403).json({ error: "Anda tidak memiliki akses ke order ini" });
    }

    // Validasi produk exists
    const produkDoc = await db.collection("products").doc(produk_id).get();
    if (!produkDoc.exists) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    const reviewData = {
      userId,
      produk_id,
      order_id,
      rating: Number(rating),
      komentar: komentar || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const reviewRef = await db.collection("reviews").add(reviewData);

    res.status(201).json({
      message: "Review berhasil ditambahkan",
      reviewId: reviewRef.id,
      ...reviewData,
    });
  } catch (error) {
    console.error("❌ Error tambah review:", error);
    res.status(500).json({ error: "Gagal menambah review" });
  }
});

app.get("/api/reviews", async (req, res) => {
  try {
    const { produk_id, userId, order_id } = req.query;

    // Get all reviews and filter manually to avoid composite index issues
    let query = db.collection("reviews");
    const snapshot = await query.get();

    let reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply filters manually
    if (produk_id) {
      reviews = reviews.filter(review => review.produk_id === produk_id);
    }
    if (userId) {
      reviews = reviews.filter(review => review.userId === userId);
    }
    if (order_id) {
      reviews = reviews.filter(review => review.order_id === order_id);
    }

    // Sort by createdAt manually
    reviews.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA;
    });

    // Get user and product data for each review
    const enhancedReviews = [];
    for (const review of reviews) {
      // Get user data
      let userData = null;
      try {
        const userDoc = await admin.auth().getUser(review.userId);
        userData = {
          email: userDoc.email,
          displayName: userDoc.displayName || userDoc.email.split('@')[0],
        };
      } catch (error) {
        userData = { email: "User", displayName: "User" };
      }

      // Get product data
      let productData = null;
      if (review.produk_id) {
        const productDoc = await db.collection("products").doc(review.produk_id).get();
        if (productDoc.exists) {
          productData = productDoc.data();
        }
      }

      enhancedReviews.push({
        id: review.id,
        ...review,
        user: userData,
        product: productData ? {
          nama: productData.nama,
          img_url: productData.img_url
        } : null,
      });
    }

    res.status(200).json(enhancedReviews);
  } catch (error) {
    console.error("❌ Error ambil reviews:", error);
    res.status(500).json({ error: "Gagal mengambil reviews" });
  }
});

app.get("/api/reviews/product/:produk_id", async (req, res) => {
  try {
    const { produk_id } = req.params;

    // Get all reviews and filter by product_id
    const snapshot = await db.collection("reviews").get();
    const reviews = [];
    let totalRating = 0;

    for (const doc of snapshot.docs) {
      const reviewData = doc.data();

      if (reviewData.produk_id === produk_id) {
        // Get user data
        let userData = null;
        try {
          const userDoc = await admin.auth().getUser(reviewData.userId);
          userData = {
            email: userDoc.email,
            displayName: userDoc.displayName || userDoc.email.split('@')[0],
          };
        } catch (error) {
          userData = { email: "User", displayName: "User" };
        }

        reviews.push({
          id: doc.id,
          ...reviewData,
          user: userData,
        });

        totalRating += reviewData.rating;
      }
    }

    // Sort by createdAt manually
    reviews.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA;
    });

    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    res.status(200).json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("❌ Error ambil reviews produk:", error);
    res.status(500).json({ error: "Gagal mengambil reviews produk" });
  }
});

app.delete("/api/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const reviewDoc = await db.collection("reviews").doc(id).get();
    if (!reviewDoc.exists) {
      return res.status(404).json({ error: "Review tidak ditemukan" });
    }

    await db.collection("reviews").doc(id).delete();

    res.status(200).json({
      message: "Review berhasil dihapus",
      id
    });
  } catch (error) {
    console.error("❌ Error delete review:", error);
    res.status(500).json({ error: "Gagal menghapus review" });
  }
});

//---------------- Gallery APIs ----------------
//---------------- Gallery APIs ----------------
app.get("/api/gallery", async (req, res) => {
  try {
    console.log("📡 Fetching gallery data from Firestore...");

    // PERBAIKAN: Hapus where active dan orderBy sementara untuk testing
    const snapshot = await db.collection("gallery").get();

    const galleryItems = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Found ${galleryItems.length} gallery items`);
    res.status(200).json(galleryItems);

  } catch (error) {
    console.error("❌ Error fetching gallery:", error);
    res.status(500).json({ error: "Gagal mengambil data gallery: " + error.message });
  }
});

app.post("/api/gallery", async (req, res) => {
  try {
    const {
      image_url,
      alt_text,
      description
    } = req.body;

    console.log("📨 Received gallery data:", { image_url, alt_text, description });

    // PERBAIKAN: Hanya image_url yang required
    if (!image_url) {
      return res.status(400).json({
        error: "image_url wajib diisi"
      });
    }

    const galleryData = {
      image_url,
      alt_text: alt_text || "Gambar gallery",
      description: description || "",
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    console.log("💾 Saving to Firestore:", galleryData);
    const galleryRef = await db.collection("gallery").add(galleryData);

    res.status(201).json({
      message: "Gambar gallery berhasil ditambahkan",
      id: galleryRef.id,
      ...galleryData,
    });
  } catch (error) {
    console.error("❌ Error tambah gallery:", error);
    res.status(500).json({ error: "Gagal menambah gambar gallery: " + error.message });
  }
});

app.put("/api/gallery/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      image_url,
      alt_text,
      description,
      active
    } = req.body;

    const galleryRef = db.collection("gallery").doc(id);
    const doc = await galleryRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Gambar gallery tidak ditemukan" });
    }

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (image_url !== undefined) updateData.image_url = image_url;
    if (alt_text !== undefined) updateData.alt_text = alt_text;
    if (description !== undefined) updateData.description = description;
    if (active !== undefined) updateData.active = active;

    await galleryRef.update(updateData);

    res.status(200).json({
      message: "Gambar gallery berhasil diupdate",
      id,
      ...updateData,
    });
  } catch (error) {
    console.error("❌ Error update gallery:", error);
    res.status(500).json({ error: "Gagal update gambar gallery" });
  }
});

app.delete("/api/gallery/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const galleryRef = db.collection("gallery").doc(id);
    const doc = await galleryRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Gambar gallery tidak ditemukan" });
    }

    await galleryRef.delete();

    res.status(200).json({
      message: "Gambar gallery berhasil dihapus",
      id,
    });
  } catch (error) {
    console.error("❌ Error delete gallery:", error);
    res.status(500).json({ error: "Gagal menghapus gambar gallery" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\nServer berjalan di http://localhost:${PORT}`);
});
