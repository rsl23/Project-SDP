// Entry point aplikasi React - file pertama yang dijalankan
// File ini bertanggung jawab untuk merender root component ke DOM

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Import global styles (Tailwind CSS)
import App from "./App.jsx";

// Render aplikasi React ke element dengan id 'root' di index.html
// StrictMode: mode development untuk mendeteksi potential problems
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
