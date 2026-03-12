import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// fetch stats
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/stats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/dashboard/stats');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// fetch sales chart
export const fetchSalesChart = createAsyncThunk(
  'dashboard/salesChart',
  async (period, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/dashboard/sales-chart', { params: { period } });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// fetch recent orders
export const fetchRecentOrders = createAsyncThunk(
  'dashboard/recentOrders',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/dashboard/recent-orders');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: null,
    salesChart: [],
    recentOrders: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (s) => { s.loading = true; })
      .addCase(fetchDashboardStats.fulfilled, (s, { payload }) => { s.loading = false; s.stats = payload; })
      .addCase(fetchDashboardStats.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(fetchSalesChart.fulfilled, (s, { payload }) => { s.salesChart = payload.data; })
      .addCase(fetchRecentOrders.fulfilled, (s, { payload }) => { s.recentOrders = payload.orders; });
  },
});

export default dashboardSlice.reducer;