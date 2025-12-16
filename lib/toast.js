import { toast } from "react-toastify";

export const showToast = {
  success: (message, options = {}) => {
    return toast.success(message, {
      position: "top-right",
      autoClose: options.duration || 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  },
  error: (message, options = {}) => {
    return toast.error(message, {
      position: "top-right",
      autoClose: options.duration || 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  },
  warning: (message, options = {}) => {
    return toast.warning(message, {
      position: "top-right",
      autoClose: options.duration || 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  },
  info: (message, options = {}) => {
    return toast.info(message, {
      position: "top-right",
      autoClose: options.duration || 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  },
};

// For backward compatibility with existing code
export const useToast = () => {
  return {
    success: showToast.success,
    error: showToast.error,
    warning: showToast.warning,
    info: showToast.info,
    showToast: (message, type = "success", duration) => {
      const options = duration ? { autoClose: duration } : {};
      switch (type) {
        case "success":
          return showToast.success(message, options);
        case "error":
          return showToast.error(message, options);
        case "warning":
          return showToast.warning(message, options);
        case "info":
          return showToast.info(message, options);
        default:
          return showToast.success(message, options);
      }
    },
    removeToast: () => {}, // No-op for compatibility
  };
};

