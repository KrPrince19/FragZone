import { io } from "socket.io-client";

export const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || "https://bgmibackend.vercel.app/",
  {
    transports: ["websocket"],
  }
);
