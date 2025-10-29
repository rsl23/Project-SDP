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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const syncEmailVerification = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        await user.reload();
        if (user.emailVerified) {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
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

    // Cleanup: Reset body scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [user]);
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
          setIsAdmin(userData.role === "admin");
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
      }
    };

    checkAdminRole();
  }, [user]);

  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Gagal untuk logout:", error);
    }
  };

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
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="profile-avatar"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="profile-avatar-fallback">
                      {getInitials()}
                    </div>
                  )}
                  <span className="profile-name">
                    {user.displayName || user.email}
                  </span>
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
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="profile-avatar"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="profile-avatar-fallback">{getInitials()}</div>
                )}
                <span className="profile-name">
                  {user.displayName || user.email}
                </span>
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
