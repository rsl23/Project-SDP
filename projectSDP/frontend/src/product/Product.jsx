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

const Product = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  const [productRatings, setProductRatings] = useState({});
  const categoryDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const navigate = useNavigate();

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

  const fetchAllProductReviews = async (productsData) => {
    const ratings = {};
    for (const product of productsData) {
      const reviewData = await fetchProductReviews(product.id);
      ratings[product.id] = reviewData;
    }
    setProductRatings(ratings);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        await fetchAllProductReviews(productsData);
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

  const getCategoryName = (kategoriId) => {
    if (!kategoriId) return "Tidak ada kategori";
    const category = categories.find((cat) => cat.id === kategoriId);
    return category ? category.nama : "Tidak ada kategori";
  };

  const getProductCategoryName = (product) => {
    if (product.kategori_nama) return product.kategori_nama;
    if (product.kategori_id) return getCategoryName(product.kategori_id);
    if (product.kategori) return product.kategori;
    return "Tidak ada kategori";
  };

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
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-400"
            }
          />
        ))}
      </div>
    );
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((p) => p.active);

    if (selectedCategory !== "Semua") {
      result = result.filter(
        (p) => getProductCategoryName(p) === selectedCategory
      );
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
      case "rating":
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

  const availableCategories = useMemo(() => {
    const categoryNames = products
      .filter((p) => p.active)
      .map((p) => getProductCategoryName(p))
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
      case "price-low":
        return "Harga Rendah";
      case "price-high":
        return "Harga Tinggi";
      case "name":
        return "Nama A-Z";
      case "rating":
        return "Rating";
      default:
        return "Urutkan";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-white text-base sm:text-lg mt-4">Memuat produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 px-3 sm:px-4 py-6 sm:py-8">
      {/* Mobile Header */}
      <div className="lg:hidden mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white text-center mb-2 bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
          Koleksi Produk
        </h1>
        <p className="text-gray-300 text-center text-sm">
          Temukan produk terbaik dengan kualitas premium
        </p>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block max-w-7xl mx-auto mb-6 sm:mb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Koleksi Produk
          </h1>
          <p className="text-gray-300">
            Temukan produk terbaik dengan kualitas premium
          </p>
        </div>
      </div>

      {/* Filters Container */}
      <div className="max-w-7xl mx-auto mb-4 sm:mb-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/20">
          {/* Search Input - Full width on mobile */}
          <div className="mb-3 sm:mb-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Filter and Sort Buttons - Horizontal layout on mobile */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Category Filter */}
            <div className="relative w-full sm:w-48" ref={categoryDropdownRef}>
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white flex justify-between items-center hover:bg-white/10 transition-colors text-sm sm:text-base"
              >
                <div className="flex items-center gap-2 truncate">
                  <Filter size={16} />
                  <span className="truncate">
                    {selectedCategory === "Semua"
                      ? "Semua Kategori"
                      : selectedCategory.length > 15
                        ? selectedCategory.substring(0, 12) + "..."
                        : selectedCategory}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${categoryDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              <div
                className={`absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-gray-800 border border-white/10 rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 z-[9999] max-h-60 overflow-y-auto ${categoryDropdownOpen
                    ? "opacity-100 visible"
                    : "opacity-0 invisible"
                  }`}
              >
                <div className="p-1 sm:p-2">
                  <div
                    className="px-3 py-2 rounded hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center justify-between text-sm sm:text-base"
                    onClick={() => {
                      setSelectedCategory("Semua");
                      setCategoryDropdownOpen(false);
                    }}
                  >
                    <span>Semua Kategori</span>
                    {selectedCategory === "Semua" && (
                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                    )}
                  </div>
                  {availableCategories.map((kategori) => (
                    <div
                      key={kategori}
                      className="px-3 py-2 rounded hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center justify-between text-sm sm:text-base"
                      onClick={() => {
                        setSelectedCategory(kategori);
                        setCategoryDropdownOpen(false);
                      }}
                    >
                      <span className="truncate">{kategori}</span>
                      {selectedCategory === kategori && (
                        <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="relative w-full sm:w-48" ref={sortDropdownRef}>
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white flex justify-between items-center hover:bg-white/10 transition-colors text-sm sm:text-base"
              >
                <div className="flex items-center gap-2">
                  <span className="truncate">{getSortLabel()}</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${sortDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              <div
                className={`absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-gray-800 border border-white/10 rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 z-[9999] ${sortDropdownOpen
                    ? "opacity-100 visible"
                    : "opacity-0 invisible"
                  }`}
              >
                <div className="p-1 sm:p-2">
                  <div
                    className="px-3 py-2 rounded hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center justify-between text-sm sm:text-base"
                    onClick={() => {
                      setSortBy("default");
                      setSortDropdownOpen(false);
                    }}
                  >
                    <span>Urutkan</span>
                    {sortBy === "default" && (
                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                    )}
                  </div>
                  <div
                    className="px-3 py-2 rounded hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center justify-between text-sm sm:text-base"
                    onClick={() => {
                      setSortBy("price-low");
                      setSortDropdownOpen(false);
                    }}
                  >
                    <span>Harga: Rendah</span>
                    {sortBy === "price-low" && (
                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                    )}
                  </div>
                  <div
                    className="px-3 py-2 rounded hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center justify-between text-sm sm:text-base"
                    onClick={() => {
                      setSortBy("price-high");
                      setSortDropdownOpen(false);
                    }}
                  >
                    <span>Harga: Tinggi</span>
                    {sortBy === "price-high" && (
                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                    )}
                  </div>
                  <div
                    className="px-3 py-2 rounded hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center justify-between text-sm sm:text-base"
                    onClick={() => {
                      setSortBy("name");
                      setSortDropdownOpen(false);
                    }}
                  >
                    <span>Nama: A-Z</span>
                    {sortBy === "name" && (
                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                    )}
                  </div>
                  <div
                    className="px-3 py-2 rounded hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center justify-between text-sm sm:text-base"
                    onClick={() => {
                      setSortBy("rating");
                      setSortDropdownOpen(false);
                    }}
                  >
                    <span>Rating</span>
                    {sortBy === "rating" && (
                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || selectedCategory !== "Semua" || sortBy !== "default") && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg sm:rounded-xl hover:bg-red-500/30 transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                <X size={16} />
                <span className="hidden sm:inline">Reset</span>
                <span className="sm:hidden">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 sm:mt-4">
          <p className="text-xs sm:text-sm text-gray-300">
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

      {/* Products Grid */}
      {filteredAndSortedProducts.length > 0 ? (
        <div className="max-w-7xl mx-auto px-1 sm:px-0">
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            {filteredAndSortedProducts.map((p) => {
              const stockStatus = getStockStatus(p.stok);
              const productRating = productRatings[p.id] || {
                averageRating: 0,
                totalReviews: 0,
              };

              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="group cursor-pointer bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm sm:backdrop-blur-lg rounded-lg sm:rounded-xl border border-gray-700/50 hover:border-pink-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:shadow-lg hover:shadow-pink-500/10 overflow-hidden flex flex-col"
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden aspect-square">
                    <img
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      src={p.img_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"}
                      alt={p.nama}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop";
                      }}
                      loading="lazy"
                    />

                    {/* Category Badge */}
                    <div className="absolute top-1.5 left-1.5">
                      <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-purple-600/90 backdrop-blur-md rounded-md border border-purple-400/30">
                        <span className="text-[10px] sm:text-xs font-semibold text-white">
                          {getProductCategoryName(p).substring(0, 8)}
                          {getProductCategoryName(p).length > 8 ? "..." : ""}
                        </span>
                      </div>
                    </div>

                    {/* Discount Badge */}
                    {p.diskon && p.diskon > 0 && (
                      <div className="absolute top-1.5 right-1.5">
                        <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-md shadow">
                          <span className="text-[10px] sm:text-xs font-bold text-white">
                            -{p.diskon}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-2 sm:p-3 md:p-4 flex-1 flex flex-col">
                    {/* Product Name */}
                    <h5 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-pink-300 transition-colors mb-1 sm:mb-2">
                      {p.nama}
                    </h5>

                    {/* Rating */}
                    <div className="mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        {renderRatingStars(productRating.averageRating, "sm")}
                        <span className="text-xs font-bold text-white">
                          {productRating.averageRating > 0
                            ? productRating.averageRating.toFixed(1)
                            : "0.0"}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-400 ml-auto">
                        ({productRating.totalReviews})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-2 sm:mb-3">
                      <div className="flex items-baseline gap-1 sm:gap-2">
                        <span className="text-sm sm:text-base md:text-lg font-bold text-transparent bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text">
                          Rp {p.harga.toLocaleString("id-ID")}
                        </span>
                        {p.diskon && p.diskon > 0 && (
                          <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                            Rp{" "}
                            {Math.round(
                              (p.harga * 100) / (100 - p.diskon)
                            ).toLocaleString("id-ID")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-700/50">
                      <div className="flex items-center justify-between">
                        <div className={`text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded ${stockStatus.bg}`}>
                          <span className={`font-medium ${stockStatus.color}`}>
                            Stok: {p.stok}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 sm:gap-1 text-gray-400 group-hover:text-pink-400 transition-colors">
                          <ShoppingCart size={10} className="sm:size-3" />
                          <span className="text-[10px] sm:text-xs font-medium">Beli</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto text-center py-8 sm:py-12 md:py-16 px-4">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 border border-gray-700/50">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
              <Search size={18} className="sm:size-6 md:size-8 text-pink-400" />
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">
              Produk Tidak Ditemukan
            </h3>
            <p className="text-gray-400 mb-4 sm:mb-6 text-xs sm:text-sm md:text-base">
              {searchTerm || selectedCategory !== "Semua"
                ? "Coba ubah kata kunci pencarian atau filter kategori"
                : "Belum ada produk yang tersedia saat ini"}
            </p>
            {(searchTerm || selectedCategory !== "Semua") && (
              <button
                onClick={clearFilters}
                className="px-3 sm:px-4 py-1.5 sm:py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg sm:rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-pink-500/25 text-xs sm:text-sm md:text-base"
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