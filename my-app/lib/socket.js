import { io } from "socket.io-client";

export const socket = io("https://bgmibackend-1.onrender.com", {
  transports: ["websocket", "polling"],
  autoConnect: true,
});
