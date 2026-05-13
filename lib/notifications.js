/**
 * Browser Notification Utility
 */

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const showBrowserNotification = (title, options = {}) => {
  if (Notification.permission !== "granted") return null;

  const defaultOptions = {
    icon: "/favicon.ico", // Path to your logo
    badge: "/favicon.ico",
    silent: false,
  };

  const notification = new Notification(title, { ...defaultOptions, ...options });

  notification.onclick = function(event) {
    event.preventDefault();
    window.focus();
    if (options.url) {
      window.location.href = options.url;
    }
    notification.close();
  };

  return notification;
};
