"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { socket } from "@/lib/socket";

const Page = () => {
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
        "https://bgmibackend-1.onrender.com/upcomingtournament",
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
        "https://bgmibackend-1.onrender.com/joinmatches",
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

  /* ================= SOCKET.IO LISTENER (FIXED) ================= */
  useEffect(() => {
    const handler = (data) => {
      // 🔥 Admin adds new tournament
      if (data.event === "TOURNAMENT_ADDED") {
        fetchTournaments();
      }

      // 🔥 User joins a match
      if (data.event === "JOIN_MATCH") {
        fetchJoined();
      }
    };

    socket.on("db-update", handler);

    return () => {
      socket.off("db-update", handler);
    };
  }, [fetchTournaments, fetchJoined]);

  /* ================= JOIN CHECK ================= */
  const isJoined = (tournamentId) => {
    if (!userEmail) return false;

    return joinedMatches.some(
      (j) =>
        j.playerEmail?.toLowerCase().trim() ===
          userEmail.toLowerCase().trim() &&
        j.tournamentName?.toUpperCase().trim() ===
          tournamentId.toUpperCase().trim()
    );
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 lg:px-10">
      {/* HEADER */}
      <div className="flex justify-center mb-8">
        <span className="text-sm md:text-xl font-bold text-cyan-600 underline">
          UPCOMING TOURNAMENT
        </span>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-center text-slate-500">
          Loading tournaments...
        </p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : upcomingTournaments.length === 0 ? (
        <div className="text-center mt-20">
          <p className="text-xl font-semibold text-slate-600">
            📭 No upcoming tournaments
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Please check back later for new tournaments.
          </p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4">
          {upcomingTournaments.map((tournament) => {
            const joined = isJoined(tournament.tournamentId);

            return (
              <div
                key={tournament.tournamentId}
                className="bg-white border border-slate-200 rounded-2xl p-6
                           shadow-sm hover:shadow-md transition
                           flex flex-col md:flex-row md:items-center
                           md:justify-between gap-6"
              >
                {/* LEFT */}
                <div>
                  <Link
                    href={`/details/${tournament.tournamentId}`}
                    className="text-xl md:text-2xl font-bold text-slate-800
                               hover:text-cyan-600 hover:underline"
                  >
                    {tournament.name?.toUpperCase()}
                  </Link>

                  <div className="flex gap-6 mt-4 text-sm text-slate-600">
                    <div>
                      <span className="font-semibold">START:</span>{" "}
                      {tournament.startdate}
                    </div>
                    <div>
                      <span className="font-semibold">END:</span>{" "}
                      {tournament.enddate}
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex gap-4">
                  {joined ? (
                    <span className="px-5 py-2 rounded-xl font-bold
                                     text-green-600 bg-green-100">
                      ✅ Joined
                    </span>
                  ) : (
                    <Link
                      href={`/joinmatch/${tournament.tournamentId}`}
                      className="px-5 py-2 rounded-xl font-bold text-white
                                 bg-cyan-500 hover:bg-cyan-600 transition"
                    >
                      Join
                    </Link>
                  )}

                  <Link
                    href={`/detail/${tournament.tournamentId}`}
                    className="px-5 py-2 rounded-xl font-bold text-cyan-600
                               border border-cyan-500 hover:bg-cyan-50 transition"
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
};

export default Page;
