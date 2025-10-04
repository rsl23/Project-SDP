import { Link } from 'react-router-dom';
import { Clock, Package, Truck, Phone } from 'lucide-react';

// 1. Semua gambar diimpor di sini
import fotoToko from '../assets/foto_toko.png';
import whatsappIcon from '../assets/whatsapp.jpg';
import tokopediaIcon from '../assets/tokopedia.jpeg';
import shopeeIcon from '../assets/shopee.png';
import instagramIcon from '../assets/instagram.svg';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
      {/* Hero Section dengan Gambar Toko */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img 
          src={fotoToko} // Path gambar sudah diperbaiki
          alt="Berkat Jaya Motor Store" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-950/80 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center px-4">
            Berkat Jaya Motor Sby
          </h1>
        </div>
      </div>

      {/* Deskripsi Toko */}
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border-t-4 border-pink-500">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
            Tentang Kami
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6 text-center max-w-3xl mx-auto">
            Berkat Jaya Motor Sby adalah <span className="font-bold text-purple-600">Supplier & Distributor aksesoris sepeda motor terbesar di Surabaya</span>
          </p>
          <p className="text-base text-gray-600 leading-relaxed text-center max-w-3xl mx-auto">
            Menjual berbagai macam variasi & aksesoris motor, seperti velg, shock, spion, lampu LED, lampu alis dan berbagai macam variasi motor lainnya.
          </p>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 text-center border-2 border-purple-200">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Phone className="text-white" size={28} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Chat</h3>
              <p className="text-gray-600 text-sm">Setiap hari<br/>jam 08.00 - 21.00</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 text-center border-2 border-purple-200">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Clock className="text-white" size={28} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Order</h3>
              <p className="text-gray-600 text-sm">24 jam / hari</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 text-center border-2 border-purple-200">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Truck className="text-white" size={28} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Pengiriman</h3>
              <p className="text-gray-600 text-sm">Senin - Sabtu</p>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border-t-4 border-purple-500">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            Hubungi Kami
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            <a 
              href="" 
              className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 hover:scale-110 transition-transform shadow-lg border-2 border-purple-200"
              aria-label="WhatsApp"
            >
              <img src={whatsappIcon} alt="WhatsApp" className="w-16 h-16 object-contain" />
            </a>
            <a 
              href="https://tokopedia.link/aBNmS4svbXb" 
              className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 hover:scale-110 transition-transform shadow-lg border-2 border-purple-200"
              aria-label="Tokopedia"
            >
              <img src={tokopediaIcon} alt="Tokopedia" className="w-16 h-16 object-contain" />
            </a>
            <a 
              href="https://shopee.co.id/berkatjayamotor777?is_from_login=true" 
              className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 hover:scale-110 transition-transform shadow-lg border-2 border-purple-200"
              aria-label="Shopee"
            >
              <img src={shopeeIcon} alt="Shopee" className="w-16 h-16 object-contain" />
            </a>
            <a 
              href="https://www.instagram.com/bjm_sby/?hl=en" 
              className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 hover:scale-110 transition-transform shadow-lg border-2 border-purple-200"
              aria-label="Instagram"
            >
              <img src={instagramIcon} alt="Instagram" className="w-16 h-16 object-contain" />
            </a>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center border-t-4 border-pink-500">
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Package className="text-white" size={40} />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
            Siap memperbarui kendaraan Anda?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Temukan berbagai aksesoris dan variasi motor terlengkap dengan kualitas terbaik
          </p>
          <Link to="/product">
            <button className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform text-lg">
              Jelajahi Produk
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;