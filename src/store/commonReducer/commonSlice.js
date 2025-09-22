'use client';
import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment';

const initialState = {
  toastId: '122123',
  isOpenSidebar: false,
  theme: 'light',
  isSessionOpen: false,
  isSessionPause: false,
  sessionTakenTime: null,
  lastInteractionTime: {
    minutes: 0,
    seconds: 0,
  },

  sessionData: null,
  sessionStartTime: '',
  isSessionExpired: false,
  answer: {
    text: '',
    base64: '',
  },
};

const commonSlice = createSlice({
  name: 'commonSlice',
  initialState,
  reducers: {
    setToastId(state, action) {
      state.toastId = action.payload;
    },
    setIsOpenSidebar(state, action) {
      state.isOpenSidebar = !state.isOpenSidebar;
    },
    setTheme(state, action) {
      state.theme = action.payload;
    },
    setIsSessionOpen(state, action) {
      state.isSessionOpen = action.payload;
    },
    setSessionData(state, action) {
      state.sessionData = action.payload;
    },
    setSessionTime(state, action) {
      state.sessionStartTime = action.payload;
      state.sessionTakenTime = null;
      state.lastInteractionTime = 0;
      state.isSessionPause = false;
    },
    setLastInteractionTime(state, action) {
      state.lastInteractionTime = action.payload;
    },
    setAiAnswer(state, action) {
      state.answer = action.payload;
    },
    setIsSessionExpired(state, action) {
      state.isSessionExpired = action.payload;
    },
    setSessionPause(state, action) {
      state.isSessionPause = true;
      state.sessionTakenTime = action.payload;
    },
    setSessionResume(state, action) {
      state.isSessionPause = false;
    },
  },
});

export const {
  setToastId,
  setIsOpenSidebar,
  setTheme,
  setIsSessionOpen,
  setSessionData,
  setSessionTime,
  setAiAnswer,
  setIsSessionExpired,
  setSessionPause,
  setSessionResume,
  setLastInteractionTime,
} = commonSlice.actions;

export default commonSlice.reducer;
