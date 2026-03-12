import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  expenses: [],
};

const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {

    addExpense: (state, action) => {
      state.expenses.push(action.payload);
    },

    deleteExpense: (state, action) => {
      state.expenses = state.expenses.filter(
        exp => exp.id !== action.payload
      );
    },

  },
});

export const { addExpense, deleteExpense } = expenseSlice.actions;

export default expenseSlice.reducer;