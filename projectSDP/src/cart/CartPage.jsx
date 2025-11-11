import React, { useEffect, useState } from "react";
import { getCart, deleteCartItem, updateCartItem } from "../apiService/cartApi";
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, Package, CreditCard, Truck, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      console.log("🛒 Cart data from API:", data);
      setCart(data);
    } catch (err) {
      console.error("Gagal mengambil cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setCart((prev) => prev.filter((item) => item.id !== id));
      await deleteCartItem(id);
    } catch (err) {
      console.error("Gagal menghapus item:", err);
      fetchCart();
    }
  };

  const handleQuantityChange = async (id, delta) => {
    const item = cart.find(item => item.id === id);
    if (!item) return;

    const newJumlah = item.jumlah + delta;
    const stok = item.produk?.stok || 0;

    if (newJumlah < 1 || newJumlah > stok) return;

    setUpdatingItems(prev => new Set(prev).add(id));

    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, jumlah: newJumlah } : item
      )
    );

    try {
      await updateCartItem(id, newJumlah);
    } catch (err) {
      console.error("Gagal update quantity:", err);
      setCart((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, jumlah: item.jumlah } : item
        )
      );
    } finally {
      // Remove from updating items
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleCheckout = async () => {
    try {
      console.log("🛒 Starting checkout process...");

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("Silakan login terlebih dahulu!");
        return;
      }

      const userId = user.uid;
      console.log("👤 User ID:", userId);

      if (cart.length === 0) {
        alert("Keranjang kosong!");
        return;
      }

      console.log("📋 Raw cart data:", cart);

      const orderItems = cart.map((item) => {
        console.log("🔍 Processing cart item:", item);

        if (!item.produk_id) {
          throw new Error(`produk_id tidak ditemukan untuk item: ${item.id}`);
        }

        if (!item.produk) {
          throw new Error(`Data produk tidak lengkap untuk item: ${item.id}`);
        }

        if (!item.jumlah || item.jumlah < 1) {
          throw new Error(`Jumlah tidak valid untuk item: ${item.id}`);
        }

        return {
          produk_id: item.produk_id,
          jumlah: item.jumlah,
          produk: {
            nama: item.produk.nama || "Produk tidak diketahui",
            harga: item.produk.harga || 0,
            img_url: item.produk.img_url || "",
          },
        };
      });

      console.log("✅ Processed order items:", orderItems);

      const invalidItems = orderItems.filter(item => !item.produk_id || !item.jumlah);
      if (invalidItems.length > 0) {
        throw new Error(`Terdapat ${invalidItems.length} item dengan data tidak valid`);
      }

      const total = calculateTotal();
      console.log("💰 Total:", total);

      console.log("📤 Sending order to backend...");
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          items: orderItems,
          total
        }),
      });

      console.log("📡 Response status:", res.status);

      const responseData = await res.json();
      console.log("📨 Response data:", responseData);

      if (!res.ok) {
        const errorMsg = responseData.error || responseData.details || `HTTP error! status: ${res.status}`;
        throw new Error(errorMsg);
      }

      console.log("🗑️ Clearing cart items...");
      const deletePromises = cart.map((item) => deleteCartItem(item.id));
      await Promise.all(deletePromises);

      console.log("🎉 Checkout successful!");
      alert("Checkout berhasil! Order masuk ke sistem. Stok sementara telah dikurangi.");

      setCart([]);

    } catch (err) {
      console.error("❌ Checkout error:", err);
      console.error("❌ Error stack:", err.stack);

      let errorMessage = "Gagal checkout: ";

      if (err.message.includes("Stok tidak cukup")) {
        errorMessage += err.message;
      } else if (err.message.includes("produk_id tidak ditemukan")) {
        errorMessage += "Data keranjang tidak valid. Silakan refresh halaman dan coba lagi.";
      } else if (err.message.includes("Data produk tidak lengkap")) {
        errorMessage += "Beberapa produk tidak ditemukan. Silakan refresh halaman.";
      } else {
        errorMessage += err.message;
      }

      alert(errorMessage);
      fetchCart();
    }
  };

  const calculateTotal = () =>
    cart.reduce(
      (acc, item) => acc + (item.produk?.harga || 0) * item.jumlah,
      0
    );

  const getTotalItems = () =>
    cart.reduce((acc, item) => acc + item.jumlah, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Memuat keranjang...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 px-4 py-8">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
              <ShoppingCart className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                Keranjang Belanja
              </h1>
              <p className="text-gray-300 text-lg">
                {cart.length} item di keranjang
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all duration-300 shadow-lg"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Kembali Belanja</span>
          </button>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20">
            <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
              <ShoppingCart size={40} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Keranjang Kosong</h3>
            <p className="text-gray-400 mb-8">
              Yuk, temukan produk menarik dan mulai belanja!
            </p>
            <button
              onClick={() => navigate("/product")}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-2xl hover:from-pink-600 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:scale-105"
            >
              Jelajahi Produk
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-pink-500/30 transition-all duration-500 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <img
                          src={item.produk?.img_url || "/placeholder-image.jpg"}
                          alt={item.produk?.nama}
                          className="w-32 h-32 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = "/placeholder-image.jpg";
                          }}
                        />
                        <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {item.produk?.kategori_nama || item.produk?.kategori || "Produk"}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-pink-400 transition-colors">
                            {item.produk?.nama || "Produk tidak ditemukan"}
                          </h3>
                          <p className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                            Rp {item.produk?.harga?.toLocaleString("id-ID")}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            disabled={updatingItems.has(item.id) || item.jumlah <= 1}
                            className="p-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            <Minus size={18} />
                          </button>

                          <div className="relative">
                            <span className="bg-white/5 border border-white/20 px-4 py-2 rounded-xl text-white font-semibold min-w-[60px] text-center block">
                              {item.jumlah}
                            </span>
                            {updatingItems.has(item.id) && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            disabled={updatingItems.has(item.id) || item.jumlah >= (item.produk?.stok || 0)}
                            className="p-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pt-4 border-t border-white/10">
                        <div>
                          <p className="text-lg font-semibold text-white">
                            Subtotal:{" "}
                            <span className="text-indigo-400">
                              Rp {((item.produk?.harga || 0) * item.jumlah).toLocaleString("id-ID")}
                            </span>
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            Stok tersedia: {item.produk?.stok || 0} unit
                          </p>
                        </div>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl hover:bg-red-500/30 transition-all duration-300"
                        >
                          <Trash2 size={18} />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg sticky top-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <CreditCard className="text-indigo-400" />
                  Ringkasan Belanja
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Total Item:</span>
                    <span className="text-white font-semibold">{getTotalItems()} item</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Subtotal:</span>
                    <span className="text-white font-semibold">
                      Rp {calculateTotal().toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Pengiriman:</span>
                    <span className="text-green-400 font-semibold">Gratis</span>
                  </div>
                </div>

                <hr className="border-white/20 my-6" />

                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold text-white">Total:</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
                    Rp {calculateTotal().toLocaleString("id-ID")}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-2xl"
                >
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <CreditCard size={24} />
                    Checkout Sekarang
                  </span>
                </button>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Truck size={16} className="text-green-400" />
                    <span>Gratis pengiriman untuk order di atas Rp 500.000</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Shield size={16} className="text-blue-400" />
                    <span>Garansi produk 100% original</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Package size={16} className="text-yellow-400" />
                    <span>Pengiriman 1-3 hari kerja</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;