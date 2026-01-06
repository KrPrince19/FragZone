"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Clock, Swords } from "lucide-react";
import { socket } from "@/lib/socket";

const LiveScrimSidebar = () => {
  const [scrims, setScrims] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH SCRIMS ================= */
  const fetchScrims = useCallback(async () => {
    try {
      const res = await fetch(
        "https://bgmibackend-1.onrender.com/upcomingscrim",
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      setScrims(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Failed to fetch scrims:", err);
      setScrims([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchScrims();
  }, [fetchScrims]);

  /* ================= SOCKET.IO REALTIME (FIXED) ================= */
  useEffect(() => {
    if (!socket) return;

    const handleDBUpdate = (data) => {
      console.log("📡 Scrim socket event:", data);

      // ✅ EVENTS THAT ACTUALLY EXIST IN YOUR BACKEND
      if (
        data?.event === "UPCOMING_SCRIM_ADDED" ||
        data?.event === "TOURNAMENT_ADDED" ||
        data?.event === "WINNER_UPDATED"
      ) {
        fetchScrims(); // 🔥 real-time refresh
      }
    };

    socket.on("db-update", handleDBUpdate);

    return () => {
      socket.off("db-update", handleDBUpdate);
    };
  }, [fetchScrims]);

  /* ================= SCRIM STATUS LOGIC ================= */
 const getScrimStatus = (date, time) => {
  if (!date || !time) return "upcoming";

  const now = new Date();

  let year, month, day;

  // ✅ DATE PARSE
  if (date.includes("-")) {
    // YYYY-MM-DD
    [year, month, day] = date.split("-").map(Number);
  } else {
    // DD/MM/YYYY
    [day, month, year] = date.split("/").map(Number);
  }

  // ✅ TIME PARSE
  let hours, minutes;
  const t = time.toLowerCase().trim();

  if (t.includes("am") || t.includes("pm")) {
    const isPM = t.includes("pm");
    const [h, m] = t.replace(/am|pm/g, "").trim().split(":").map(Number);

    hours = isPM ? (h === 12 ? 12 : h + 12) : h === 12 ? 0 : h;
    minutes = m;
  } else {
    [hours, minutes] = t.split(":").map(Number);
  }

  const scrimTime = new Date(year, month - 1, day, hours, minutes);
  const diff = (scrimTime - now) / 60000;

  if (diff <= 0 && diff >= -40) return "live";
  if (diff > 0 && diff <= 30) return "soon";

  return "upcoming";
};


  /* ================= FILTERS ================= */
  const liveScrims = scrims.filter(
    (s) => getScrimStatus(s.startdate, s.time) === "live"
  );

  const soonScrims = scrims.filter(
    (s) => getScrimStatus(s.startdate, s.time) === "soon"
  );

  return (
    <aside className="hidden lg:block w-64 bg-white border-l border-slate-200 p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-5 sticky top-6">

        {/* HEADER */}
        <h2 className="text-lg font-bold text-cyan-600 flex items-center gap-2">
          <Swords className="w-5 h-5" />
          Live Scrims
        </h2>

        {/* LOADING */}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="w-3 h-3 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            Updating...
          </div>
        )}

        {/* 🔴 LIVE SCRIMS */}
        {liveScrims.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              LIVE NOW
            </h3>

            {liveScrims.map((scrim, idx) => (
              <div
                key={idx}
                className="border border-red-200 rounded-xl p-3 mb-2 bg-red-50 hover:shadow-md transition"
              >
                <p className="font-bold text-slate-800 text-sm">
                  {scrim.name}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-slate-600 mt-1">
                  Map: {scrim.map || "TBA"}
                </p>

                <button className="mt-2 w-full text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg py-1.5">
                  Join Scrim
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ⏱ STARTING SOON */}
        {soonScrims.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-amber-600 mb-2">
              ⏱ Starting Soon
            </h3>

            {soonScrims.map((scrim, idx) => (
              <div
                key={idx}
                className="border border-amber-200 rounded-xl p-3 mb-2 bg-amber-50"
              >
                <p className="font-bold text-slate-800 text-sm">
                  {scrim.name}
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  {scrim.time}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && liveScrims.length === 0 && soonScrims.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-slate-400">No active scrims</p>
            <p className="text-[10px] text-slate-300 mt-1">
              Check back later
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default LiveScrimSidebar;
