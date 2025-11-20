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
    AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";

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

    // Fetch semua reviews
    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/api/reviews");
            if (response.ok) {
                const data = await response.json();
                setReviews(data);
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
            const response = await fetch("http://localhost:5000/api/products");
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
    };

    // Delete review
    const handleDeleteReview = async () => {
        if (!reviewToDelete) return;

        try {
            const response = await fetch(`http://localhost:5000/api/reviews/${reviewToDelete.id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                toast.success("Review berhasil dihapus");
                // Update UI tanpa refresh - hapus dari state
                setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewToDelete.id));

                // Tutup semua modal yang terbuka
                closeDeleteModal();
                if (detailModalOpen) {
                    setDetailModalOpen(false);
                }
            } else {
                throw new Error("Gagal menghapus review");
            }
        } catch (error) {
            console.error("Error deleting review:", error);
            toast.error("Gagal menghapus review");
        }
    };

    // Filter reviews
    const filteredReviews = reviews.filter(review => {
        const matchesSearch =
            review.product?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.komentar?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesProduct = selectedProduct === "all" || review.produk_id === selectedProduct;
        const matchesRating = ratingFilter === "all" || review.rating === parseInt(ratingFilter);

        return matchesSearch && matchesProduct && matchesRating;
    });

    // Format date
    const formatDate = (timestamp) => {
        if (!timestamp) return "-";

        try {
            let date;

            if (timestamp._seconds !== undefined) {
                date = new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000);
            }
            else if (timestamp.seconds !== undefined) {
                date = new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
            }
            else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
                date = timestamp.toDate();
            }
            else {
                date = new Date(timestamp);
            }

            if (isNaN(date.getTime())) {
                return "Tanggal tidak valid";
            }

            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
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
                        size={16}
                        className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                    />
                ))}
            </div>
        );
    };

    // Get rating count
    const getRatingCount = (rating) => {
        return reviews.filter(review => review.rating === rating).length;
    };

    // Get selected product name
    const getSelectedProductName = () => {
        if (selectedProduct === "all") return "Semua Produk";
        const product = products.find(p => p.id === selectedProduct);
        return product ? product.nama : "Semua Produk";
    };

    // Stats
    const stats = {
        total: reviews.length,
        average: reviews.length > 0
            ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
            : 0,
        rating5: getRatingCount(5),
        rating1: getRatingCount(1),
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat reviews...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Kelola Reviews</h1>
                    <p className="text-gray-600">
                        Kelola dan moderasi ulasan dari pelanggan
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <MessageCircle className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                                <div className="text-sm text-gray-600">Total Reviews</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Star className="text-green-600" size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-800">{stats.average}</div>
                                <div className="text-sm text-gray-600">Rating Rata-rata</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Star className="text-yellow-600 fill-yellow-600" size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-800">{stats.rating5}</div>
                                <div className="text-sm text-gray-600">5 Bintang</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-100 rounded-lg">
                                <Star className="text-red-600" size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-800">{stats.rating1}</div>
                                <div className="text-sm text-gray-600">1 Bintang</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        {/* Search */}
                        <div className="flex-1 w-full relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Cari review..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Product Filter - Dropdown Custom */}
                        <div className="relative w-full lg:w-64">
                            <button
                                onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Package size={18} />
                                    <span className="truncate max-w-[180px]">
                                        {getSelectedProductName()}
                                    </span>
                                </div>
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform ${productDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {productDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                                    <div className="p-2 space-y-1">
                                        <button
                                            onClick={() => {
                                                setSelectedProduct("all");
                                                setProductDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center justify-between ${selectedProduct === "all" ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100"}`}
                                        >
                                            <span>Semua Produk</span>
                                            {selectedProduct === "all" && (
                                                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                            )}
                                        </button>
                                        {products.map(product => (
                                            <button
                                                key={product.id}
                                                onClick={() => {
                                                    setSelectedProduct(product.id);
                                                    setProductDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center justify-between ${selectedProduct === product.id ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100"}`}
                                            >
                                                <span className="truncate flex-1 mr-2">{product.nama}</span>
                                                {selectedProduct === product.id && (
                                                    <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Rating Filter */}
                        <div className="relative w-full lg:w-64">
                            <button
                                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Filter size={18} />
                                    <span>
                                        {ratingFilter === "all" ? "Semua Rating" : `${ratingFilter} Bintang`}
                                    </span>
                                </div>
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {filterDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                    <div className="p-2 space-y-1">
                                        <button
                                            onClick={() => {
                                                setRatingFilter("all");
                                                setFilterDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center justify-between ${ratingFilter === "all" ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100"}`}
                                        >
                                            <span>Semua Rating</span>
                                            {ratingFilter === "all" && (
                                                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                            )}
                                        </button>
                                        {[5, 4, 3, 2, 1].map((rating) => (
                                            <button
                                                key={rating}
                                                onClick={() => {
                                                    setRatingFilter(rating.toString());
                                                    setFilterDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center justify-between ${ratingFilter === rating.toString() ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100"}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                size={12}
                                                                className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span>{rating} Bintang</span>
                                                </div>
                                                <span className="text-xs text-gray-500">({getRatingCount(rating)})</span>
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
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                        <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            {searchTerm || selectedProduct !== "all" || ratingFilter !== "all"
                                ? "Tidak ada review yang sesuai"
                                : "Belum ada review"}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm || selectedProduct !== "all" || ratingFilter !== "all"
                                ? "Coba ubah filter pencarian"
                                : "Review dari pelanggan akan muncul di sini"
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredReviews.map((review) => (
                            <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                        <User className="text-indigo-600" size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">
                                                            {review.user?.displayName || "Pelanggan"}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {formatDate(review.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {renderRatingStars(review.rating)}
                                                    <span className="text-sm text-gray-600 font-medium">
                                                        {review.rating}.0
                                                    </span>
                                                </div>
                                            </div>

                                            {review.komentar && (
                                                <p className="text-gray-700 mb-4 leading-relaxed">
                                                    {review.komentar}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Package size={16} />
                                                    <span className="font-medium">
                                                        {review.product?.nama || "Produk tidak ditemukan"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} />
                                                    <span>Order: {review.order_id?.slice(-8)}</span>
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
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                            >
                                                <Eye size={16} />
                                                Detail
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(review)}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                                Hapus
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-gray-800">Detail Review</h3>
                                    <button
                                        onClick={() => setDetailModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* User Info */}
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <User className="text-indigo-600" size={24} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {selectedReview.user?.displayName || "Pelanggan"}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(selectedReview.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-3">
                                    {renderRatingStars(selectedReview.rating)}
                                    <span className="text-lg font-semibold text-gray-800">
                                        {selectedReview.rating}.0 / 5.0
                                    </span>
                                </div>

                                {/* Comment */}
                                {selectedReview.komentar && (
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Komentar</h4>
                                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                                            {selectedReview.komentar}
                                        </p>
                                    </div>
                                )}

                                {/* Product Info */}
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Produk</h4>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        {selectedReview.product?.img_url && (
                                            <img
                                                src={selectedReview.product.img_url}
                                                alt={selectedReview.product.nama}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {selectedReview.product?.nama || "Produk tidak ditemukan"}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Order ID: {selectedReview.order_id}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => openDeleteModal(selectedReview)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                        Hapus Review
                                    </button>
                                    <button
                                        onClick={() => setDetailModalOpen(false)}
                                        className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-red-100 rounded-full">
                                        <AlertTriangle className="text-red-600" size={24} />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800">Hapus Review</h3>
                                </div>

                                <p className="text-gray-600 mb-6">
                                    Apakah Anda yakin ingin menghapus review dari{" "}
                                    <span className="font-semibold text-gray-800">
                                        {reviewToDelete.user?.displayName || "Pelanggan"}
                                    </span>
                                    ? Tindakan ini tidak dapat dibatalkan.
                                </p>

                                {/* Review Preview */}
                                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        {renderRatingStars(reviewToDelete.rating)}
                                        <span className="text-sm font-medium text-gray-700">
                                            {reviewToDelete.rating}.0
                                        </span>
                                    </div>
                                    {reviewToDelete.komentar && (
                                        <p className="text-gray-600 text-sm line-clamp-2">
                                            "{reviewToDelete.komentar}"
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2">
                                        Produk: {reviewToDelete.product?.nama || "Tidak diketahui"}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={closeDeleteModal}
                                        className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleDeleteReview}
                                        className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={18} />
                                        Ya, Hapus
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