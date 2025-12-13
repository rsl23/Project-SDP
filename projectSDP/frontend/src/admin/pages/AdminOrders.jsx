import React, { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import {
  CheckCircle,
  XCircle,
  Clock,
  Package,
  User,
  DollarSign,
  Search,
} from "lucide-react";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [processingOrder, setProcessingOrder] = useState(null);
  const [users, setUsers] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Urutkan dari yang terbaru ke terlama berdasarkan createdAt
      const sortedData = data.sort((a, b) => {
        const dateA = a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt);
        return dateB - dateA; // Terbaru ke terlama
      });

      setOrders(sortedData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = {};
      snapshot.forEach((doc) => {
        data[doc.id] = doc.data();
      });
      setUsers(data);
    });

    return () => unsubscribe();
  }, []);

  // Fungsi untuk format tanggal
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

  // AdminOrders.jsx - Update handleStatusChange
  const handleStatusChange = async (orderId, status) => {
    try {
      setProcessingOrder(orderId);

      console.log(`🔄 Changing order ${orderId} status to: ${status}`);

      // Update status order di Firebase
      await updateDoc(doc(db, "orders", orderId), { status });
      console.log(`✅ Order status updated to: ${status}`);

      // Handle stok berdasarkan status
      if (status === "accepted") {
        // Konfirmasi stok - stok tetap berkurang
        console.log(`🔒 Confirming stock for order ${orderId}`);
        const confirmResponse = await fetch(
          `http://localhost:3000/api/orders/${orderId}/confirm-stock`,
          {
            method: "POST",
          }
        );

        const confirmResult = await confirmResponse.json();
        console.log(`📨 Confirm stock response:`, confirmResult);

        if (!confirmResponse.ok) {
          throw new Error(confirmResult.error || "Gagal mengonfirmasi stok");
        }

        console.log(`✅ Stock confirmed for order ${orderId}`);
      } else if (status === "rejected") {
        // Kembalikan stok - stok dikembalikan
        console.log(`🔄 Returning stock for order ${orderId}`);
        const returnResponse = await fetch(
          `http://localhost:3000/api/orders/${orderId}/return-stock`,
          {
            method: "POST",
          }
        );

        const returnResult = await returnResponse.json();
        console.log(`📨 Return stock response:`, returnResult);

        if (!returnResponse.ok) {
          // Jika return stock gagal, kita masih bisa update status order tapi beri warning
          console.warn(
            `⚠️ Stock return failed but order status updated:`,
            returnResult
          );
          alert(
            `Status order berhasil diubah ke Ditolak, tetapi ada masalah mengembalikan stok: ${returnResult.error}`
          );
        } else {
          console.log(`✅ Stock returned for order ${orderId}`);
        }
      }

      alert(
        `Status order berhasil diubah menjadi ${
          status === "accepted" ? "Diterima" : "Ditolak"
        }`
      );
    } catch (err) {
      console.error("❌ Gagal update status:", err);

      let errorMessage = "Gagal mengupdate status order: ";
      if (err.message.includes("Gagal mengonfirmasi stok")) {
        errorMessage += "Stok tidak dapat dikonfirmasi. ";
      } else if (err.message.includes("Gagal mengembalikan stok")) {
        errorMessage += "Stok tidak dapat dikembalikan. ";
      }
      errorMessage += err.message;

      alert(errorMessage);

      // Refresh data untuk memastikan sync
      const orderDoc = await doc(db, "orders", orderId).get();
      if (orderDoc.exists) {
        const currentStatus = orderDoc.data().status;
        console.log(`🔄 Current order status after error: ${currentStatus}`);
      }
    } finally {
      setProcessingOrder(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 border-yellow-200 text-yellow-700";
      case "accepted":
        return "bg-green-50 border-green-200 text-green-700";
      case "rejected":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  //filter berdasarkan status
  let filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter((order) => order.status === selectedStatus);

  //filter berdasarkan search term
  if (searchTerm.trim()) {
    filteredOrders = filteredOrders.filter((order) => {
      const searchAll = searchTerm.toLowerCase();
      const orderIdmatch = order.id.toLowerCase().includes(searchAll);
      const userNameMatch = users[order.userId]?.name
        ?.toLowerCase()
        .includes(searchAll);
      return orderIdmatch || userNameMatch;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Kelola Pesanan
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Kelola pesanan dan stok akan otomatis disesuaikan saat
            menerima/menolak pesanan
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-4 sm:mb-6 bg-white rounded-lg shadow-md p-3 sm:p-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari berdasarkan ID order atau Nama User..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Filter Status */}
        <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-3">
          {["pending", "all", "accepted", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                selectedStatus === status
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
              }`}
            >
              {getStatusIcon(status)}
              {status === "all"
                ? "Semua"
                : status === "pending"
                ? "Menunggu"
                : status === "accepted"
                ? "Diterima"
                : "Ditolak"}
            </button>
          ))}
        </div>

        {searchTerm && (
          <p className="text-sm text-gray-600 mb-4">
            Menampilkan{" "}
            <span className="font-semibold">{filteredOrders.length}</span> hasil
            untuk "{searchTerm}"
          </p>
        )}

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-2xl shadow-sm">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
              {selectedStatus === "all"
                ? "Belum ada pesanan"
                : `Tidak ada pesanan ${selectedStatus}`}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 px-4">
              {selectedStatus === "all"
                ? "Pesanan dari pelanggan akan muncul di sini"
                : `Tidak ada pesanan dengan status ${
                    selectedStatus === "pending" ? "menunggu" : selectedStatus
                  }`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status === "pending"
                            ? "Menunggu Konfirmasi"
                            : order.status === "accepted"
                            ? "Pesanan Diterima"
                            : "Pesanan Ditolak"}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500 font-mono">
                          #{order.id}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="text-xs sm:text-sm truncate">
                            User:{" "}
                            {users[order.userId]?.name || "Tidak diketahui"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Package className="w-4 h-4" />
                          <span className="text-xs sm:text-sm">
                            {order.items?.length || 0} Items
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-xs sm:text-sm font-semibold">
                            Rp {order.total?.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - HANYA untuk status pending */}
                    <div className="flex gap-2">
                      {order.status === "pending" ? (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(order.id, "accepted")
                            }
                            disabled={processingOrder === order.id}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md ${
                              processingOrder === order.id
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                          >
                            {processingOrder === order.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            {processingOrder === order.id
                              ? "Memproses..."
                              : "Terima"}
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(order.id, "rejected")
                            }
                            disabled={processingOrder === order.id}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md ${
                              processingOrder === order.id
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : "bg-red-500 text-white hover:bg-red-600"
                            }`}
                          >
                            {processingOrder === order.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            {processingOrder === order.id
                              ? "Memproses..."
                              : "Tolak"}
                          </button>
                        </>
                      ) : (
                        // Untuk status accepted atau rejected, tampilkan indikator saja
                        <div
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                            order.status === "accepted"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          }`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status === "accepted"
                            ? "Pesanan Telah Diterima"
                            : "Pesanan Telah Ditolak"}
                          {order.status === "rejected" && (
                            <span className="text-xs">
                              (Stok telah dikembalikan)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 sm:p-6">
                  <h4 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">
                    Items Pesanan
                  </h4>
                  <div className="grid gap-2 sm:gap-3">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                      >
                        <img
                          src={item.produk?.img_url}
                          alt={item.produk?.nama}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover shadow-sm flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate text-xs sm:text-sm">
                            {item.produk?.nama}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-4 mt-1">
                            <p className="text-xs sm:text-sm text-gray-600">
                              Harga:{" "}
                              <span className="font-semibold">
                                Rp {item.produk?.harga?.toLocaleString("id-ID")}
                              </span>
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Jumlah:{" "}
                              <span className="font-semibold">
                                {item.jumlah}
                              </span>
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Subtotal:{" "}
                              <span className="font-semibold text-green-600">
                                Rp{" "}
                                {(
                                  (item.produk?.harga || 0) * item.jumlah
                                ).toLocaleString("id-ID")}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {orders.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-gray-800">
                {orders.length}
              </div>
              <div className="text-sm text-gray-600">Total Pesanan</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter((o) => o.status === "pending").length}
              </div>
              <div className="text-sm text-gray-600">Menunggu</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-green-600">
                {orders.filter((o) => o.status === "accepted").length}
              </div>
              <div className="text-sm text-gray-600">Diterima</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-red-600">
                {orders.filter((o) => o.status === "rejected").length}
              </div>
              <div className="text-sm text-gray-600">Ditolak</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
