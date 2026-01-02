"use client";
import { createContext } from "react";
import { socket } from "@/lib/socket";


export const SocketContext = createContext(null);

export default function SocketProvider({ children }) {
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
