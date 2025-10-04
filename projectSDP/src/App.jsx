import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./navbar/Navbar";
import HomePage from "./home/HomePage";
import ProductPage from "./product/Product";
import LoginPage from "./login/LoginPage";
import RegisterPage from "./register/RegisterPage";
import './App.css';
import AboutUs from "./aboutUs/AboutUs";
import Footer from "./footer/Footer";

function App() {
  return (
    <Router>
      <div className="w-screen h-screen bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] text-white">
        <Navbar />
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
