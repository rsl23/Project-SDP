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

const API_URL = "http://localhost:5000/api/orders";

// Fallback to Firestore if server is not available
export const getUserOrders = async (userId) => {
  try {
    // Try API first
    const res = await fetch(`${API_URL}?userId=${userId}`, {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (error) {
    console.log(
      "Server not available, using Firestore directly:",
      error.message
    );
    // Fallback to Firestore
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", userId)
        // Note: orderBy removed to avoid index requirement
        // Orders will be sorted in client-side if needed
      );
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by createdAt in client-side
      return orders.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA; // desc order
      });
    } catch (firestoreError) {
      console.error("Firestore error:", firestoreError);
      throw new Error("Gagal mengambil riwayat pesanan");
    }
  }
};

export const getAllOrders = async () => {
  try {
    const res = await fetch(API_URL, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (error) {
    console.log("Server not available, using Firestore directly");
    // Fallback to Firestore
    const snapshot = await getDocs(collection(db, "orders"));
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Sort by createdAt in client-side
    return orders.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA; // desc order
    });
  }
};

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
    // Fallback to Firestore
    const orderData = {
      userId,
      items,
      total,
      status: "pending",
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "orders"), orderData);
    return { id: docRef.id, ...orderData };
  }
};

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
    // Fallback to Firestore
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status, updatedAt: serverTimestamp() });
    return { success: true, id: orderId, status };
  }
};
