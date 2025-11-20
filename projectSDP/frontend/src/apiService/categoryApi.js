const CATEGORY_API_URL = "http://localhost:5000/api/categories";

export async function getCategories() {
    try {
        const response = await fetch(CATEGORY_API_URL);
        console.log("Ambil Kategori");

        if (!response.ok) throw new Error("Gagal mengambil kategori");
        return await response.json();
    } catch (error) {
        console.error("Error di getCategories:", error);
        throw error;
    }
}

export async function addCategory(categoryData) {
    try {
        const response = await fetch(CATEGORY_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(categoryData),
        });
        if (!response.ok) throw new Error("Gagal menambah kategori");
        return await response.json();
    } catch (error) {
        console.error("Error di addCategory:", error);
        throw error;
    }
}

export async function updateCategory(id, updatedData) {
    try {
        const response = await fetch(`${CATEGORY_API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
        });
        if (!response.ok) throw new Error("Gagal update kategori");
        return await response.json();
    } catch (error) {
        console.error("Error di updateCategory:", error);
        throw error;
    }
}

export async function deleteCategory(id) {
    try {
        const response = await fetch(`${CATEGORY_API_URL}/${id}`, {
            method: "DELETE"
        });
        if (!response.ok) throw new Error("Gagal menghapus kategori");
        return await response.json();
    } catch (error) {
        console.error("Error di deleteCategory:", error);
        throw error;
    }
}