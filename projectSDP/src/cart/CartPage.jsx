import React, { useEffect, useState } from "react";
import { getCart, deleteCartItem, updateCartItem } from "../apiService/cartApi";
import { Trash2, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      console.log("🛒 Cart data from API:", data);

      // Log detail setiap item
      data.forEach((item, index) => {
        console.log(`📦 Item ${index}:`, {
          id: item.id,
          produk_id: item.produk_id,
          produk: item.produk,
          jumlah: item.jumlah
        });
      });

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
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newJumlah = item.jumlah + delta;
        const stok = item.produk?.stok || 0;
        if (newJumlah < 1 || newJumlah > stok) return item;
        return { ...item, jumlah: newJumlah };
      })
    );

    try {
      const itemToUpdate = cart.find((item) => item.id === id);
      if (!itemToUpdate) return;
      await updateCartItem(id, itemToUpdate.jumlah + delta);
    } catch (err) {
      console.error(err);
      setCart((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, jumlah: item.jumlah } : item
        )
      );
    }
  };

  // Di CartPage.jsx - update handleCheckout
  // CartPage.jsx - Update handleCheckout
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

      // Pastikan cart tidak kosong
      if (cart.length === 0) {
        alert("Keranjang kosong!");
        return;
      }

      console.log("📋 Raw cart data:", cart);

      // Prepare order items - FIXED VERSION
      const orderItems = cart.map((item) => {
        console.log("🔍 Processing cart item:", item);

        // Validasi data yang diperlukan
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
          produk_id: item.produk_id, // Gunakan produk_id langsung dari item
          jumlah: item.jumlah,
          produk: {
            nama: item.produk.nama || "Produk tidak diketahui",
            harga: item.produk.harga || 0,
            img_url: item.produk.img_url || "",
          },
        };
      });

      console.log("✅ Processed order items:", orderItems);

      // Validasi final sebelum kirim
      const invalidItems = orderItems.filter(item => !item.produk_id || !item.jumlah);
      if (invalidItems.length > 0) {
        throw new Error(`Terdapat ${invalidItems.length} item dengan data tidak valid`);
      }

      const total = calculateTotal();
      console.log("💰 Total:", total);

      // Kirim request ke backend
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
        // Jika error dari backend, tampilkan pesan error yang lebih spesifik
        const errorMsg = responseData.error || responseData.details || `HTTP error! status: ${res.status}`;
        throw new Error(errorMsg);
      }

      // ✅ Hapus semua item dari cart di database
      console.log("🗑️ Clearing cart items...");
      const deletePromises = cart.map((item) => deleteCartItem(item.id));
      await Promise.all(deletePromises);

      console.log("🎉 Checkout successful!");
      alert("Checkout berhasil! Order masuk ke sistem. Stok sementara telah dikurangi.");

      // Clear local state
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

      // Refresh cart untuk sync data
      fetchCart();
    }
  };

  const calculateTotal = () =>
    cart.reduce(
      (acc, item) => acc + (item.produk?.harga || 0) * item.jumlah,
      0
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-lg bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018]">
        Memuat keranjang...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] text-white px-6 py-10 transition-all">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold tracking-wide">CART</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-lg"
        >
          &larr; Kembali
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="text-center text-gray-300 text-lg mt-20">
          Keranjang kamu kosong
          <br />
          <button
            onClick={() => navigate("/product")}
            className="mt-4 px-5 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg font-medium transition"
          >
            Belanja Sekarang
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-white/10 backdrop-blur-lg rounded-xl p-4 shadow-lg hover:bg-white/20 transition-all duration-300 ease-in-out"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.produk?.img_url}
                    alt={item.produk?.nama}
                    className="w-24 h-24 rounded-lg object-cover shadow-md transform hover:scale-105 transition-transform duration-300"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {item.produk?.nama || "Produk tidak ditemukan"}
                    </h3>
                    <p className="text-sm text-gray-300 mt-1">
                      Rp {item.produk?.harga?.toLocaleString("id-ID")}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="bg-white/20 hover:bg-white/30 text-white rounded-lg px-2 py-1 transition"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="bg-white/20 px-4 py-1 rounded-lg text-sm min-w-[40px] text-center">
                        {item.jumlah}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="bg-white/20 hover:bg-white/30 text-white rounded-lg px-2 py-1 transition"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold text-indigo-400">
                    Rp{" "}
                    {((item.produk?.harga || 0) * item.jumlah).toLocaleString(
                      "id-ID"
                    )}
                  </p>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="mt-3 text-red-400 hover:text-red-600 transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg h-fit">
            <h2 className="text-2xl font-semibold mb-4 border-b border-white/20 pb-3">
              Ringkasan Belanja
            </h2>

            <div className="flex justify-between text-gray-300 mb-2">
              <span>Jumlah Item:</span>
              <span>{cart.reduce((acc, item) => acc + item.jumlah, 0)}</span>
            </div>
            <div className="flex justify-between text-gray-300 mb-4">
              <span>Subtotal:</span>
              <span>Rp {calculateTotal().toLocaleString("id-ID")}</span>
            </div>

            <hr className="border-white/20 my-4" />

            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-indigo-400">
                Rp {calculateTotal().toLocaleString("id-ID")}
              </span>
            </div>

            <button
              onClick={() => handleCheckout()}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 rounded-lg font-semibold transition-all shadow-lg"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
