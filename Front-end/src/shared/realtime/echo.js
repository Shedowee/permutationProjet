import Echo from "laravel-echo";
import Pusher from "pusher-js";

let echoInstance = null;

export const getEcho = () => {
  const appKey = import.meta.env.VITE_REVERB_APP_KEY;
  if (!appKey) return null;

  if (echoInstance) return echoInstance;

  if (typeof window !== "undefined") {
    window.Pusher = Pusher;
  }

  const host = import.meta.env.VITE_REVERB_HOST || "127.0.0.1";
  const port = Number(import.meta.env.VITE_REVERB_PORT || 8080);
  const scheme = import.meta.env.VITE_REVERB_SCHEME || "http";
  const forceTLS = scheme === "https";

  echoInstance = new Echo({
    broadcaster: "pusher",
    key: appKey,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS,
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/broadcasting/auth`,
    auth: {
      withCredentials: true,
      headers: {
        Accept: "application/json",
      },
    },
  });

  return echoInstance;
};

export const leaveNotificationChannel = (userId) => {
  if (!echoInstance || !userId) return;
  echoInstance.leave(`notifications.${userId}`);
};
