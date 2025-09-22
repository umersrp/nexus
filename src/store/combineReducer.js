"use client";
import { combineReducers } from "redux";
import authReducer from "./auth/authSlice";
import commonReducer from "./commonReducer/commonSlice";

const rootReducer = combineReducers({
  authReducer,
  commonReducer,
});

export default rootReducer;
