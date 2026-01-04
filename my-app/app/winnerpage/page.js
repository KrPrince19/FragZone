"use client";

import React, { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import Image from "next/image";

const Page = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH WINNERS ================= */
  const fetchWinners = async () => {
    try {
      const res = await fetch("https://bgmibackend-1.onrender.com/winner");
      if (!res.ok) throw new Error("Failed to fetch winners");
      const data = await res.json();
      setWinners(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to load winners");
    } finally {
      setLoading(false);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchWinners();
  }, []);

  /* ================= SOCKET LISTENER ================= */
  useEffect(() => {
    socket.on("db-update", (data) => {
      if (data.event === "WINNER_UPDATED") {
        fetchWinners(); // 🔥 refetch ONCE
      }
    });

    return () => socket.off("db-update");
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 lg:px-10">

      {/* TITLE */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-center text-slate-800 mb-8">
        🏆 Winners
      </h1>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-slate-500">
          Loading winners...
        </p>
      )}

      {/* ERROR */}
      {error && (
        <p className="text-center text-red-500">
          {error}
        </p>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && winners.length === 0 && (
        <div className="text-center mt-20">
          <p className="text-xl font-semibold text-slate-600">
            📭 No winners declared yet
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Winners will appear after match results are published.
          </p>
        </div>
      )}

      {/* WINNER LIST */}
      {!loading && !error && winners.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-4">
          {winners.map((player, index) => (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-2xl
                         shadow-sm hover:shadow-md transition
                         flex items-center gap-5 p-4"
            >
              {/* RANK */}
              <div className="text-3xl font-extrabold text-amber-500 w-10 text-center">
                #{index + 1}
              </div>

              {/* IMAGE */}
              <Image
                src={`/mvpimage/${player.imgSrc}`}
                alt={player.name || "Player"}
                className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400"
              />

              {/* DETAILS */}
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-800">
                  {(player.name || "UNKNOWN").toUpperCase()}
                </h2>
                <p className="text-slate-500 text-sm">
                  Team: {player.teamname || "N/A"}
                </p>
              </div>

              {/* STATS */}
              <div className="text-right">
                <p className="text-emerald-600 font-bold">
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
