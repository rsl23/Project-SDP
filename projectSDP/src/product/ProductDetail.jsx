import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProducts } from "../apiService/productApi";
import { addToCart } from "../apiService/cartApi";
import tokopediaLogo from "../assets/tokopedia.jpeg";
import shopeeLogo from "../assets/shopee.png";
import toast, { Toaster } from "react-hot-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, 1);
      toast.success("Berhasil menambahkan ke keranjang!", {
        duration: 3000,
        position: "top-center",
      });
    } catch (error) {
      console.error("Gagal menambah ke keranjang:", error);

      if (error.message === "User belum login") {
        toast.error("Silakan login terlebih dahulu!");
        navigate("/login", { state: { from: location } });
      } else {
        toast.error("Gagal menambahkan ke keranjang!");
      }
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        const selected = data.find((p) => p.id.toString() === id);

        if (!selected) {
          navigate("/product");
          return;
        }

        setProduct(selected);

      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Gagal memuat data produk");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const getStockInfo = (stock) => {
    if (stock > 10) {
      return { color: "text-green-400", text: "Tersedia", badge: "bg-green-500" };
    } else if (stock > 0) {
      return { color: "text-yellow-400", text: "Hampir Habis", badge: "bg-yellow-500" };
    } else {
      return { color: "text-red-400", text: "Stok Habis", badge: "bg-red-500" };
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center text-white bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018]">
        Memuat produk...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full h-screen flex justify-center items-center text-white bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018]">
        Produk tidak ditemukan
      </div>
    );
  }

  const stockInfo = getStockInfo(product.stok);

  return (
    <div>
      <Toaster />
      <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] text-white">
        <button
          className="mb-6 px-5 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-md"
          onClick={() => navigate(-1)}
        >
          &larr; Kembali
        </button>

        <div className="flex flex-col md:flex-row gap-10 max-w-6xl mx-auto bg-white/10 backdrop-blur-lg rounded-xl p-6 md:p-10 shadow-xl">
          <div className="md:w-1/2 flex justify-center items-center">
            <img
              src={product.img_url}
              alt={product.nama}
              className="w-full h-96 object-cover rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
            />
          </div>

          <div className="md:w-1/2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-4xl font-bold">{product.nama}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockInfo.badge} text-white`}>
                  {stockInfo.text}
                </span>
              </div>

              <p className="text-2xl text-indigo-400 font-semibold mb-4">
                Rp {product.harga.toLocaleString("id-ID")}
              </p>

              <div className="mb-4">
                <p className="text-gray-200">
                  Stok: <span className={`font-medium ${stockInfo.color}`}>
                    {product.stok} unit
                  </span>
                </p>
              </div>

              <p className="mb-2 text-gray-200">
                Kategori:{" "}
                <span className="text-white font-medium">
                  {product.kategori}
                </span>
              </p>

              <hr className="my-4 border-gray-600" />

              <p className="text-gray-200 leading-relaxed">
                Deskripsi produk: <br />
                {product.deskripsi}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stok === 0}
                className={`w-full md:w-auto px-6 py-3 bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-medium rounded-lg shadow-lg transition-all ${product.stok === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:from-pink-600 hover:to-indigo-700"
                  }`}
              >
                {product.stok === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
              </button>

              <div className="flex gap-4 w-full">
                <a
                  href={product.link_tokopedia || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-1 justify-center items-center gap-2 px-6 py-3 bg-green-500 text-white font-medium rounded-lg shadow-lg transition-all ${!product.link_tokopedia || product.stok === 0
                    ? "opacity-50 cursor-not-allowed pointer-events-none"
                    : "hover:bg-green-600"
                    }`}
                  onClick={(e) => (!product.link_tokopedia || product.stok === 0) && e.preventDefault()}
                >
                  <img
                    src={tokopediaLogo}
                    alt="Tokopedia"
                    className="w-6 h-6 object-contain"
                  />
                  Pesan di Tokopedia
                </a>

                <a
                  href={product.link_shopee || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-1 justify-center items-center gap-2 px-6 py-3 bg-orange-600 text-white font-medium rounded-lg shadow-lg transition-all ${!product.link_shopee || product.stok === 0
                    ? "opacity-50 cursor-not-allowed pointer-events-none"
                    : "hover:bg-orange-700"
                    }`}
                  onClick={(e) => (!product.link_shopee || product.stok === 0) && e.preventDefault()}
                >
                  <img
                    src={shopeeLogo}
                    alt="Shopee"
                    className="w-6 h-6 object-contain"
                  />
                  Pesan di Shopee
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;