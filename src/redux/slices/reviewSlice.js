import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchReviews = createAsyncThunk('reviews/fetch', async (params, { rejectWithValue }) => {
  try { const { data } = await api.get('/admin/reviews', { params }); return data; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const approveReview = createAsyncThunk('reviews/approve', async (id, { rejectWithValue }) => {
  try { const { data } = await api.patch(`/admin/reviews/${id}/approve`); return data; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const deleteReview = createAsyncThunk('reviews/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/admin/reviews/${id}`); return id; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: { list: [], total: 0, totalPages: 1, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchReviews.pending, (s) => { s.loading = true; })
     .addCase(fetchReviews.fulfilled, (s, { payload }) => { s.loading = false; s.list = payload.reviews; s.total = payload.total; s.totalPages = payload.totalPages; })
     .addCase(fetchReviews.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
     .addCase(approveReview.fulfilled, (s, { payload }) => { const i = s.list.findIndex(r => r._id === payload.review._id); if (i !== -1) s.list[i] = payload.review; })
     .addCase(deleteReview.fulfilled, (s, { payload }) => { s.list = s.list.filter(r => r._id !== payload); });
  },
});
export default reviewSlice.reducer;