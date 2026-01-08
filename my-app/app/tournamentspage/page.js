"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CalendarDays, Swords, Users, Wifi, WifiOff } from "lucide-react";
import { socket } from "@/lib/socket";

const getTournamentStatus = (startdate, enddate) => {
  if (!startdate || !enddate) return "upcoming";
  const parse = (d) => {
    const p = d.includes("/") ? d.split("/") : d.split("-");
    // Handle YYYY-MM-DD or DD-MM-YYYY
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
  const [isConnected, setIsConnected] = useState(socket.connected);

  /* ================= FETCH DATA ================= */
  const fetchTournaments = useCallback(async () => {
    try {
      const res = await fetch("https://bgmibackendzm.onrender.com/tournament", { 
        cache: "no-store" 
      });
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setTournaments(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= SOCKET.IO LOGIC ================= */
  useEffect(() => {
    fetchTournaments();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const handleUpdate = (data) => {
      console.log("📡 Socket Event:", data?.event);
      
      // Matches the logic from your Upcoming Page and Backend
      const relevantEvents = [
        "TOURNAMENT_ADDED", 
        "TOURNAMENT_DETAIL_UPDATED", 
        "JOIN_MATCH"
      ];

      if (relevantEvents.includes(data?.event)) {
        fetchTournaments();
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("db-update", handleUpdate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("db-update", handleUpdate);
    };
  }, [fetchTournaments]);

  return (
    <div className="min-h-screen bg-slate-50 space-y-6 px-4 py-6">
      
      {/* HEADER WITH SYNC INDICATOR */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-cyan-600 flex items-center gap-2">
          <Swords className="w-7 h-7" /> Tournaments
        </h1>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border text-[10px] font-bold shadow-sm">
          {isConnected ? (
            <>
              <Wifi size={12} className="text-green-500" /> 
              <span className="text-slate-600">LIVE SYNC</span>
            </>
          ) : (
            <>
              <WifiOff size={12} className="text-red-500" /> 
              <span className="text-red-500">OFFLINE</span>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tournaments.map((t, i) => {
            const status = getTournamentStatus(t.startdate, t.enddate);
            return (
              <div 
                key={t.tournamentId || i} 
                className="group bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-cyan-400 transition-all duration-300"
              >
                <h2 className="text-xl font-bold mb-4 uppercase text-slate-800 group-hover:text-cyan-600 transition-colors">
                  {t.name || "Tournament"}
                </h2>
                
                <div className="text-sm text-slate-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-slate-400" /> 
                    {t.startdate} – {t.enddate}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-slate-400" /> 
                    Slots: <span className="font-semibold text-slate-700">{t.slots || "Unlimited"}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div>
                    {status === "live" && (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse inline-flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-600 rounded-full"></span> LIVE
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
                    className="text-cyan-600 text-sm font-bold hover:text-cyan-700 hover:underline flex items-center gap-1"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tournaments.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
          <p className="text-slate-400">No tournaments found.</p>
        </div>
      )}
    </div>
  );
}
