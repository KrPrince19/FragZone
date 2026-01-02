import { io } from "socket.io-client";

export const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || "https://bgmibackend.onrender.com",
  {
    transports: ["websocket"],
  }
);
