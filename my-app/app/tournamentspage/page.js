"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CalendarDays, Swords, Users } from "lucide-react";
import { socket } from "@/lib/socket";

/* ================= STATUS (TOURNAMENT LOGIC) ================= */
const getTournamentStatus = (startdate, enddate) => {
  if (!startdate || !enddate) return "upcoming";

  const parse = (d) => {
    const p = d.includes("/") ? d.split("/") : d.split("-");
    return p[0].length === 4
      ? new Date(p[0], p[1] - 1, p[2])
      : new Date(p[2], p[1] - 1, p[0]);
  };

  const now = new Date();
  const s = parse(startdate);
  const e = parse(enddate);

  if (now < s) return "upcoming";
  if (now > e) return "passed";
  return "live";
};

export default function Page() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH TOURNAMENTS ================= */
  const fetchTournaments = useCallback(async () => {
    try {
      const res = await fetch(
        "https://bgmibackend-1.onrender.com/tournament",
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Fetch failed");

      setTournaments(await res.json());
      setError(null);
    } catch {
      setError("❌ Failed to fetch tournaments");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  /* ================= SOCKET.IO ================= */
  useEffect(() => {
    const handler = (data) => {
      if (data.event === "TOURNAMENT_ADDED") {
        fetchTournaments();
      }
    };

    socket.on("db-update", handler);
    return () => socket.off("db-update", handler);
  }, [fetchTournaments]);

  return (
    <div className="min-h-screen bg-slate-50 space-y-6 px-4 py-6">

      {/* HEADER (SCRIM STYLE) */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-cyan-600 flex items-center gap-2">
          <Swords className="w-7 h-7" />
          Tournaments
        </h1>
        <span className="text-sm text-slate-500">
          Compete • Win • Glory
        </span>
      </div>

      {loading && (
        <p className="text-center text-slate-500">Loading tournaments...</p>
      )}

      {error && (
        <p className="text-center text-red-500">{error}</p>
      )}

      {!loading && !error && tournaments.length === 0 && (
        <p className="text-center mt-20 text-slate-500">
          📭 No tournaments available
        </p>
      )}

      {/* ===== SCRIM STYLE CARDS ===== */}
      {!loading && !error && tournaments.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tournaments.map((t, index) => {
            const status = getTournamentStatus(t.startdate, t.enddate);

            return (
              <div
                key={index}
                className="bg-white border rounded-2xl p-6 shadow-sm
                           hover:shadow-md hover:border-cyan-400 transition-all"
              >
                <h2 className="text-xl font-bold mb-4">
                  {(t.name || "UNKNOWN TOURNAMENT").toUpperCase()}
                </h2>

                <div className="text-sm text-slate-600 space-y-2">
                  <div className="flex gap-2">
                    <CalendarDays size={14} />
                    {t.startdate} – {t.enddate}
                  </div>

                  <div className="flex gap-2">
                    <Users size={14} />
                    Slots: {t.slots || "Limited"}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    {status === "live" && (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                        🟢 LIVE
                      </span>
                    )}
                    {status === "upcoming" && (
                      <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-xs font-bold">
                        ⏳ UPCOMING
                      </span>
                    )}
                    {status === "passed" && (
                      <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                        ⚫ PASSED
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/detail/${t.tournamentId}`}
                    className="text-cyan-600 text-sm font-semibold"
                  >
                    View
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
