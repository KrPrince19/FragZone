import { io } from "socket.io-client";

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  // Polling handles the initial "wake up" of Render servers better
  transports: ["polling", "websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
});
