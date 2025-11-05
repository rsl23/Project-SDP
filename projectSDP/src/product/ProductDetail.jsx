import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProducts } from "../apiService/productApi";
import { addToCart } from "../apiService/cartApi";
<<<<<<< Updated upstream
=======
import tokopediaLogo from "../assets/tokopedia.jpeg";
import shopeeLogo from "../assets/shopee.png"; // atau .jpeg, sesuai file Anda
import toast, { Toaster } from "react-hot-toast";
import { getAuth } from "firebase/auth";
>>>>>>> Stashed changes

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  const handleAddToCart = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      toast.error("Silakan login terlebih dahulu!", {
        duration: 2000,
        position: "top-center",
      });
      return;
    }

    try {
      await addToCart(product.id, 1);
<<<<<<< Updated upstream
=======
      toast.success("Berhasil menambahkan ke keranjang!", {
        duration: 2000,
        position: "top-center",
      });
>>>>>>> Stashed changes
    } catch (error) {
      console.error("Gagal menambah ke keranjang:", error);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProducts();
        const selected = data.find((p) => p.id.toString() === id);
        if (!selected) {
          navigate("/product");
        } else {
          setProduct(selected);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  if (!product) {
    return (
      <div className="w-full h-screen flex justify-center items-center text-white bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018]">
        Memuat produk...
      </div>
    );
  }

  return (
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

        {/* Product Info */}
        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.nama}</h1>
            <p className="text-2xl text-indigo-400 font-semibold mb-4">
              Rp {product.harga.toLocaleString("id-ID")}
            </p>
            <p className="mb-2 text-gray-200">
              Kategori:{" "}
              <span className="text-white font-medium">{product.kategori}</span>
            </p>
            <hr className="my-4 border-gray-600" />
            <p className="text-gray-200 leading-relaxed">
              Deskripsi produk: <br />
              {product.deskripsi}
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            className="mt-6 w-full md:w-auto px-6 py-3 bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:from-pink-600 hover:to-indigo-700 transition-all"
          >
            Tambah ke Keranjang
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
