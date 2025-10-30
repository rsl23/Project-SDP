import React, { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { CheckCircle, XCircle, Clock, Package, User, DollarSign } from "lucide-react";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
    } catch (err) {
      console.error("Gagal update status:", err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "accepted": return <CheckCircle className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-50 border-yellow-200 text-yellow-700";
      case "accepted": return "bg-green-50 border-green-200 text-green-700";
      case "rejected": return "bg-red-50 border-red-200 text-red-700";
      default: return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  const filteredOrders = selectedStatus === "all"
    ? orders
    : orders.filter(order => order.status === selectedStatus);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Kelola Pesanan</h1>
          <p className="text-gray-600">Kelola dan pantau semua pesanan pelanggan</p>
        </div>

        {/* Filter Status */}
        <div className="mb-6 flex flex-wrap gap-3">
          {["all", "pending", "accepted", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${selectedStatus === status
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
                }`}
            >
              {getStatusIcon(status)}
              {status === "all" ? "Semua" :
                status === "pending" ? "Menunggu" :
                  status === "accepted" ? "Diterima" : "Ditolak"}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {selectedStatus === "all" ? "Belum ada pesanan" : `Tidak ada pesanan ${selectedStatus}`}
            </h3>
            <p className="text-gray-500">
              {selectedStatus === "all"
                ? "Pesanan dari pelanggan akan muncul di sini"
                : `Tidak ada pesanan dengan status ${selectedStatus === "pending" ? "menunggu" : selectedStatus}`
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status === "pending" ? "Menunggu Konfirmasi" :
                            order.status === "accepted" ? "Pesanan Diterima" : "Pesanan Ditolak"}
                        </span>
                        <span className="text-sm text-gray-500 font-mono">#{order.id.slice(-8)}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="text-sm">User: {order.userId?.slice(0, 8)}...</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Package className="w-4 h-4" />
                          <span className="text-sm">{order.items?.length || 0} Items</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-sm font-semibold">Rp {order.total?.toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - HANYA untuk status pending */}
                    <div className="flex gap-2">
                      {order.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleStatusChange(order.id, "accepted")}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-sm hover:shadow-md"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Terima
                          </button>
                          <button
                            onClick={() => handleStatusChange(order.id, "rejected")}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-sm hover:shadow-md"
                          >
                            <XCircle className="w-4 h-4" />
                            Tolak
                          </button>
                        </>
                      ) : (
                        // Untuk status accepted atau rejected, tampilkan indikator saja
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${order.status === "accepted"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-red-100 text-red-700 border-red-200"
                          }`}>
                          {getStatusIcon(order.status)}
                          {order.status === "accepted" ? "Pesanan Telah Diterima" : "Pesanan Telah Ditolak"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Items Pesanan</h4>
                  <div className="grid gap-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                        <img
                          src={item.produk?.img_url}
                          alt={item.produk?.nama}
                          className="w-16 h-16 rounded-lg object-cover shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{item.produk?.nama}</p>
                          <div className="flex flex-wrap gap-4 mt-1">
                            <p className="text-sm text-gray-600">
                              Harga: <span className="font-semibold">Rp {item.produk?.harga?.toLocaleString("id-ID")}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Jumlah: <span className="font-semibold">{item.jumlah}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Subtotal: <span className="font-semibold text-green-600">
                                Rp {((item.produk?.harga || 0) * item.jumlah).toLocaleString("id-ID")}
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
              <div className="text-2xl font-bold text-gray-800">{orders.length}</div>
              <div className="text-sm text-gray-600">Total Pesanan</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.status === "pending").length}
              </div>
              <div className="text-sm text-gray-600">Menunggu</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === "accepted").length}
              </div>
              <div className="text-sm text-gray-600">Diterima</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.status === "rejected").length}
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