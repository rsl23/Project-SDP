// Navbar Component - Navigation bar dengan auth state, admin detection, mobile responsive
// Features: User authentication status, admin panel link, mobile hamburger menu, logout

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Menu, X } from "lucide-react";
import "./Navbar.css";

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false); // Admin role detection
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu toggle

  // Background sync email verification status dari Firebase Auth ke Firestore
  // Jalan otomatis saat component mount untuk update status terbaru
  useEffect(() => {
    const syncEmailVerification = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        await user.reload(); // Refresh user data dari Firebase Auth
        if (user.emailVerified) {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          // Update Firestore jika belum ter-sync
          if (userDoc.exists() && !userDoc.data().email_verified) {
            await updateDoc(userDocRef, { email_verified: true });
            console.log("✅ Email verification synced in background");
          }
        }
      } catch (error) {
        console.error("Error syncing email verification:", error);
      }
    };

    syncEmailVerification();

    // Cleanup: Reset body scroll saat component unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [user]);

  // Check admin role dari Firestore user document
  // Jalan setiap kali user state berubah
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsAdmin(userData.role === "admin"); // Set true jika role = admin
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
      }
    };

    checkAdminRole();
  }, [user]);

  // Hide navbar di halaman login dan register
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  // Handle logout - sign out dari Firebase Auth dan redirect ke home
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Gagal untuk logout:", error);
    }
  };

  // Toggle mobile menu dan prevent body scroll saat menu open
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Prevent body scroll when menu is open
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = "unset";
  };

  const getInitials = () => {
    if (user.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Backdrop Overlay (Mobile Only) */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-backdrop" onClick={closeMobileMenu} />
      )}

      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <Link to="/" onClick={closeMobileMenu}>
              <img src="../src/assets/logo.jpeg" alt="BJM Logo" />
            </Link>
          </div>

          {/* Burger Menu Button (Mobile Only) */}
          <button className="burger-menu" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Desktop Menu & Mobile Dropdown */}
          <div className={`navbar-menu ${isMobileMenuOpen ? "active" : ""}`}>
            <ul>
              <li>
                <Link to="/" onClick={closeMobileMenu}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/product" onClick={closeMobileMenu}>
                  Product
                </Link>
              </li>
              <li>
                <Link to="/aboutus" onClick={closeMobileMenu}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/cart" onClick={closeMobileMenu}>
                  Cart
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link
                    to="/admin"
                    className="admin-link"
                    onClick={closeMobileMenu}
                  >
                    🛡️ Admin Panel
                  </Link>
                </li>
              )}
            </ul>

            {/* Mobile Auth Section */}
            <div className="navbar-auth-mobile">
              {user ? (
                <div className="navbar-profile-mobile">
                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="profile-avatar cursor-pointer"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="profile-avatar-fallback cursor-pointer">
                        {getInitials()}
                      </div>
                    )}
                    <span className="profile-name">
                      {user.displayName || user.email}
                    </span>
                  </Link>
                  <button onClick={handleLogout} className="btn-logout">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-buttons">
                  <Link to="/register" onClick={closeMobileMenu}>
                    <button className="btn-register">Register</button>
                  </Link>
                  <Link to="/login" onClick={closeMobileMenu}>
                    <button className="btn-login">Login</button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Auth Section */}
          <div className="navbar-auth">
            {user ? (
              <div className="navbar-profile">
                <Link to="/profile" className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="profile-avatar cursor-pointer"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="profile-avatar-fallback cursor-pointer">
                      {getInitials()}
                    </div>
                  )}
                  <span className="profile-name">
                    {user.displayName || user.email}
                  </span>
                </Link>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </div>
            ) : (
              <div className="">
                <Link to="/register">
                  <button className="btn-register">Register</button>
                </Link>
                <Link to="/login">
                  <button className="btn-login">Login</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
