const API_URL = "http://localhost:5000/api/orders";

export const getUserOrders = async (userId) => {
  const res = await fetch(`${API_URL}?userId=${userId}`);
  if (!res.ok) throw new Error("Gagal mengambil riwayat pesanan");
  return res.json();
};

export const getAllOrders = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Gagal mengambil data pesanan");
  return res.json();
};

export const createOrder = async (userId, items, total) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, items, total }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Gagal membuat pesanan");
  }

  return res.json();
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await fetch(`${API_URL}/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error("Gagal mengubah status pesanan");
  return res.json();
};
