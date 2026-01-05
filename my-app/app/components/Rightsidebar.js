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
      const data = await res.json();

      setScrims(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Failed to fetch scrims", err);
      setScrims([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchScrims();
  }, [fetchScrims]);

  /* ================= SOCKET.IO LISTENER (SYNCED) ================= */
  useEffect(() => {
    const handler = (data) => {
      // Listens for specific Scrim events + broader tournament events
      const shouldRefresh = 
        data.event === "SCRIM_ADDED" ||
        data.event === "SCRIM_UPDATED" ||
        data.event === "SCRIM_DELETED" ||
        data.event === "TOURNAMENT_ADDED" ||   // Logic from tournament page
        data.event === "RESULT_PUBLISHED";     // Logic from winner page

      if (shouldRefresh) {
        console.log("Real-time Scrim Sidebar update:", data.event);
        fetchScrims(); 
      }
    };

    socket.on("db-update", handler);

    return () => {
      socket.off("db-update", handler);
    };
  }, [fetchScrims]);

  /* ================= SCRIM STATUS LOGIC ================= */
 const getScrimStatus = (date, time) => {
  if (!date || !time) return "upcoming";

  const now = new Date();

  /* 1. PARSE DATE */
  let [day, month, year] = date.includes("/") ? date.split("/") : date.split("-");
  // Handle YYYY-MM-DD
  if (day.length === 4) [year, month, day] = [day, month, year];

  /* 2. PARSE TIME */
  let hours, minutes;
  const timeClean = time.toLowerCase().trim();

  if (timeClean.includes("am") || timeClean.includes("pm")) {
    // 12-hour logic (e.g., "11:00 pm")
    const period = timeClean.includes("pm") ? "pm" : "am";
    const numericPart = timeClean.replace(/am|pm/g, "").trim();
    let [h, m] = numericPart.split(":").map(Number);

    if (period === "pm" && h < 12) h += 12;
    if (period === "am" && h === 12) h = 0;
    hours = h;
    minutes = m;
  } else {
    // 24-hour logic (e.g., "23:00")
    [hours, minutes] = timeClean.split(":").map(Number);
  }

  const scrimStart = new Date(year, month - 1, day, hours, minutes, 0);
  const diffMinutes = (scrimStart - now) / 60000;

  // Debugging: console.log(scrimStart, diffMinutes); 

  if (diffMinutes <= 0 && diffMinutes >= -40) return "live";
  if (diffMinutes > 0 && diffMinutes <= 30) return "soon";

  return "upcoming";
};

  /* ================= FILTERS ================= */
  const liveScrims = scrims.filter(
    (s) => getScrimStatus(s.date, s.time) === "live"
  );

  const soonScrims = scrims.filter(
    (s) => getScrimStatus(s.date, s.time) === "soon"
  );

  return (
    <aside className="hidden lg:block w-64 bg-white border-l border-slate-200 p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-5 sticky top-6">

        {/* HEADER */}
        <h2 className="text-lg font-bold text-cyan-600 flex items-center gap-2">
          <Swords className="w-5 h-5" />
          Live Scrims
        </h2>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="w-3 h-3 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            Updating...
          </div>
        )}

        {/* 🔴 LIVE SECTION */}
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
                className="border border-red-200 rounded-xl p-3 mb-2 bg-red-50 hover:shadow-md transition-shadow"
              >
                <p className="font-bold text-slate-800 text-sm">
                  {scrim.name}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-slate-600 mt-1">
                   Map: {scrim.map || "TBA"}
                </p>

                <button className="mt-2 w-full text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg py-1.5 transition-colors">
                  Join Scrim
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ⏱ STARTING SOON SECTION */}
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
             <p className="text-[10px] text-slate-300 mt-1">Check back later</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default LiveScrimSidebar;