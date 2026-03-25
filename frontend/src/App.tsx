import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AdminPage } from "./pages/AdminPage";
import { CartPage } from "./pages/CartPage";
import { CategoryPage } from "./pages/CategoryPage";
import { HistoryPage } from "./pages/HistoryPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { ReturnsPage } from "./pages/ReturnsPage";
import { AboutPage } from "./pages/AboutPage";
import { PrivacyPage } from "./pages/PrivacyPage";

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
        <Route path="about" element={<AboutPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
