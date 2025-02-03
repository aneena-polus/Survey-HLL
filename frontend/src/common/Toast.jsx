import { toast } from 'react-toastify';

export const ToastMessage = (message) => {
    toast(message, {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        draggable: true,
        progress: undefined,
        width: "100px",
        theme: "dark"
    });
}