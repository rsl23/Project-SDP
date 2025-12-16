import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Car, Star } from "lucide-react";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] text-white overflow-x-hidden font-sans">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen text-center px-4 sm:px-6 relative overflow-hidden">
        {/* Glow Background Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)]"></div>

        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 bg-black/40 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl max-w-lg sm:max-w-xl md:max-w-4xl mx-2"
        >
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight bg-gradient-to-r from-pink-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent px-2">
            Selamat Datang di Berkat Jaya Motor SBY
          </h1>
          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-gray-200">
            Temukan semua kebutuhan otomotif Anda di satu tempat
          </p>
          {/* CTA Button */}
          <Link to="/product">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-4 bg-gradient-to-r from-pink-500 to-indigo-600 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all w-full max-w-xs sm:max-w-none"
            >
              <div className="flex items-center gap-2 justify-center">
                <ShoppingBag size={18} className="sm:size-5 md:size-6" />
                <span className="text-sm sm:text-base md:text-lg">Lihat Produk</span>
              </div>
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 bg-white/5">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-5xl mx-auto text-center"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-pink-400 px-2">
            Tentang Berkat Jaya Motor SBY
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-3xl mx-auto px-2">
            BJM Parts menyediakan berbagai suku cadang dan aksesori otomotif
            berkualitas tinggi. Kami berkomitmen memberikan pengalaman belanja
            terbaik dengan produk asli, harga bersaing, dan layanan pelanggan
            yang luar biasa.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Car size={24} className="sm:size-8 md:size-10 lg:size-12" />,
                title: "Suku Cadang Asli",
                desc: "Kami hanya menjual produk berkualitas tinggi dan terpercaya.",
              },
              {
                icon: <Star size={24} className="sm:size-8 md:size-10 lg:size-12" />,
                title: "Layanan Terpercaya",
                desc: "Tim kami siap membantu Anda dengan pelayanan profesional.",
              },
              {
                icon: <ShoppingBag size={24} className="sm:size-8 md:size-10 lg:size-12" />,
                title: "Belanja Mudah",
                desc: "Nikmati pengalaman belanja online cepat dan aman.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                className="bg-black/30 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg hover:shadow-pink-500/20 transition-all min-h-[180px] sm:min-h-[220px] flex flex-col"
              >
                <div className="flex flex-col items-center h-full justify-center">
                  <div className="mb-3 sm:mb-4 text-pink-400">{item.icon}</div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3">{item.title}</h3>
                  <p className="text-gray-300 text-xs sm:text-sm md:text-base flex-grow">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Link ke About Us */}
          <Link to="/aboutus">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-4 mt-6 sm:mt-8 md:mt-10 bg-gradient-to-r from-pink-500 to-indigo-600 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all text-sm sm:text-base md:text-lg"
            >
              Tentang Kami
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Call to Action Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-pink-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent px-2">
            Siap memperbarui kendaraan Anda?
          </h3>
          {/* CTA Button */}
          <Link to="/product">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-4 bg-gradient-to-r from-pink-500 to-indigo-600 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all text-sm sm:text-base md:text-lg"
            >
              Jelajahi Produk
            </motion.button>
          </Link>
        </motion.div>

        {/* Decorative Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,0,128,0.1),transparent_70%)]"></div>
      </section>
    </div>
  );
}