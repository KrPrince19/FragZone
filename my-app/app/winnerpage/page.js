"use client";

import React, { useEffect, useState, useCallback } from "react";
import { socket } from "@/lib/socket";
import Image from "next/image";

const Page = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchWinners();
  }, [fetchWinners]);

  /* ================= SOCKET.IO REALTIME (FIXED) ================= */
  useEffect(() => {
    if (!socket) return;

    const handler = (data) => {
      console.log("📡 Winner page socket:", data);

      // ✅ ONLY EVENT THAT EXISTS FOR WINNERS
      if (data?.event === "WINNER_UPDATED") {
        fetchWinners(); // 🔥 realtime refresh
      }
    };

    socket.on("db-update", handler);

    return () => {
      socket.off("db-update", handler);
    };
  }, [fetchWinners]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 lg:px-10">
      {/* TITLE */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-center text-slate-800 mb-8">
        🏆 Winners
      </h1>

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
                  src={`/mvpimage/${player.imgSrc}`}
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
