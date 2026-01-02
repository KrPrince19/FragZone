"use client";

import React, { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import Image from "next/image";


const Page = () => {
  const [rankData, setRankData] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH LEADERBOARD ================= */
  const fetchRanks = async () => {
    try {
      const res = await fetch("http://localhost:5000/leaderboard");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      const data = await res.json();
      setRankData(data);
      setError(null);
    } catch (err) {
      setError("❌ Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH TOP PLAYERS ================= */
  const fetchTopPlayers = async () => {
    try {
      const res = await fetch("http://localhost:5000/winner");
      if (!res.ok) throw new Error("Failed to fetch top players");
      const data = await res.json();
      setTopPlayers(data.slice(0, 3));
    } catch (err) {
      setError("❌ Failed to load top players");
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchRanks();
    fetchTopPlayers();
  }, []);

  /* ================= SOCKET LISTENER ================= */
  useEffect(() => {
    socket.on("db-update", (data) => {
      if (data.event === "LEADERBOARD_UPDATED") {
        fetchRanks(); // 🔥 refetch leaderboard
      }

      if (data.event === "WINNER_UPDATED") {
        fetchTopPlayers(); // 🔥 refetch winners
      }
    });

    return () => socket.off("db-update");
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 lg:px-10">
      
      {/* TITLE */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-center text-slate-800 mb-8">
        🏆 Leaderboard
      </h1>

      {/* ================= MOST KILL PLAYERS ================= */}
      {!loading && !error && topPlayers.length > 0 && (
        <>
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-md">
              🔥 Most Kill Players
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
            {topPlayers.map((player, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 text-center"
              >
                <Image
                  src={`/mvpimage/${player.imgSrc}`}
                  alt={player.name || "Player"}
                  className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-cyan-400"
                />

                <h2 className="mt-4 text-xl font-bold text-slate-800">
                  {player.name?.toUpperCase() || "UNKNOWN"}
                </h2>

                <p className="text-slate-500 font-semibold mt-1">
                  Team: {player.teamname || "N/A"}
                </p>

                <p className="mt-3 text-lg font-bold text-emerald-600">
                  🔫 Kills: {player.kill ?? 0}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ================= LEADERBOARD TABLE ================= */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-5 bg-slate-100 px-4 py-3 font-bold text-slate-600 text-sm">
          <div>Rank</div>
          <div>Player</div>
          <div>Team</div>
          <div>Kills</div>
          <div>Points</div>
        </div>

        {loading ? (
          <p className="text-center py-6 text-slate-500">
            Loading leaderboard...
          </p>
        ) : error ? (
          <p className="text-center text-red-500 py-6">
            {error}
          </p>
        ) : rankData.length === 0 ? (
          <p className="text-center py-6 text-slate-500">
            📭 Leaderboard data not available yet
          </p>
        ) : (
          rankData.map((playerRank, idx) => (
            <div
              key={idx}
              className="grid grid-cols-5 px-4 py-4 border-t text-sm hover:bg-slate-50 transition"
            >
              <div className="font-bold text-amber-600">
                #{playerRank.rank ?? idx + 1}
              </div>
              <div className="font-semibold text-slate-800">
                {playerRank.playerName?.toUpperCase() || "UNKNOWN"}
              </div>
              <div className="font-semibold text-slate-500">
                {playerRank.teamName?.toUpperCase() || "UNKNOWN"}
              </div>
              <div className="font-bold text-emerald-600">
                {playerRank.kill ?? 0}
              </div>
              <div className="font-bold text-blue-600">
                {playerRank.point ?? 0}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Page;
