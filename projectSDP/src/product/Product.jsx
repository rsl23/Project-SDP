import React, { useState, useMemo } from 'react';
import './Product.css';

const Product = () => {
    // Data statis untuk kategori dan produk
    const kategori = ["Spion", "Shock", "Master Rem", "Lampu", "Filter Udara"];
    const products = [
        { id: 1, nama: "Spion Motor Kanan", kategori: "Spion", harga: 75000, stok: 10 },
        { id: 2, nama: "Shockbreaker Belakang", kategori: "Shock", harga: 300000, stok: 5 },
        { id: 3, nama: "Master Rem Depan", kategori: "Master Rem", harga: 250000, stok: 8 },
        { id: 4, nama: "Lampu Depan LED", kategori: "Lampu", harga: 200000, stok: 15 },
        { id: 5, nama: "Filter Udara Racing", kategori: "Filter Udara", harga: 100000, stok: 20 },
        { id: 6, nama: "Spion Motor Kiri", kategori: "Spion", harga: 75000, stok: 12 },
        { id: 7, nama: "Shockbreaker Depan", kategori: "Shock", harga: 450000, stok: 3 },
    ];

    // State untuk filter & search
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    
    // State baru untuk menyimpan kuantitas setiap produk
    // Strukturnya: { productId: quantity }, contoh: { 1: 2, 3: 1 }
    const [quantities, setQuantities] = useState({});

    // --- FUNGSI BARU UNTUK MENGELOLA KUANTITAS ---

    // Fungsi untuk mengubah kuantitas saat input angka diubah manual
    const handleQuantityChange = (productId, value) => {
        // Mengonversi nilai input menjadi angka
        const numValue = parseInt(value, 10);
        // Memastikan nilai tidak kurang dari 1 dan merupakan angka
        const newQuantity = !isNaN(numValue) && numValue > 0 ? numValue : 1;

        setQuantities(prevQuantities => ({
            ...prevQuantities,
            [productId]: newQuantity
        }));
    };

    // Fungsi untuk menambah kuantitas (tombol +)
    const handleIncrement = (productId) => {
        setQuantities(prevQuantities => ({
            ...prevQuantities,
            // Jika produk belum ada di state, mulai dari 1, lalu tambah 1
            [productId]: (prevQuantities[productId] || 1) + 1
        }));
    };

    // Fungsi untuk mengurangi kuantitas (tombol -)
    const handleDecrement = (productId) => {
        // Ambil kuantitas saat ini, atau default ke 1
        const currentQuantity = quantities[productId] || 1;
        // Pastikan kuantitas tidak kurang dari 1
        if (currentQuantity > 1) {
            setQuantities(prevQuantities => ({
                ...prevQuantities,
                [productId]: currentQuantity - 1
            }));
        }
    };

    // --- FUNGSI LAINNYA ---

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    const filteredProducts = useMemo(() => {
        let result = products;
        if (selectedCategory !== 'Semua') {
            result = result.filter(product => product.kategori === selectedCategory);
        }
        if (searchTerm) {
            result = result.filter(product =>
                product.nama.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return result;
    }, [products, searchTerm, selectedCategory]);

    // Fungsi add to cart sekarang menggunakan kuantitas dari state
    const handleAddToCart = (product) => {
        const quantityToAdd = quantities[product.id] || 1;
        console.log(`Menambahkan: ${quantityToAdd} x "${product.nama}" ke keranjang.`);
    };

    return (
        <div className="product-container">
            <div className="filter-section">
                <input
                    type="text"
                    placeholder="Cari nama produk..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                >
                    <option value="Semua">Semua Kategori</option>
                    {kategori.map((item) => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                </select>
            </div>

            <div className="product-grid">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((item) => (
                        <div key={item.id} className="product-card">
                            <h4>{item.nama}</h4>
                            <span className="category-badge">{item.kategori}</span>
                            <p className="product-price">Rp {item.harga.toLocaleString('id-ID')}</p>
                            <p>Stok: {item.stok} unit</p>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <p>Produk tidak ditemukan.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Product;