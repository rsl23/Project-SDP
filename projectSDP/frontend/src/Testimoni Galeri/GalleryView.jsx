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
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  // Close image modal
  const closeImageModal = () => {
    setSelectedImage(null);
    // Restore body scroll
    document.body.style.overflow = 'auto';
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-sm sm:text-lg">Memuat gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 px-3 sm:px-4 py-6 sm:py-8 relative">
      {/* Mobile Header */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/aboutus"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-violet-600/20 hover:bg-violet-600/30 px-3 py-2 rounded-lg text-sm"
          >
            <ArrowLeft size={16} />
            <span className="hidden xs:inline">Kembali</span>
          </Link>
          <h1 className="text-lg sm:text-xl font-bold text-white text-center flex-1 mx-2">
            Gallery
          </h1>
          <div className="w-10"></div> {/* Spacer untuk balance */}
        </div>
        <p className="text-center text-gray-300 text-sm">Koleksi foto toko, produk, dan aktivitas kami</p>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block max-w-7xl mx-auto mb-6 sm:mb-8">
        <div className="flex items-center mb-6 sm:mb-8">
          {/* Tombol kiri */}
          <div className="flex-1">
            <Link
              to="/aboutus"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-violet-600/20 hover:bg-violet-600/30 px-4 py-2 rounded-lg text-sm sm:text-base"
            >
              <ArrowLeft size={18} />
              <span>Kembali ke About Us</span>
            </Link>
          </div>

          {/* Judul di tengah */}
          <div className="flex-1 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Gallery Berkat Jaya Motor
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">Koleksi foto toko, produk, dan aktivitas kami</p>
          </div>

          {/* Spacer kanan */}
          <div className="flex-1"></div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto relative z-50">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-white/20">
          {/* Search Box - Full width di mobile */}
          <div className="mb-4 sm:mb-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Cari gambar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* View Mode Toggle - Mobile compact */}
            <div className="flex items-center justify-between sm:justify-start">
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 sm:p-2 rounded transition ${viewMode === "grid"
                    ? "bg-pink-500 text-white"
                    : "text-gray-400 hover:text-white"
                    }`}
                  title="Grid View"
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 sm:p-2 rounded transition ${viewMode === "list"
                    ? "bg-pink-500 text-white"
                    : "text-gray-400 hover:text-white"
                    }`}
                  title="List View"
                >
                  <List size={18} />
                </button>
              </div>

              {/* Clear Filters Button - Mobile */}
              {(searchTerm || sortBy !== "newest") && (
                <button
                  onClick={clearFilters}
                  className="sm:hidden px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-colors flex items-center gap-1 text-sm"
                >
                  <X size={14} />
                  Reset
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative w-full sm:w-48" ref={sortDropdownRef}>
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white flex justify-between items-center hover:bg-white/10 transition-colors text-sm sm:text-base relative z-50"
              >
                <div className="flex items-center gap-2">
                  <Filter size={16} />
                  <span className="truncate">{getSortLabel()}</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${sortDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              <div className={`absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-gray-800 border border-white/10 rounded-lg sm:rounded-xl shadow-2xl transition-all duration-300 z-[9999] ${sortDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                <div className="p-1 sm:p-2">
                  <div
                    className="px-3 py-2 rounded hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center justify-between text-sm sm:text-base"
                    onClick={() => {
                      setSortBy("newest");
                      setSortDropdownOpen(false);
                    }}
                  >
                    <span>Terbaru</span>
                    {sortBy === "newest" && (
                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                    )}
                  </div>
                  <div
                    className="px-3 py-2 rounded hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center justify-between text-sm sm:text-base"
                    onClick={() => {
                      setSortBy("oldest");
                      setSortDropdownOpen(false);
                    }}
                  >
                    <span>Terlama</span>
                    {sortBy === "oldest" && (
                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                    )}
                  </div>
                  <div
                    className="px-3 py-2 rounded hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center justify-between text-sm sm:text-base"
                    onClick={() => {
                      setSortBy("name");
                      setSortDropdownOpen(false);
                    }}
                  >
                    <span>Nama A-Z</span>
                    {sortBy === "name" && (
                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Clear Filters Button - Desktop */}
            {(searchTerm || sortBy !== "newest") && (
              <button
                onClick={clearFilters}
                className="hidden sm:flex px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 hover:bg-red-500/30 transition-colors items-center gap-2"
              >
                <X size={16} />
                Reset
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-3 sm:mt-4">
            <p className="text-xs sm:text-sm text-gray-300">
              Menampilkan <span className="text-white font-semibold">{filteredAndSortedImages.length}</span> gambar
              {searchTerm && ` untuk "${searchTerm}"`}
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      {filteredAndSortedImages.length > 0 ? (
        <div className="max-w-7xl mx-auto px-1 sm:px-0 relative z-0">
          {viewMode === "grid" ? (
            // Grid View - Responsive columns
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {filteredAndSortedImages.map((image) => (
                <div
                  key={image.id}
                  className="group bg-white/5 backdrop-blur-sm sm:backdrop-blur-lg rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 hover:border-pink-500/50 transition-all duration-300 cursor-pointer relative z-0"
                  onClick={() => openImageModal(image)}
                >
                  <div className="relative overflow-hidden aspect-square">
                    <img
                      src={image.image_url}
                      alt={image.alt_text}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x400/4f46e5/ffffff?text=Image";
                      }}
                      loading="lazy"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <ZoomIn size={20} className="text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-2 sm:p-3 md:p-4">
                    <h3 className="font-medium text-white text-xs sm:text-sm md:text-base line-clamp-2 group-hover:text-pink-300 transition-colors mb-1">
                      {image.alt_text || "Gambar Gallery"}
                    </h3>
                    {image.description && (
                      <p className="text-xs text-gray-300 line-clamp-1 sm:line-clamp-2">
                        {image.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View - Responsive
            <div className="bg-white/5 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden relative z-0">
              {filteredAndSortedImages.map((image) => (
                <div
                  key={image.id}
                  className="flex items-center gap-3 p-3 sm:p-4 border-b border-white/10 last:border-b-0 hover:bg-white/10 transition cursor-pointer group relative z-0"
                  onClick={() => openImageModal(image)}
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden">
                    <img
                      src={image.image_url}
                      alt={image.alt_text}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/80x80/4f46e5/ffffff?text=Image";
                      }}
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate text-sm sm:text-base group-hover:text-pink-300 transition-colors">
                      {image.alt_text || "Gambar Gallery"}
                    </h3>
                    {image.description && (
                      <p className="text-xs text-gray-300 mt-1 line-clamp-1 sm:line-clamp-2">
                        {image.description}
                      </p>
                    )}
                    <div className="mt-1">
                      <span className="text-xs text-gray-400">
                        {new Date(image.createdAt?.toDate?.() || image.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    <button className="p-1 sm:p-2 text-gray-400 hover:text-pink-300 transition">
                      <ZoomIn size={16} className="sm:size-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Empty State - Responsive
        <div className="max-w-2xl mx-auto text-center py-8 sm:py-12 md:py-16 px-4 relative z-0">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 border border-white/10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 bg-white/10 rounded-full flex items-center justify-center">
              <Search size={24} className="sm:size-8 md:size-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">
              {searchTerm ? "Gambar Tidak Ditemukan" : "Belum Ada Gallery"}
            </h3>
            <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6">
              {searchTerm
                ? `Tidak ada gambar yang sesuai dengan pencarian "${searchTerm}"`
                : "Gallery akan muncul setelah admin menambahkan gambar melalui dashboard."
              }
            </p>
            {searchTerm && (
              <button
                onClick={clearFilters}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-pink-600 hover:to-indigo-700 transition-all duration-300 font-medium text-sm sm:text-base"
              >
                Tampilkan Semua Gambar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Image Modal - Responsive */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center p-2 sm:p-4 z-[99999]"
          onClick={closeImageModal}
        >
          <div
            className="max-w-full max-h-full bg-gray-800 rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 w-full sm:w-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {/* Image */}
              <img
                src={selectedImage.image_url}
                alt={selectedImage.alt_text}
                className="w-full h-auto max-h-[60vh] sm:max-h-[70vh] object-contain"
              />

              {/* Close Button */}
              <button
                onClick={closeImageModal}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition backdrop-blur-sm"
              >
                <X size={16} className="sm:size-6" />
              </button>
            </div>

            {/* Image Info */}
            <div className="p-3 sm:p-4 md:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-2">
                {selectedImage.alt_text || "Gambar Gallery"}
              </h3>
              {selectedImage.description && (
                <p className="text-gray-300 text-sm sm:text-base mb-3 sm:mb-4">{selectedImage.description}</p>
              )}
              <div className="text-xs sm:text-sm text-gray-400">
                Ditambahkan pada {new Date(selectedImage.createdAt?.toDate?.() || selectedImage.createdAt).toLocaleDateString('id-ID')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryView;