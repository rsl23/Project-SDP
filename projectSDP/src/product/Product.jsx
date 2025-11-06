import React, { useState, useEffect, useMemo, useRef } from "react";
import { getProducts } from "../apiService/productApi";
import { useNavigate } from "react-router-dom";

const kategori = ["Spion", "Shock", "Master Rem", "Lampu", "Filter Udara"];

const Product = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (err) {
                console.error("Gagal memuat produk:", err);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredProducts = useMemo(() => {
        let result = products;
        result = result.filter((p) => p.active);
        if (selectedCategory !== "Semua") {
            result = result.filter((p) => p.kategori === selectedCategory);
        }
        if (searchTerm) {
            result = result.filter((p) =>
                p.nama.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return result;
    }, [products, searchTerm, selectedCategory]);

    return (
        <div className="product-page px-6 py-8 max-w-[1400px] mx-auto min-h-screen">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 relative z-10">
                <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-1/2 text-sm text-gray-900 bg-white"
                />

                <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="w-full sm:w-auto px-4 py-2 bg-white text-gray-900 rounded-lg flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {selectedCategory === "Semua" ? "Semua Kategori" : selectedCategory}
                        <svg
                            className={`w-4 h-4 ml-2 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : "rotate-0"
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>

                    <ul
                        className={`absolute left-0 mt-2 w-full sm:w-auto bg-white text-gray-900 rounded shadow-lg overflow-hidden transition-all duration-300 origin-top z-50 ${dropdownOpen
                            ? "scale-100 opacity-100 pointer-events-auto"
                            : "scale-95 opacity-0 pointer-events-none"
                            }`}
                    >
                        <li
                            className="px-4 py-2 hover:bg-indigo-500 hover:text-white cursor-pointer"
                            onClick={() => {
                                setSelectedCategory("Semua");
                                setDropdownOpen(false);
                            }}
                        >
                            Semua Kategori
                        </li>
                        {kategori.map((k) => (
                            <li
                                key={k}
                                className="px-4 py-2 hover:bg-indigo-500 hover:text-white cursor-pointer"
                                onClick={() => {
                                    setSelectedCategory(k);
                                    setDropdownOpen(false);
                                }}
                            >
                                {k}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {filteredProducts.map((p) => (
                        <div
                            key={p.id}
                            className="product-card cursor-pointer bg-gradient-to-br from-pink-400/30 via-purple-400/30 to-indigo-400/30 backdrop-blur-sm rounded-xl shadow-md p-4 flex flex-col items-center text-sm hover:shadow-xl hover:scale-105 transition-all duration-300"
                            onClick={() => navigate(`/product/${p.id}`)} // navigasi ke detail
                        >
                            <div className="relative w-full">
                                <img
                                    src={
                                        p.img_url
                                    }
                                    alt={p.nama}
                                    className="w-full h-28 object-cover rounded-lg mb-2"
                                />
                                <span className="absolute top-2 left-2 bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded">
                                    {p.kategori}
                                </span>
                            </div>
                            <p className="font-semibold text-center truncate w-full mb-1 text-white">
                                {p.nama}
                            </p>
                            <p className="text-indigo-400 font-bold text-center mb-2">
                                Rp {p.harga.toLocaleString("id-ID")}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-400 text-sm mt-8">
                    Produk tidak ditemukan.
                </p>
            )}
        </div>
    );
};

export default Product;
