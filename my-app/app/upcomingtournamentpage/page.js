"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { socket } from "@/lib/socket";

export default function Page() {
  const { user, isLoaded } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [joinedMatches, setJoinedMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH UPCOMING TOURNAMENTS ================= */
  const fetchTournaments = useCallback(async () => {
    try {
      const res = await fetch(
        "https://bgmibackendzm.onrender.com/upcomingtournament",
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      setUpcomingTournaments(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to fetch tournaments");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= FETCH JOINED MATCHES ================= */
  const fetchJoined = useCallback(async () => {
    if (!userEmail) return;

    try {
      const res = await fetch(
        "https://bgmibackendzm.onrender.com/joinmatches",
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      setJoinedMatches(data);
    } catch (err) {
      console.error(err);
    }
  }, [userEmail]);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  useEffect(() => {
    fetchJoined();
  }, [fetchJoined]);

  /* ================= SOCKET.IO REALTIME (ADDED) ================= */
  useEffect(() => {
    if (!socket) return;

    const handleDBUpdate = (data) => {
      console.log("📡 Socket event received:", data);

      // 🔥 Same logic as Tournament page
      if (data?.event === "TOURNAMENT_ADDED") {
        fetchTournaments();
      }

      if (data?.event === "JOIN_MATCH") {
        fetchJoined();
      }
    };

    socket.on("db-update", handleDBUpdate);

    return () => {
      socket.off("db-update", handleDBUpdate);
    };
  }, [fetchTournaments, fetchJoined]);

  /* ================= JOIN CHECK ================= */
  const isJoined = (tournamentId) => {
    if (!userEmail) return false;

    return joinedMatches.some(
      (j) =>
        j.playerEmail?.toLowerCase() === userEmail.toLowerCase() &&
        j.tournamentName?.toUpperCase() === tournamentId.toUpperCase()
    );
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 lg:px-10">
      <div className="flex justify-center mb-8">
        <span className="text-xl font-bold text-cyan-600 underline">
          UPCOMING TOURNAMENT
        </span>
      </div>

      {loading ? (
        <p className="text-center">Loading tournaments...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : upcomingTournaments.length === 0 ? (
        <p className="text-center">📭 No upcoming tournaments</p>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4">
          {upcomingTournaments.map((t) => {
            const joined = isJoined(t.tournamentId);

            return (
              <div
                key={t.tournamentId}
                className="bg-white border rounded-2xl p-6 flex justify-between items-center"
              >
                <div>
                  <Link
                    href={`/detail/${t.tournamentId}`}
                    className="text-xl font-bold hover:underline"
                  >
                    {t.name?.toUpperCase()}
                  </Link>
                  <p className="text-sm text-slate-600 mt-2">
                    {t.startdate} → {t.enddate}
                  </p>
                </div>

                <div className="flex gap-3">
                  {joined ? (
                    <span className="px-4 py-2 bg-green-100 text-green-600 rounded-xl font-bold">
                      ✅ Joined
                    </span>
                  ) : (
                    <Link
                      href={`/joinmatch/${t.tournamentId}`}
                      className="px-4 py-2 bg-cyan-500 text-white rounded-xl font-bold"
                    >
                      Join
                    </Link>
                  )}

                  <Link
                    href={`/detail/${t.tournamentId}`}
                    className="px-4 py-2 border border-cyan-500 text-cyan-600 rounded-xl font-bold"
                  >
                    Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
