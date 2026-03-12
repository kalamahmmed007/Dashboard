import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API URL
const API_URL = "http://localhost:5000/api/coupons";

// Async thunks
export const fetchCoupons = createAsyncThunk(
  "coupon/fetchCoupons",
  async () => {
    const res = await axios.get(API_URL);
    return res.data;
  }
);

export const addCoupon = createAsyncThunk(
  "coupon/addCoupon",
  async (data) => {
    const res = await axios.post(API_URL, data);
    return res.data;
  }
);

export const deleteCoupon = createAsyncThunk(
  "coupon/deleteCoupon",
  async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`);
    return id;
  }
);

// Slice
const couponSlice = createSlice({
  name: "coupon",
  initialState: { coupons: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.coupons = action.payload;
        state.loading = false;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })

      // Add
      .addCase(addCoupon.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCoupon.fulfilled, (state, action) => {
        state.coupons.push(action.payload);
        state.loading = false;
      })
      .addCase(addCoupon.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })

      // Delete
      .addCase(deleteCoupon.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter(
          (c) => c._id !== action.payload
        );
        state.loading = false;
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});

export default couponSlice.reducer;