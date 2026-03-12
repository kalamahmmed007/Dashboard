// src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutAdmin } from "../../redux/slices/authSlice";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const dispatch = useDispatch();

  const handleLogout = () => dispatch(logoutAdmin());

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Products", path: "/products" },
    { name: "Orders", path: "/orders" },
    { name: "Hero", path: "/hero" },
    { name: "Categories", path: "/categories" },
    { name: "Users", path: "/users" },
    { name: "Special Offers", path: "/special-offers" },
    { name: "Flash Deals", path: "/flash-deals" },
    { name: "Reviews", path: "/reviews" },
    { name: "StockManagement", path: "/stock-management" },
    { name: "Returns & Refunds", path: "/returns" },
    { name: "CurierBooking", path: "/curier-booking" },
    { name: "Settings", path: "/settings" },
    
  ];

  return (
    <aside
      className={`flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white w-64 h-screen shadow-xl transition-transform duration-300 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      {/* Logo / Title */}
      <div className="border-b border-gray-700 p-6 text-center text-2xl font-bold tracking-wider">
        ROYEL <span className="text-red-500">ATTIRE</span>
      </div>

      {/* Menu Items */}
      <nav className="mt-6 flex flex-1 flex-col gap-1 px-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-gray-700 ${
                isActive ? "bg-gray-700 font-semibold shadow-inner" : ""
              }`
            }
            onClick={() => setSidebarOpen(false)}
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="border-t border-gray-700 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}