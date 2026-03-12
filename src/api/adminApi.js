import API from "./api";

// dashboard stats
export const getStats = () => API.get("/admin/stats");

// orders filter
export const getOrders = (status) =>
  API.get(`/orders/admin${status ? `?status=${status}` : ""}`);

// users
export const getUsers = () => API.get("/admin/users");

// categories
export const getCategories = () => API.get("/categories");

// search products
export const getUsersPaginated = (page = 1, search = "") =>
  API.get(`/users/admin?page=${page}&search=${search}`);