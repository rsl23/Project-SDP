import express from "express";
import cors from "cors";
import { db } from "./firebase.js";
import { img, u } from "framer-motion/client";

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
    const { nama, kategori, harga, stok, img_url } = req.body;
    if (!nama || !kategori || !harga || !stok) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    const newDoc = await db.collection("products").add({
      nama,
      kategori,
      harga,
      stok,
      img_url: img_url || "",
      active: true,
    });

    console.log("✅ Produk berhasil ditambahkan:", newDoc.id);
    res.status(201).json({ id: newDoc.id, nama, kategori, harga, stok });
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
    res.status(500).json({ error: "Gagal update produk", details: error.message });
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
      const produkDoc = await db.collection("products").doc(data.produk_id).get();
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
      return res.status(400).json({ error: "produk_id dan jumlah wajib diisi" });
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
    res.status(500).json({ error: "Gagal menambah ke cart", details: error.message });
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

    if (!doc.exists) return res.status(404).json({ error: "Item cart tidak ditemukan" });

    await cartRef.update({ jumlah });

    res.status(200).json({ id, jumlah, message: "Jumlah item berhasil diperbarui" });
  } catch (error) {
    console.error("Error update cart:", error);
    res.status(500).json({ error: "Gagal update cart", details: error.message });
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
    res.status(500).json({ error: "Gagal menghapus cart", details: error.message });
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
