// Import dependencies untuk Express server
import express from "express";
import cors from "cors";
import path from "path";

// Import semua router dari folder /api
import productsRouter from "./api/products.js";
import stockRouter from "./api/stock.js";
import cartRouter from "./api/cart.js";
import ordersRouter from "./api/orders.js";
import categoriesRouter from "./api/categories.js";
import reviewsRouter from "./api/reviews.js";
import galleryRouter from "./api/gallery.js";

// Inisialisasi Express app
const app = express();

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// Enable CORS untuk akses dari frontend (Google App Engine)
app.use(cors({ origin: "*" }));

// Parse JSON request body untuk semua request
app.use(express.json());

// ============================================================================
// API ROUTES - Mount semua router ke base path masing-masing
// ============================================================================

// Products API - CRUD produk dan manajemen stok
// Endpoints: GET /, POST /, PUT /:id, PUT /:id/stock, DELETE /:id
app.use("/api/products", productsRouter);

// Stock API - Riwayat stok masuk/keluar
// Endpoints: GET /, POST /
app.use("/api/stock", stockRouter);

// Cart API - Keranjang belanja per user
// Endpoints: GET /, POST /, PUT /:id, DELETE /:id
app.use("/api/cart", cartRouter);

// Orders API - Pemesanan dan checkout
// Endpoints: GET /, POST /, PATCH /:orderId, POST /:orderId/confirm-stock, POST /:orderId/return-stock
app.use("/api/orders", ordersRouter);

// Categories API - Kategori produk
// Endpoints: GET /, POST /, PUT /:id, DELETE /:id
app.use("/api/categories", categoriesRouter);

// Reviews API - Review dan rating produk
// Endpoints: GET /, POST /, GET /product/:produk_id, DELETE /:id
app.use("/api/reviews", reviewsRouter);

// Gallery API - Galeri gambar
// Endpoints: GET /, POST /, PUT /:id, DELETE /:id
app.use("/api/gallery", galleryRouter);

app.use(express.static(path.join(__dirname, "dist")));

// Catch-all React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
// Port dari environment variable atau default 8080
const PORT = process.env.PORT || 8080;

// Start server dan listen pada port yang ditentukan
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation:`);
  console.log(`   - Products: /api/products`);
  console.log(`   - Stock:    /api/stock`);
  console.log(`   - Cart:     /api/cart`);
  console.log(`   - Orders:   /api/orders`);
  console.log(`   - Categories: /api/categories`);
  console.log(`   - Reviews:  /api/reviews`);
  console.log(`   - Gallery:  /api/gallery`);
});
