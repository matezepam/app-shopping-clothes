import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { AdminPage } from "./pages/admin/AdminPage";
import { CartPage } from "./pages/shop/CartPage";
import { CategoryPage } from "./pages/shop/CategoryPage";
import { HistoryPage } from "./pages/info/HistoryPage";
import { HomePage } from "./pages/shop/HomePage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ReturnsPage } from "./pages/info/ReturnsPage";
import { AboutPage } from "./pages/info/AboutPage";
import { PrivacyPage } from "./pages/info/PrivacyPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="category/:category" element={<CategoryPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="returns" element={<ReturnsPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
