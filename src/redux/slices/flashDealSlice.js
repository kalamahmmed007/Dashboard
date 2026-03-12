import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchFlashDeals = createAsyncThunk('flashDeals/fetch', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/admin/flash-deals'); return data; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const createFlashDeal = createAsyncThunk('flashDeals/create', async (body, { rejectWithValue }) => {
  try { const { data } = await api.post('/admin/flash-deals', body); return data; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const updateFlashDeal = createAsyncThunk('flashDeals/update', async ({ id, body }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/admin/flash-deals/${id}`, body); return data; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const deleteFlashDeal = createAsyncThunk('flashDeals/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/admin/flash-deals/${id}`); return id; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const flashDealSlice = createSlice({
  name: 'flashDeals',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchFlashDeals.pending, (s) => { s.loading = true; })
     .addCase(fetchFlashDeals.fulfilled, (s, { payload }) => { s.loading = false; s.list = payload.deals; })
     .addCase(fetchFlashDeals.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
     .addCase(createFlashDeal.fulfilled, (s, { payload }) => { s.list.unshift(payload.deal); })
     .addCase(updateFlashDeal.fulfilled, (s, { payload }) => { const i = s.list.findIndex(d => d._id === payload.deal._id); if (i !== -1) s.list[i] = payload.deal; })
     .addCase(deleteFlashDeal.fulfilled, (s, { payload }) => { s.list = s.list.filter(d => d._id !== payload); });
  },
});
export default flashDealSlice.reducer;