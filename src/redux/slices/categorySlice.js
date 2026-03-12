// categorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchCategories = createAsyncThunk('categories/fetch', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/admin/categories'); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const createCategory = createAsyncThunk('categories/create', async (formData, { rejectWithValue }) => {
  try { const { data } = await api.post('/admin/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const updateCategory = createAsyncThunk('categories/update', async ({ id, formData }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/admin/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const deleteCategory = createAsyncThunk('categories/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/admin/categories/${id}`); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const categorySlice = createSlice({
  name: 'categories',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (s) => { s.loading = true; })
      .addCase(fetchCategories.fulfilled, (s, { payload }) => { s.loading = false; s.list = payload.categories; })
      .addCase(fetchCategories.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(createCategory.fulfilled, (s, { payload }) => { s.list.push(payload.category); })
      .addCase(updateCategory.fulfilled, (s, { payload }) => {
        const i = s.list.findIndex(c => c._id === payload.category._id);
        if (i !== -1) s.list[i] = payload.category;
      })
      .addCase(deleteCategory.fulfilled, (s, { payload }) => { s.list = s.list.filter(c => c._id !== payload); });
  },
});
export default categorySlice.reducer;