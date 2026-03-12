import React from "react";
import { useDispatch } from "react-redux";
import { updateOrderStatus, deleteOrder } from "../../store/slices/orderSlice.js";

const OrdersTable = ({ orders }) => {
  const dispatch = useDispatch();

  const handleMarkShipped = (id) => {
    dispatch(updateOrderStatus({ id, status: "Shipped" }));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      dispatch(deleteOrder(id));
    }
  };

  const handleViewDetails = (id) => {
    // Implement modal or navigation logic here
    alert(`View details for order ${id}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Order ID</th>
            <th className="border px-4 py-2">User</th>
            <th className="border px-4 py-2">Total</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="text-center">
              <td className="border px-4 py-2">{order._id}</td>
              <td className="border px-4 py-2">{order.user?.name || "N/A"}</td>
              <td className="border px-4 py-2">${order.total.toFixed(2)}</td>
              <td className="border px-4 py-2">{order.status}</td>
              <td className="border px-4 py-2">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="flex justify-center gap-2 border px-4 py-2">
                <button
                  onClick={() => handleMarkShipped(order._id)}
                  className="rounded bg-green-500 px-2 py-1 text-white hover:bg-green-600"
                  disabled={order.status === "Shipped"}
                >
                  Mark Shipped
                </button>
                <button
                  onClick={() => handleViewDetails(order._id)}
                  className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(order._id)}
                  className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;