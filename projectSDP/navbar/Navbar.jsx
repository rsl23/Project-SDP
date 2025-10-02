import React, { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  // 1. Tambahkan state untuk melacak status login pengguna
  //    Nilai awalnya `false` karena pengguna belum login.
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 2. Buat fungsi untuk mengubah state saat tombol ditekan
  const handleLogin = () => {
    // Fungsi ini akan dipanggil oleh tombol Register atau Login
    setIsLoggedIn(true); 
  };

  const handleLogout = () => {
    // Fungsi ini akan dipanggil oleh tombol Logout di dalam profile
    setIsLoggedIn(false);
  };

  return (
    <nav className="navbar">
        <div className="navbar-container">
            {/* Logo */}
            <div className="navbar-logo">
                <img src="../src/assets/logo.jpeg" alt="BJM Logo" />
            </div>
            
            {/* Navigation Menu */}
            <div className="navbar-menu">
                <ul>
                    <li><a href="#home">Home</a></li>
                    <li><a href="#product">Product</a></li>
                    <li><a href="#about">About Us</a></li>
                    <li><a href="#cart">Shopping Cart</a></li>
                </ul>
            </div>
            
            {/* Auth Section - Tampilannya akan berubah berdasarkan state */}
            <div className="navbar-auth">
                {isLoggedIn ? (
                    // 4. Jika isLoggedIn adalah `true`, tampilkan ini
                    <div className="navbar-profile">
                        <span className="profile-name">Richard</span> 
                        {/* Ganti dengan nama user asli nantinya */}
                        <button onClick={handleLogout} className="btn-logout">Logout</button>
                    </div>
                ) : (
                    // 5. Jika isLoggedIn adalah `false`, tampilkan ini
                    <>
                        <button onClick={handleLogin} className="btn-register">Register</button>
                        <button onClick={handleLogin} className="btn-login">Login</button>
                    </>
                )}
            </div>
        </div>
    </nav>
  )
}

export default Navbar;