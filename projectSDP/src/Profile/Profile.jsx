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
} from "lucide-react";
import toast from "react-hot-toast";

const Profile = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "profile"
  ); // profile, security, orders
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Gagal memuat riwayat pesanan");
    } finally {
      setLoading(false);
    }
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
      toast.success("Email berhasil diperbarui!");
      setCurrentPassword("");
    } catch (err) {
      console.error("Error updating email:", err);
      if (err.code === "auth/wrong-password") {
        toast.error("Password salah");
      } else if (err.code === "auth/email-already-in-use") {
        toast.error("Email sudah digunakan");
      } else {
        toast.error("Gagal mengubah email: " + err.message);
      }
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Semua field harus diisi");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password baru tidak cocok");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
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
    } catch (err) {
      console.error("Error updating password:", err);
      if (err.code === "auth/wrong-password") {
        toast.error("Password lama salah");
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

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
              <form onSubmit={handleUpdateEmail} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Mail className="inline mr-2" size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Lock className="inline mr-2" size={16} />
                    Password Saat Ini (untuk konfirmasi)
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Masukkan password saat ini"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-all shadow-lg"
                >
                  Perbarui Email
                </button>
              </form>
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
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Masukkan password lama"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Lock className="inline mr-2" size={16} />
                    Password Baru
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Minimal 6 karakter"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Lock className="inline mr-2" size={16} />
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ketik ulang password baru"
                  />
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

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Riwayat Pesanan</h2>

              {loading ? (
                <div className="text-center py-10 text-gray-300">
                  Memuat pesanan...
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-10 text-gray-300">
                  Belum ada pesanan
                  <br />
                  <button
                    onClick={() => navigate("/product")}
                    className="mt-4 px-5 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg font-medium transition"
                  >
                    Belanja Sekarang
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white/10 rounded-lg p-5 hover:bg-white/15 transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
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
                          <span
                            className={`font-semibold ${
                              order.status === "pending"
                                ? "text-yellow-400"
                                : order.status === "accepted"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.produk?.nama || "Produk"} x {item.jumlah}
                            </span>
                            <span className="text-indigo-300">
                              Rp{" "}
                              {(
                                (item.produk?.harga || 0) * item.jumlah
                              ).toLocaleString("id-ID")}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-white/20 pt-3 flex justify-between items-center">
                        <span className="font-semibold">Total:</span>
                        <span className="text-xl font-bold text-indigo-400">
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
    </div>
  );
};

export default Profile;
