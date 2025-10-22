import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./Navbar.css";

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

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
      navigate("/");
    } catch (error) {
      console.error("Gagal untuk logout:", error);
    }
  };

  const getInitials = () => {
    if (user.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <img src="../src/assets/logo.jpeg" alt="BJM Logo" />
          </Link>
        </div>

        <div className="navbar-menu">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/product">Product</Link>
            </li>
            <li>
              <Link to="/aboutus">About Us</Link>
            </li>
            {isAdmin && (
              <li>
                <Link to="/admin" className="admin-link">
                  🛡️ Admin Panel
                </Link>
              </li>
            )}
          </ul>
        </div>

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
              <Link Link to="/register">
                <button className="btn-register">Register</button>
              </Link>
              <Link to="/login">
                <button className="btn-login">Login</button>
              </Link>
            </div>
          )}
        </div>
      </div >
    </nav >
  );
};

export default Navbar;
