// src/components/common/ProtectedRoute.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { token, loading, admin } = useSelector((state) => state.auth);

  if (loading) return null; // or <Spinner />
  if (!token || !admin) return <Navigate to="/login" replace />;

  return children ? children : <Outlet />;
};

export default ProtectedRoute;