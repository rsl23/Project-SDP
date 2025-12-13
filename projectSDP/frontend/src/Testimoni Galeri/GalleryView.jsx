import React, { useState, useEffect, useMemo, useRef } from "react";
import { ArrowLeft, Search, Filter, Grid, List, ZoomIn, ChevronDown, X } from "lucide-react";
import { Link } from "react-router-dom";

const GalleryView = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedImage, setSelectedImage] = useState(null);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const sortDropdownRef = useRef(null);

  // Fetch gallery data dari API - hanya yang aktif
  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://backend-dot-storied-courier-479504-q5.et.r.appspot.com/api/gallery");

        if (response.ok) {
          const galleryData = await response.json();
          // Filter hanya gambar yang aktif
          const activeImages = galleryData.filter(image => image.active !== false);
          setGalleryImages(activeImages);
        }
      } catch (error) {
        console.error("Error fetching gallery data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryData();
  }, []);

  // Close dropdown ketika klik outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter dan sort images
  const filteredAndSortedImages = useMemo(() => {
    let result = galleryImages.filter(image =>
      image.alt_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort berdasarkan pilihan
    switch (sortBy) {
      case "newest":
        result = [...result].sort((a, b) =>
          new Date(b.createdAt?.toDate?.() || b.createdAt) -
          new Date(a.createdAt?.toDate?.() || a.createdAt)
        );
        break;
      case "oldest":
        result = [...result].sort((a, b) =>
          new Date(a.createdAt?.toDate?.() || a.createdAt) -
          new Date(b.createdAt?.toDate?.() || b.createdAt)
        );
        break;
      case "name":
        result = [...result].sort((a, b) =>
          (a.alt_text || "").localeCompare(b.alt_text || "")
        );
        break;
      default:
        break;
    }

    return result;
  }, [galleryImages, searchTerm, sortBy]);

  // Open image modal
  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  // Close image modal
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("newest");
  };

  // Get sort label
  const getSortLabel = () => {
    switch (sortBy) {
      case "newest": return "Terbaru";
      case "oldest": return "Terlama";
      case "name": return "Nama A-Z";
      default: return "Urutkan";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Memuat gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 px-4 py-8 relative">
      <div className="max-w-7xl mx-auto mb-8 relative z-30">
        <div className="flex items-center mb-8">
          {/* Tombol kiri */}
          <div className="flex-1">
            <Link
              to="/aboutus"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-violet-600/20 hover:bg-violet-600/30 px-4 py-2 rounded-lg"
            >
              <ArrowLeft size={20} />
              <span>Kembali ke About Us</span>
            </Link>
          </div>

          {/* Judul di tengah */}
          <div className="flex-1 text-center">
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Gallery Berkat Jaya Motor
            </h1>
            <p className="text-gray-300">Koleksi foto toko, produk, dan aktivitas kami</p>
          </div>

          {/* Spacer kanan agar tetap center */}
          <div className="flex-1"></div>
        </div>


        {/* Search and Filter Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20 relative z-40">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Box */}
            <div className="flex-1 w-full relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari gambar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition ${viewMode === "grid"
                  ? "bg-pink-500 text-white"
                  : "text-gray-400 hover:text-white"
                  }`}
                title="Grid View"
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition ${viewMode === "list"
                  ? "bg-pink-500 text-white"
                  : "text-gray-400 hover:text-white"
                  }`}
                title="List View"
              >
                <List size={20} />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative w-full lg:w-64" ref={sortDropdownRef}>
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white flex justify-between items-center hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Filter size={18} />
                  <span className="truncate">{getSortLabel()}</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${sortDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              <div className={`absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-white/10 rounded-xl shadow-2xl transition-all duration-300 z-[9999] ${sortDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                <div className="p-2">
                  <div
                    className="px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center justify-between"
                    onClick={() => {
                      setSortBy("newest");
                      setSortDropdownOpen(false);
                    }}
                  >
                    <span>Terbaru</span>
                    {sortBy === "newest" && (
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    )}
                  </div>
                  <div
                    className="px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center justify-between"
                    onClick={() => {
                      setSortBy("oldest");
                      setSortDropdownOpen(false);
                    }}
                  >
                    <span>Terlama</span>
                    {sortBy === "oldest" && (
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    )}
                  </div>
                  <div
                    className="px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center justify-between"
                    onClick={() => {
                      setSortBy("name");
                      setSortDropdownOpen(false);
                    }}
                  >
                    <span>Nama A-Z</span>
                    {sortBy === "name" && (
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || sortBy !== "newest") && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 hover:bg-red-500/30 transition-colors flex items-center gap-2"
              >
                <X size={18} />
                Reset
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-300">
              Menampilkan <span className="text-white font-semibold">{filteredAndSortedImages.length}</span> gambar
              {searchTerm && ` untuk "${searchTerm}"`}
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      {filteredAndSortedImages.length > 0 ? (
        <div className="max-w-7xl mx-auto relative z-10">
          {viewMode === "grid" ? (
            // Grid View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedImages.map((image) => (
                <div
                  key={image.id}
                  className="group bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 hover:border-pink-500/50 transition-all duration-500 hover:transform hover:scale-105 cursor-pointer"
                  onClick={() => openImageModal(image)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={image.image_url}
                      alt={image.alt_text}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x300/4f46e5/ffffff?text=Gambar+Tidak+Tersedia";
                      }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <ZoomIn size={32} className="text-white" />
                      </div>
                    </div>

                    {/* Date Badge */}
                    <div className="absolute top-3 right-3">
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-pink-400 transition-colors">
                      {image.alt_text || "Gambar Gallery"}
                    </h3>
                    {image.description && (
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {image.description}
                      </p>
                    )}
                  </div>

                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-pink-500/30 rounded-2xl transition-all duration-500 pointer-events-none" />
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
              {filteredAndSortedImages.map((image) => (
                <div
                  key={image.id}
                  className="flex items-center gap-4 p-4 border-b border-white/10 last:border-b-0 hover:bg-white/10 transition cursor-pointer group"
                  onClick={() => openImageModal(image)}
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden">
                    <img
                      src={image.image_url}
                      alt={image.alt_text}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/80x80/4f46e5/ffffff?text=Gambar+Tidak+Tersedia";
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate group-hover:text-pink-400 transition-colors">
                      {image.alt_text || "Gambar Gallery"}
                    </h3>
                    {image.description && (
                      <p className="text-sm text-gray-300 mt-1 line-clamp-1">
                        {image.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(image.createdAt?.toDate?.() || image.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    <button className="p-2 text-gray-400 hover:text-pink-400 transition">
                      <ZoomIn size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Empty State
        <div className="max-w-2xl mx-auto text-center py-16 relative z-10">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10">
            <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
              <Search size={40} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {searchTerm ? "Gambar Tidak Ditemukan" : "Belum Ada Gallery"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm
                ? `Tidak ada gambar yang sesuai dengan pencarian "${searchTerm}"`
                : "Gallery akan muncul setelah admin menambahkan gambar melalui dashboard."
              }
            </p>
            {searchTerm && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-xl hover:from-pink-600 hover:to-indigo-700 transition-all duration-300 font-medium"
              >
                Tampilkan Semua Gambar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl max-h-full bg-gray-800 rounded-2xl overflow-hidden border border-white/10">
            <div className="relative">
              {/* Image */}
              <img
                src={selectedImage.image_url}
                alt={selectedImage.alt_text}
                className="w-full h-auto max-h-[70vh] object-contain"
              />

              {/* Close Button */}
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition backdrop-blur-sm"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image Info */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">
                {selectedImage.alt_text || "Gambar Gallery"}
              </h3>
              {selectedImage.description && (
                <p className="text-gray-300 mb-4">{selectedImage.description}</p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>
                  Ditambahkan pada {new Date(selectedImage.createdAt?.toDate?.() || selectedImage.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryView;