  // redux/slice.js
  import { createSlice } from "@reduxjs/toolkit";

  const initialState = {
    formData: {},
    excelData: [],
    retrievedData: null,

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
      fetchDataFromDatabase: (state, action) => {
        state.retrievedData = action.payload;
      },
      setRetrievedData: (state, action) => {
        state.retrievedData = action.payload;
      },
    },
  });

  export const { addFormData, addExcelData,fetchDataFromDatabase,setRetrievedData  } = formSlice.actions;
  export default formSlice.reducer;
