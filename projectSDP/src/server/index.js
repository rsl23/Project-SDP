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

    res.status(201).json({ id: newDoc.id, nama, kategori, harga, stok });
  } catch (error) {
    console.error("Error menambah produk:", error);
    res.status(500).json({ error: "Gagal menambah produk" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
