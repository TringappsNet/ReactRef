// redux/slice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  formData: {},
  excelData: [],
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    addFormData: (state, action) => {
      state.formData = action.payload;
    },
    addExcelData: (state, action) => {
      state.excelData = action.payload;
    },
  },
});

export const { addFormData, addExcelData } = formSlice.actions;
export default formSlice.reducer;
