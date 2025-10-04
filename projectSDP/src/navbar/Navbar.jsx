import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Jangan tampilkan navbar di halaman login atau register
    if (location.pathname === '/login' || location.pathname === '/register') {
        return null;
    }

    const handleLogout = () => {
        setIsLoggedIn(false);
        navigate('/'); // redirect ke home setelah logout
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <div className="navbar-logo">
                    <Link to="/">
                        <img src="../src/assets/logo.jpeg" alt="BJM Logo" />
                    </Link>
                </div>

                {/* Navigation Menu */}
                <div className="navbar-menu">
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/product">Product</Link></li>
                        <li><Link to="/aboutus">About Us</Link></li>
                        <li><Link to="/cart">Shopping Cart</Link></li>
                    </ul>
                </div>

                {/* Auth Section */}
                <div className="navbar-auth">
                    {isLoggedIn ? (
                        <div className="navbar-profile">
                            <span className="profile-name">Richard</span>
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
