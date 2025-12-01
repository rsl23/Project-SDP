// Footer Component - Footer sederhana dengan copyright dan kontak info
// Ditampilkan di semua public pages dengan social media links

import whatsappIcon from "../assets/whatsapp.png";
import tokopediaIcon from "../assets/tokopedia.jpeg";
import shopeeIcon from "../assets/shopee.png";
import instagramIcon from "../assets/instagram.svg";
import tiktokIcon from "../assets/tiktokLogo.png";
import lazadaIcon from "../assets/lazadaLogo.webp";

const Footer = () => {
  return (
    <footer className="bg-black/80 text-gray-400 py-8 px-6 max-w-[100vw]">
      <div className="max-w-6xl mx-auto">
        {/* Copyright dengan dynamic year */}
        <p className="text-center mb-4">
          &copy; {new Date().getFullYear()} BJM Parts. Semua hak dilindungi.
        </p>

        {/* Contact information */}
        <p className="text-center mb-4">Telp: 081233965551 | 081333777968</p>

        {/* Social Media Icons - Grid layout untuk rapi */}
        <div className="flex justify-center items-center gap-2 flex-wrap">
          <a
            href="https://wa.me/6281333777968"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded p-1.5 hover:scale-110 transition-transform shadow-sm border border-purple-200"
            aria-label="WhatsApp"
          >
            <img
              src={whatsappIcon}
              alt="WhatsApp"
              className="w-6 h-6 object-contain"
            />
          </a>

          <a
            href="https://tokopedia.link/aBNmS4svbXb"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded p-1.5 hover:scale-110 transition-transform shadow-sm border border-purple-200"
            aria-label="Tokopedia"
          >
            <img
              src={tokopediaIcon}
              alt="Tokopedia"
              className="w-6 h-6 object-contain"
            />
          </a>

          <a
            href="https://shopee.co.id/berkatjayamotor777?is_from_login=true"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded p-1.5 hover:scale-110 transition-transform shadow-sm border border-purple-200"
            aria-label="Shopee"
          >
            <img
              src={shopeeIcon}
              alt="Shopee"
              className="w-6 h-6 object-contain"
            />
          </a>

          <a
            href="https://www.lazada.co.id/shop/berkat-jaya-motor-surabaya-1586404555/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded p-1.5 hover:scale-110 transition-transform shadow-sm border border-purple-200"
            aria-label="Lazada"
          >
            <img
              src={lazadaIcon}
              alt="Lazada"
              className="w-6 h-6 object-contain"
            />
          </a>

          <a
            href="https://www.instagram.com/bjm_sby/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded p-1.5 hover:scale-110 transition-transform shadow-sm border border-purple-200"
            aria-label="Instagram"
          >
            <img
              src={instagramIcon}
              alt="Instagram"
              className="w-6 h-6 object-contain"
            />
          </a>

          <a
            href="https://www.tiktok.com/@berkatjayamotorofficial?_r=1&_t=ZS-91rXtB7Qqyz"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded p-1.5 hover:scale-110 transition-transform shadow-sm border border-purple-200"
            aria-label="TikTok"
          >
            <img
              src={tiktokIcon}
              alt="TikTok"
              className="w-6 h-6 object-contain"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
