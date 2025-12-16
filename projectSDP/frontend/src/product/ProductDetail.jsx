// ProductDetail Component - Halaman detail produk dengan reviews, add to cart, marketplace links
// Features: Product info lengkap, stock status, reviews dengan rating filter, add to cart, e-commerce links

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getProducts } from "../apiService/productApi";
import { getCategories } from "../apiService/categoryApi";
import { addToCart } from "../apiService/cartApi";
import tokopediaLogo from "../assets/tokopedia.jpeg";
import shopeeLogo from "../assets/shopee.png";
import toast, { Toaster } from "react-hot-toast"; // Toast notifications
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Tag,
  ExternalLink,
  Star,
  Truck,
  User,
  MessageCircle,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Card, Button, Spinner, Badge } from "flowbite-react";

const ProductDetail = () => {
  const { id } = useParams(); // Product ID dari URL params
  const navigate = useNavigate();
  const location = useLocation();
  // State management untuk product data dan UI
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false); // Image lazy loading
  const [reviews, setReviews] = useState([]); // Filtered reviews
  const [allReviews, setAllReviews] = useState([]); // Original reviews tanpa filter
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState("all"); // Filter: "all", 5, 4, 3, 2, 1
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Fetch reviews untuk produk ini dari API
  // @param productId - ID produk
  // Returns: averageRating, totalReviews, dan array reviews dengan user info
  const fetchProductReviews = async (productId) => {
    try {
      setReviewsLoading(true);
      const response = await fetch(
        `https://backend-dot-storied-courier-479504-q5.et.r.appspot.com/api/reviews/product/${productId}`
      );
      if (response.ok) {
        const data = await response.json();
        setAllReviews(data.reviews); // Simpan semua untuk filtering
        setReviews(data.reviews); // Default tampilkan semua
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Apply rating filter saat ratingFilter atau allReviews berubah
  // Filter reviews berdasarkan rating yang dipilih (1-5 bintang atau semua)
  useEffect(() => {
    if (ratingFilter === "all") {
      setReviews(allReviews);
    } else {
      const filtered = allReviews.filter(
        (review) => review.rating === parseInt(ratingFilter)
      );
      setReviews(filtered);
    }
  }, [ratingFilter, allReviews]);

  // Handle add to cart dengan error handling dan toast notification
  // Redirect ke login jika user belum login
  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, 1); // Add 1 qty ke cart
      toast.success("Berhasil menambahkan ke keranjang!", {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#1e1b4b",
          color: "white",
          border: "1px solid #4f46e5",
        },
      });
    } catch (error) {
      console.error("Gagal menambah ke keranjang:", error);

      // Special handling untuk user belum login
      if (error.message === "User belum login") {
        toast.error("Silakan login terlebih dahulu!", {
          style: {
            background: "#7f1d1d",
            color: "white",
            border: "1px solid #dc2626",
          },
        });
        navigate("/login", { state: { from: location } }); // Redirect dengan return URL
      } else {
        toast.error("Gagal menambahkan ke keranjang!", {
          style: {
            background: "#7f1d1d",
            color: "white",
            border: "1px solid #dc2626",
          },
        });
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);

        const selected = productsData.find((p) => p.id.toString() === id);

        if (!selected) {
          navigate("/product");
          return;
        }

        setProduct(selected);
        setCategories(categoriesData);

        // Fetch reviews setelah product ditemukan
        await fetchProductReviews(selected.id);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Gagal memuat data produk", {
          style: {
            background: "#7f1d1d",
            color: "white",
            border: "1px solid #dc2626",
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const getProductCategoryName = () => {
    if (!product) return "Tidak ada kategori";

    if (product.kategori_nama) return product.kategori_nama;
    if (product.kategori_id) {
      const category = categories.find((cat) => cat.id === product.kategori_id);
      if (category) return category.nama;
    }
    if (product.kategori) return product.kategori;
    return "Tidak ada kategori";
  };

  const getStockInfo = (stock) => {
    if (stock > 10) {
      return {
        color: "text-green-400",
        text: "Tersedia",
        badge: "bg-green-500/20 border-green-500/50 text-green-300",
        icon: "🟢",
      };
    } else if (stock > 0) {
      return {
        color: "text-yellow-400",
        text: "Hampir Habis",
        badge: "bg-yellow-500/20 border-yellow-500/50 text-yellow-300",
        icon: "🟡",
      };
    } else {
      return {
        color: "text-red-400",
        text: "Stok Habis",
        badge: "bg-red-500/20 border-red-500/50 text-red-300",
        icon: "🔴",
      };
    }
  };

  // Fungsi untuk render rating stars
  const renderRatingStars = (rating, size = "sm") => {
    const starSize = size === "lg" ? 20 : 16;
    return (
      <div className="flex items-center gap-1">
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

  // Fungsi untuk format tanggal review
  const formatReviewDate = (timestamp) => {
    if (!timestamp) return "";

    try {
      let date;

      if (timestamp._seconds !== undefined) {
        date = new Date(
          timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000
        );
      } else if (timestamp.seconds !== undefined) {
        date = new Date(
          timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000
        );
      } else if (timestamp.toDate && typeof timestamp.toDate === "function") {
        date = timestamp.toDate();
      } else {
        date = new Date(timestamp);
      }

      if (isNaN(date.getTime())) {
        return "";
      }

      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting review date:", error);
      return "";
    }
  };

  // Get rating filter label
  const getRatingFilterLabel = () => {
    switch (ratingFilter) {
      case "all":
        return "Semua Rating";
      case "5":
        return "5 Bintang";
      case "4":
        return "4 Bintang";
      case "3":
        return "3 Bintang";
      case "2":
        return "2 Bintang";
      case "1":
        return "1 Bintang";
      default:
        return "Semua Rating";
    }
  };

  // Get count for each rating
  const getRatingCount = (rating) => {
    return allReviews.filter((review) => review.rating === rating).length;
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20">
          <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
            <Package className="text-white" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Produk Tidak Ditemukan
          </h2>
          <Button
            gradientDuoTone="pinkToOrange"
            size="xl"
            onClick={() => navigate("/product")}
          >
            Kembali ke Daftar Produk
          </Button>
        </div>
      </div>
    );
  }

  const stockInfo = getStockInfo(product.stok);
  const categoryName = getProductCategoryName();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <Toaster />

      {/* Header */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-lg border border-white/30 rounded-xl text-white font-medium transition-all duration-300 shadow-lg"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="flex justify-center">
            <div className="relative group">
              <div
                className={`absolute inset-0 bg-gradient-to-br from-pink-500/20 to-indigo-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
              ></div>
              <div className="relative bg-white/5 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
                <img
                  src={product.img_url || "/placeholder-image.jpg"}
                  alt={product.nama}
                  className={`w-full max-w-md h-auto max-h-[500px] object-contain rounded-2xl transition-all duration-500 ${imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    } group-hover:scale-105`}
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => {
                    e.target.src = "/placeholder-image.jpg";
                    setImageLoaded(true);
                  }}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Spinner size="lg" color="pink" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center space-y-8">
            {/* Header Section */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                  {product.nama}
                </h1>
                <div
                  className={`px-4 py-2 rounded-full border ${stockInfo.badge} backdrop-blur-sm`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {stockInfo.icon} {stockInfo.text}
                  </span>
                </div>
              </div>

              {/* Price & Rating */}
              <div className="flex items-center gap-4">
                <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
                  Rp {product.harga.toLocaleString("id-ID")}
                </p>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full">
                  {renderRatingStars(averageRating, "sm")}
                  <div className="flex flex-row gap-3 items-center">
                    <span className="text-white text-sm font-bold">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="text-gray-300 text-xs">
                      ({totalReviews} ulasan)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Package size={20} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Stok Tersedia</p>
                    <p className={`text-lg font-semibold ${stockInfo.color}`}>
                      {product.stok} unit
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500/20 rounded-lg">
                    <Tag size={20} className="text-pink-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Kategori</p>
                    <p className="text-white text-lg font-semibold">
                      {categoryName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span>📝</span> Deskripsi Produk
              </h3>
              {product.deskripsi ? (
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {product.deskripsi}
                </p>
              ) : (
                <p className="text-gray-400 italic">
                  Tidak ada deskripsi untuk produk ini.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stok === 0}
                className={`w-full px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 text-lg ${product.stok === 0
                  ? "bg-gray-600 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 hover:shadow-2xl hover:scale-105"
                  }`}
              >
                <ShoppingCart size={24} />
                {product.stok === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
              </button>

              {/* E-commerce Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.link_tokopedia ? (
                  <a
                    href={product.link_tokopedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-medium transition-all duration-300 bg-green-600 hover:bg-green-700 hover:scale-105 hover:shadow-xl text-white"
                  >
                    <img
                      src={tokopediaLogo}
                      alt="Tokopedia"
                      className="w-6 h-6 object-contain rounded"
                    />
                    <span>Beli di Tokopedia</span>
                    <ExternalLink
                      size={16}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </a>
                ) : (
                  <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-medium bg-gray-600/50 cursor-not-allowed opacity-50 text-white">
                    <img
                      src={tokopediaLogo}
                      alt="Tokopedia"
                      className="w-6 h-6 object-contain rounded"
                    />
                    <span>Link Tidak Tersedia</span>
                  </div>
                )}

                {product.link_shopee ? (
                  <a
                    href={product.link_shopee}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-medium transition-all duration-300 bg-orange-600 hover:bg-orange-700 hover:scale-105 hover:shadow-xl text-white"
                  >
                    <img
                      src={shopeeLogo}
                      alt="Shopee"
                      className="w-6 h-6 object-contain"
                    />
                    <span>Beli di Shopee</span>
                    <ExternalLink
                      size={16}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </a>
                ) : (
                  <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-medium bg-gray-600/50 cursor-not-allowed opacity-50 text-white">
                    <img
                      src={shopeeLogo}
                      alt="Shopee"
                      className="w-6 h-6 object-contain"
                    />
                    <span>Link Tidak Tersedia</span>
                  </div>
                )}
              </div>

              {/* Shipping Info */}
              {/* <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <Truck size={20} className="text-indigo-400" />
                  <span className="text-sm">
                    Gratis pengiriman untuk order di atas Rp 500.000
                  </span>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          {/* Header dengan filter */}
          <div className="border-b border-white/10 pb-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Ulasan Produk
                </h2>
                <div className="flex items-center gap-4 text-gray-300 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={
                            star <= averageRating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-400"
                          }
                        />
                      ))}
                    </div>
                    <span className="font-medium text-white">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-white/20"></div>
                  <span>{totalReviews} ulasan</span>
                </div>
              </div>

              {/* Rating Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  <Filter size={16} />
                  <span className="text-sm">{getRatingFilterLabel()}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${filterDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {filterDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-white/20 rounded-lg shadow-lg z-10">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setRatingFilter("all");
                          setFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${ratingFilter === "all"
                          ? "bg-indigo-600 text-white"
                          : "text-gray-300 hover:bg-white/10"
                          }`}
                      >
                        Semua Rating ({totalReviews})
                      </button>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => {
                            setRatingFilter(rating.toString());
                            setFilterDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center justify-between ${ratingFilter === rating.toString()
                            ? "bg-indigo-600 text-white"
                            : "text-gray-300 hover:bg-white/10"
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={12}
                                  className={
                                    star <= rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-400"
                                  }
                                />
                              ))}
                            </div>
                            <span>{rating}</span>
                          </div>
                          <span className="text-xs text-gray-400">
                            ({getRatingCount(rating)})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reviews */}
          {reviewsLoading ? (
            <div className="text-center py-8 border border-white/10 rounded-lg bg-white/5">
              <Spinner size="lg" color="pink" />
              <p className="text-gray-300 mt-2 text-sm">Memuat ulasan...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 border border-white/10 rounded-lg bg-white/5">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10">
                <MessageCircle size={20} className="text-gray-400" />
              </div>
              <p className="text-gray-400 text-sm">
                {ratingFilter === "all"
                  ? "Belum ada ulasan"
                  : `Tidak ada ulasan dengan rating ${ratingFilter} bintang`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-gray-400 text-sm mb-4">
                Menampilkan {reviews.length} ulasan{" "}
                {ratingFilter !== "all" &&
                  `dengan rating ${ratingFilter} bintang`}
              </div>
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 border border-white/10 rounded-lg bg-white/5 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-indigo-500/10 rounded-full flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
                      <User size={16} className="text-indigo-400" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-white text-sm font-medium">
                          {review.user?.displayName || "Pelanggan"}
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              className={
                                star <= review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-400"
                              }
                            />
                          ))}
                        </div>
                      </div>

                      {review.komentar && (
                        <p className="text-gray-300 text-sm leading-relaxed mb-2">
                          {review.komentar}
                        </p>
                      )}

                      <div className="text-gray-500 text-xs">
                        {formatReviewDate(review.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
