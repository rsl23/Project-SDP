const API_URL = "http://localhost:5000/api/products";

export async function getProducts() {
  try {
    const response = await fetch(API_URL);
    console.log("Ambil Produk");

    if (!response.ok) throw new Error("Gagal mengambil produk");
    return await response.json();
  } catch (error) {
    console.error("Error di getProducts:", error);
    throw error;
  }
}

export async function addProduct(productData) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error("Gagal menambah produk");
    return await response.json();
  } catch (error) {
    console.error("Error di addProduct:", error);
    throw error;
  }
}

export async function updateProduct(id, updatedData) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) throw new Error("Gagal update produk");
    return await response.json();
  } catch (error) {
    console.error("Error di updateProduct:", error);
    throw error;
  }
}

export async function deleteProduct(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Gagal menghapus produk");
    return await response.json();
  } catch (error) {
    console.error("Error di deleteProduct:", error);
    throw error;
  }
}

export async function updateProductStock(id, stockData) {
  try {
    const response = await fetch(`${API_URL}/${id}/stock`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stockData),
    });
    if (!response.ok) throw new Error("Gagal update stok produk");
    return await response.json();
  } catch (error) {
    console.error("Error di updateProductStock:", error);
    throw error;
  }
}