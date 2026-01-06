"use client";

import React, { useEffect, useState, useCallback } from "react";
import { socket } from "@/lib/socket";
import Image from "next/image";

const Page = () => {
  const [rankData, setRankData] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH LEADERBOARD ================= */
  const fetchRanks = useCallback(async () => {
    try {
      const res = await fetch(
        "https://bgmibackendzm.onrender.com/leaderboard",
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Failed to fetch leaderboard");

      const data = await res.json();
      setRankData(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= FETCH TOP PLAYERS ================= */
  const fetchTopPlayers = useCallback(async () => {
    try {
      const res = await fetch(
        "https://bgmibackendzm.onrender.com/winner",
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Failed to fetch top players");

      const data = await res.json();
      setTopPlayers(data.slice(0, 3));
    } catch (err) {
      console.error(err);
      // We don't set global error here to allow the main leaderboard to still show
    }
  }, []);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchRanks();
    fetchTopPlayers();
  }, [fetchRanks, fetchTopPlayers]);

  /* ================= SOCKET.IO LISTENER (UPDATED) ================= */
  useEffect(() => {
    const handler = (data) => {
      // 1. Logic for refreshing Leaderboard data
      const isLeaderboardUpdate = 
        data.event === "LEADERBOARD_UPDATED" || 
        data.event === "TOURNAMENT_ADDED"; // Sync logic from tournament page

      // 2. Logic for refreshing MVP/Top Players data
      const isWinnerUpdate = 
        data.event === "WINNER_UPDATED" ||
        data.event === "RESULT_PUBLISHED";

      if (isLeaderboardUpdate) {
        console.log("Real-time Leaderboard update:", data.event);
        fetchRanks();
      }

      if (isWinnerUpdate || isLeaderboardUpdate) {
        console.log("Real-time MVP update:", data.event);
        fetchTopPlayers();
      }
    };

    socket.on("db-update", handler);

    return () => {
      socket.off("db-update", handler);
    };
  }, [fetchRanks, fetchTopPlayers]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 lg:px-10">
      {/* TITLE */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-center text-slate-800 mb-8">
        🏆 Leaderboard
      </h1>

      {/* ================= MOST KILL PLAYERS (TOP 3) ================= */}
      {!loading && !error && topPlayers.length > 0 && (
        <div className="mb-12">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-md animate-pulse">
              🔥 Most Kill Players
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {topPlayers.map((player, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 text-center hover:scale-105 transition-transform duration-300"
              >
                <div className="relative w-32 h-32 mx-auto">
                  <Image
                    src={`/mvpimage/${player.imgSrc}`}
                    alt={player.name || "Player"}
                    fill
                    className="rounded-full object-cover border-4 border-cyan-400"
                  />
                </div>

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
        </div>
      )}

      {/* ================= LEADERBOARD TABLE ================= */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* TABLE HEADER */}
        <div className="grid grid-cols-5 bg-slate-100 px-4 py-4 font-bold text-slate-600 text-sm md:text-base">
          <div>Rank</div>
          <div>Player</div>
          <div>Team</div>
          <div>Kills</div>
          <div>Points</div>
        </div>

        {/* TABLE CONTENT */}
        {loading ? (
          <div className="flex flex-col items-center py-10 space-y-2">
             <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-slate-500">Updating Leaderboard...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500 font-medium">{error}</p>
            <button onClick={fetchRanks} className="mt-2 text-cyan-600 text-sm underline">Retry</button>
          </div>
        ) : rankData.length === 0 ? (
          <p className="text-center py-10 text-slate-500">
            📭 Leaderboard data not available yet
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {rankData.map((playerRank, idx) => (
              <div
                key={idx}
                className="grid grid-cols-5 px-4 py-4 text-sm md:text-base hover:bg-slate-50 transition items-center"
              >
                <div className="font-bold text-amber-600">
                  #{playerRank.rank ?? idx + 1}
                </div>
                <div className="font-semibold text-slate-800 truncate pr-2">
                  {playerRank.playerName?.toUpperCase() || "UNKNOWN"}
                </div>
                <div className="font-semibold text-slate-500 truncate pr-2">
                  {playerRank.teamName?.toUpperCase() || "UNKNOWN"}
                </div>
                <div className="font-bold text-emerald-600">
                  {playerRank.kill ?? 0}
                </div>
                <div className="font-bold text-blue-600">
                  {playerRank.point ?? 0}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
