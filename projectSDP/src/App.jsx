import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";
import Navbar from "./navbar/Navbar";
import HomePage from "./home/HomePage";
import ProductPage from "./product/Product";
import LoginPage from "./login/LoginPage";
import RegisterPage from "./register/RegisterPage";
import AboutUs from "./aboutUs/AboutUs";
import Footer from "./footer/Footer";
import ProductDetail from "./product/ProductDetail";

// Admin Components
import AdminRoute from "./admin/AdminRoute";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminUsers from "./admin/pages/AdminUsers";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminSettings from "./admin/pages/AdminSettings";

import "./App.css";
import CartPage from "./cart/CartPage";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] flex justify-center items-center">
        <p className="text-white text-2xl">Memuat...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="w-full min-h-screen overflow-hidden"> {/* Tambahkan overflow-hidden */}
        <Routes>
          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          />

          {/* User Routes */}
          <Route
            path="/*"
            element={
              <div className="w-full min-h-screen bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] text-white overflow-x-hidden"> {/* Tambahkan overflow-x-hidden */}
                <Navbar user={user} />
                <main className="w-full"> {/* Container untuk konten utama */}
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/product" element={<ProductPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/aboutus" element={<AboutUs />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<CartPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
