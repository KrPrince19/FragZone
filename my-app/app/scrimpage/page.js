"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CalendarDays, Swords, Users } from "lucide-react";
import { socket } from "@/lib/socket";

/* ================= STATUS LOGIC ================= */
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
  const [upcomingScrims, setUpcomingScrims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH SCRIMS ================= */
  const fetchScrims = useCallback(async () => {
    try {
      const res = await fetch(
        "https://bgmibackendzm.onrender.com/upcomingscrim",
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      setUpcomingScrims(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to fetch upcoming scrims");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchScrims();
  }, [fetchScrims]);

  /* ================= SOCKET.IO REALTIME (FIXED & GUARANTEED) ================= */
  useEffect(() => {
    // 🔥 Ensure socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    const handler = (data) => {
      console.log("📡 Scrim socket event received:", data);

      // ✅ EXACT event from backend
      if (data?.event === "UPCOMING_SCRIM_ADDED") {
        fetchScrims();
      }
    };

    socket.on("db-update", handler);

    return () => {
      socket.off("db-update", handler);
    };
  }, [fetchScrims]);

  return (
    <div className="min-h-screen bg-slate-50 space-y-6 px-4 py-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-cyan-600 flex items-center gap-2">
          <Swords className="w-7 h-7" />
          Upcoming Scrims
        </h1>
        <span className="text-sm text-slate-500">
          Compete • Win • Glory
        </span>
      </div>

      {loading && (
        <p className="text-center text-slate-500">
          Loading upcoming scrims...
        </p>
      )}

      {error && (
        <p className="text-center text-red-500">{error}</p>
      )}

      {!loading && !error && upcomingScrims.length === 0 && (
        <p className="text-center mt-20 text-slate-500">
          📭 No upcoming scrims available
        </p>
      )}

      {!loading && !error && upcomingScrims.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {upcomingScrims.map((t, index) => {
            const status = getTournamentStatus(t.startdate, t.enddate);

            return (
              <div
                key={index}
                className="bg-white border rounded-2xl p-6 shadow-sm
                           hover:shadow-md hover:border-cyan-400 transition-all"
              >
                <h2 className="text-xl font-bold mb-4">
                  {(t.name || "UNKNOWN SCRIM").toUpperCase()}
                </h2>

                <div className="text-sm text-slate-600 space-y-2">
                  <div className="flex gap-2">
                    <CalendarDays size={14} />
                    {t.startdate}
                  </div>

                  <div className="flex gap-2">
                    <Users size={14} />
                    Time: {t.time}
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

                  
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
