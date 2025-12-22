# Project-SDP - Berkat Jaya Motor Surabaya



## **URL Aplikasi**

- Frontend: https://storied-courier-479504-q5.et.r.appspot.com



## **Fitur**

* Autentikasi Pengguna dengan Email dan Password (Login \& Register)
* Login menggunakan Google
* Forgot Password
* Katalog Produk (Product)
* Detail Produk
* Informasi Seputar Toko (About Us)
* Keranjang Belanja (Cart)
* Pemesanan (Order)
* Profile (Informasi, Ubah Password, Riwayat Pesanan)
* Managemen Produk (Tambah Kategori, Edit Kategori, Hapus Kategori, Tambah Produk, Edit Produk, Hapus Produk, Ubah Status Produk)
* Managemen Galeri (Tambah Galeri, Hapus Galeri, Aktif / Nonaktifkan Galeri)
* Managemen Order (Terima / Tolak Order)
* Managemen Review (Detail dan Hapus Review)
* Managemen Users (Managemen Admin, Hapus Akun)





## **Akun Dummy**

* Admin

- Email: rsl777.la@gmail.com

- Password: adminbaru

* User

- Email: zoomgreg225@gmail.com

- Password: 123456

Login juga dapat dilakukan menggunakan akun Google melalui Firebase Authentication.



## Cara Menggunakan Aplikasi**

1. Buka Aplikasi dengan URL Frontend
2. Register / Login menggunakan data Akun Dummy atau menggunakan akun Google
3. Untuk User:

* User bisa melihat Katalog Produk melalui tombol Product di Navbar / di Halaman Dashboard
* User dapat melakukan pencarian produk atau menggunakan fitur filter / sort untuk Katalog Produk
* Ketika user memilih salah satu produk maka akan diarahkan ke halaman Detail Produk
* Di halaman Detail Produk, user dapat melihat semua informasi terkait produk. User juga dapat memilih tombol "Tambahkan ke Keranjang", "Beli di Tokopedia", dan "Beli di Shopee". Jika menekan tombol "Tambahkan ke Keranjang" maka produk akan masuk ke dalam halaman Cart
* Di halaman Cart user dapat menambah Quantity, menghapus Cart dan melakukan Checkout
* User juga bisa melihat informasi seputar toko di halaman About Us seperti lokasi toko, nomor telepon, dn galeri yang menampilkan hasil atau aktivitas Toko BJM. Di halaman About Us terdapat tombol yang akan mengarahkan ke WhatsApp, Tokopedia, Shopee, Lazada, Instagram, dan TikTok dari toko BJM.
* User bisa melihat profil user di halaman Profile dengan menekan username atau foto profil user yang ada di Navbar paling kanan.
* User juga bisa logout dengan menekan tombol "Logout" yang ada di sebelah kanan tombol Profile
* Di halaman Profile, user dapat melihat semua informasi user. User juga dapat mengubah Password user. User dapat melihat Riwayat Pesanan user, serta memberikan review dari produk yang pernah dipesan di halaman Profile.

4. Untuk Admin:

* Setelah login dengan akun Admin maka user langsung diarahkan ke halaman Dashboard Admin.
* Di halaman Dashboard, admin dapat melihat informasi secara garis besar mengenai Website. Terdapat juga tombol "Ke Halaman Home" untuk admin pergi ke Halaman Home User.
* Jika menu burger ditekan maka akan muncul semua tombol menuju semua halaman yang ada di Admin.
* Di halaman Produk akan muncul semua produk yang ada di website. Admin dapat mengelola produk dengan Kelola Kategori, Tambah Produk, Set Status Produk, Update Produk dan Delete Produk.
* Di halaman Gallery, admin dapat menambahkan gambar dengan menekan tombol "Tambah Gambar", admin juga dapat mengaktifkan atau menon-aktifkan gambar, dan menghapus gambar.
* Di halaman Orders, admin dapat memantau order dengan memanfaatkan fitur pencarian atau filter berdasarkan status order. Admin juga dapat menerima atau menolak order dari user.
* Di halaman Reviews, admin dapat melihat semua review dari user dan mengelolanya dengan fitur pencarian, filter berdasarkan produk atau rating. Admin juga dapat melihat detail Review user dan menghapusnya.
* Di halaman Users, admin dapat memantau informasi user yang ter-registrasi di website. Admin juga dapat membuat user menjadi admin, dan menghapus akun milik user.  



## Menjalankan Website Secara Lokal**

* Backend

cd backend

npm install

npm run dev

* Frontend

cd frontend

npm install

npm run dev





###### **## Tim Pembuat**

* Nama: Rafael Jove Wicaksono

NRP: 223117102



* Nama: Raoul Stanley Kho

NRP: 223117103



* Nama: Richard Gunawan

NRP: 223117104

