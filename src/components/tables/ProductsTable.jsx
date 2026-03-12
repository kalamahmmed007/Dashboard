import React from "react";
import { useDispatch } from "react-redux";
import {
  deleteProduct,
  toggleProductActive,
} from "../../store/slices/productSlice.js";

const ProductsTable = ({ products, onEdit }) => {
  const dispatch = useDispatch();

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(id));
    }
  };

  const handleToggleActive = (id, currentStatus) => {
    dispatch(toggleProductActive({ id, isActive: !currentStatus }));
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Price</th>
            <th className="border px-4 py-2">Active</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id} className="text-center">
              <td className="border px-4 py-2">{product._id}</td>
              <td className="border px-4 py-2">{product.name}</td>
              <td className="border px-4 py-2">${product.price.toFixed(2)}</td>
              <td className="border px-4 py-2">
                {product.isActive ? "Yes" : "No"}
              </td>
              <td className="flex justify-center gap-2 border px-4 py-2">
                <button
                  onClick={() => onEdit(product)}
                  className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(product._id, product.isActive)}
                  className={`px-2 py-1 rounded text-white ${
                    product.isActive
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {product.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
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

export default ProductsTable;