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
    const products = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        nama: data.nama,
        kategori: data.kategori,
        harga: data.harga,
        stok: data.stok,
        img_url: data.img_url || "",
        deskripsi: data.deskripsi || "",
        active: data.active ?? true,
      };
    });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Gagal mengambil produk" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    console.log("🔵 POST /api/products dipanggil!");
    console.log("📨 req.body:", JSON.stringify(req.body, null, 2));

    const { nama, kategori, harga, stok, img_url, deskripsi, img_name } =
      req.body;

    console.log("� Deskripsi value:", deskripsi);
    console.log("📝 Deskripsi type:", typeof deskripsi);
    console.log("📝 Deskripsi length:", deskripsi?.length);

    if (!nama || !kategori || !harga || !stok) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    const dataToSave = {
      nama,
      kategori,
      harga,
      stok,
      img_url: img_url || "",
      img_name: img_name || "",
      deskripsi: deskripsi || "",
      active: true,
    };

    console.log("💾 Data yang akan disimpan ke Firestore:");
    console.log(JSON.stringify(dataToSave, null, 2));

    const newDoc = await db.collection("products").add(dataToSave);

    console.log("✅ Produk berhasil ditambahkan dengan ID:", newDoc.id);
    res
      .status(201)
      .json({ id: newDoc.id, nama, kategori, harga, stok, deskripsi, img_url });
  } catch (error) {
    console.error("❌ Error menambah produk:", error);
    res.status(500).json({ error: "Gagal menambah produk" });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

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

app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting product ${id}`);
    const productRef = db.collection("products").doc(id);
    const doc = await productRef.get();
    if (!doc.exists) {
      console.log(`Product ${id} not found`);
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }
    await productRef.delete();
    console.log(`Product ${id} deleted successfully`);
    res.status(200).json({
      id,
      message: "Produk berhasil dihapus",
    });
  } catch (error) {
    console.error("Error delete produk:", error);
    res
      .status(500)
      .json({ error: "Gagal menghapus produk", details: error.message });
  }
});

app.get("/api/cart", async (req, res) => {
  try {
    const snapshot = await db.collection("cart").get();
    const cartItems = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      // ambil data produk terkait
      const produkDoc = await db
        .collection("products")
        .doc(data.produk_id)
        .get();
      const produkData = produkDoc.exists ? produkDoc.data() : null;

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

// POST add item to cart
app.post("/api/cart", async (req, res) => {
  try {
    const { produk_id, jumlah } = req.body;
    if (!produk_id || !jumlah) {
      return res
        .status(400)
        .json({ error: "produk_id dan jumlah wajib diisi" });
    }

    const produkRef = db.collection("products").doc(produk_id);
    const produkDoc = await produkRef.get();

    if (!produkDoc.exists) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    const newCart = await db.collection("cart").add({
      produk_id,
      jumlah,
      createdAt: new Date(),
    });

    const produkData = produkDoc.data();
    res.status(201).json({
      id: newCart.id,
      produk_id,
      jumlah,
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

// PUT update jumlah cart
// PUT update jumlah cart
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

// DELETE item from cart
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
    const { userId, items, total } = req.body;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ error: "userId dan items wajib diisi" });
    }

    // Buat order baru di Firestore
    const newOrder = await db.collection("orders").add({
      userId,
      items, // array { produk_id, jumlah, produk: {nama, harga, img_url} }
      total,
      status: "pending", // default: pending
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res
      .status(201)
      .json({ message: "Order berhasil dibuat", orderId: newOrder.id });
  } catch (err) {
    console.error("Error create order:", err);
    res
      .status(500)
      .json({ error: "Gagal membuat order", details: err.message });
  }
});

// GET /api/orders -> semua order (untuk admin)
app.get("/api/orders", async (req, res) => {
  try {
    const snapshot = await db
      .collection("orders")
      .orderBy("createdAt", "desc")
      .get();
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil order" });
  }
});

// PATCH /api/orders/:orderId -> update status
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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\nServer berjalan di http://localhost:${PORT}`);
  console.log(`API Endpoints:`);
  console.log(`GET    /api/products     - Get all products`);
  console.log(`POST   /api/products     - Add new product`);
  console.log(`PUT    /api/products/:id - Update product`);
  console.log(`DELETE /api/products/:id - Delete product\n`);
});
