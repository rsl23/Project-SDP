import { auth } from '../firebase/config';

const API_URL = "http://localhost:5000/api/cart";

const getCurrentUser = () => {
    return auth.currentUser;
};

export const addToCart = async (produk_id, jumlah = 1) => {
    const user = getCurrentUser();

    if (!user) {
        throw new Error("User belum login");
    }

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            produk_id,
            jumlah,
            userId: user.uid
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal menambah ke keranjang");
    }

    return res.json();
};

export const getCart = async () => {
    const user = getCurrentUser();

    if (!user) {
        throw new Error("User belum login");
    }

    const res = await fetch(`${API_URL}?userId=${user.uid}`);
    if (!res.ok) throw new Error("Gagal mengambil data keranjang");
    return res.json();
};

export const deleteCartItem = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Gagal menghapus item keranjang");
    return res.json();
};

export const updateCartItem = async (id, jumlah) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jumlah: Number(jumlah) }),
    });
    if (!res.ok) throw new Error("Gagal update jumlah cart");
    return res.json();
};