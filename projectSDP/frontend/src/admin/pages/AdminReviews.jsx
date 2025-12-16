import React, { useEffect, useState } from "react";
import {
  Star,
  Search,
  Filter,
  Trash2,
  Eye,
  Package,
  User,
  Calendar,
  ChevronDown,
  MessageCircle,
  X,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAuth } from "firebase/auth";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [products, setProducts] = useState([]);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch semua reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://backend-dot-storied-courier-479504-q5.et.r.appspot.com/api/reviews"
      );
      if (response.ok) {
        const reviewsData = await response.json();

        // Fetch products untuk semua reviews (hanya sekali)
        const productsResponse = await fetch(
          `https://backend-dot-storied-courier-479504-q5.et.r.appspot.com/api/products`
        );
        const productsData = productsResponse.ok
          ? await productsResponse.json()
          : [];

        // Add product and user data untuk setiap review
        const reviewsWithDetails = reviewsData.map((review) => {
          // Find product
          const product = productsData.find((p) => p.id === review.produk_id);

          // Use data yang sudah tersimpan di review (userName, userPhotoURL)
          const userData = {
            displayName: review.userName || "Anonymous",
            photoURL: review.userPhotoURL || null,
          };

          return {
            ...review,
            product: product || null,
            user: userData,
          };
        });

        setReviews(reviewsWithDetails);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products untuk filter
  const fetchProducts = async () => {
    try {
      const response = await fetch(
        "https://backend-dot-storied-courier-479504-q5.et.r.appspot.com/api/products"
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchProducts();
  }, []);

  // Open delete confirmation modal
  const openDeleteModal = (review) => {
    setReviewToDelete(review);
    setDeleteModalOpen(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setReviewToDelete(null);
    setDeleting(false);
  };

  // Delete review - FIXED dengan authorization
  // Fungsi untuk menghapus review
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    setDeleting(true);

    try {
      // Dapatkan user dari Firebase Auth
      const auth = getAuth();
      const user = auth.currentUser;

      console.log("👤 Current user:", {
        uid: user?.uid,
        email: user?.email,
        displayName: user?.displayName,
      });

      if (!user) {
        toast.error("Anda harus login untuk menghapus review");
        closeDeleteModal();
        return;
      }

      // SEND QUERY PARAMETERS, bukan Authorization header
      const url = new URL(
        `https://backend-dot-storied-courier-479504-q5.et.r.appspot.com/api/reviews/${reviewToDelete.id}`
      );

      // Tambahkan query parameters seperti yang diharapkan backend
      url.searchParams.append("userId", user.uid);
      url.searchParams.append("isAdmin", "true"); // Asumsi Anda adalah admin

      console.log("🚀 DELETE URL:", url.toString());

      const response = await fetch(url.toString(), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📥 Response status:", response.status);

      let responseData;
      try {
        responseData = await response.json();
        console.log("📦 Response data:", responseData);
      } catch (parseError) {
        console.error("❌ Failed to parse response:", parseError);
        responseData = { error: "Failed to parse server response" };
      }

      if (response.ok) {
        // SUCCESS
        toast.success("Review berhasil dihapus");

        // Update state lokal
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review.id !== reviewToDelete.id)
        );

        // Tutup modal
        closeDeleteModal();
        if (detailModalOpen) {
          setDetailModalOpen(false);
          setSelectedReview(null);
        }

        // Refresh data
        setTimeout(() => {
          fetchReviews();
        }, 300);
      } else {
        // ERROR
        console.error("❌ Delete failed:", responseData);

        if (response.status === 403) {
          // Forbidden - bukan pemilik dan bukan admin
          toast.error("Anda tidak memiliki izin untuk menghapus review ini");

          // Cek jika bukan pemilik review
          if (reviewToDelete.userId !== user.uid) {
            toast.error("Anda bukan pemilik review ini");
          }
        } else if (response.status === 404) {
          // Not found
          toast.error("Review tidak ditemukan di server");

          // Hapus dari state lokal
          setReviews((prevReviews) =>
            prevReviews.filter((review) => review.id !== reviewToDelete.id)
          );
        } else {
          // Other errors
          toast.error(
            `Gagal menghapus review: ${responseData.error || "Unknown error"}`
          );
        }
      }
    } catch (error) {
      console.error("❌ Network or unexpected error:", error);
      toast.error("Gagal menghapus review. Periksa koneksi internet Anda.");
    } finally {
      setDeleting(false);
    }
  };

  // Fungsi untuk cek role user
  // Fungsi untuk cek role user langsung dari Firestore
  const checkUserRole = async (userId) => {
    try {
      console.log("🔍 Checking user role for:", userId);

      // Akses Firestore langsung (jika setup)
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "users", userId));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("👤 User data from Firestore:", userData);

        if (userData.role !== "admin") {
          toast.error(
            `Role Anda: ${
              userData.role || "user"
            }. Hanya admin yang dapat menghapus review.`
          );
        }
      } else {
        console.log("❌ User document not found in Firestore");
        toast.error(
          "Data user tidak ditemukan. Pastikan Anda memiliki akses admin."
        );
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      toast.error("Tidak dapat memverifikasi peran pengguna");
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.product?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user?.displayName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      review.komentar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.order_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProduct =
      selectedProduct === "all" || review.produk_id === selectedProduct;
    const matchesRating =
      ratingFilter === "all" || review.rating === parseInt(ratingFilter);

    return matchesSearch && matchesProduct && matchesRating;
  });

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";

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
        return "Tanggal tidak valid";
      }

      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Tanggal tidak valid";
    }
  };

  // Render rating stars
  const renderRatingStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  };

  // Get rating count
  const getRatingCount = (rating) => {
    return reviews.filter((review) => review.rating === rating).length;
  };

  // Get selected product name
  const getSelectedProductName = () => {
    if (selectedProduct === "all") return "Semua Produk";
    const product = products.find((p) => p.id === selectedProduct);
    return product ? product.nama : "Semua Produk";
  };

  // Stats
  const stats = {
    total: reviews.length,
    average:
      reviews.length > 0
        ? (
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length
          ).toFixed(1)
        : 0,
    rating5: getRatingCount(5),
    rating1: getRatingCount(1),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-3 md:mt-4 text-gray-600 text-sm md:text-base">
            Memuat reviews...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">
            Kelola Reviews
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">
            Kelola dan moderasi ulasan dari pelanggan
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="text-blue-600" size={18} />
              </div>
              <div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                  {stats.total}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Total Reviews
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="text-green-600" size={18} />
              </div>
              <div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                  {stats.average}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Rating Rata-rata
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="text-yellow-600 fill-yellow-600" size={18} />
              </div>
              <div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                  {stats.rating5}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  5 Bintang
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Star className="text-red-600" size={18} />
              </div>
              <div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                  {stats.rating1}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  1 Bintang
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
            {/* Search */}
            <div className="flex-1 w-full relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Cari nama user, produk, order ID, atau komentar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 md:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
              />
            </div>

            {/* Product Filter - Dropdown Custom */}
            <div className="relative w-full lg:w-56">
              <button
                onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                className="w-full px-3 py-2 md:px-4 md:py-3 bg-gray-50 border border-gray-300 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Package size={16} />
                  <span className="truncate max-w-[120px] sm:max-w-[150px] text-xs md:text-sm">
                    {getSelectedProductName()}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    productDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {productDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-48 sm:max-h-60 overflow-y-auto">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setSelectedProduct("all");
                        setProductDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center justify-between text-xs md:text-sm ${
                        selectedProduct === "all"
                          ? "bg-indigo-100 text-indigo-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <span>Semua Produk</span>
                      {selectedProduct === "all" && (
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                      )}
                    </button>
                    {products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          setSelectedProduct(product.id);
                          setProductDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center justify-between text-xs md:text-sm ${
                          selectedProduct === product.id
                            ? "bg-indigo-100 text-indigo-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <span className="truncate flex-1 mr-2">
                          {product.nama}
                        </span>
                        {selectedProduct === product.id && (
                          <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full flex-shrink-0"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rating Filter */}
            <div className="relative w-full lg:w-56">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="w-full px-3 py-2 md:px-4 md:py-3 bg-gray-50 border border-gray-300 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Filter size={16} />
                  <span className="text-xs md:text-sm">
                    {ratingFilter === "all"
                      ? "Semua Rating"
                      : `${ratingFilter} Bintang`}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    filterDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {filterDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setRatingFilter("all");
                        setFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center justify-between text-xs md:text-sm ${
                        ratingFilter === "all"
                          ? "bg-indigo-100 text-indigo-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <span>Semua Rating</span>
                      {ratingFilter === "all" && (
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                      )}
                    </button>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => {
                          setRatingFilter(rating.toString());
                          setFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center justify-between text-xs md:text-sm ${
                          ratingFilter === rating.toString()
                            ? "bg-indigo-100 text-indigo-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={10}
                                className={
                                  star <= rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }
                              />
                            ))}
                          </div>
                          <span>{rating} Bintang</span>
                        </div>
                        <span className="text-xs text-gray-500">
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

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8 sm:py-12 md:py-16 bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200">
            <MessageCircle className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-600 mb-1 sm:mb-2">
              {searchTerm || selectedProduct !== "all" || ratingFilter !== "all"
                ? "Tidak ada review yang sesuai"
                : "Belum ada review"}
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 px-4">
              {searchTerm || selectedProduct !== "all" || ratingFilter !== "all"
                ? "Coba ubah filter pencarian"
                : "Review dari pelanggan akan muncul di sini"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-4 md:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3 md:mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <User className="text-indigo-600" size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm sm:text-base">
                              {review.user?.displayName || "Pelanggan"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {renderRatingStars(review.rating)}
                          <span className="text-xs sm:text-sm text-gray-600 font-medium">
                            {review.rating}.0
                          </span>
                        </div>
                      </div>

                      {review.komentar && (
                        <p className="text-gray-700 mb-3 md:mb-4 leading-relaxed text-sm sm:text-base">
                          {review.komentar}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Package size={14} />
                          <span className="font-medium truncate max-w-[150px] sm:max-w-none">
                            {review.product?.nama || "Produk tidak ditemukan"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Calendar size={14} />
                          <span>
                            Order:{" "}
                            {review.order_id
                              ? `#${review.order_id.slice(-8).toUpperCase()}`
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setDetailModalOpen(true);
                        }}
                        className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm"
                      >
                        <Eye size={14} />
                        <span>Detail</span>
                      </button>
                      <button
                        onClick={() => openDeleteModal(review)}
                        className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm"
                      >
                        <Trash2 size={14} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Detail Modal */}
        {detailModalOpen && selectedReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Detail Review
                </h3>
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">
                      {selectedReview.user?.displayName || "Pelanggan"}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {formatDate(selectedReview.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  {renderRatingStars(selectedReview.rating)}
                  <span className="text-base sm:text-lg font-semibold text-gray-800">
                    {selectedReview.rating}.0 / 5.0
                  </span>
                </div>

                {/* Comment */}
                {selectedReview.komentar && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                      Komentar
                    </h4>
                    <p className="text-gray-700 bg-gray-50 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
                      {selectedReview.komentar}
                    </p>
                  </div>
                )}

                {/* Product Info */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                    Produk
                  </h4>
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    {selectedReview.product?.img_url && (
                      <img
                        src={selectedReview.product.img_url}
                        alt={selectedReview.product.nama}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 text-sm sm:text-base truncate">
                        {selectedReview.product?.nama ||
                          "Produk tidak ditemukan"}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Order ID: {selectedReview.order_id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => openDeleteModal(selectedReview)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 sm:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
                  >
                    <Trash2 size={16} />
                    Hapus Review
                  </button>
                  <button
                    onClick={() => setDetailModalOpen(false)}
                    className="flex-1 px-4 py-2 sm:py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && reviewToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-md mx-2 sm:mx-4">
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="text-red-600" size={20} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Hapus Review
                  </h3>
                </div>

                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  Apakah Anda yakin ingin menghapus review dari{" "}
                  <span className="font-semibold text-gray-800">
                    {reviewToDelete.user?.displayName || "Pelanggan"}
                  </span>
                  ? Tindakan ini tidak dapat dibatalkan.
                </p>

                {/* Review Preview */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    {renderRatingStars(reviewToDelete.rating)}
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      {reviewToDelete.rating}.0
                    </span>
                  </div>
                  {reviewToDelete.komentar && (
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">
                      "{reviewToDelete.komentar}"
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Produk: {reviewToDelete.product?.nama || "Tidak diketahui"}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={closeDeleteModal}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 sm:py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 sm:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Menghapus...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Ya, Hapus
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
