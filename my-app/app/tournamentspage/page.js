"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, CalendarDays, Users } from "lucide-react";

/* =====================================================
   TOURNAMENT STATUS (TODAY = LIVE | DATE ONLY)
===================================================== */
const getTournamentStatus = (startdate, enddate) => {
  if (!startdate || !enddate) return "upcoming";

  const today = new Date();
  const tYear = today.getFullYear();
  const tMonth = today.getMonth() + 1;
  const tDay = today.getDate();

  let sDay, sMonth, sYear;
  let eDay, eMonth, eYear;

  // START DATE
  if (startdate.includes("-") && startdate.split("-")[0].length === 4) {
    [sYear, sMonth, sDay] = startdate.split("-").map(Number);
  } else {
    const parts = startdate.includes("/") ? startdate.split("/") : startdate.split("-");
    [sDay, sMonth, sYear] = parts.map(Number);
  }

  // END DATE
  if (enddate.includes("-") && enddate.split("-")[0].length === 4) {
    [eYear, eMonth, eDay] = enddate.split("-").map(Number);
  } else {
    const parts = enddate.includes("/") ? enddate.split("/") : enddate.split("-");
    [eDay, eMonth, eYear] = parts.map(Number);
  }

  if (
    tYear > eYear ||
    (tYear === eYear && tMonth > eMonth) ||
    (tYear === eYear && tMonth === eMonth && tDay > eDay)
  ) {
    return "passed";
  }

  if (
    tYear < sYear ||
    (tYear === sYear && tMonth < sMonth) ||
    (tYear === sYear && tMonth === sMonth && tDay < sDay)
  ) {
    return "upcoming";
  }

  return "live";
};

const Page = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await fetch("http://localhost:5000/tournament");
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        setTournaments(data);
      } catch (err) {
        console.error(err);
        setError("❌ Failed to fetch tournaments");
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 space-y-6 px-4 py-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-cyan-600 flex items-center gap-2">
          <Trophy className="w-7 h-7" />
          Tournaments
        </h1>
        <span className="text-sm text-slate-500">
          Compete • Win • Dominate
        </span>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-slate-500">
          Loading tournaments...
        </p>
      )}

      {/* ERROR */}
      {error && (
        <p className="text-center text-red-500">
          {error}
        </p>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && tournaments.length === 0 && (
        <div className="text-center mt-20">
          <p className="text-xl font-semibold text-slate-600">
            📭 No tournaments available
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Please check back later for upcoming tournaments.
          </p>
        </div>
      )}

      {/* TOURNAMENT CARDS */}
      {!loading && !error && tournaments.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tournaments.map((t) => {
            const status = getTournamentStatus(t.startdate, t.enddate);

            return (
              <div
                key={t.tournamentId}
                className="bg-white border border-slate-200 rounded-2xl p-6
                           shadow-sm hover:shadow-md hover:border-cyan-400
                           transition-all"
              >
                <h2 className="text-xl font-bold text-slate-800 mb-3">
                  {(t.name || "UNKNOWN TOURNAMENT").toUpperCase()}
                </h2>

                <div className="space-y-2 text-slate-600 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-cyan-500" />
                    <span>
                      {t.startdate || "—"} – {t.enddate || "—"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-500" />
                    <span>
                      Slots: {t.slots || "Limited"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  {status === "upcoming" && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-100 text-cyan-700">
                      ⏳ Upcoming
                    </span>
                  )}
                  {status === "live" && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700 animate-pulse">
                      🟢 Live
                    </span>
                  )}
                  {status === "passed" && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-200 text-slate-600">
                      ⚫ Passed
                    </span>
                  )}

                  <Link
                    href={`/detail/${t.tournamentId}`}
                    className="text-sm font-semibold text-cyan-600 hover:underline"
                  >
                    View Details
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
