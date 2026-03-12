import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchProducts = createAsyncThunk('products/fetch', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/admin/products', { params });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createProduct = createAsyncThunk('products/create', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/admin/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/admin/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/admin/products/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const toggleProductStatus = createAsyncThunk('products/toggleStatus', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/admin/products/${id}/toggle-status`);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    list: [],
    total: 0,
    totalPages: 1,
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedProduct: (state, { payload }) => { state.selected = payload; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchProducts.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.list = payload.products;
        state.total = payload.total;
        state.totalPages = payload.totalPages;
      })
      .addCase(fetchProducts.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(createProduct.fulfilled, (state, { payload }) => { state.list.unshift(payload.product); state.total += 1; })
      .addCase(updateProduct.fulfilled, (state, { payload }) => {
        const idx = state.list.findIndex(p => p._id === payload.product._id);
        if (idx !== -1) state.list[idx] = payload.product;
      })
      .addCase(deleteProduct.fulfilled, (state, { payload }) => {
        state.list = state.list.filter(p => p._id !== payload);
        state.total -= 1;
      })
      .addCase(toggleProductStatus.fulfilled, (state, { payload }) => {
        const idx = state.list.findIndex(p => p._id === payload.product._id);
        if (idx !== -1) state.list[idx] = payload.product;
      });
  },
});

export const { setSelectedProduct, clearError } = productSlice.actions;
export default productSlice.reducer;