// src/routes/AdminRoutes.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAdminProfile } from "../redux/slices/authSlice";
import ProtectedRoute from "../components/common/ProtectedRoute";

// Layout
import AdminLayout from "../components/layout/AdminLayout";

// Pages
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard";
import ProductsPage from "../pages/products/ProductsPage";
import OrdersPage from "../pages/orders/OrdersPage";
import CategoriesPage from "../pages/categories/CategoriesPage";
import UsersPage from "../pages/users/UsersPage";
import SpecialOffersPage from "../pages/SpecialOffersPage";
import FlashDealsPage from "../pages/FlashDealsPage";
import ReviewsPage from "../pages/ReviewsPage";
import SettingsPage from "../pages/SettingsPage";
import AdminHero from "../pages/hero/HeroPage";
import StockManagement from "../pages/StockManagement/StockManagement";
import CurierBooking from "../pages/CurierBooking/CurierBooking";
import Returns from "../pages/Returns/ReturnRefundPage";

export default function AdminRoutes() {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);

  // Fetch admin profile on app load if token exists
  useEffect(() => {
    if (token) dispatch(getAdminProfile());
  }, [token, dispatch]);

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="hero" element={<AdminHero />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="special-offers" element={<SpecialOffersPage />} />
        <Route path="flash-deals" element={<FlashDealsPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="stock-management" element={<StockManagement />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="curier-booking" element={<CurierBooking />} />
        <Route path="returns" element={<Returns />} />
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}