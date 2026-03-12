import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// Fetch all orders with optional params (page, status, limit, etc.)
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/orders", { params });
      return data; // expects { orders: [], total, totalPages }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch orders");
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  "orders/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    if (!id) return rejectWithValue("Order ID is required");
    try {
      const { data } = await api.patch(`/admin/orders/${id}/status`, { status });
      return data; // expects { order: { ... } }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update status");
    }
  }
);

// Get single order by ID
export const getOrderById = createAsyncThunk(
  "orders/getOrderById",
  async (id, { rejectWithValue }) => {
    if (!id) return rejectWithValue("Order ID is required"); // ✅ guard: undefined হলে API call হবে না
    try {
      const { data } = await api.get(`/admin/orders/${id}`);
      return data; // expects { order: { ... } }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch order");
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    list: [],
    total: 0,
    totalPages: 1,
    selected: null,
    loading: false,
    detailLoading: false, 
    error: null,
  },
  reducers: {
    setSelectedOrder: (state, { payload }) => {
      state.selected = payload;
    },
    clearSelectedOrder: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchOrders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.list = payload.orders ?? [];
        state.total = payload.total ?? 0;
        state.totalPages = payload.totalPages ?? 1;
      })
      .addCase(fetchOrders.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // updateOrderStatus
      .addCase(updateOrderStatus.fulfilled, (state, { payload }) => {
        if (!payload?.order) return;
        const idx = state.list.findIndex((o) => o._id === payload.order._id);
        if (idx !== -1) state.list[idx] = payload.order;
        if (state.selected?._id === payload.order._id) state.selected = payload.order;
      })
      .addCase(updateOrderStatus.rejected, (state, { payload }) => {
        state.error = payload;
      })

      // getOrderById
      .addCase(getOrderById.pending, (state) => {
        state.detailLoading = true; // ✅ detail modal loading
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, { payload }) => {
        state.detailLoading = false;
        if (payload?.order) state.selected = payload.order;
      })
      .addCase(getOrderById.rejected, (state, { payload }) => {
        state.detailLoading = false;
        state.error = payload;
      });
  },
});

export const { setSelectedOrder, clearSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;