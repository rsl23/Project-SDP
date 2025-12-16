import React, { useState, useEffect } from "react";
import {
  getAuth,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { getUserOrders } from "../apiService/orderApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Image,
  ChevronLeft,
} from "lucide-react";
import toast from "react-hot-toast";

// Review Modal Component
const ReviewModal = ({ isOpen, onClose, product, orderId, onReviewSubmit }) => {
  const [rating, setRating] = useState(0);
  const [komentar, setKomentar] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Silakan beri rating");
      return;
    }

    setLoading(true);
    try {
      const reviewData = {
        produk_id: product.id,
        order_id: orderId,
        rating,
        komentar,
      };

      console.log("📝 Submitting review with data:", reviewData);
      console.log("📦 Order ID:", orderId);

      await onReviewSubmit(reviewData);
      setRating(0);
      setKomentar("");
      onClose();
      toast.success("Review berhasil dikirim!");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Gagal mengirim review: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md border border-white/20 shadow-2xl mx-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Beri Review {product.nama}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Stars */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Rating *
            </label>
            <div className="flex gap-1 justify-center sm:justify-start">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl focus:outline-none active:scale-90 transition-transform"
                >
                  <Star
                    className={
                      star <= rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-400"
                    }
                    size={28}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Komentar (opsional)
            </label>
            <textarea
              value={komentar}
              onChange={(e) => setKomentar(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white placeholder-gray-400 text-sm sm:text-base"
              placeholder="Bagaimana pengalaman Anda dengan produk ini?"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium text-white transition-all border border-white/20 text-sm sm:text-base"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 sm:px-4 py-2 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 rounded-lg font-semibold text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? "Mengirim..." : "Kirim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Profile = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "profile"
  );
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState({});
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    product: null,
    orderId: null,
  });

  // Form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Error states
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setUser(currentUser);
    fetchOrders(currentUser.uid);

    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [auth, navigate, searchParams]);

  const fetchOrders = async (userId) => {
    try {
      setLoading(true);
      const data = await getUserOrders(userId);
      console.log("📦 Data orders:", data.length);
      setOrders(data);

      const accepted = data.filter((order) => order.status === "accepted");
      setAcceptedOrders(accepted);

      await fetchUserReviews(userId);
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReviews = async (userId) => {
    try {
      const response = await fetch(
        `https://backend-dot-storied-courier-479504-q5.et.r.appspot.com/api/reviews?userId=${userId}`
      );
      if (response.ok) {
        const userReviews = await response.json();
        const reviewsMap = {};
        userReviews.forEach((review) => {
          const key = `${review.order_id}_${review.produk_id}`;
          reviewsMap[key] = review;
        });
        setReviews(reviewsMap);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews({});
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      const payload = {
        ...reviewData,
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userPhotoURL: user.photoURL || null,
      };

      console.log("🚀 Sending review to backend:", payload);
      console.log("📦 Order ID in payload:", payload.order_id);

      const response = await fetch(
        "https://backend-dot-storied-courier-479504-q5.et.r.appspot.com/api/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengirim review");
      }

      toast.success("Review berhasil dikirim!");
      await fetchUserReviews(user.uid);
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const openReviewModal = (product, orderId) => {
    console.log("🔓 Opening review modal for:", {
      product,
      orderId,
      orderIdType: typeof orderId,
      orderIdValue: orderId,
    });

    setReviewModal({
      isOpen: true,
      product,
      orderId,
    });
  };

  const closeReviewModal = () => {
    setReviewModal({
      isOpen: false,
      product: null,
      orderId: null,
    });
  };

  const hasUserReviewed = (orderId, produkId) => {
    const key = `${orderId}_${produkId}`;
    return reviews[key];
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    setErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    let hasError = false;
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!currentPassword) {
      newErrors.currentPassword = "Password lama harus diisi";
      hasError = true;
    }

    if (!newPassword) {
      newErrors.newPassword = "Password baru harus diisi";
      hasError = true;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Minimal 6 karakter";
      hasError = true;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password harus diisi";
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi tidak sesuai";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);
      toast.success("Password berhasil diperbarui!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Error updating password:", err);
      console.error("Error code:", err.code);

      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential" ||
        err.code === "auth/invalid-login-credentials"
      ) {
        setErrors({
          currentPassword: "Password lama tidak cocok",
          newPassword: "",
          confirmPassword: "",
        });
        toast.error("Password lama tidak cocok");
      } else if (err.code === "auth/too-many-requests") {
        toast.error("Terlalu banyak percobaan. Coba lagi nanti.");
      } else if (err.code === "auth/requires-recent-login") {
        toast.error("Sesi login sudah kadaluarsa. Silakan login ulang.");
      } else {
        toast.error("Gagal mengubah password: " + err.message);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="text-yellow-500" size={16} />;
      case "accepted":
        return <CheckCircle className="text-green-500" size={16} />;
      case "rejected":
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <AlertCircle className="text-gray-500" size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Menunggu Konfirmasi";
      case "accepted":
        return "Diterima";
      case "rejected":
        return "Ditolak";
      default:
        return "Tidak Diketahui";
    }
  };

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
        hour12: false,
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Tanggal tidak valid";
    }
  };

  const formatAuthDate = (dateString) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Tanggal tidak valid";
      }

      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting auth date:", error);
      return "Tanggal tidak valid";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] flex items-center justify-center text-white">
        Memuat...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] text-white px-4 sm:px-6 py-6 sm:py-10">
      {/* Mobile Header */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Profil Saya</h1>
        </div>
        <p className="text-gray-300 text-sm">
          Kelola profil dan riwayat pesanan
        </p>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-wide mb-2">
          Profil Saya
        </h1>
        <p className="text-gray-300">
          Kelola informasi profil dan riwayat pesanan Anda
        </p>
      </div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto">
        {/* Mobile Tabs - Horizontal scroll */}
        <div className="lg:hidden mb-6">
          <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm ${
                activeTab === "profile"
                  ? "bg-indigo-600 text-white"
                  : "bg-white/10 text-gray-300"
              }`}
            >
              <User className="inline mr-2" size={14} />
              Profil
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm ${
                activeTab === "security"
                  ? "bg-indigo-600 text-white"
                  : "bg-white/10 text-gray-300"
              }`}
            >
              <Lock className="inline mr-2" size={14} />
              Keamanan
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm ${
                activeTab === "orders"
                  ? "bg-indigo-600 text-white"
                  : "bg-white/10 text-gray-300"
              }`}
            >
              <Package className="inline mr-2" size={14} />
              Pesanan
            </button>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden lg:flex gap-4 mb-8 border-b border-white/20">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-4 font-semibold transition-all ${
              activeTab === "profile"
                ? "border-b-2 border-indigo-500 text-indigo-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <User className="inline mr-2" size={18} />
            Profil
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`pb-3 px-4 font-semibold transition-all ${
              activeTab === "security"
                ? "border-b-2 border-indigo-500 text-indigo-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Lock className="inline mr-2" size={18} />
            Keamanan
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 px-4 font-semibold transition-all ${
              activeTab === "orders"
                ? "border-b-2 border-indigo-500 text-indigo-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Package className="inline mr-2" size={18} />
            Riwayat Pesanan
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6">
                Informasi Profil
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <User className="inline mr-2" size={14} />
                    User ID
                  </label>
                  <div className="w-full px-3 sm:px-4 py-2 rounded-lg bg-white/20 text-gray-300 text-sm sm:text-base truncate">
                    {user.uid}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Mail className="inline mr-2" size={14} />
                    Email
                  </label>
                  <div className="w-full px-3 sm:px-4 py-2 rounded-lg bg-white/20 text-gray-300 text-sm sm:text-base truncate">
                    {user.email}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Untuk mengubah email, silakan hubungi administrator
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <CheckCircle className="inline mr-2" size={14} />
                    Status Verifikasi
                  </label>
                  <div className="w-full px-3 sm:px-4 py-2 rounded-lg bg-white/20">
                    {user.emailVerified ? (
                      <span className="text-green-400 text-sm sm:text-base">
                        ✓ Email Terverifikasi
                      </span>
                    ) : (
                      <span className="text-yellow-400 text-sm sm:text-base">
                        ⚠ Belum Terverifikasi
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Clock className="inline mr-2" size={14} />
                    Tanggal Bergabung
                  </label>
                  <div className="w-full px-3 sm:px-4 py-2 rounded-lg bg-white/20 text-gray-300 text-sm sm:text-base">
                    {formatAuthDate(user.metadata.creationTime)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6">
                Ubah Password
              </h2>
              <form
                onSubmit={handleUpdatePassword}
                className="space-y-4 sm:space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Lock className="inline mr-2" size={14} />
                    Password Lama
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      if (errors.currentPassword) {
                        setErrors({ ...errors, currentPassword: "" });
                      }
                    }}
                    className={`w-full px-3 sm:px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 text-sm sm:text-base ${
                      errors.currentPassword
                        ? "ring-2 ring-red-500"
                        : "focus:ring-indigo-500"
                    }`}
                    placeholder="Masukkan password lama"
                  />
                  {errors.currentPassword && (
                    <p className="text-red-400 text-xs sm:text-sm mt-1 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Lock className="inline mr-2" size={14} />
                    Password Baru
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword) {
                        setErrors({ ...errors, newPassword: "" });
                      }
                    }}
                    className={`w-full px-3 sm:px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 text-sm sm:text-base ${
                      errors.newPassword
                        ? "ring-2 ring-red-500"
                        : "focus:ring-indigo-500"
                    }`}
                    placeholder="Minimal 6 karakter"
                  />
                  {errors.newPassword && (
                    <p className="text-red-400 text-xs sm:text-sm mt-1 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Lock className="inline mr-2" size={14} />
                    Konfirmasi Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors({ ...errors, confirmPassword: "" });
                      }
                    }}
                    className={`w-full px-3 sm:px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 text-sm sm:text-base ${
                      errors.confirmPassword
                        ? "ring-2 ring-red-500"
                        : "focus:ring-indigo-500"
                    }`}
                    placeholder="Ketik ulang password baru"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs sm:text-sm mt-1 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-all shadow-lg text-sm sm:text-base"
                >
                  Ubah Password
                </button>
              </form>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6">
                Riwayat Pesanan Diterima
              </h2>

              {loading ? (
                <div className="text-center py-8 sm:py-10 text-gray-300">
                  Memuat pesanan...
                </div>
              ) : acceptedOrders.length === 0 ? (
                <div className="text-center py-8 sm:py-10 text-gray-300">
                  {orders.length === 0 ? (
                    <>
                      Belum ada pesanan
                      <br />
                      <button
                        onClick={() => navigate("/product")}
                        className="mt-3 sm:mt-4 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg font-medium transition text-sm sm:text-base"
                      >
                        Belanja Sekarang
                      </button>
                    </>
                  ) : (
                    <>
                      Belum ada pesanan yang diterima
                      <br />
                      <p className="text-xs sm:text-sm text-gray-400 mt-2">
                        Anda memiliki{" "}
                        {
                          orders.filter((order) => order.status === "pending")
                            .length
                        }{" "}
                        pesanan menunggu konfirmasi
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {acceptedOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 hover:bg-white/15 transition-all border border-white/10"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 pb-3 border-b border-white/20">
                        <div className="mb-2 sm:mb-0">
                          <p className="text-xs sm:text-sm text-gray-400">
                            Order: {order.id.substring(0, 8)}...
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400 mt-1">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className="text-green-400 font-semibold text-sm sm:text-base">
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-3 mb-4">
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex gap-3 p-3 bg-white/5 rounded-lg"
                          >
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              {item.produk?.img_url ? (
                                <img
                                  src={item.produk.img_url}
                                  alt={item.produk.nama}
                                  className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-lg flex items-center justify-center">
                                  <Image className="text-gray-400" size={20} />
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-white text-sm sm:text-base truncate">
                                    {item.produk?.nama || "Produk"}
                                  </h4>
                                  <p className="text-xs sm:text-sm text-gray-300 mt-1">
                                    Jumlah: {item.jumlah}
                                  </p>
                                  <p className="text-indigo-300 font-semibold mt-1 text-sm sm:text-base">
                                    Rp{" "}
                                    {(
                                      (item.produk?.harga || 0) * item.jumlah
                                    ).toLocaleString("id-ID")}
                                  </p>
                                </div>

                                {/* Review Button */}
                                <div className="flex-shrink-0">
                                  {hasUserReviewed(order.id, item.produk_id) ? (
                                    <div className="flex items-center gap-2 text-green-400">
                                      <Star
                                        className="fill-green-400"
                                        size={14}
                                      />
                                      <span className="text-xs sm:text-sm">
                                        Telah direview
                                      </span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        openReviewModal(
                                          {
                                            id: item.produk_id,
                                            nama: item.produk?.nama || "Produk",
                                          },
                                          order.id
                                        )
                                      }
                                      className="px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap"
                                    >
                                      Beri Review
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer */}
                      <div className="border-t border-white/20 pt-3 flex justify-between items-center">
                        <span className="font-semibold text-sm sm:text-base">
                          Total:
                        </span>
                        <span className="text-lg sm:text-xl font-bold text-indigo-400">
                          Rp {(order.total || 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Back Button - Desktop */}
        <div className="hidden lg:block mt-8">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          >
            &larr; Kembali
          </button>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={closeReviewModal}
        product={reviewModal.product}
        orderId={reviewModal.orderId}
        onReviewSubmit={handleSubmitReview}
      />
    </div>
  );
};

export default Profile;
