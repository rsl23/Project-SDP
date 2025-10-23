import React, { useEffect, useState } from "react";
import { getCart, deleteCartItem, updateCartItem } from "../apiService/cartApi";
import { Trash2, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
        }
    };

    const handleQuantityChange = async (item, delta) => {
        const newJumlah = item.jumlah + delta;
        const stok = item.produk?.stok || 0;

        if (newJumlah < 1 || newJumlah > stok) return;

        // Optimistic UI
        setCart(prev => prev.map(p => p.id === item.id ? { ...p, jumlah: newJumlah } : p));

        try {
            await updateCartItem(item.id, newJumlah);
        } catch (err) {
            console.error(err);
            // rollback UI
            setCart(prev => prev.map(p => p.id === item.id ? { ...p, jumlah: item.jumlah } : p));
        }
    };

    const calculateTotal = () =>
        cart.reduce((acc, item) => acc + (item.produk?.harga || 0) * item.jumlah, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-white text-lg bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018]">
                Memuat keranjang...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] text-white px-6 py-10 transition-all">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold tracking-wide">🛒 Keranjang Belanja</h1>
                <button
                    onClick={() => navigate(-1)}
                    className="px-5 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-lg"
                >
                    &larr; Kembali
                </button>
            </div>

            {cart.length === 0 ? (
                <div className="text-center text-gray-300 text-lg mt-20">
                    Keranjang kamu kosong 😢
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
                    {/* Daftar Produk */}
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

                                        {/* Kontrol Jumlah */}
                                        <div className="mt-3 flex items-center gap-2">
                                            <button
                                                onClick={() => handleQuantityChange(item, -1)}
                                                className="bg-white/20 hover:bg-white/30 text-white rounded-lg px-2 py-1 transition"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="bg-white/20 px-4 py-1 rounded-lg text-sm min-w-[40px] text-center">
                                                {item.jumlah}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(item, 1)}
                                                className="bg-white/20 hover:bg-white/30 text-white rounded-lg px-2 py-1 transition"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-lg font-semibold text-indigo-400">
                                        Rp {(item.produk?.harga || 0 * item.jumlah).toLocaleString("id-ID")}
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

                    {/* Ringkasan Pembayaran */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg h-fit">
                        <h2 className="text-2xl font-semibold mb-4 border-b border-white/20 pb-3">
                            Ringkasan Belanja
                        </h2>

                        <div className="flex justify-between text-gray-300 mb-2">
                            <span>Jumlah Item:</span>
                            <span>{cart.length}</span>
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
                            onClick={() => console.log("Checkout clicked")}
                            className="w-full py-3 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 rounded-lg font-semibold transition-all shadow-lg"
                        >
                            Lanjut ke Pembayaran
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
