import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// ── Special Offers ──
export const fetchSpecialOffers = createAsyncThunk('specialOffers/fetch', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/admin/special-offers'); return data; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const createSpecialOffer = createAsyncThunk('specialOffers/create', async (formData, { rejectWithValue }) => {
  try { const { data } = await api.post('/admin/special-offers', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); return data; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const updateSpecialOffer = createAsyncThunk('specialOffers/update', async ({ id, formData }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/admin/special-offers/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); return data; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const deleteSpecialOffer = createAsyncThunk('specialOffers/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/admin/special-offers/${id}`); return id; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const specialOfferSlice = createSlice({
  name: 'specialOffers',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchSpecialOffers.pending, (s) => { s.loading = true; })
     .addCase(fetchSpecialOffers.fulfilled, (s, { payload }) => { s.loading = false; s.list = payload.offers; })
     .addCase(fetchSpecialOffers.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
     .addCase(createSpecialOffer.fulfilled, (s, { payload }) => { s.list.unshift(payload.offer); })
     .addCase(updateSpecialOffer.fulfilled, (s, { payload }) => { const i = s.list.findIndex(o => o._id === payload.offer._id); if (i !== -1) s.list[i] = payload.offer; })
     .addCase(deleteSpecialOffer.fulfilled, (s, { payload }) => { s.list = s.list.filter(o => o._id !== payload); });
  },
});
export default specialOfferSlice.reducer;