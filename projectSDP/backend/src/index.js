// Import dependencies untuk Express server dan Firebase
import express from "express";
import cors from "cors";
import { db } from "./firebase.js";
import { img, u } from "framer-motion/client";
import admin from "firebase-admin";

// Inisialisasi Express app dan middleware
const app = express();
app.use(cors()); // Enable CORS untuk akses dari frontend
app.use(express.json()); // Parse JSON request body

// Endpoint: GET /api/products
// Fungsi: Mengambil semua produk dengan kalkulasi stok real-time dan data kategori
app.get("/api/products", async (req, res) => {
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
app.put("/api/products/:id/stock", async (req, res) => {
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
app.delete("/api/products/:id", async (req, res) => {
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

// Endpoint: POST /api/stock
// Fungsi: Menambah entry riwayat stok manual (masuk/keluar)
app.post("/api/stock", async (req, res) => {
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
app.get("/api/stock", async (req, res) => {
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

// Endpoint: GET /api/cart
// Fungsi: Mengambil cart items milik user dengan data produk dan stok real-time
app.get("/api/cart", async (req, res) => {
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

    // Iterasi setiap cart item untuk join dengan data produk dan hitung stok
    // Iterasi setiap cart item untuk join dengan data produk dan hitung stok
    for (const doc of snapshot.docs) {
      const data = doc.data();
      // Join dengan tabel products untuk data produk
      const produkDoc = await db
        .collection("products")
        .doc(data.produk_id)
        .get();
      const produkData = produkDoc.exists ? produkDoc.data() : null;
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
      produkData.stok = stokAkhir; // Set stok real-time ke produk data

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
app.post("/api/cart", async (req, res) => {
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
app.put("/api/cart/:id", async (req, res) => {
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
app.delete("/api/cart/:id", async (req, res) => {
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

// Endpoint: POST /api/orders
// Fungsi: Checkout - buat order baru dengan validasi dan reservasi stok
app.post("/api/orders", async (req, res) => {
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
app.post("/api/orders/:orderId/return-stock", async (req, res) => {
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
app.post("/api/orders/:orderId/confirm-stock", async (req, res) => {
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
app.get("/api/orders", async (req, res) => {
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
app.patch("/api/orders/:orderId", async (req, res) => {
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

// Endpoint: GET /api/categories
// Fungsi: Mengambil semua kategori dengan sorting by nama
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

// Endpoint: POST /api/categories
// Fungsi: Menambah kategori baru dengan validasi duplikasi
app.post("/api/categories", async (req, res) => {
  try {
    const { nama } = req.body;

    // Validasi nama tidak boleh kosong
    if (!nama || nama.trim() === "") {
      return res
        .status(400)
        .json({ error: "Nama kategori tidak boleh kosong" });
    }

    // Cek apakah kategori dengan nama yang sama sudah ada
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

// Endpoint: DELETE /api/categories/:id
// Fungsi: Hapus kategori (hanya jika tidak dipakai produk)
app.delete("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi kategori tidak digunakan oleh produk
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

// Endpoint: PUT /api/categories/:id
// Fungsi: Update nama kategori dengan validasi duplikasi
app.put("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nama } = req.body;

    // Validasi nama tidak boleh kosong atau hanya spasi
    if (!nama || nama.trim() === "") {
      return res
        .status(400)
        .json({ error: "Nama kategori tidak boleh kosong" });
    }

    // Cek apakah nama kategori baru sudah digunakan kategori lain
    const existingCategory = await db
      .collection("categories")
      .where("nama", "==", nama.trim())
      .get();

    // Pastikan kategori yang ditemukan bukan kategori yang sedang diupdate
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
// Endpoint: POST /api/reviews
// Fungsi: Menambah review produk dengan validasi duplikasi dan ownership
app.post("/api/reviews", async (req, res) => {
  try {
    const { userId, produk_id, order_id, rating, komentar } = req.body;

    // Validasi field wajib
    if (!userId || !produk_id || !order_id || !rating) {
      return res.status(400).json({ error: "Data review tidak lengkap" });
    }

    // Validasi rating harus 1-5
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating harus antara 1-5" });
    }

    // Cek duplikasi: user sudah review produk ini di order yang sama?
    // Manual query untuk avoid composite index
    const reviewsSnapshot = await db.collection("reviews").get();
    const existingReview = reviewsSnapshot.docs.find((doc) => {
      const data = doc.data();
      return (
        data.userId === userId &&
        data.produk_id === produk_id &&
        data.order_id === order_id
      );
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ error: "Anda sudah memberikan review untuk produk ini" });
    }

    // Validasi order exists dan milik user (authorization)
    const orderDoc = await db.collection("orders").doc(order_id).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: "Order tidak ditemukan" });
    }

    const orderData = orderDoc.data();
    if (orderData.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Anda tidak memiliki akses ke order ini" });
    }

    // Validasi produk exists di database
    const produkDoc = await db.collection("products").doc(produk_id).get();
    if (!produkDoc.exists) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    // Siapkan data review untuk disimpan
    const reviewData = {
      userId, // ID user yang memberikan review
      produk_id, // ID produk yang direview
      order_id, // ID order tempat produk dibeli
      rating: Number(rating), // Rating 1-5
      komentar: komentar || "", // Komentar review (opsional)
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Simpan review ke Firestore collection 'reviews'
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

// Endpoint: GET /api/reviews
// Fungsi: Mengambil reviews dengan filter (produk_id, userId, order_id) dan join user data
app.get("/api/reviews", async (req, res) => {
  try {
    const { produk_id, userId, order_id } = req.query;

    // Ambil semua reviews dulu (manual filter untuk avoid composite index requirement)
    // Composite index diperlukan jika query Firestore dengan multiple where clauses
    let query = db.collection("reviews");
    const snapshot = await query.get();

    // Convert snapshot docs menjadi array of objects
    let reviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Terapkan filter secara manual di memory (lebih fleksibel tanpa setup index)
    if (produk_id) {
      reviews = reviews.filter((review) => review.produk_id === produk_id);
    }
    if (userId) {
      reviews = reviews.filter((review) => review.userId === userId);
    }
    if (order_id) {
      reviews = reviews.filter((review) => review.order_id === order_id);
    }

    // Sort reviews by createdAt descending (terbaru di atas)
    // Manual sort karena data sudah di-load ke memory
    reviews.sort((a, b) => {
      // Convert Firestore Timestamp ke JavaScript Date
      const dateA = a.createdAt?.toDate
        ? a.createdAt.toDate()
        : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate
        ? b.createdAt.toDate()
        : new Date(b.createdAt);
      return dateB - dateA; // Descending: review terbaru duluan
    });

    // Join dengan data user dan product untuk response yang lebih informatif
    const enhancedReviews = [];
    for (const review of reviews) {
      // Get user data
      let userData = null;
      try {
        const userDoc = await admin.auth().getUser(review.userId);
        userData = {
          email: userDoc.email,
          displayName: userDoc.displayName || userDoc.email.split("@")[0],
        };
      } catch (error) {
        userData = { email: "User", displayName: "User" };
      }

      // Get product data
      let productData = null;
      if (review.produk_id) {
        const productDoc = await db
          .collection("products")
          .doc(review.produk_id)
          .get();
        if (productDoc.exists) {
          productData = productDoc.data();
        }
      }

      enhancedReviews.push({
        id: review.id,
        ...review,
        user: userData,
        product: productData
          ? {
              nama: productData.nama,
              img_url: productData.img_url,
            }
          : null,
      });
    }

    res.status(200).json(enhancedReviews);
  } catch (error) {
    console.error("❌ Error ambil reviews:", error);
    res.status(500).json({ error: "Gagal mengambil reviews" });
  }
});

// Endpoint: GET /api/reviews/product/:produk_id
// Fungsi: Mengambil reviews untuk produk tertentu dengan kalkulasi rating rata-rata
app.get("/api/reviews/product/:produk_id", async (req, res) => {
  try {
    const { produk_id } = req.params;

    // Ambil semua reviews dan filter by product_id (manual filter)
    const snapshot = await db.collection("reviews").get();
    const reviews = []; // Array untuk menyimpan reviews produk ini
    let totalRating = 0; // Akumulator untuk menghitung rata-rata rating

    // Loop semua reviews untuk filter yang sesuai product_id
    for (const doc of snapshot.docs) {
      const reviewData = doc.data();

      // Filter hanya reviews untuk produk yang diminta
      if (reviewData.produk_id === produk_id) {
        // Ambil data user dari Firebase Auth untuk ditampilkan
        let userData = null;
        try {
          const userDoc = await admin.auth().getUser(reviewData.userId);
          userData = {
            email: userDoc.email,
            displayName: userDoc.displayName || userDoc.email.split("@")[0],
          };
        } catch (error) {
          userData = { email: "User", displayName: "User" };
        }

        // Tambahkan review dengan user data ke array
        reviews.push({
          id: doc.id,
          ...reviewData,
          user: userData,
        });

        // Akumulasi rating untuk kalkulasi rata-rata
        totalRating += reviewData.rating;
      }
    }

    // Sort reviews by createdAt descending (terbaru duluan)
    reviews.sort((a, b) => {
      const dateA = a.createdAt?.toDate
        ? a.createdAt.toDate()
        : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate
        ? b.createdAt.toDate()
        : new Date(b.createdAt);
      return dateB - dateA;
    });

    // Hitung rata-rata rating (total rating dibagi jumlah reviews)
    // Jika tidak ada reviews, return 0
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Return reviews dengan statistik rating
    res.status(200).json({
      reviews, // Array semua reviews produk dengan user data
      averageRating: Math.round(averageRating * 10) / 10, // Rata-rata rating (1 desimal)
      totalReviews: reviews.length, // Total jumlah reviews
    });
  } catch (error) {
    console.error("❌ Error ambil reviews produk:", error);
    res.status(500).json({ error: "Gagal mengambil reviews produk" });
  }
});

// Endpoint: DELETE /api/reviews/:id
// Fungsi: Hapus review berdasarkan ID
app.delete("/api/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi review exists
    const reviewDoc = await db.collection("reviews").doc(id).get();
    if (!reviewDoc.exists) {
      return res.status(404).json({ error: "Review tidak ditemukan" });
    }

    await db.collection("reviews").doc(id).delete();

    res.status(200).json({
      message: "Review berhasil dihapus",
      id,
    });
  } catch (error) {
    console.error("❌ Error delete review:", error);
    res.status(500).json({ error: "Gagal menghapus review" });
  }
});

//---------------- Gallery APIs ----------------
// Endpoint: GET /api/gallery
// Fungsi: Mengambil semua gambar gallery untuk ditampilkan di halaman galeri/testimoni
app.get("/api/gallery", async (req, res) => {
  try {
    console.log("📡 Fetching gallery data from Firestore...");

    // Ambil semua gallery items tanpa filter (termasuk yang active=false)
    // Admin bisa filter di frontend jika perlu hanya tampilkan yang active
    const snapshot = await db.collection("gallery").get();

    // Convert Firestore documents menjadi array of objects
    const galleryItems = snapshot.docs.map((doc) => ({
      id: doc.id, // Document ID dari Firestore
      ...doc.data(), // Spread semua field (image_url, alt_text, description, active, createdAt)
    }));

    console.log(`✅ Found ${galleryItems.length} gallery items`);
    res.status(200).json(galleryItems);
  } catch (error) {
    console.error("❌ Error fetching gallery:", error);
    res
      .status(500)
      .json({ error: "Gagal mengambil data gallery: " + error.message });
  }
});

// Endpoint: POST /api/gallery
// Fungsi: Menambah gambar baru ke gallery (untuk admin panel)
app.post("/api/gallery", async (req, res) => {
  try {
    const { image_url, alt_text, description } = req.body;

    console.log("📨 Received gallery data:", {
      image_url,
      alt_text,
      description,
    });

    // Validasi field wajib: hanya image_url yang required
    // alt_text dan description opsional
    if (!image_url) {
      return res.status(400).json({
        error: "image_url wajib diisi",
      });
    }

    // Siapkan data gallery dengan default values untuk field opsional
    const galleryData = {
      image_url, // URL gambar (wajib)
      alt_text: alt_text || "Gambar gallery", // Alt text untuk accessibility
      description: description || "", // Deskripsi gambar (opsional)
      active: true, // Default aktif (bisa diubah via PUT)
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // Timestamp pembuatan
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
    res
      .status(500)
      .json({ error: "Gagal menambah gambar gallery: " + error.message });
  }
});

// Endpoint: PUT /api/gallery/:id
// Fungsi: Update data gambar gallery (partial update - hanya field yang dikirim)
app.put("/api/gallery/:id", async (req, res) => {
  try {
    const { id } = req.params; // ID gallery dari URL parameter
    const { image_url, alt_text, description, active } = req.body;

    // Validasi gallery item exists
    const galleryRef = db.collection("gallery").doc(id);
    const doc = await galleryRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Gambar gallery tidak ditemukan" });
    }

    // Siapkan object untuk update (hanya field yang ada di request body)
    // Timestamp updatedAt selalu ditambahkan
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Conditional update: hanya update field yang dikirim (partial update)
    if (image_url !== undefined) updateData.image_url = image_url;
    if (alt_text !== undefined) updateData.alt_text = alt_text;
    if (description !== undefined) updateData.description = description;
    if (active !== undefined) updateData.active = active; // Toggle visibility

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

// Endpoint: DELETE /api/gallery/:id
// Fungsi: Hapus gambar dari gallery secara permanen (hard delete)
app.delete("/api/gallery/:id", async (req, res) => {
  try {
    const { id } = req.params; // ID gallery dari URL parameter

    // Validasi gallery item exists sebelum dihapus
    const galleryRef = db.collection("gallery").doc(id);
    const doc = await galleryRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Gambar gallery tidak ditemukan" });
    }

    // Hard delete: hapus dokumen dari Firestore
    // Note: URL gambar di storage tidak dihapus otomatis, perlu cleanup manual
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

// Start Express server pada PORT 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\nServer berjalan di http://localhost:${PORT}`);
});
