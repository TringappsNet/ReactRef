    // redux/slice.js
    import { createSlice } from "@reduxjs/toolkit";

    const initialState = {
      formData: {},
      excelData: [],
      retrievedData: null,
      registeredEmails: [], // Add this line
      registeredFirstNames: [], // Add this line
    };

    const formSlice = createSlice({
      name: "form",
      initialState,
      reducers: {
        addFormData: (state, action) => {
          state.formData = action.payload;
          state.registeredEmails.push(action.payload.email); // Add this line
          state.registeredFirstNames.push(action.payload.firstName); // Add this line 
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
