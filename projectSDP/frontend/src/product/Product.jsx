import React, { useState, useEffect, useMemo, useRef } from "react";
import { getProducts } from "../apiService/productApi";
import { getCategories } from "../apiService/categoryApi";
import { useNavigate } from "react-router-dom";
import { Search, Filter, X, ShoppingCart, Star, ChevronDown } from "lucide-react";

const Product = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("default");
    const categoryDropdownRef = useRef(null);
    const sortDropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productsData, categoriesData] = await Promise.all([
                    getProducts(),
                    getCategories()
                ]);
                setProducts(productsData);
                setCategories(categoriesData);
            } catch (err) {
                console.error("Gagal memuat data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
                setCategoryDropdownOpen(false);
            }
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
                setSortDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getCategoryName = (kategoriId) => {
        if (!kategoriId) return "Tidak ada kategori";
        const category = categories.find(cat => cat.id === kategoriId);
        return category ? category.nama : "Tidak ada kategori";
    };

    const getProductCategoryName = (product) => {
        if (product.kategori_nama) return product.kategori_nama;
        if (product.kategori_id) return getCategoryName(product.kategori_id);
        if (product.kategori) return product.kategori;
        return "Tidak ada kategori";
    };

    const getStockStatus = (stock) => {
        if (stock > 10) return { text: "Tersedia", color: "text-green-400", bg: "bg-green-500/20" };
        if (stock > 0) return { text: "Hampir Habis", color: "text-yellow-400", bg: "bg-yellow-500/20" };
        return { text: "Stok Habis", color: "text-red-400", bg: "bg-red-500/20" };
    };

    const filteredAndSortedProducts = useMemo(() => {
        let result = products.filter((p) => p.active);

        if (selectedCategory !== "Semua") {
            result = result.filter((p) => getProductCategoryName(p) === selectedCategory);
        }

        if (searchTerm) {
            result = result.filter((p) =>
                p.nama.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        switch (sortBy) {
            case "price-low":
                result = [...result].sort((a, b) => a.harga - b.harga);
                break;
            case "price-high":
                result = [...result].sort((a, b) => b.harga - a.harga);
                break;
            case "name":
                result = [...result].sort((a, b) => a.nama.localeCompare(b.nama));
                break;
            default:
                break;
        }

        return result;
    }, [products, searchTerm, selectedCategory, categories, sortBy]);

    const availableCategories = useMemo(() => {
        const categoryNames = products
            .filter(p => p.active)
            .map(p => getProductCategoryName(p))
            .filter(Boolean);
        return [...new Set(categoryNames)].sort();
    }, [products, categories]);

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("Semua");
        setSortBy("default");
    };

    const getSortLabel = () => {
        switch (sortBy) {
            case "price-low": return "Harga: Rendah ke Tinggi";
            case "price-high": return "Harga: Tinggi ke Rendah";
            case "name": return "Nama: A-Z";
            default: return "Urutkan";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-lg">Memuat produk...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 px-4 py-8 relative">
            <div className="max-w-7xl mx-auto mb-8 relative z-30">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
                        Koleksi Produk
                    </h1>
                    <p className="text-gray-300">Temukan produk terbaik dengan kualitas premium</p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20 relative z-40">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <div className="flex-1 w-full relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            />
                        </div>

                        <div className="relative w-full lg:w-64" ref={categoryDropdownRef}>
                            <button
                                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white flex justify-between items-center hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Filter size={18} />
                                    <span className="truncate">
                                        {selectedCategory === "Semua" ? "Semua Kategori" : selectedCategory}
                                    </span>
                                </div>
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform duration-300 ${categoryDropdownOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            <div className={`absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-white/10 rounded-xl shadow-2xl transition-all duration-300 z-[9999] max-h-80 overflow-y-auto ${categoryDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                                <div className="p-2">
                                    <div
                                        className="px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center justify-between"
                                        onClick={() => {
                                            setSelectedCategory("Semua");
                                            setCategoryDropdownOpen(false);
                                        }}
                                    >
                                        <span>Semua Kategori</span>
                                        {selectedCategory === "Semua" && (
                                            <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                        )}
                                    </div>
                                    {availableCategories.map((kategori) => (
                                        <div
                                            key={kategori}
                                            className="px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center justify-between"
                                            onClick={() => {
                                                setSelectedCategory(kategori);
                                                setCategoryDropdownOpen(false);
                                            }}
                                        >
                                            <span className="truncate">{kategori}</span>
                                            {selectedCategory === kategori && (
                                                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="relative w-full lg:w-64" ref={sortDropdownRef}>
                            <button
                                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white flex justify-between items-center hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="truncate">{getSortLabel()}</span>
                                </div>
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform duration-300 ${sortDropdownOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            <div className={`absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-white/10 rounded-xl shadow-2xl transition-all duration-300 z-[9999] ${sortDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                                <div className="p-2">
                                    <div
                                        className="px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center justify-between"
                                        onClick={() => {
                                            setSortBy("default");
                                            setSortDropdownOpen(false);
                                        }}
                                    >
                                        <span>Urutkan</span>
                                        {sortBy === "default" && (
                                            <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                        )}
                                    </div>
                                    <div
                                        className="px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center justify-between"
                                        onClick={() => {
                                            setSortBy("price-low");
                                            setSortDropdownOpen(false);
                                        }}
                                    >
                                        <span>Harga: Rendah ke Tinggi</span>
                                        {sortBy === "price-low" && (
                                            <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                        )}
                                    </div>
                                    <div
                                        className="px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center justify-between"
                                        onClick={() => {
                                            setSortBy("price-high");
                                            setSortDropdownOpen(false);
                                        }}
                                    >
                                        <span>Harga: Tinggi ke Rendah</span>
                                        {sortBy === "price-high" && (
                                            <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                        )}
                                    </div>
                                    <div
                                        className="px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center justify-between"
                                        onClick={() => {
                                            setSortBy("name");
                                            setSortDropdownOpen(false);
                                        }}
                                    >
                                        <span>Nama: A-Z</span>
                                        {sortBy === "name" && (
                                            <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {(searchTerm || selectedCategory !== "Semua" || sortBy !== "default") && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 hover:bg-red-500/30 transition-colors flex items-center gap-2"
                            >
                                <X size={18} />
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-300">
                        Menampilkan <span className="text-white font-semibold">{filteredAndSortedProducts.length}</span> produk
                        {searchTerm && ` untuk "${searchTerm}"`}
                        {selectedCategory !== "Semua" && ` dalam "${selectedCategory}"`}
                    </p>
                </div>
            </div>

            {/* Products Grid - z-index lebih rendah */}
            {filteredAndSortedProducts.length > 0 ? (
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAndSortedProducts.map((p) => {
                            const stockStatus = getStockStatus(p.stok);
                            return (
                                <div
                                    key={p.id}
                                    className="group bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 hover:border-pink-500/50 transition-all duration-500 hover:transform hover:scale-105 cursor-pointer"
                                    onClick={() => navigate(`/product/${p.id}`)}
                                >
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={p.img_url || "/placeholder-image.jpg"}
                                            alt={p.nama}
                                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.src = "/placeholder-image.jpg";
                                            }}
                                        />
                                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                                            <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                                {getProductCategoryName(p)}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                                                {stockStatus.text}
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-pink-400 transition-colors">
                                            {p.nama}
                                        </h3>

                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text">
                                                Rp {p.harga.toLocaleString("id-ID")}
                                            </span>
                                            <div className="flex items-center gap-1 text-yellow-400">
                                                <Star size={14} fill="currentColor" />
                                                <span className="text-xs text-gray-300">5.0</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <span>Stok: {p.stok}</span>
                                            <div className="flex items-center gap-1">
                                                <ShoppingCart size={14} />
                                                <span>Beli</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-pink-500/30 rounded-2xl transition-all duration-500 pointer-events-none" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="max-w-2xl mx-auto text-center py-16 relative z-10">
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10">
                        <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
                            <Search size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Produk Tidak Ditemukan</h3>
                        <p className="text-gray-400 mb-6">
                            {searchTerm || selectedCategory !== "Semua"
                                ? "Coba ubah kata kunci pencarian atau filter kategori"
                                : "Belum ada produk yang tersedia saat ini"}
                        </p>
                        {(searchTerm || selectedCategory !== "Semua") && (
                            <button
                                onClick={clearFilters}
                                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-xl hover:from-pink-600 hover:to-indigo-700 transition-all duration-300 font-medium"
                            >
                                Tampilkan Semua Produk
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Product;