const { default: store } = require('@/store');
const { setAiAnswer } = require('@/store/commonReducer/commonSlice');

// Convert Base64 String back to ArrayBuffer
export function base64ToArrayBuffer(base64) {
  const binary = atob(base64); // Decode from Base64
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer; // Convert to ArrayBuffer
}

export const addBufferInRedux = (text, buffer) => {
  store.dispatch(
    setAiAnswer({
      text,
      base64: buffer,
    })
  );
};
