import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "./components/layout/Layout";
import { PageLoader } from "./components/common/PageLoader";
import { ScrollToTop } from "./components/common/ScrollToTop";

const AdminPage = lazy(() =>
  import("./pages/admin/AdminPage").then((module) => ({
    default: module.AdminPage,
  }))
);

const CartPage = lazy(() =>
  import("./pages/shop/CartPage").then((module) => ({
    default: module.CartPage,
  }))
);

const CategoryPage = lazy(() =>
  import("./pages/shop/CategoryPage").then((module) => ({
    default: module.CategoryPage,
  }))
);

const HistoryPage = lazy(() =>
  import("./pages/info/HistoryPage").then((module) => ({
    default: module.HistoryPage,
  }))
);

const HomePage = lazy(() =>
  import("./pages/shop/HomePage").then((module) => ({
    default: module.HomePage,
  }))
);

const LoginPage = lazy(() =>
  import("./pages/auth/LoginPage").then((module) => ({
    default: module.LoginPage,
  }))
);

const RegisterPage = lazy(() =>
  import("./pages/auth/RegisterPage").then((module) => ({
    default: module.RegisterPage,
  }))
);

const ForgotPasswordPage = lazy(() =>
  import("./pages/auth/ForgotPassword").then((module) => ({
    default: module.ForgotPasswordPage,
  }))
);

const ReturnsPage = lazy(() =>
  import("./pages/info/ReturnsPage").then((module) => ({
    default: module.ReturnsPage,
  }))
);

const AboutPage = lazy(() =>
  import("./pages/info/AboutPage").then((module) => ({
    default: module.AboutPage,
  }))
);

const PrivacyPage = lazy(() =>
  import("./pages/info/PrivacyPage").then((module) => ({
    default: module.PrivacyPage,
  }))
);

const CheckoutPage = lazy(() =>
  import("./pages/shop/CheckoutPage").then((module) => ({
    default: module.CheckoutPage,
  }))
);

export function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />

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

          <Route path="forgot-password" element={<ForgotPasswordPage />} />

          <Route path="about" element={<AboutPage />} />

          <Route path="privacy" element={<PrivacyPage />} />

          <Route path="checkout" element={<CheckoutPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}