import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import './Navbar.css';

const Navbar = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();

    if (location.pathname === '/login' || location.pathname === '/register') {
        return null;
    }

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
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
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/product">Product</Link></li>
                        <li><Link to="/aboutus">About Us</Link></li>
                        <li><Link to="/cart">Shopping Cart</Link></li>
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
                                    // --- TAMBAHKAN BARIS INI ---
                                    referrerPolicy="no-referrer" 
                                />
                            ) : (
                                <div className="profile-avatar-fallback">
                                    {getInitials()}
                                </div>
                            )}
                            <span className="profile-name">{user.displayName || user.email}</span>
                            <button onClick={handleLogout} className="btn-logout">Logout</button>
                        </div>
                    ) : (
                        <>
                            <Link to="/register">
                                <button className="btn-register">Register</button>
                            </Link>
                            <Link to="/login">
                                <button className="btn-login">Login</button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;