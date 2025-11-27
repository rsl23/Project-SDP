// Footer Component - Footer sederhana dengan copyright dan kontak info
// Ditampilkan di semua public pages

const Footer = () => {
  return (
    <footer className="bg-black/80 text-gray-400 py-8 px-6 text-center max-w-[100vw]">
      {/* Copyright dengan dynamic year */}
      <p>&copy; {new Date().getFullYear()} BJM Parts. Semua hak dilindungi.</p>
      {/* Contact information */}
      <p className="mt-2">Kontak: info@bjmparts.com | Telp: 0812xxxxxxx</p>
    </footer>
  );
};

export default Footer;
