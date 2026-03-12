import React from "react";
import { useDispatch } from "react-redux";
import { deleteUser, toggleUserActive } from "../../store/slices/userSlice.js";

const UsersTable = ({ users }) => {
  const dispatch = useDispatch();

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser(id));
    }
  };

  const handleToggleActive = (id, isActive) => {
    dispatch(toggleUserActive({ id, isActive: !isActive }));
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Active</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="text-center">
              <td className="border px-4 py-2">{user._id}</td>
              <td className="border px-4 py-2">{user.name}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.isActive ? "Yes" : "No"}</td>
              <td className="flex justify-center gap-2 border px-4 py-2">
                <button
                  onClick={() => handleToggleActive(user._id, user.isActive)}
                  className={`px-2 py-1 rounded text-white ${
                    user.isActive
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {user.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDelete(user._id)}
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

export default UsersTable;