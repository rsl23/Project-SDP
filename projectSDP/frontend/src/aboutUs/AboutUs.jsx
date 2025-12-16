import { Link } from "react-router-dom";
import { Clock, Package, Truck, Phone } from "lucide-react";
import { useState, useEffect } from "react";

// Import semua assets images
import fotoToko from "../assets/foto_toko.png";
import whatsappIcon from "../assets/whatsapp.png";
import tokopediaIcon from "../assets/tokopedia.jpeg";
import shopeeIcon from "../assets/shopee.png";
import instagramIcon from "../assets/instagram.svg";
import tiktokIcon from "../assets/tiktokLogo.png";
import lazadaIcon from "../assets/lazadapng.png";

const AboutUs = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch gallery images dari API saat component mount
  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setLoading(true);
        // Fetch dari Express server gallery endpoint
        const galleryResponse = await fetch(
          "https://backend-dot-storied-courier-479504-q5.et.r.appspot.com/api/gallery"
        );

        if (galleryResponse.ok) {
          const galleryData = await galleryResponse.json();
          // Filter hanya gambar yang aktif untuk ditampilkan
          const activeImages = galleryData.filter(
            (image) => image.active !== false
          );
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
      {/* Hero Section */}
      <div className="relative h-48 sm:h-64 md:h-96 overflow-hidden">
        <img
          src={fotoToko}
          alt="Berkat Jaya Motor Store"
          className="w-full h-full object-cover opacity-40"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-950/80 flex items-center justify-center flex-col space-y-1 sm:space-y-2 md:space-y-4 p-3 sm:p-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white text-center px-2">
              Berkat Jaya Motor Sby
            </h1>
          </div>
          <div className="font-semibold text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-center space-y-1">
            <p className="leading-relaxed text-[10px] xs:text-xs sm:text-sm md:text-base">
              BJM 1 : Jl. Bulak Setro 1B-1 No.15, Bulak, Surabaya
            </p>
            <p className="leading-relaxed text-[10px] xs:text-xs sm:text-sm md:text-base">
              Telp : 0813-3377-7968
            </p>
          </div>
          <div className="font-semibold text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-center space-y-1">
            <p className="leading-relaxed text-[10px] xs:text-xs sm:text-sm md:text-base">
              BJM 2 : Jl. Raya Panjang Jiwo Permai Blok 1B No. 15, Surabaya
            </p>
            <p className="leading-relaxed text-[10px] xs:text-xs sm:text-sm md:text-base">
              Telp : 0812-3396-5551
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16">
        {/* Tentang Kami Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg sm:shadow-xl md:shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12 mb-6 sm:mb-8 border-t-4 border-pink-500">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
            Tentang Kami
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6 text-center max-w-3xl mx-auto">
            Berkat Jaya Motor Sby adalah{" "}
            <span className="font-bold text-purple-600">
              Supplier & Distributor aksesoris kendaraan terbesar dan termurah
              di Surabaya.
            </span>{" "}
            Kami telah melayani ribuan pelanggan dengan menyediakan produk
            berkualitas tinggi dan layanan terbaik.
          </p>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed text-center max-w-3xl mx-auto">
            Menjual berbagai macam variasi & aksesoris kendaraan, seperti velg,
            shock, spion, lampu LED, lampu alis dan berbagai macam variasi
            kendaraan lainnya.
          </p>

          {/* Info Cards */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8 md:mt-10">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 text-center border-2 border-purple-200 w-full max-w-xs mx-auto sm:mx-0 sm:w-56 md:w-64 lg:w-80">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 shadow-lg">
                <Phone className="text-white w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">
                Chat
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                Setiap hari
                <br />
                jam 08.00 - 21.00
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 text-center border-2 border-purple-200 w-full max-w-xs mx-auto sm:mx-0 sm:w-56 md:w-64 lg:w-80">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 shadow-lg">
                <Clock className="text-white w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">
                Order
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                24 jam / hari
              </p>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg sm:shadow-xl md:shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12 mb-6 sm:mb-8 border-t-4 border-purple-500">
          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center">
            Gallery Kami
          </h3>
          <p className="text-gray-600 text-center mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
            Lihat langsung suasana toko, produk berkualitas, dan aktivitas tim
            kami yang siap melayani kebutuhan aksesoris kendaraan Anda
          </p>

          {/* Gallery Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : galleryImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {galleryImages.slice(0, 6).map((image) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl shadow-md hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 bg-white"
                >
                  <img
                    src={image.image_url}
                    alt={image.alt_text}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300x200/4f46e5/ffffff?text=Gambar+Tidak+Tersedia";
                    }}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-2 sm:p-3 md:p-4 text-white w-full">
                      <p className="font-semibold text-sm sm:text-base md:text-lg">
                        {image.alt_text}
                      </p>
                      {image.description && (
                        <p className="text-xs sm:text-sm mt-1 sm:mt-2 opacity-90 line-clamp-1 sm:line-clamp-2">
                          {image.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 text-base sm:text-lg md:text-xl mb-2 sm:mb-4">
                📸 Belum ada gambar gallery
              </div>
              <div className="text-gray-500 max-w-md mx-auto text-sm sm:text-base">
                Gallery akan muncul setelah admin menambahkan gambar melalui
                dashboard.
              </div>
            </div>
          )}

          {/* View More Button */}
          {galleryImages.length > 0 && (
            <div className="text-center mt-6 sm:mt-8">
              <div className="text-xs sm:text-sm text-gray-500 mb-2">
                Menampilkan {Math.min(galleryImages.length, 6)} dari{" "}
                {galleryImages.length} gambar
              </div>
              <Link to="/gallery">
                <button className="px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl sm:rounded-2xl font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all text-sm sm:text-base md:text-lg">
                  Lihat selengkapnya
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg sm:shadow-xl md:shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12 mb-6 sm:mb-8 border-t-4 border-purple-500">
          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center">
            Hubungi Kami
          </h3>
          <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:flex lg:flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            <a
              href="https://wa.me/6281333777968"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 hover:scale-105 active:scale-95 transition-transform shadow-md hover:shadow-lg border-2 border-purple-200 flex items-center justify-center"
              aria-label="WhatsApp"
            >
              <img
                src={whatsappIcon}
                alt="WhatsApp"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 object-contain"
              />
            </a>
            <a
              href="https://tokopedia.link/aBNmS4svbXb"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 hover:scale-105 active:scale-95 transition-transform shadow-md hover:shadow-lg border-2 border-purple-200 flex items-center justify-center"
              aria-label="Tokopedia"
            >
              <img
                src={tokopediaIcon}
                alt="Tokopedia"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 object-contain"
              />
            </a>
            <a
              href="https://shopee.co.id/berkatjayamotor777?is_from_login=true"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 hover:scale-105 active:scale-95 transition-transform shadow-md hover:shadow-lg border-2 border-purple-200 flex items-center justify-center"
              aria-label="Shopee"
            >
              <img
                src={shopeeIcon}
                alt="Shopee"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 object-contain"
              />
            </a>
            <a
              href="https://www.lazada.co.id/shop/berkat-jaya-motor-surabaya-1586404555/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 hover:scale-105 active:scale-95 transition-transform shadow-md hover:shadow-lg border-2 border-purple-200 flex items-center justify-center"
              aria-label="Lazada"
            >
              <img
                src={lazadaIcon}
                alt="Lazada"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 object-contain"
              />
            </a>
            <a
              href="https://www.instagram.com/bjm_sby/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 hover:scale-105 active:scale-95 transition-transform shadow-md hover:shadow-lg border-2 border-purple-200 flex items-center justify-center"
              aria-label="Instagram"
            >
              <img
                src={instagramIcon}
                alt="Instagram"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 object-contain"
              />
            </a>
            <a
              href="https://www.tiktok.com/@berkatjayamotorofficial?_r=1&_t=ZS-91rXtB7Qqyz"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 hover:scale-105 active:scale-95 transition-transform shadow-md hover:shadow-lg border-2 border-purple-200 flex items-center justify-center"
              aria-label="TikTok"
            >
              <img
                src={tiktokIcon}
                alt="TikTok"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 object-contain"
              />
            </a>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg sm:shadow-xl md:shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12 text-center border-t-4 border-pink-500">
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
            <Package className="text-white w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10" />
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">
            Siap memperbarui kendaraan Anda?
          </h3>
          <p className="text-gray-600 mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
            Temukan berbagai aksesoris dan variasi motor terlengkap dengan
            kualitas terbaik
          </p>
          <Link to="/product">
            <button className="px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl sm:rounded-2xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all text-sm sm:text-base md:text-lg">
              Jelajahi Produk
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
