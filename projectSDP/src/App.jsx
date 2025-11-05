
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import CartPage from "./cart/CartPage";

import AdminRoute from "./admin/AdminRoute";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminUsers from "./admin/pages/AdminUsers";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminSettings from "./admin/pages/AdminSettings";

import "./App.css";

const ProtectedRoute = ({ children, user }) => {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

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
      <div className="w-screen min-h-screen bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] flex justify-center items-center">
        <p className="text-white text-2xl">Memuat...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <AdminRoute user={user}>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route
          path="/*"
          element={
            <div className="w-full min-h-screen bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] text-white overflow-x-hidden">
              <Navbar user={user} />
              <main className="w-full">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route
                    path="/product"
                    element={
                      <ProtectedRoute user={user}>
                        <ProductPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/product/:id"
                    element={
                      <ProtectedRoute user={user}>
                        <ProductDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute user={user}>
                        <CartPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/aboutus" element={<AboutUs />} />
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;