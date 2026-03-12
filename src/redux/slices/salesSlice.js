import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sales: [],
};

const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {

    addSale: (state, action) => {
      state.sales.push(action.payload);
    },

    deleteSale: (state, action) => {
      state.sales = state.sales.filter(
        sale => sale.id !== action.payload
      );
    },

  },
});

export const { addSale, deleteSale } = salesSlice.actions;

export default salesSlice.reducer;