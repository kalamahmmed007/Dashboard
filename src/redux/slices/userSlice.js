import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// ================= FETCH USERS =================
export const fetchUsers = createAsyncThunk(
  "users/fetch",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/users", { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ================= TOGGLE STATUS =================
export const toggleUserStatus = createAsyncThunk(
  "users/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admin/users/${id}/toggle-status`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ================= DELETE USER =================
export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/users/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ================= UPDATE PASSWORD =================
export const updateUserPassword = createAsyncThunk(
  "users/updatePassword",
  async ({ id, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admin/users/${id}/update-password`, {
        password,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ================= SLICE =================
const userSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
    total: 0,
    totalPages: 1,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      // fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.list = payload.users;
        state.total = payload.total;
        state.totalPages = payload.totalPages;
      })
      .addCase(fetchUsers.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // toggle status
      .addCase(toggleUserStatus.fulfilled, (state, { payload }) => {
        const index = state.list.findIndex(
          (u) => u._id === payload.user._id
        );
        if (index !== -1) {
          state.list[index] = payload.user;
        }
      })

      // delete user
      .addCase(deleteUser.fulfilled, (state, { payload }) => {
        state.list = state.list.filter((u) => u._id !== payload);
      })

      // update password
      .addCase(updateUserPassword.fulfilled, (state, { payload }) => {
        const index = state.list.findIndex(
          (u) => u._id === payload.user._id
        );
        if (index !== -1) {
          state.list[index] = payload.user;
        }
      });
  },
});

export default userSlice.reducer;