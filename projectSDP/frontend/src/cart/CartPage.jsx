import React, { useEffect, useState } from "react";
import { getCart, deleteCartItem, updateCartItem } from "../apiService/cartApi";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  Package,
  CreditCard,
  Truck,
  Shield,
} from "lucide-react";
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
      console.log("🛒 Cart data:", data.length, "items");
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
    const item = cart.find((item) => item.id === id);
    if (!item) return;

    const newJumlah = item.jumlah + delta;
    const stok = item.produk?.stok || 0;

    if (newJumlah < 1 || newJumlah > stok) return;

    setUpdatingItems((prev) => new Set(prev).add(id));

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
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleCheckout = async () => {
    try {
      console.log("🛒 Starting checkout...");

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("Silakan login terlebih dahulu!");
        return;
      }

      const userId = user.uid;

      if (cart.length === 0) {
        alert("Keranjang kosong!");
        return;
      }

      const orderItems = cart.map((item) => {
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

      const invalidItems = orderItems.filter(
        (item) => !item.produk_id || !item.jumlah
      );
      if (invalidItems.length > 0) {
        throw new Error(
          `Terdapat ${invalidItems.length} item dengan data tidak valid`
        );
      }

      const total = calculateTotal();

      const res = await fetch(
        "https://backend-dot-storied-courier-479504-q5.et.r.appspot.com/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            items: orderItems,
            total,
          }),
        }
      );

      const responseData = await res.json();

      if (!res.ok) {
        const errorMsg =
          responseData.error ||
          responseData.details ||
          `HTTP error! status: ${res.status}`;
        throw new Error(errorMsg);
      }

      const deletePromises = cart.map((item) => deleteCartItem(item.id));
      await Promise.all(deletePromises);

      alert(
        "Checkout berhasil! Order masuk ke sistem. Stok sementara telah dikurangi."
      );

      setCart([]);
    } catch (err) {
      console.error("❌ Checkout error:", err);

      let errorMessage = "Gagal checkout: ";

      if (err.message.includes("Stok tidak cukup")) {
        errorMessage += err.message;
      } else if (err.message.includes("produk_id tidak ditemukan")) {
        errorMessage +=
          "Data keranjang tidak valid. Silakan refresh halaman dan coba lagi.";
      } else if (err.message.includes("Data produk tidak lengkap")) {
        errorMessage +=
          "Beberapa produk tidak ditemukan. Silakan refresh halaman.";
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

  const getTotalItems = () => cart.reduce((acc, item) => acc + item.jumlah, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-white text-base sm:text-lg mt-4">Memuat keranjang...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 px-3 sm:px-4 py-6 sm:py-8">
      {/* Mobile Header */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg border border-white/30 rounded-xl text-white font-medium transition-all duration-300"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Kembali</span>
          </button>
          <h1 className="text-xl font-bold text-white text-center flex-1 mx-2">
            Keranjang
          </h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>
        <p className="text-gray-300 text-sm text-center">
          {cart.length} item di keranjang
        </p>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block max-w-7xl mx-auto mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
              <ShoppingCart className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                Keranjang Belanja
              </h1>
              <p className="text-gray-300 text-base sm:text-lg">
                {cart.length} item di keranjang
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="hidden lg:flex items-center gap-3 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-lg border border-white/30 rounded-xl text-white font-medium transition-all duration-300 shadow-lg"
          >
            <ArrowLeft size={20} />
            <span>Kembali Belanja</span>
          </button>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="max-w-2xl mx-auto text-center py-8 sm:py-12 md:py-16 px-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 border border-white/20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 bg-white/10 rounded-full flex items-center justify-center">
              <ShoppingCart size={24} className="sm:size-8 md:size-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">
              Keranjang Kosong
            </h3>
            <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8">
              Yuk, temukan produk menarik dan mulai belanja!
            </p>
            <button
              onClick={() => navigate("/product")}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 shadow-lg hover:scale-105 active:scale-95"
            >
              Jelajahi Produk
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-pink-500/30 transition-all duration-300 shadow-md"
                >
                  <div className="flex flex-col xs:flex-row gap-4 sm:gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <img
                          src={item.produk?.img_url || "/placeholder-image.jpg"}
                          alt={item.produk?.nama}
                          className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-lg sm:rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = "/placeholder-image.jpg";
                          }}
                        />
                        <div className="absolute -top-1 -right-1 xs:-top-2 xs:-right-2 bg-pink-500 text-white text-xs px-1.5 py-0.5 xs:px-2 xs:py-1 rounded-full font-medium">
                          {item.produk?.kategori_nama?.substring(0, 10) ||
                            "Produk"}
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-1 sm:mb-2 group-hover:text-pink-300 transition-colors truncate">
                            {item.produk?.nama || "Produk tidak ditemukan"}
                          </h3>
                          <p className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent mb-3 sm:mb-4">
                            Rp {item.produk?.harga?.toLocaleString("id-ID")}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            disabled={
                              updatingItems.has(item.id) || item.jumlah <= 1
                            }
                            className="p-1.5 sm:p-2 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
                          >
                            <Minus size={14} className="sm:size-4" />
                          </button>

                          <div className="relative">
                            <span className="bg-white/5 border border-white/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-white font-semibold min-w-[50px] sm:min-w-[60px] text-center block text-sm sm:text-base">
                              {item.jumlah}
                            </span>
                            {updatingItems.has(item.id) && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg sm:rounded-xl">
                                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            disabled={
                              updatingItems.has(item.id) ||
                              item.jumlah >= (item.produk?.stok || 0)
                            }
                            className="p-1.5 sm:p-2 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
                          >
                            <Plus size={14} className="sm:size-4" />
                          </button>
                        </div>
                      </div>

                      {/* Footer - Subtotal and Delete */}
                      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10">
                        <div className="space-y-1">
                          <p className="text-sm sm:text-base font-semibold text-white">
                            Subtotal:{" "}
                            <span className="text-indigo-400">
                              Rp{" "}
                              {(
                                (item.produk?.harga || 0) * item.jumlah
                              ).toLocaleString("id-ID")}
                            </span>
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400">
                            Stok: {item.produk?.stok || 0} unit
                          </p>
                        </div>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg sm:rounded-xl hover:bg-red-500/30 transition-all duration-300 text-sm sm:text-base self-start xs:self-center"
                        >
                          <Trash2 size={14} className="sm:size-4" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary - Mobile Sticky Bottom Bar */}
            <div className="lg:hidden">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 shadow-lg sticky bottom-0 z-10">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-300">Total ({getTotalItems()} item)</p>
                    <p className="text-xl font-bold text-white">
                      Rp {calculateTotal().toLocaleString("id-ID")}
                    </p>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="px-4 py-3 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white rounded-xl font-bold text-sm transition-all duration-300 shadow-lg"
                  >
                    Checkout
                  </button>
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-2">
                  <Shield size={12} className="text-blue-400" />
                  <span>Garansi produk 100% original</span>
                </div>
              </div>
            </div>

            {/* Order Summary - Desktop Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg sticky top-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <CreditCard className="text-indigo-400" size={20} />
                  Ringkasan Belanja
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Total Item:</span>
                    <span className="text-white font-semibold">
                      {getTotalItems()} item
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Subtotal:</span>
                    <span className="text-white font-semibold">
                      Rp {calculateTotal().toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <hr className="border-white/20 my-6" />

                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold text-white">Total:</span>
                  <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
                    Rp {calculateTotal().toLocaleString("id-ID")}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-lg hover:scale-105 flex items-center justify-center gap-3"
                >
                  <CreditCard size={20} />
                  Checkout Sekarang
                </button>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Shield size={16} className="text-blue-400" />
                    <span>Garansi produk 100% original</span>
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