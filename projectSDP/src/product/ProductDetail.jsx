import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getProducts } from "../apiService/productApi";
import { getCategories } from "../apiService/categoryApi";
import { addToCart } from "../apiService/cartApi";
import tokopediaLogo from "../assets/tokopedia.jpeg";
import shopeeLogo from "../assets/shopee.png";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, ShoppingCart, Package, Tag, ExternalLink, Star, Truck } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, 1);
      toast.success("Berhasil menambahkan ke keranjang!", {
        duration: 3000,
        position: "top-center",
        style: {
          background: '#1e1b4b',
          color: 'white',
          border: '1px solid #4f46e5'
        }
      });
    } catch (error) {
      console.error("Gagal menambah ke keranjang:", error);

      if (error.message === "User belum login") {
        toast.error("Silakan login terlebih dahulu!", {
          style: {
            background: '#7f1d1d',
            color: 'white',
            border: '1px solid #dc2626'
          }
        });
        navigate("/login", { state: { from: location } });
      } else {
        toast.error("Gagal menambahkan ke keranjang!", {
          style: {
            background: '#7f1d1d',
            color: 'white',
            border: '1px solid #dc2626'
          }
        });
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);

        const selected = productsData.find((p) => p.id.toString() === id);

        if (!selected) {
          navigate("/product");
          return;
        }

        setProduct(selected);
        setCategories(categoriesData);

      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Gagal memuat data produk", {
          style: {
            background: '#7f1d1d',
            color: 'white',
            border: '1px solid #dc2626'
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const getProductCategoryName = () => {
    if (!product) return "Tidak ada kategori";

    if (product.kategori_nama) return product.kategori_nama;
    if (product.kategori_id) {
      const category = categories.find(cat => cat.id === product.kategori_id);
      if (category) return category.nama;
    }
    if (product.kategori) return product.kategori;
    return "Tidak ada kategori";
  };

  const getStockInfo = (stock) => {
    if (stock > 10) {
      return {
        color: "text-green-400",
        text: "Tersedia",
        badge: "bg-green-500/20 border-green-500/50 text-green-300",
        icon: "🟢"
      };
    } else if (stock > 0) {
      return {
        color: "text-yellow-400",
        text: "Hampir Habis",
        badge: "bg-yellow-500/20 border-yellow-500/50 text-yellow-300",
        icon: "🟡"
      };
    } else {
      return {
        color: "text-red-400",
        text: "Stok Habis",
        badge: "bg-red-500/20 border-red-500/50 text-red-300",
        icon: "🔴"
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20">
          <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
            <Package className="text-white" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Produk Tidak Ditemukan</h2>
          <button
            onClick={() => navigate("/product")}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-xl hover:from-pink-600 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg"
          >
            Kembali ke Daftar Produk
          </button>
        </div>
      </div>
    );
  }

  const stockInfo = getStockInfo(product.stok);
  const categoryName = getProductCategoryName();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <Toaster />

      {/* Header */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all duration-300 shadow-lg"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Kembali</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Product Image */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className={`absolute inset-0 bg-gradient-to-br from-pink-500/20 to-indigo-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}></div>
              <div className="relative bg-white/5 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
                <img
                  src={product.img_url || "/placeholder-image.jpg"}
                  alt={product.nama}
                  className={`w-full max-w-md h-96 object-cover rounded-2xl transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} group-hover:scale-105`}
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => {
                    e.target.src = "/placeholder-image.jpg";
                    setImageLoaded(true);
                  }}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center space-y-8">

            {/* Header Section */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                  {product.nama}
                </h1>
                <div className={`px-4 py-2 rounded-full border ${stockInfo.badge} backdrop-blur-sm`}>
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {stockInfo.icon} {stockInfo.text}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
                  Rp {product.harga.toLocaleString("id-ID")}
                </p>
                <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                  <Star size={16} className="text-yellow-400 fill-current" />
                  <span className="text-yellow-300 text-sm font-medium">5.0</span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Package size={20} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Stok Tersedia</p>
                    <p className={`text-lg font-semibold ${stockInfo.color}`}>
                      {product.stok} unit
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500/20 rounded-lg">
                    <Tag size={20} className="text-pink-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Kategori</p>
                    <p className="text-white text-lg font-semibold">
                      {categoryName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span>📝</span> Deskripsi Produk
              </h3>
              {product.deskripsi ? (
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {product.deskripsi}
                </p>
              ) : (
                <p className="text-gray-400 italic">Tidak ada deskripsi untuk produk ini.</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stok === 0}
                className={`w-full group relative overflow-hidden px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 ${product.stok === 0
                    ? "bg-gray-600/50 cursor-not-allowed"
                    : "bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 hover:shadow-2xl hover:scale-105"
                  }`}
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <ShoppingCart size={24} className="relative z-10" />
                <span className="relative z-10">
                  {product.stok === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
                </span>
              </button>

              {/* E-commerce Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={product.link_tokopedia || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-medium transition-all duration-300 ${!product.link_tokopedia || product.stok === 0
                      ? "bg-gray-600/50 cursor-not-allowed opacity-50"
                      : "bg-green-600 hover:bg-green-700 hover:scale-105 hover:shadow-xl"
                    }`}
                  onClick={(e) => (!product.link_tokopedia || product.stok === 0) && e.preventDefault()}
                >
                  <img
                    src={tokopediaLogo}
                    alt="Tokopedia"
                    className="w-6 h-6 object-contain rounded"
                  />
                  <span>Tokopedia</span>
                  <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>

                <a
                  href={product.link_shopee || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-medium transition-all duration-300 ${!product.link_shopee || product.stok === 0
                      ? "bg-gray-600/50 cursor-not-allowed opacity-50"
                      : "bg-orange-600 hover:bg-orange-700 hover:scale-105 hover:shadow-xl"
                    }`}
                  onClick={(e) => (!product.link_shopee || product.stok === 0) && e.preventDefault()}
                >
                  <img
                    src={shopeeLogo}
                    alt="Shopee"
                    className="w-6 h-6 object-contain"
                  />
                  <span>Shopee</span>
                  <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>

              {/* Shipping Info */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <Truck size={20} className="text-indigo-400" />
                  <span className="text-sm">Gratis pengiriman untuk order di atas Rp 500.000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;