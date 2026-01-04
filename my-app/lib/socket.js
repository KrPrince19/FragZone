import { io } from "socket.io-client";

export const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || "https://bgmibackend-1.onrender.com/",
  {
    transports: ["websocket"],
  }
);
