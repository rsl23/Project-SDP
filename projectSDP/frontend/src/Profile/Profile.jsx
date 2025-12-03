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
} from "lucide-react";
import toast from "react-hot-toast";
import { Button, Badge, Card, Spinner } from "flowbite-react";

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
      await onReviewSubmit({
        produk_id: product.id,
        order_id: orderId,
        rating,
        komentar,
      });
      setRating(0);
      setKomentar("");
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-6 w-full max-w-md border border-white/20 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-4">
          Beri Review {product.nama}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Stars */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Rating *
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl focus:outline-none hover:scale-110 transition-transform"
                >
                  <Star
                    className={
                      star <= rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-400"
                    }
                    size={32}
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
              rows={4}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white placeholder-gray-400"
              placeholder="Bagaimana pengalaman Anda dengan produk ini?"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium text-white transition-all border border-white/20"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 rounded-lg font-semibold text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Mengirim..." : "Kirim Review"}
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
  ); // profile, security, orders
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
  const [newEmail, setNewEmail] = useState("");
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
    setNewEmail(currentUser.email || "");
    fetchOrders(currentUser.uid);

    // Set active tab from query parameter
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [auth, navigate, searchParams]);

  const fetchOrders = async (userId) => {
    try {
      setLoading(true);
      const data = await getUserOrders(userId);
      console.log("📦 Data orders dari API:", data); // Debug log
      setOrders(data);

      // Filter hanya order yang diterima
      const accepted = data.filter((order) => order.status === "accepted");
      setAcceptedOrders(accepted);

      // Fetch reviews for each order
      await fetchUserReviews(userId);
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Gagal memuat riwayat pesanan");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReviews = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/reviews?userId=${userId}`
      );
      if (response.ok) {
        const userReviews = await response.json();
        const reviewsMap = {};
        userReviews.forEach((review) => {
          const key = `${review.order_id}_${review.produk_id}`;
          reviewsMap[key] = review;
        });
        setReviews(reviewsMap);
      } else {
        console.warn("Gagal mengambil reviews, menggunakan fallback");
        // Fallback: tetap set empty reviews map
        setReviews({});
      }
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      // Fallback: tetap set empty reviews map
      setReviews({});
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      const response = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...reviewData,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengirim review");
      }

      toast.success("Review berhasil dikirim!");

      // Refresh reviews
      await fetchUserReviews(user.uid);
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const openReviewModal = (product, orderId) => {
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

  const handleUpdateEmail = async (e) => {
    e.preventDefault();

    if (!newEmail || newEmail === user.email) {
      toast.error("Email baru harus berbeda dengan email saat ini");
      return;
    }

    if (!currentPassword) {
      toast.error("Password diperlukan untuk mengubah email");
      return;
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update email
      await updateEmail(user, newEmail);

      // Send verification email to new email
      await user.reload();

      toast.success(
        "Email berhasil diperbarui! Silakan cek inbox untuk verifikasi."
      );
      setCurrentPassword("");
      setNewEmail(user.email || "");
    } catch (err) {
      console.error("Error updating email:", err);
      if (err.code === "auth/wrong-password") {
        toast.error("Password salah");
      } else if (err.code === "auth/email-already-in-use") {
        toast.error("Email sudah digunakan");
      } else if (err.code === "auth/operation-not-allowed") {
        toast.error(
          "Fitur ubah email belum diaktifkan. Silakan hubungi administrator."
        );
      } else if (err.code === "auth/requires-recent-login") {
        toast.error("Silakan login ulang untuk mengubah email");
      } else {
        toast.error("Gagal mengubah email. Fitur ini mungkin belum tersedia.");
      }
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    // Reset errors
    setErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    // Validation
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
      newErrors.newPassword = "Password minimal 6 karakter";
      hasError = true;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password harus diisi";
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password tidak sesuai";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
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
      console.error("Error code:", err.code); // Debug log

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
        toast.error("Sesi login Anda sudah kadaluarsa. Silakan login ulang.");
      } else {
        toast.error("Gagal mengubah password: " + err.message);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="text-yellow-500" size={20} />;
      case "accepted":
        return <CheckCircle className="text-green-500" size={20} />;
      case "rejected":
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <AlertCircle className="text-gray-500" size={20} />;
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

  // Format sangat clean
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

      // Format: "20 Nov 2023, 14:30"
      return (
        date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }) +
        ", " +
        date.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Tanggal tidak valid";
    }
  };

  const formatAuthDate = (dateString) => {
    if (!dateString) {
      console.log("❌ Auth date string kosong");
      return "-";
    }

    console.log("🔍 Auth date string:", dateString);

    try {
      const date = new Date(dateString);
      console.log("📅 Auth date hasil konversi:", date);

      if (isNaN(date.getTime())) {
        console.log("❌ Auth date tidak valid");
        return "Tanggal tidak valid";
      }

      const formatted = date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      console.log("📝 Auth date diformat:", formatted);
      return formatted;
    } catch (error) {
      console.error(
        "❌ Error formatting auth date:",
        error,
        "Date string:",
        dateString
      );
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
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-wide mb-2">Profil Saya</h1>
          <p className="text-gray-300">
            Kelola informasi profil dan riwayat pesanan Anda
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/20">
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
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Informasi Profil</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <User className="inline mr-2" size={16} />
                    User ID
                  </label>
                  <div className="w-full px-4 py-2 rounded-lg bg-white/20 text-gray-300">
                    {user.uid}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Mail className="inline mr-2" size={16} />
                    Email
                  </label>
                  <div className="w-full px-4 py-2 rounded-lg bg-white/20 text-gray-300">
                    {user.email}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Untuk mengubah email, silakan hubungi administrator
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <CheckCircle className="inline mr-2" size={16} />
                    Status Verifikasi
                  </label>
                  <div className="w-full px-4 py-2 rounded-lg bg-white/20">
                    {user.emailVerified ? (
                      <span className="text-green-400">
                        ✓ Email Terverifikasi
                      </span>
                    ) : (
                      <span className="text-yellow-400">
                        ⚠ Belum Terverifikasi
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Clock className="inline mr-2" size={16} />
                    Tanggal Bergabung
                  </label>
                  <div className="w-full px-4 py-2 rounded-lg bg-white/20 text-gray-300">
                    {formatAuthDate(user.metadata.creationTime)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Ubah Password</h2>
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Lock className="inline mr-2" size={16} />
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
                    className={`w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                      errors.currentPassword
                        ? "ring-2 ring-red-500"
                        : "focus:ring-indigo-500"
                    }`}
                    placeholder="Masukkan password lama"
                  />
                  {errors.currentPassword && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Lock className="inline mr-2" size={16} />
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
                    className={`w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                      errors.newPassword
                        ? "ring-2 ring-red-500"
                        : "focus:ring-indigo-500"
                    }`}
                    placeholder="Minimal 6 karakter"
                  />
                  {errors.newPassword && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Lock className="inline mr-2" size={16} />
                    Konfirmasi Password Baru
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
                    className={`w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                      errors.confirmPassword
                        ? "ring-2 ring-red-500"
                        : "focus:ring-indigo-500"
                    }`}
                    placeholder="Ketik ulang password baru"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-all shadow-lg"
                >
                  Ubah Password
                </button>
              </form>
            </div>
          )}

          {/* Orders Tab - Hanya menampilkan yang diterima */}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">
                Riwayat Pesanan Diterima
              </h2>

              {loading ? (
                <div className="text-center py-10 text-gray-300">
                  Memuat pesanan...
                </div>
              ) : acceptedOrders.length === 0 ? (
                <div className="text-center py-10 text-gray-300">
                  {orders.length === 0 ? (
                    <>
                      Belum ada pesanan
                      <br />
                      <button
                        onClick={() => navigate("/product")}
                        className="mt-4 px-5 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg font-medium transition"
                      >
                        Belanja Sekarang
                      </button>
                    </>
                  ) : (
                    <>
                      Belum ada pesanan yang diterima
                      <br />
                      <p className="text-sm text-gray-400 mt-2">
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
                <div className="space-y-6">
                  {acceptedOrders.map((order) => {
                    console.log(
                      "🎯 Rendering order:",
                      order.id,
                      "dengan createdAt:",
                      order.createdAt
                    );
                    return (
                      <div
                        key={order.id}
                        className="bg-white/10 rounded-xl p-6 hover:bg-white/15 transition-all border border-white/10"
                      >
                        {/* Order Header */}
                        <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/20">
                          <div>
                            <p className="text-sm text-gray-400">
                              Order ID: {order.id}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <span className="text-green-400 font-semibold">
                              {getStatusText(order.status)}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-4 mb-6">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex gap-4 p-4 bg-white/5 rounded-lg"
                            >
                              {/* Product Image */}
                              <div className="flex-shrink-0">
                                {item.produk?.img_url ? (
                                  <img
                                    src={item.produk.img_url}
                                    alt={item.produk.nama}
                                    className="w-16 h-16 object-cover rounded-lg"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                                    <Image
                                      className="text-gray-400"
                                      size={24}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Product Info */}
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium text-white">
                                      {item.produk?.nama || "Produk"}
                                    </h4>
                                    <p className="text-sm text-gray-300 mt-1">
                                      Jumlah: {item.jumlah}
                                    </p>
                                    <p className="text-indigo-300 font-semibold mt-1">
                                      Rp{" "}
                                      {(
                                        (item.produk?.harga || 0) * item.jumlah
                                      ).toLocaleString("id-ID")}
                                    </p>
                                  </div>

                                  {/* Review Button */}
                                  <div>
                                    {hasUserReviewed(
                                      order.id,
                                      item.produk_id
                                    ) ? (
                                      <div className="flex items-center gap-2 text-green-400">
                                        <Star
                                          className="fill-green-400"
                                          size={16}
                                        />
                                        <span className="text-sm">
                                          Telah direview (
                                          {
                                            hasUserReviewed(
                                              order.id,
                                              item.produk_id
                                            ).rating
                                          }
                                          /5)
                                        </span>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          openReviewModal(
                                            {
                                              id: item.produk_id,
                                              nama:
                                                item.produk?.nama || "Produk",
                                            },
                                            order.id
                                          )
                                        }
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition"
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
                        <div className="border-t border-white/20 pt-4 flex justify-between items-center">
                          <span className="font-semibold">Total:</span>
                          <span className="text-xl font-bold text-indigo-400">
                            Rp {(order.total || 0).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8">
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
