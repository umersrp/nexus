"use client";
import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
  accessToken: "",
  isLogin: false,
  user: null,
  mode: "light",
  isOpen: false,
  fcmToken: null,
  cart: [],
};

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    SaveFcmToken(state, action) {
      state.fcmToken = action.payload.fcmToken;
    },
    saveLoginUserData(state, action) {
      state.user = action.payload.user;
      state.isLogin = true;
      state.accessToken = action.payload.token;
    },
    updateUser(state, action) {
      state.user = action.payload;
    },
    signOutRequest(state) {
      state.accessToken = "";
      state.isLogin = false;
      state.user = null;
      Cookies.remove("xpdx");
      Cookies.remove("role");
    },
    ToggleDrawer(state, action) {
      state.isOpen = action.payload;
    },
    addToCart(state, action) {
      state.cart?.push(action?.payload);
    },
    deleteProductFromCart(state, action) {
      state.cart?.splice(action?.payload, 1);
    },
    emptyCart(state, action) {
      state.cart = [];
    },
    updateProductQuantity(state, action) {
      const updateProducIndx = state?.cart?.findIndex(
        (e) => e?.product?._id == action?.payload?._id
      );
      const updatedProduct = {
        ...state?.cart[updateProducIndx],
        quantity:
          state?.cart[updateProducIndx]?.quantity + action?.payload?.quantity,
      };
      state.cart?.splice(updateProducIndx, 1, updatedProduct);
    },
  },
});

export const {
  SaveFcmToken,
  saveLoginUserData,
  signOutRequest,
  ToggleDrawer,
  updateUser,
  addToCart,
  updateProductQuantity,
  deleteProductFromCart,
  emptyCart,
} = authSlice.actions;

export default authSlice.reducer;
