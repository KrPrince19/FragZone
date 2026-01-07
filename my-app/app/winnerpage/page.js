"use client";

import React, { useEffect, useState, useCallback } from "react";
import { socket } from "@/lib/socket";
import Image from "next/image";
import { Trophy, Wifi, WifiOff } from "lucide-react"; // Matching style

const Page = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);

  /* ================= FETCH WINNERS ================= */
  const fetchWinners = useCallback(async () => {
    try {
      const res = await fetch(
        "https://bgmibackendzm.onrender.com/winner",
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      setWinners(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to load winners");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= SOCKET.IO REALTIME ================= */
  useEffect(() => {
    fetchWinners();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const handleUpdate = (data) => {
      console.log("📡 Winner Socket Event:", data.event);
      // Matching the "WINNER" event emitted by your backend
      if (data?.event === "WINNER") {
        fetchWinners(); 
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("db-update", handleUpdate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("db-update", handleUpdate);
    };
  }, [fetchWinners]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 lg:px-10">
      
      {/* HEADER WITH SYNC STATUS */}
      <div className="flex items-center justify-between max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 flex items-center gap-2">
          <Trophy className="text-amber-500 w-8 h-8" /> Winners
        </h1>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border text-[10px] font-bold shadow-sm">
          {isConnected ? (
            <><Wifi size={12} className="text-green-500" /> LIVE SYNC</> 
          ) : (
            <><WifiOff size={12} className="text-red-500" /> SYNCING...</>
          )}
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-slate-500 animate-pulse">
          Loading winners...
        </p>
      )}

      {/* ERROR */}
      {error && (
        <div className="text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={fetchWinners}
            className="mt-4 text-cyan-600 underline text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && winners.length === 0 && (
        <div className="text-center mt-20">
          <p className="text-xl font-semibold text-slate-600">
            📭 No winners declared yet
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Winners will appear after results are published.
          </p>
        </div>
      )}

      {/* WINNERS LIST */}
      {!loading && !error && winners.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-4">
          {winners.map((player, index) => (
            <div
              key={index}
              className="bg-white border rounded-2xl p-4
                         flex items-center gap-5
                         shadow-sm hover:shadow-md transition-all"
            >
              {/* RANK */}
              <div className="text-3xl font-extrabold text-amber-500 w-10 text-center">
                #{index + 1}
              </div>

              {/* IMAGE */}
              <div className="relative w-16 h-16">
                <Image
                  src={`/mvpimage/${player.imgSrc || "default.png"}`}
                  alt={player.name || "Player"}
                  fill
                  className="rounded-full object-cover border-2 border-cyan-400"
                />
              </div>

              {/* DETAILS */}
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-800">
                  {(player.name || "UNKNOWN").toUpperCase()}
                </h2>
                <p className="text-sm text-slate-500">
                  Team: {player.teamname || "N/A"}
                </p>
              </div>

              {/* STATS */}
              <div className="text-right">
                <p className="font-bold text-emerald-600">
                  Kills: {player.kill ?? 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
