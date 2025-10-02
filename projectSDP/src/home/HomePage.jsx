import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] text-white overflow-x-hidden box-border">

            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center min-h-screen text-center px-6 max-w-[100vw]">
                <div className="bg-black/50 p-8 rounded-xl max-w-full">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
                        Selamat Datang di BJM Parts
                    </h1>
                    <p className="text-lg md:text-2xl mb-6">
                        Temukan semua kebutuhan otomotif Anda di satu tempat
                    </p>
                    <Link to="/product">
                        <button className="px-8 py-3 bg-gradient-to-r from-pink-500 to-indigo-600 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform">
                            Lihat Produk
                        </button>
                    </Link>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 px-6 bg-white/5 max-w-[100vw]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Tentang BJM Parts</h2>
                    <p className="text-lg md:text-xl text-gray-200">
                        BJM Parts menyediakan berbagai suku cadang dan aksesori otomotif berkualitas tinggi.
                        Kami berkomitmen memberikan pengalaman belanja terbaik dengan produk asli dan layanan terpercaya.
                    </p>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-16 px-6 text-center max-w-[100vw]">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    Siap memperbarui kendaraan Anda?
                </h3>
                <Link to="/product">
                    <button className="px-8 py-3 bg-gradient-to-r from-pink-500 to-indigo-600 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform">
                        Jelajahi Produk
                    </button>
                </Link>
            </section>

            {/* Footer */}
            <footer className="bg-black/80 text-gray-400 py-8 px-6 text-center max-w-[100vw]">
                <p>&copy; {new Date().getFullYear()} BJM Parts. Semua hak dilindungi.</p>
                <p className="mt-2">Kontak: info@bjmparts.com | Telp: 0812xxxxxxx</p>
            </footer>
        </div>
    );
}
