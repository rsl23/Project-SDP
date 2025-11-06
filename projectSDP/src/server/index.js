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
      const stockSnap = await db
        .collection("stock")
        .where("produk_id", "==", doc.id)
        .get();
      let totalMasuk = 0;
      let totalKeluar = 0;
      stockSnap.forEach((s) => {
        const st = s.data();
        if (st.tipe === "masuk") totalMasuk += st.jumlah;
        else if (st.tipe === "keluar") totalKeluar += st.jumlah;
      });
      const stokAkhir = totalMasuk - totalKeluar;
      products.push({
        id: doc.id,
        ...data,
        stok: stokAkhir,
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
      kategori,
      harga,
      img_url,
      deskripsi,
      link_tokopedia,
      link_shopee,
      stok,
    } = req.body;

    if (!nama || !kategori || !harga) {
      return res.status(400).json({ error: "Data produk tidak lengkap" });
    }

    const newProduct = {
      nama,
      kategori,
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

    const stockSnap = await db
      .collection("stock")
      .where("produk_id", "==", id)
      .where("keterangan", "==", "Stok awal produk")
      .get();

    stockSnap.forEach((doc) => doc.ref.delete());
    if (stok > 0) {
      await db.collection("stock").add({
        produk_id: id,
        tipe: "masuk",
        jumlah: stok,
        keterangan: "Stok awal produk",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.status(200).json({ message: "Stok berhasil diperbarui", stok });
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

    const snapshot = await db.collection("cart")
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

app.post("/api/cart", async (req, res) => {
  try {
    const { produk_id, jumlah, userId } = req.body; // Tambah userId

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

    const existingCart = await db.collection("cart")
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
    const { userId, items, total } = req.body;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ error: "userId dan items wajib diisi" });
    }
    const newOrder = await db.collection("orders").add({
      userId,
      items,
      total,
      status: "pending",
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

app.get("/api/orders", async (req, res) => {
  try {
    const { userId } = req.query;

    let query = db.collection("orders").orderBy("createdAt", "desc");
    if (userId) {
      query = db
        .collection("orders")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc");
    }

    const snapshot = await query.get();
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\nServer berjalan di http://localhost:${PORT}`);
  console.log(`API Endpoints:`);
  console.log(`GET    /api/products     - Get all products`);
  console.log(`POST   /api/products     - Add new product`);
  console.log(`PUT    /api/products/:id - Update product`);
  console.log(`DELETE /api/products/:id - Delete product\n`);
});
