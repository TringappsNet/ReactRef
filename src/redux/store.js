// redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import formReducer from "./slice";

export const store = configureStore({
  reducer: {
    form: formReducer,
  },
});
