import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../../apiService/productApi";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    kategori: "",
    harga: "",
    stok: "",
    img_url: "",
    img_name: "",
    deskripsi: "",
    link_tokopedia: "",
    link_shopee: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);

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

  const kategoriOptions = [
    "Filter Udara",
    "Aksesoris CNC Aluminium",
    "Aksesoris Velg",
    "Lain-lain",
    "Aksesoris Plastik",
    "Spion Motor",
    "Alarm Motor Mobil",
    "Klakson",
    "Shockbreaker",
    "Knalpot",
    "Aksesoris NMAX Old New",
    "Tempat Plat Motor",
    "Product Shock",
    "Gas Spontan Motor",
    "Aksesoris Lampu",
    "Lampu Tembak Sorot",
    "Saklar",
    "Handgrip Motor",
    "Aksesoris Stang Motor",
    "Breket Plat Motor",
    "Disc Piringan Cakram",
    "Produk RCB",
    "Kagawa",
    "Scoyco",
    "Rochell",
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

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
      kategori: formData.kategori,
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
        await updateProduct(currentProduct.id, productData);
        await fetch(`http://localhost:5000/api/products/${currentProduct.id}/stock`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stok: stokData }),
        });
      } else {
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
      kategori: product.kategori,
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
      kategori: "",
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
  };

  const filteredProducts = products.filter((p) =>
    p.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Kelola Produk</h1>
          <p className="text-gray-600 mt-1">Tambah, edit, atau hapus produk</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={20} />
          Tambah Produk
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
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
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.nama}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rp {product.harga.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stok}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition ${product.active
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                      >
                        {product.active ? "Active" : "Tidak Active"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md overflow-y-auto max-h-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editMode ? "Edit Produk" : "Tambah Produk Baru"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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

                <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                >
                  <option value="">Pilih Kategori</option>
                  {kategoriOptions.map((kat) => (
                    <option key={kat} value={kat}>
                      {kat}
                    </option>
                  ))}
                </select>
              </div>
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
    </div>
  );
};

export default AdminProducts;
