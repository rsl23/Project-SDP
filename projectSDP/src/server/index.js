import express from "express";
import cors from "cors";
import { db } from "./firebase.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/products", async (req, res) => {
  try {
    const snapshot = await db.collection("products").get();
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Gagal mengambil produk" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { nama, kategori, harga, stok } = req.body;
    if (!nama || !kategori || !harga || !stok) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    const newDoc = await db.collection("products").add({
      nama,
      kategori,
      harga,
      stok,
    });

    console.log("✅ Produk berhasil ditambahkan:", newDoc.id);
    res.status(201).json({ id: newDoc.id, nama, kategori, harga, stok });
  } catch (error) {
    console.error("❌ Error menambah produk:", error);
    res.status(500).json({ error: "Gagal menambah produk" });
  }
});

// UPDATE Product by ID
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, kategori, harga, stok } = req.body;

    console.log(`Updating product ${id}:`, { nama, kategori, harga, stok });

    if (!nama || !kategori || harga === undefined || stok === undefined) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    // Check if product exists
    const productRef = db.collection("products").doc(id);
    const doc = await productRef.get();

    if (!doc.exists) {
      console.log(`Product ${id} not found`);
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    // Update product
    await productRef.update({
      nama,
      kategori,
      harga,
      stok,
    });

    console.log(`Product ${id} updated successfully`);
    res.status(200).json({
      id,
      nama,
      kategori,
      harga,
      stok,
      message: "Produk berhasil diupdate",
    });
  } catch (error) {
    console.error("Error update produk:", error);
    res
      .status(500)
      .json({ error: "Gagal update produk", details: error.message });
  }
});

// DELETE Product by ID
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Deleting product ${id}`);

    // Check if product exists
    const productRef = db.collection("products").doc(id);
    const doc = await productRef.get();

    if (!doc.exists) {
      console.log(`Product ${id} not found`);
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    // Delete product
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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📋 API Endpoints:`);
  console.log(`   GET    /api/products     - Get all products`);
  console.log(`   POST   /api/products     - Add new product`);
  console.log(`   PUT    /api/products/:id - Update product`);
  console.log(`   DELETE /api/products/:id - Delete product\n`);
});
