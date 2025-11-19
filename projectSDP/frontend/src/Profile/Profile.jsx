import React, { useState, useEffect } from "react";
import { Tabs, TextInput, Label, Button, Badge, Alert } from "flowbite-react";
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
                    {formatDate(user.metadata.creationTime)}
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
                  <div className="mb-2 block">
                    <Label
                      htmlFor="currentPassword"
                      value="Password Lama"
                      className="text-white"
                    />
                  </div>
                  <TextInput
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      if (errors.currentPassword) {
                        setErrors({ ...errors, currentPassword: "" });
                      }
                    }}
                    color={errors.currentPassword ? "failure" : "gray"}
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
                  <div className="mb-2 block">
                    <Label
                      htmlFor="newPassword"
                      value="Password Baru"
                      className="text-white"
                    />
                  </div>
                  <TextInput
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword) {
                        setErrors({ ...errors, newPassword: "" });
                      }
                    }}
                    color={errors.newPassword ? "failure" : "gray"}
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
                  <div className="mb-2 block">
                    <Label
                      htmlFor="confirmPassword"
                      value="Konfirmasi Password Baru"
                      className="text-white"
                    />
                  </div>
                  <TextInput
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors({ ...errors, confirmPassword: "" });
                      }
                    }}
                    color={errors.confirmPassword ? "failure" : "gray"}
                    placeholder="Ketik ulang password baru"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  gradientDuoTone="purpleToBlue"
                  className="mt-4"
                >
                  Ubah Password
                </Button>
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
                          <Badge
                            color={
                              order.status === "pending"
                                ? "warning"
                                : order.status === "accepted"
                                ? "success"
                                : "failure"
                            }
                            size="sm"
                          >
                            {getStatusText(order.status)}
                          </Badge>
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
