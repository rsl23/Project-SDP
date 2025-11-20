const Footer = () => {
  return (
    <footer className="bg-black/80 text-gray-400 py-8 px-6 text-center max-w-[100vw]">
        <p>&copy; {new Date().getFullYear()} BJM Parts. Semua hak dilindungi.</p>
        <p className="mt-2">Kontak: info@bjmparts.com | Telp: 0812xxxxxxx</p>
    </footer>
  )
}

export default Footer