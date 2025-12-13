// API Service untuk Order endpoints
// Handle operasi orders dengan fallback ke Firestore jika server tidak tersedia
// Pattern: Try API first dengan timeout 5s, fallback ke Firestore direct

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const API_URL = "https://backend-dot-storied-courier-479504-q5.et.r.appspot.com/api/orders";

// Mengambil semua orders milik user tertentu
// @param userId - ID user dari Firebase Auth
// @returns Array orders dengan createdAt terbaru dulu (descending)
// Fallback ke Firestore direct jika API timeout/unavailable
export const getUserOrders = async (userId) => {
  try {
    // Try API first dengan timeout 5 detik
    const res = await fetch(`${API_URL}?userId=${userId}`, {
      signal: AbortSignal.timeout(5000), // Prevent hanging request
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (error) {
    console.log(
      "Server not available, using Firestore directly:",
      error.message
    );
    // Fallback ke Firestore - langsung query collection
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", userId)
        // Note: orderBy removed untuk avoid Firestore composite index requirement
        // Sorting dilakukan di client-side instead
      );
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Client-side sorting by createdAt descending
      return orders.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA; // newest first
      });
    } catch (firestoreError) {
      console.error("Firestore error:", firestoreError);
      throw new Error("Gagal mengambil riwayat pesanan");
    }
  }
};

// Mengambil semua orders (untuk admin)
// @returns Array semua orders dengan createdAt descending
// Fallback ke Firestore direct jika API unavailable
export const getAllOrders = async () => {
  try {
    const res = await fetch(API_URL, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (error) {
    console.log("Server not available, using Firestore directly");
    // Fallback ke Firestore - get all orders
    const snapshot = await getDocs(collection(db, "orders"));
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Client-side sorting by createdAt descending
    return orders.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA; // newest first
    });
  }
};

// Membuat order baru dari cart checkout
// @param userId - ID user dari Firebase Auth
// @param items - Array cart items yang dipesan
// @param total - Total harga order
// @returns Object order baru dengan id dan status 'pending'
// Fallback ke Firestore direct dengan serverTimestamp untuk createdAt
export const createOrder = async (userId, items, total) => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, items, total }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "API error");
    }

    return await res.json();
  } catch (error) {
    console.log("Server not available, using Firestore directly");
    // Fallback ke Firestore - manual create order document
    const orderData = {
      userId,
      items,
      total,
      status: "pending", // Default status untuk order baru
      createdAt: serverTimestamp(), // Server timestamp untuk konsistensi
    };
    const docRef = await addDoc(collection(db, "orders"), orderData);
    return { id: docRef.id, ...orderData };
  }
};

// Update status order (pending -> completed/cancelled)
// @param orderId - ID order yang akan diupdate
// @param status - Status baru (pending, completed, cancelled)
// @returns Object dengan success status
// Fallback ke Firestore direct dengan updatedAt timestamp
export const updateOrderStatus = async (orderId, status) => {
  try {
    const res = await fetch(`${API_URL}/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (error) {
    console.log("Server not available, using Firestore directly");
    // Fallback ke Firestore - manual update document
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status, updatedAt: serverTimestamp() });
    return { success: true, id: orderId, status };
  }
};
