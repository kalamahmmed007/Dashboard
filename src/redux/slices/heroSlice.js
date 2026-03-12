// src/redux/slices/heroSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fetch hero slides from backend
export const fetchHeroSlides = createAsyncThunk(
  "hero/fetchSlides",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/hero");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch slides");
    }
  }
);

const heroSlice = createSlice({
  name: "hero",
  initialState: {
    slides: [],
    loading: false,
    error: null,
  },
  reducers: {
    // optional: add local hero slides manually
    setHeroSlides: (state, action) => {
      state.slides = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHeroSlides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHeroSlides.fulfilled, (state, action) => {
        state.loading = false;
        state.slides = action.payload;
      })
      .addCase(fetchHeroSlides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load slides";
      });
  },
});

export const { setHeroSlides } = heroSlice.actions;
export default heroSlice.reducer;