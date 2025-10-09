import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";
import Navbar from "./navbar/Navbar";
import HomePage from "./home/HomePage";
import ProductPage from "./product/Product";
import LoginPage from "./login/LoginPage";
import RegisterPage from "./register/RegisterPage";
import './App.css';
import AboutUs from "./aboutUs/AboutUs";
import Footer from "./footer/Footer";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Tambahkan state loading

  useEffect(() => {
    // onAuthStateChanged adalah listener dari Firebase.
    // Ia akan terpanggil setiap kali status otentikasi pengguna berubah (login/logout).
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set state user dengan data pengguna yang login, atau null jika logout
      setLoading(false); // Set loading menjadi false setelah status user didapatkan
    });

    // Membersihkan listener saat komponen tidak lagi digunakan (unmount)
    // untuk mencegah kebocoran memori.
    return () => {
      unsubscribe();
    };
  }, []); // Array kosong berarti useEffect ini hanya berjalan sekali saat komponen pertama kali dirender.

  // Tampilkan loading screen sederhana selagi status otentikasi diperiksa
  if (loading) {
    return (
        <div className="w-screen h-screen bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] flex justify-center items-center">
            <p className="text-white text-2xl">Memuat...</p>
        </div>
    );
  }

  return (
    <Router>
      <div className="w-screen h-screen bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] text-white">
        {/* Kirim state 'user' sebagai prop ke Navbar */}
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/aboutus" element={<AboutUs/>}/>
        </Routes>
        <Footer/>
      </div>
    </Router>
  );
}

export default App;