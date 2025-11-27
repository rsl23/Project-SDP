// HomePage Component - Halaman landing/utama aplikasi
// Menampilkan hero section, tentang perusahaan, dan fitur-fitur utama BJM Parts

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // Library untuk animasi smooth
import { ShoppingBag, Car, Star } from "lucide-react"; // Icon library

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] text-white overflow-x-hidden box-border font-sans">
      {/* Hero Section - Section utama dengan CTA button */}
      <section className="flex flex-col items-center justify-center min-h-screen text-center px-6 relative overflow-hidden">
        {/* Glow Background Effect - efek cahaya radial di background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)]"></div>

        {/* Content Card dengan fade-in animation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} // State awal: invisible dan 40px ke bawah
          animate={{ opacity: 1, y: 0 }} // Animasi ke: visible dan posisi normal
          transition={{ duration: 1 }} // Durasi animasi 1 detik
          className="relative z-10 bg-black/40 backdrop-blur-md p-10 rounded-2xl shadow-2xl max-w-4xl"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-pink-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent">
            Selamat Datang di Berkat Jaya Motor SBY
          </h1>
          <p className="text-lg md:text-2xl mb-8 text-gray-200">
            Temukan semua kebutuhan otomotif Anda di satu tempat
          </p>
          {/* CTA Button - navigasi ke halaman produk */}
          <Link to="/product">
            <motion.button
              whileHover={{ scale: 1.08 }} // Scale up saat hover
              whileTap={{ scale: 0.95 }} // Scale down saat di-click
              className="px-10 py-4 bg-gradient-to-r from-pink-500 to-indigo-600 rounded-xl font-semibold shadow-lg"
            >
              <div className="flex items-center gap-2 justify-center">
                <ShoppingBag size={22} />
                <span>Lihat Produk</span>
              </div>
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* About Section - Informasi tentang perusahaan dan fitur */}
      <section id="about" className="py-24 px-6 bg-white/5 max-w-[100vw]">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }} // Trigger animation saat masuk viewport
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-pink-400">
            Tentang Berkat Jaya Motor SBY
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
            BJM Parts menyediakan berbagai suku cadang dan aksesori otomotif
            berkualitas tinggi. Kami berkomitmen memberikan pengalaman belanja
            terbaik dengan produk asli, harga bersaing, dan layanan pelanggan
            yang luar biasa.
          </p>

          {/* Feature Cards - Grid 3 kolom untuk fitur utama */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Map array fitur menjadi card components */}
            {[
              {
                icon: <Car size={40} />,
                title: "Suku Cadang Asli",
                desc: "Kami hanya menjual produk berkualitas tinggi dan terpercaya.",
              },
              {
                icon: <Star size={40} />,
                title: "Layanan Terpercaya",
                desc: "Tim kami siap membantu Anda dengan pelayanan profesional.",
              },
              {
                icon: <ShoppingBag size={40} />,
                title: "Belanja Mudah",
                desc: "Nikmati pengalaman belanja online cepat dan aman.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }} // Sedikit scale up saat hover
                className="bg-black/30 backdrop-blur-md p-8 rounded-2xl shadow-lg hover:shadow-pink-500/30 transition"
              >
                <div className="flex flex-col items-center">
                  <div className="mb-4 text-pink-400">{item.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-300 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Link ke halaman About Us untuk informasi lebih detail */}
          <Link to="/aboutus">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 mt-10 bg-gradient-to-r from-pink-500 to-indigo-600 rounded-xl font-semibold shadow-lg"
            >
              Tentang Kami
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Call to Action Section - CTA kedua di bagian bawah untuk konversi */}
      <section className="py-20 px-6 text-center max-w-[100vw] relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }} // Fade-in saat masuk viewport
          transition={{ duration: 1 }}
          className="relative z-10"
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-pink-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Siap memperbarui kendaraan Anda?
          </h3>
          {/* CTA Button kedua - mendorong user ke halaman produk */}
          <Link to="/product">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-gradient-to-r from-pink-500 to-indigo-600 rounded-xl font-semibold shadow-lg"
            >
              Jelajahi Produk
            </motion.button>
          </Link>
        </motion.div>

        {/* Decorative Glow - efek cahaya dekoratif di bawah */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,0,128,0.15),transparent_70%)]"></div>
      </section>
    </div>
  );
}
