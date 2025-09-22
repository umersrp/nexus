import store from '@/store';
import { setToastId } from '@/store/commonReducer/commonSlice';
import { toast } from 'react-toastify';
const toastId = '123';
export const CustomToast = ({ message, type = 'error' }) => {
  if (toast.isActive(toastId)) {
    toast.update(toastId, { type: type, render: message });
  } else {
    const id = Math.random().toString(36).slice(2, 9);
    toast(message, {
      type,
      autoClose: 5000,
      onOpen: () => store.dispatch(setToastId(toastId)),

      toastId: toastId,
    });
  }

  toast.onChange((payload) => {
    switch (payload.status) {
      case 'added':
        break;
      case 'updated':
        break;
      case 'removed':
        setTimeout(() => {}, 1000);

        break;
    }
  });
};
