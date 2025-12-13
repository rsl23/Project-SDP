// Product Component - Halaman katalog produk dengan search, filter, dan sort
// Features: Search produk, filter kategori, sort by price/name/rating, display rating dan stock

import React, { useState, useEffect, useMemo, useRef } from "react";
import { getProducts } from "../apiService/productApi";
import { getCategories } from "../apiService/categoryApi";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  X,
  ShoppingCart,
  Star,
  ChevronDown,
} from "lucide-react";
import { Card, Button, Badge, Spinner } from "flowbite-react";

const Product = () => {
  // State management untuk products, categories, dan UI controls
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  const [productRatings, setProductRatings] = useState({}); // Cache rating produk
  const categoryDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch rating dan total reviews untuk satu produk
  // @param productId - ID produk
  // @returns Object dengan averageRating dan totalReviews
  const fetchProductReviews = async (productId) => {
    try {
      const response = await fetch(
        `https://backend-dot-storied-courier-479504-q5.et.r.appspot.com/api/reviews/product/${productId}`
      );
      if (response.ok) {
        const data = await response.json();
        return {
          averageRating: data.averageRating,
          totalReviews: data.totalReviews,
        };
      }
    } catch (error) {
      console.error("Error fetching reviews for product:", productId, error);
    }
    return { averageRating: 0, totalReviews: 0 };
  };

  // Fetch reviews untuk semua produk dan cache di state
  // Dijalankan setelah products data loaded untuk display rating di card
  const fetchAllProductReviews = async (productsData) => {
    const ratings = {};
    for (const product of productsData) {
      const reviewData = await fetchProductReviews(product.id);
      ratings[product.id] = reviewData;
    }
    setProductRatings(ratings);
  };

  // Initial data fetch - products, categories, dan reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Parallel fetch products dan categories untuk efficiency
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);

        // Fetch reviews untuk semua produk setelah products loaded
        await fetchAllProductReviews(productsData);
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Close dropdowns when clicking outside
  // Event listener untuk menutup dropdown kategori dan sort saat click di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(e.target)
      ) {
        setCategoryDropdownOpen(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target)
      ) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper: Get nama kategori dari kategori_id
  // Helper: Get nama kategori dari kategori_id
  const getCategoryName = (kategoriId) => {
    if (!kategoriId) return "Tidak ada kategori";
    const category = categories.find((cat) => cat.id === kategoriId);
    return category ? category.nama : "Tidak ada kategori";
  };

  // Helper: Extract nama kategori dari berbagai field produk (kategori_nama, kategori_id, kategori)
  // Compatibility untuk berbagai format data produk dari API
  const getProductCategoryName = (product) => {
    if (product.kategori_nama) return product.kategori_nama;
    if (product.kategori_id) return getCategoryName(product.kategori_id);
    if (product.kategori) return product.kategori;
    return "Tidak ada kategori";
  };

  // Helper: Determine stock status dengan color coding
  // @param stock - Jumlah stok produk
  // @returns Object dengan text, color className, dan background className
  const getStockStatus = (stock) => {
    if (stock > 10)
      return {
        text: "Tersedia",
        color: "text-green-400",
        bg: "bg-green-500/20",
      };
    if (stock > 0)
      return {
        text: "Hampir Habis",
        color: "text-yellow-400",
        bg: "bg-yellow-500/20",
      };
    return { text: "Stok Habis", color: "text-red-400", bg: "bg-red-500/20" };
  };

  // Render rating stars component
  // @param rating - Rating value (0-5)
  // @param size - Size variant ("sm" atau "md")
  // @returns React component dengan 5 stars (filled atau empty)
  const renderRatingStars = (rating, size = "sm") => {
    const starSize = size === "sm" ? 12 : 14;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={starSize}
            className={
              star <= rating
                ? "text-yellow-400 fill-yellow-400" // Filled star untuk rating
                : "text-gray-400" // Empty star
            }
          />
        ))}
      </div>
    );
  };

  // Memoized filtered dan sorted products
  // Dependency: products, searchTerm, selectedCategory, sortBy, productRatings
  // Filter: active products, category, search term
  // Sort: price (low/high), name, rating
  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((p) => p.active); // Hanya tampilkan produk aktif

    // Filter by category
    if (selectedCategory !== "Semua") {
      result = result.filter(
        (p) => getProductCategoryName(p) === selectedCategory
      );
    }

    // Filter by search term (case insensitive)
    if (searchTerm) {
      result = result.filter((p) =>
        p.nama.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by selected criteria
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
      case "rating":
        // Sort by average rating descending
        result = [...result].sort((a, b) => {
          const ratingA = productRatings[a.id]?.averageRating || 0;
          const ratingB = productRatings[b.id]?.averageRating || 0;
          return ratingB - ratingA;
        });
        break;
      default:
        break;
    }

    return result;
  }, [
    products,
    searchTerm,
    selectedCategory,
    categories,
    sortBy,
    productRatings,
  ]);

  // Memoized list kategori unik dari produk aktif untuk filter dropdown
  const availableCategories = useMemo(() => {
    const categoryNames = products
      .filter((p) => p.active)
      .map((p) => getProductCategoryName(p))
      .filter(Boolean); // Remove null/undefined
    return [...new Set(categoryNames)].sort(); // Unique dan sorted
  }, [products, categories]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("Semua");
    setSortBy("default");
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case "price-low":
        return "Harga: Rendah ke Tinggi";
      case "price-high":
        return "Harga: Tinggi ke Rendah";
      case "name":
        return "Nama: A-Z";
      case "rating":
        return "Rating Tertinggi";
      default:
        return "Urutkan";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="xl" color="pink" />
          <p className="text-white text-lg mt-4">Memuat produk...</p>
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
          <p className="text-gray-300">
            Temukan produk terbaik dengan kualitas premium
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20 relative z-40">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
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
                    {selectedCategory === "Semua"
                      ? "Semua Kategori"
                      : selectedCategory}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${
                    categoryDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-white/10 rounded-xl shadow-2xl transition-all duration-300 z-[9999] max-h-80 overflow-y-auto ${
                  categoryDropdownOpen
                    ? "opacity-100 visible"
                    : "opacity-0 invisible"
                }`}
              >
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
                  className={`transition-transform duration-300 ${
                    sortDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-white/10 rounded-xl shadow-2xl transition-all duration-300 z-[9999] ${
                  sortDropdownOpen
                    ? "opacity-100 visible"
                    : "opacity-0 invisible"
                }`}
              >
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
                  <div
                    className="px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center justify-between"
                    onClick={() => {
                      setSortBy("rating");
                      setSortDropdownOpen(false);
                    }}
                  >
                    <span>Rating Tertinggi</span>
                    {sortBy === "rating" && (
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {(searchTerm ||
              selectedCategory !== "Semua" ||
              sortBy !== "default") && (
              <Button color="failure" onClick={clearFilters}>
                <X size={18} className="mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-300">
            Menampilkan{" "}
            <span className="text-white font-semibold">
              {filteredAndSortedProducts.length}
            </span>{" "}
            produk
            {searchTerm && ` untuk "${searchTerm}"`}
            {selectedCategory !== "Semua" && ` dalam "${selectedCategory}"`}
          </p>
        </div>
      </div>

      {/* Products Grid - z-index lebih rendah */}
      {filteredAndSortedProducts.length > 0 ? (
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredAndSortedProducts.map((p) => {
              const stockStatus = getStockStatus(p.stok);
              const productRating = productRatings[p.id] || {
                averageRating: 0,
                totalReviews: 0,
              };

              return (
                <Card
                  key={p.id}
                  className="group cursor-pointer bg-white/5 backdrop-blur-lg border-white/10 hover:border-pink-500/50 transition-all duration-500 hover:transform hover:scale-105"
                  onClick={() => navigate(`/product/${p.id}`)}
                  imgSrc={p.img_url || "/placeholder-image.jpg"}
                  imgAlt={p.nama}
                >
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <Badge color="pink" size="sm">
                      {getProductCategoryName(p)}
                    </Badge>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${stockStatus.bg} ${stockStatus.color}`}
                    >
                      {stockStatus.text}
                    </span>
                  </div>

                  <h5 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-pink-400 transition-colors text-sm sm:text-base">
                    {p.nama}
                  </h5>

                  <div className="mb-2">
                    <span className="text-lg sm:text-2xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text">
                      Rp {p.harga.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {renderRatingStars(productRating.averageRating)}
                      <span className="text-xs text-gray-300">
                        {productRating.averageRating > 0
                          ? productRating.averageRating.toFixed(1)
                          : "0.0"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      ({productRating.totalReviews} ulasan)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Stok: {p.stok}</span>
                    <ShoppingCart size={14} />
                  </div>
                </Card>
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
            <h3 className="text-2xl font-bold text-white mb-2">
              Produk Tidak Ditemukan
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || selectedCategory !== "Semua"
                ? "Coba ubah kata kunci pencarian atau filter kategori"
                : "Belum ada produk yang tersedia saat ini"}
            </p>
            {(searchTerm || selectedCategory !== "Semua") && (
              <Button gradientDuoTone="pinkToOrange" onClick={clearFilters}>
                Tampilkan Semua Produk
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
