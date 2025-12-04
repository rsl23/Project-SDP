import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
} from "../../apiService/productApi";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../../apiService/categoryApi";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  const [formData, setFormData] = useState({
    nama: "",
    kategori_id: "",
    harga: "",
    stok: "",
    img_url: "",
    img_name: "",
    deskripsi: "",
    link_tokopedia: "",
    link_shopee: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Load categories dan products
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Gagal mengambil data kategori");
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setFormData((prev) => ({
      ...prev,
      img_name: file.name,
      img_url: URL.createObjectURL(file),
    }));
  };

  const handleToggleActive = async (product) => {
    try {
      const updatedProduct = { active: !product.active };
      await updateProduct(product.id, updatedProduct);
      fetchProducts();
    } catch (error) {
      console.error("Gagal mengubah status produk:", error);
      alert("Gagal mengubah status produk!");
    }
  };

  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "sdp_img");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dnyh66ror/image/upload",
        { method: "POST", body: data }
      );
      const result = await res.json();
      return result.secure_url || null;
    } catch (err) {
      console.error("❌ Error upload:", err);
      return null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = formData.img_url;
    setLoading(true);
    if (selectedFile) {
      const uploadedUrl = await uploadToCloudinary(selectedFile);
      if (!uploadedUrl) {
        alert("Upload gagal!");
        setLoading(false);
        return;
      }
      imageUrl = uploadedUrl;
    }

    const productData = {
      nama: formData.nama,
      kategori_id: formData.kategori_id,
      harga: parseInt(formData.harga),
      img_url: imageUrl,
      img_name: formData.img_name,
      deskripsi: formData.deskripsi,
      link_tokopedia: formData.link_tokopedia,
      link_shopee: formData.link_shopee,
    };

    const stokData = parseInt(formData.stok);

    try {
      if (editMode && currentProduct) {
        // Update produk
        await updateProduct(currentProduct.id, productData);

        // Update stok terpisah
        await updateProductStock(currentProduct.id, { stok: stokData });
      } else {
        // Tambah produk baru dengan stok
        await addProduct({ ...productData, stok: stokData });
      }

      fetchProducts();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Gagal menyimpan produk!");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setLoading(true);
    setEditMode(true);
    setCurrentProduct(product);
    setFormData({
      nama: product.nama,
      kategori_id: product.kategori_id || "",
      harga: product.harga.toString(),
      stok: product.stok ? product.stok.toString() : "0",
      img_url: product.img_url || "",
      img_name: product.img_name || "",
      deskripsi: product.deskripsi || "",
      link_tokopedia: product.link_tokopedia || "",
      link_shopee: product.link_shopee || "",
    });
    setShowModal(true);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus produk ini?")) return;

    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Gagal menghapus produk!");
    }
  };

  const resetForm = () => {
    setFormData({
      nama: "",
      kategori_id: "",
      harga: "",
      stok: "",
      deskripsi: "",
      img_url: "",
      img_name: "",
      link_tokopedia: "",
      link_shopee: "",
    });
    setEditMode(false);
    setCurrentProduct(null);
    setSelectedFile(null);
  };

  // Fungsi untuk menambah kategori baru
  const handleAddCategory = async () => {
    if (newCategory.trim() === "") {
      alert("Nama kategori tidak boleh kosong!");
      return;
    }

    try {
      await addCategory({ nama: newCategory.trim() });
      await fetchCategories(); // Refresh daftar kategori
      setNewCategory("");
      alert("Kategori berhasil ditambahkan!");
    } catch (error) {
      console.error("Error adding category:", error);
      alert(error.message || "Gagal menambah kategori!");
    }
  };

  // Fungsi untuk menghapus kategori
  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Yakin ingin menghapus kategori "${category.nama}"?`))
      return;

    try {
      await deleteCategory(category.id);
      await fetchCategories(); // Refresh daftar kategori
      alert("Kategori berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting category:", error);
      alert(error.message || "Gagal menghapus kategori!");
    }
  };

  // Fungsi untuk edit kategori
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditCategoryName(category.nama);
  };

  const handleUpdateCategory = async () => {
    if (editCategoryName.trim() === "") {
      alert("Nama kategori tidak boleh kosong!");
      return;
    }

    try {
      await updateCategory(editingCategory.id, {
        nama: editCategoryName.trim(),
      });
      await fetchCategories(); // Refresh daftar kategori
      setEditingCategory(null);
      setEditCategoryName("");
      alert("Kategori berhasil diupdate!");
    } catch (error) {
      console.error("Error updating category:", error);
      alert(error.message || "Gagal mengupdate kategori!");
    }
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryName("");
  };

  const filteredProducts = products.filter((p) =>
    p.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function untuk mendapatkan nama kategori dari ID
  const getCategoryName = (kategoriId) => {
    const category = categories.find((cat) => cat.id === kategoriId);
    return category ? category.nama : "Tidak ada kategori";
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Kelola Produk
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Tambah, edit, atau hapus produk
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm sm:text-base"
          >
            <Plus size={18} />
            Kelola Kategori
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base"
          >
            <Plus size={18} />
            Tambah Produk
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Produk
                  </th>
                  <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok
                  </th>
                  <th className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2">
                        {product.nama}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getCategoryName(product.kategori_id)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                      Rp {product.harga.toLocaleString("id-ID")}
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                      {product.stok}
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold transition ${
                          product.active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {product.active ? "Active" : "Tidak Active"}
                      </button>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit Produk */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
              {editMode ? "Edit Produk" : "Tambah Produk Baru"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Upload Image */}
              <div>
                <div className="relative flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-indigo-400 transition bg-gray-50 h-40">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center text-gray-500 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 mb-2 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 15a4 4 0 004 4h10a4 4 0 004-4m-8-9v10m0 0l-3-3m3 3l3-3"
                      />
                    </svg>
                    <p className="text-sm font-medium">
                      Klik untuk upload gambar
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG</p>
                  </div>
                </div>

                {formData.img_url && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-indigo-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 21h10a2 2 0 002-2V7l-5-5H7a2 2 0 00-2 2v15a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                      {formData.img_name}
                    </p>
                  </div>
                )}
              </div>

              {/* Nama Produk */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi Produk
                </label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Masukkan deskripsi produk (opsional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 resize-y"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.deskripsi.length} karakter
                </p>
              </div>

              {/* Kategori */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Kategori
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    + Kelola Kategori
                  </button>
                </div>
                <select
                  name="kategori_id"
                  value={formData.kategori_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Harga */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga
                </label>
                <input
                  type="number"
                  name="harga"
                  value={formData.harga}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                />
              </div>

              {/* Stok */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stok
                </label>
                <input
                  type="number"
                  name="stok"
                  value={formData.stok}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                />
              </div>

              {/* Link Tokopedia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Tokopedia (Opsional)
                </label>
                <input
                  type="url"
                  name="link_tokopedia"
                  value={formData.link_tokopedia}
                  onChange={handleInputChange}
                  placeholder="https://tokopedia.link/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                />
              </div>

              {/* Link Shopee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Shopee (Opsional)
                </label>
                <input
                  type="url"
                  name="link_shopee"
                  value={formData.link_shopee}
                  onChange={handleInputChange}
                  placeholder="https://shopee.co.id/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  {editMode ? "Update" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola Kategori */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Kelola Kategori
              </h2>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                  setEditCategoryName("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form Tambah Kategori Baru */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Tambah Kategori Baru
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Masukkan nama kategori baru"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                  onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
                />
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Tambah
                </button>
              </div>
            </div>

            {/* Daftar Kategori */}
            <div className="flex-1 overflow-hidden">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Daftar Kategori
              </h3>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {categories.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Belum ada kategori
                  </div>
                ) : (
                  categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex justify-between items-center p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                    >
                      {editingCategory?.id === category.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editCategoryName}
                            onChange={(e) =>
                              setEditCategoryName(e.target.value)
                            }
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleUpdateCategory()
                            }
                          />
                          <button
                            onClick={handleUpdateCategory}
                            className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelEditCategory}
                            className="px-2 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-gray-800 flex-1">
                            {category.nama}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Edit kategori"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Hapus kategori"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Total: {categories.length} kategori
              </p>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                  setEditCategoryName("");
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
