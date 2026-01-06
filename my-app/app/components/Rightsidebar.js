"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Clock, Swords, Radio } from "lucide-react"; // Added Radio for live icon
import { socket } from "@/lib/socket";

const LiveScrimSidebar = () => {
  const [scrims, setScrims] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchScrims = useCallback(async () => {
    try {
      const res = await fetch("https://bgmibackend-1.onrender.com/upcomingscrim", { 
        cache: "no-store" 
      });
      const data = await res.json();
      setScrims(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScrims();
    // Refresh the UI every 60 seconds to update "Live" status automatically
    const interval = setInterval(fetchScrims, 60000);
    return () => clearInterval(interval);
  }, [fetchScrims]);

  /* ================= REAL-TIME STATUS LOGIC ================= */
  const getScrimStatus = (scrimTimeStr) => {
    if (!scrimTimeStr) return "upcoming";

    const now = new Date();
    const [time, modifier] = scrimTimeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const scrimDate = new Date();
    scrimDate.setHours(hours, minutes, 0, 0);

    const diffInMinutes = (scrimDate - now) / 60000;

    // 1. LIVE: Start time has passed, but it's been less than 45 mins (Match Duration)
    if (diffInMinutes <= 0 && diffInMinutes >= -45) return "live";
    
    // 2. SOON: Match starts within the next 30 minutes
    if (diffInMinutes > 0 && diffInMinutes <= 30) return "soon";

    // 3. UPCOMING: More than 30 mins away
    return "upcoming";
  };

  const liveScrims = scrims.filter(s => getScrimStatus(s.time) === "live");
  const soonScrims = scrims.filter(s => getScrimStatus(s.time) === "soon");

  return (
    <aside className="hidden lg:block w-72 bg-slate-50 border-l min-h-screen p-4">
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b pb-4">
          <Swords className="text-cyan-600 w-6 h-6" />
          <h2 className="text-xl font-bold text-slate-800">Scrim Center</h2>
        </div>

        {/* 🔴 LIVE SECTION */}
        {liveScrims.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-red-600 text-xs font-black tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                LIVE NOW
              </span>
            </div>
            {liveScrims.map((s, i) => (
              <div key={i} className="group relative bg-white border-l-4 border-red-500 rounded-r-xl p-4 shadow-sm hover:shadow-md transition-all">
                <p className="font-bold text-slate-800 leading-tight mb-1">{s.name}</p>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                   <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded">MAP: {s.map}</span>
                   <span className="flex items-center gap-1"><Radio size={10}/> IN PROGRESS</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ⏱ STARTING SOON SECTION */}
        {soonScrims.length > 0 && (
          <div className="space-y-3">
            <span className="text-amber-600 text-xs font-black tracking-widest flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              STARTING SOON
            </span>
            {soonScrims.map((s, i) => (
              <div key={i} className="bg-white border-l-4 border-amber-400 rounded-r-xl p-4 shadow-sm border border-slate-100">
                <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 italic">{s.time}</span>
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold uppercase">{s.map}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && liveScrims.length === 0 && soonScrims.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 opacity-40">
            <div className="bg-slate-200 p-4 rounded-full mb-2">
              <Clock className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500">No active scrims</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default LiveScrimSidebar;
