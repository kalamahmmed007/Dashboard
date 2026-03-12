// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api"; // make sure this path matches your project

/* ===============================
   🔐 ADMIN LOGIN
=============================== */
export const loginAdmin = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/admin/auth/login", credentials);

      // store token
      localStorage.setItem("adminToken", data.token);

      return data; // { token, admin }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

/* ===============================
   👤 GET PROFILE
=============================== */
export const getAdminProfile = createAsyncThunk(
  "auth/profile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/auth/me");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Profile failed");
    }
  }
);

/* ===============================
   🚪 LOGOUT
=============================== */
export const logoutAdmin = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("adminToken");
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    admin: null,
    token: localStorage.getItem("adminToken") || null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // 🔥 emergency logout (used by axios interceptor)
    forceLogout: (state) => {
      state.admin = null;
      state.token = null;
      localStorage.removeItem("adminToken");
    },
  },
  extraReducers: (builder) => {
    builder
      // ================= LOGIN
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.admin = payload.admin;
        state.token = payload.token;
      })
      .addCase(loginAdmin.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // ================= LOGOUT
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.admin = null;
        state.token = null;
      })

      // ================= PROFILE
      .addCase(getAdminProfile.fulfilled, (state, { payload }) => {
        state.admin = payload;
      });
  },
});

export const { clearError, forceLogout } = authSlice.actions;
export default authSlice.reducer;