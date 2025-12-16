import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

const GalleryPage = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // State untuk custom popup
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({
    type: "success", // success, error, confirm
    title: "",
    message: "",
    onConfirm: null,
    showCancel: false,
  });

  // Form state
  const [formData, setFormData] = useState({
    alt_text: "",
    description: "",
  });

  // File state untuk upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Custom popup functions
  const showSuccessPopup = (message) => {
    setPopupData({
      type: "success",
      title: "Sukses",
      message: message,
      showCancel: false,
    });
    setShowPopup(true);
  };

  const showErrorPopup = (message) => {
    setPopupData({
      type: "error",
      title: "Error",
      message: message,
      showCancel: false,
    });
    setShowPopup(true);
  };

  const showConfirmPopup = (message, onConfirm) => {
    setPopupData({
      type: "confirm",
      title: "Konfirmasi",
      message: message,
      onConfirm: onConfirm,
      showCancel: true,
    });
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupData({
      type: "success",
      title: "",
      message: "",
      onConfirm: null,
      showCancel: false,
    });
  };

  // Fetch gallery data
  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://backend-dot-storied-courier-479504-q5.et.r.appspot.com/api/gallery"
      );

      if (response.ok) {
        const data = await response.json();
        setGalleryItems(data);
      } else {
        showErrorPopup("Gagal mengambil data gallery");
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
      showErrorPopup("Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Upload ke Cloudinary
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

  const handleAddGallery = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      showErrorPopup("Pilih gambar terlebih dahulu");
      return;
    }

    try {
      setUploading(true);

      const imageUrl = await uploadToCloudinary(selectedFile);

      if (!imageUrl) {
        showErrorPopup("Upload gambar gagal!");
        return;
      }

      const galleryData = {
        image_url: imageUrl,
        caption: formData.alt_text || "Gambar gallery",
        description: formData.description || "",
      };

      const response = await fetch(
        "https://backend-dot-storied-courier-479504-q5.et.r.appspot.com/api/gallery",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(galleryData),
        }
      );

      if (response.status === 201) {
        setShowAddModal(false);
        resetForm();
        fetchGallery();
        showSuccessPopup("Gambar berhasil ditambahkan!");
      } else {
        const errorText = await response.text();
        showErrorPopup(`Gagal menambah gambar: ${errorText}`);
      }
    } catch (error) {
      console.error("Error adding gallery item:", error);
      showErrorPopup("Gagal menambah gambar gallery");
    } finally {
      setUploading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      alt_text: "",
      description: "",
    });
    setSelectedFile(null);
    setImagePreview("");
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
  };

  // Delete gallery item - FIXED URL
  const handleDeleteGallery = async (id) => {
    showConfirmPopup(
      "Apakah Anda yakin ingin menghapus gambar ini?",
      async () => {
        try {
          const response = await fetch(
            `https://backend-dot-storied-courier-479504-q5.et.r.appspot.com/api/gallery/${id}`,
            {
              method: "DELETE",
            }
          );

          if (response.ok) {
            fetchGallery();
            showSuccessPopup("Gambar berhasil dihapus!");
          } else {
            showErrorPopup("Gagal menghapus gambar");
          }
        } catch (error) {
          console.error("Error deleting gallery item:", error);
          showErrorPopup("Gagal menghapus gambar gallery");
        }
      }
    );
  };

  // Toggle active status - FIXED URL
  const handleToggleActive = async (id, currentActive) => {
    try {
      // console.log(!currentActive);

      const response = await fetch(
        `https://backend-dot-storied-courier-479504-q5.et.r.appspot.com/api/gallery/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ active: !currentActive }),
        }
      );

      if (response.ok) {
        fetchGallery();
        showSuccessPopup(
          `Gambar berhasil ${!currentActive ? "diaktifkan" : "dinonaktifkan"}`
        );
      } else {
        showErrorPopup("Gagal mengupdate status gambar");
      }
    } catch (error) {
      console.error("Error updating gallery item:", error);
      showErrorPopup("Gagal mengupdate status gambar");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            Gallery Management
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2">
            Kelola gambar gallery untuk halaman About Us
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-3 md:px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition w-full sm:w-auto text-sm md:text-base"
        >
          <Plus size={18} />
          <span>Tambah Gambar</span>
        </button>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-8 md:py-12">
          <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm md:shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={item.image_url}
                  alt={item.alt_text}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x200/4f46e5/ffffff?text=Gambar+Tidak+Tersedia";
                  }}
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.active
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >
                    {item.active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 md:p-4">
                <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base">
                  {item.alt_text || "Tanpa judul"}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">
                  {item.description || "Tidak ada deskripsi"}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(item.id, item.active)}
                      className={`p-1.5 md:p-2 rounded-lg transition ${
                        item.active
                          ? "text-yellow-600 hover:bg-yellow-50 border border-yellow-200"
                          : "text-green-600 hover:bg-green-50 border border-green-200"
                      }`}
                      title={item.active ? "Nonaktifkan" : "Aktifkan"}
                    >
                      {item.active ? (
                        <EyeOff size={14} className="md:w-4 md:h-4" />
                      ) : (
                        <Eye size={14} className="md:w-4 md:h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteGallery(item.id)}
                      className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition border border-red-200"
                      title="Hapus"
                    >
                      <Trash2 size={14} className="md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && galleryItems.length === 0 && (
        <div className="text-center py-8 md:py-12 bg-white rounded-lg shadow-sm md:shadow border border-gray-200">
          <ImageIcon
            size={48}
            className="mx-auto text-gray-400 mb-3 md:mb-4 md:w-16 md:h-16"
          />
          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
            Tidak ada gambar gallery
          </h3>
          <p className="text-xs md:text-sm text-gray-600 mb-4 px-4">
            Belum ada gambar yang ditambahkan ke gallery
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm md:text-base"
          >
            Tambah Gambar Pertama
          </button>
        </div>
      )}

      {/* Add Gallery Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                Tambah Gambar Gallery
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 md:p-6">
              <form onSubmit={handleAddGallery} className="space-y-4">
                {/* Upload Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Gambar *
                  </label>
                  <div className="relative flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 cursor-pointer hover:border-indigo-400 transition bg-gray-50 h-32 md:h-40">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {imagePreview ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-24 md:max-h-32 max-w-full object-contain rounded"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500 pointer-events-none text-center">
                        <Upload
                          size={24}
                          className="mb-2 text-gray-400 md:w-8 md:h-8"
                        />
                        <p className="text-xs md:text-sm font-medium">
                          Klik untuk upload gambar
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG, JPEG
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Alt Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Gambar
                  </label>
                  <input
                    type="text"
                    value={formData.alt_text}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        alt_text: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Interior toko Berkat Jaya Motor"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 transition text-sm md:text-base"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi (Opsional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Deskripsi singkat tentang gambar..."
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 resize-none transition text-sm md:text-base"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-medium text-sm md:text-base"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="text-xs md:text-sm">Uploading...</span>
                      </div>
                    ) : (
                      "Simpan"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Custom Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-4 md:p-6 transform transition-all">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div
                className={`p-1.5 md:p-2 rounded-full ${
                  popupData.type === "success"
                    ? "bg-green-100 text-green-600"
                    : popupData.type === "error"
                    ? "bg-red-100 text-red-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {popupData.type === "success" ? (
                  <CheckCircle size={20} className="md:w-6 md:h-6" />
                ) : popupData.type === "error" ? (
                  <AlertCircle size={20} className="md:w-6 md:h-6" />
                ) : (
                  <AlertCircle size={20} className="md:w-6 md:h-6" />
                )}
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                {popupData.title}
              </h3>
            </div>

            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
              {popupData.message}
            </p>

            <div
              className={`flex gap-3 ${
                popupData.showCancel ? "justify-between" : "justify-end"
              }`}
            >
              {popupData.showCancel && (
                <button
                  onClick={closePopup}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-medium text-sm md:text-base"
                >
                  Batal
                </button>
              )}
              <button
                onClick={() => {
                  if (popupData.onConfirm) {
                    popupData.onConfirm();
                  }
                  closePopup();
                }}
                className={`flex-1 py-2 rounded-lg transition font-medium text-sm md:text-base ${
                  popupData.type === "success"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : popupData.type === "error"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {popupData.type === "confirm" ? "Ya" : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
