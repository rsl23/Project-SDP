import React, { useState, useEffect, useMemo } from "react";
import { getProducts } from "../apiService/productApi";
import "./Product.css";

const Product = () => {
    const kategori = ["Spion", "Shock", "Master Rem", "Lampu", "Filter Udara"];
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [quantities, setQuantities] = useState({});

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (err) {
                console.error("Gagal memuat produk:", err);
            }
        };
        fetchProducts();
    }, []);

    const handleQuantityChange = (id, value) => {
        const num = parseInt(value, 10);
        setQuantities((prev) => ({ ...prev, [id]: isNaN(num) ? 1 : num }));
    };

    const handleIncrement = (id) => {
        setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
    };

    const handleDecrement = (id) => {
        const current = quantities[id] || 1;
        if (current > 1)
            setQuantities((prev) => ({ ...prev, [id]: current - 1 }));
    };

    const filteredProducts = useMemo(() => {
        let result = products;
        if (selectedCategory !== "Semua") {
            result = result.filter((p) => p.kategori === selectedCategory);
        }
        if (searchTerm) {
            result = result.filter((p) =>
                p.nama.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return result;
    }, [products, searchTerm, selectedCategory]);

    const handleAddToCart = (product) => {
        const qty = quantities[product.id] || 1;
        console.log(`Menambahkan ${qty} x "${product.nama}" ke keranjang`);
    };

    return (
        <div className="product-container">
            <div className="filter-section">
                <input
                    type="text"
                    placeholder="Cari nama produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="Semua">Semua Kategori</option>
                    {kategori.map((k) => (
                        <option key={k} value={k}>{k}</option>
                    ))}
                </select>
            </div>

            <div className="product-grid">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => (
                        <div key={p.id} className="product-card">
                            <h4>{p.nama}</h4>
                            <span className="category-badge">{p.kategori}</span>
                            <p className="product-price">Rp {p.harga.toLocaleString("id-ID")}</p>
                            <p>Stok: {p.stok}</p>
                        </div>
                    ))
                ) : (
                    <p className="empty-state">Produk tidak ditemukan.</p>
                )}
            </div>
        </div>
    );
};

export default Product;
