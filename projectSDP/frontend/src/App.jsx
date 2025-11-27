// Root component aplikasi - mengatur routing dan authentication state
// Mengelola Firebase auth state dan protected routes untuk halaman yang memerlukan login

import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";

// Import public pages components
import Navbar from "./navbar/Navbar";
import HomePage from "./home/HomePage";
import ProductPage from "./product/Product";
import LoginPage from "./login/LoginPage";
import RegisterPage from "./register/RegisterPage";
import AboutUs from "./aboutUs/AboutUs";
import Footer from "./footer/Footer";
import ProductDetail from "./product/ProductDetail";
import CartPage from "./cart/CartPage";
import Profile from "./Profile/Profile";

// Import admin pages components
import AdminRoute from "./admin/AdminRoute";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminUsers from "./admin/pages/AdminUsers";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminSettings from "./admin/pages/AdminSettings";
import AdminReviews from "./admin/pages/AdminReviews";
import GalleryPage from "./admin/pages/AdminGallery";
import GalleryView from "./Testimoni Galeri/GalleryView";

import "./App.css";

// Component untuk protected routes - hanya bisa diakses jika user sudah login
// Jika belum login, redirect ke /login dengan menyimpan URL tujuan di state
const ProtectedRoute = ({ children, user }) => {
  const location = useLocation();

  // Redirect ke login jika user belum terautentikasi
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  // State management untuk user authentication
  const [user, setUser] = useState(null); // User object dari Firebase Auth
  const [loading, setLoading] = useState(true); // Loading state saat check auth

  // Setup Firebase auth listener untuk track authentication state changes
  useEffect(() => {
    // onAuthStateChanged: listener yang trigger setiap kali auth state berubah
    // (login, logout, token refresh, dll)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update user state (null jika logout)
      setLoading(false); // Auth check selesai
    });

    // Cleanup: unsubscribe listener saat component unmount
    return () => unsubscribe();
  }, []);

  // Tampilkan loading screen saat masih check authentication
  if (loading) {
    return (
      <div className="w-screen min-h-screen bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] flex justify-center items-center">
        <p className="text-white text-2xl">Memuat...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Admin routes - nested routes dengan AdminLayout sebagai wrapper */}
        {/* Semua routes /admin/* akan dicek oleh AdminRoute (role-based access) */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute user={user}>
              <AdminLayout />
            </AdminRoute>
          }
        >
          {/* Nested admin routes - render di dalam AdminLayout */}
          <Route index element={<AdminDashboard />} /> {/* /admin */}
          <Route path="products" element={<AdminProducts />} />{" "}
          {/* /admin/products */}
          <Route path="users" element={<AdminUsers />} /> {/* /admin/users */}
          <Route path="orders" element={<AdminOrders />} />{" "}
          {/* /admin/orders */}
          <Route path="settings" element={<AdminSettings />} />{" "}
          {/* /admin/settings */}
          <Route path="reviews" element={<AdminReviews />} />{" "}
          {/* /admin/reviews */}
          <Route path="gallery" element={<GalleryPage />} />{" "}
          {/* /admin/gallery */}
        </Route>

        {/* Public routes - dengan Navbar dan Footer wrapper */}
        <Route
          path="/*"
          element={
            <div className="w-full min-h-screen bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] text-white overflow-x-hidden">
              <Navbar user={user} />{" "}
              {/* Navbar ditampilkan di semua public pages */}
              <main className="w-full">
                <Routes>
                  {/* Public routes - bisa diakses tanpa login */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/product" element={<ProductPage />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/aboutus" element={<AboutUs />} />
                  <Route path="/gallery" element={<GalleryView />} />

                  {/* Protected routes - harus login dulu */}
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute user={user}>
                        <CartPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute user={user}>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
              <Footer /> {/* Footer ditampilkan di semua public pages */}
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
