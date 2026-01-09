"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CalendarDays, Swords, Users, Wifi, WifiOff, History } from "lucide-react";
import { socket } from "@/lib/socket";

const getTournamentStatus = (startdate, enddate) => {
  if (!startdate) return "upcoming";
  
  // Helper to normalize date strings (handles YYYY-MM-DD and DD/MM/YYYY)
  const parse = (d) => {
    if (!d) return new Date();
    const p = d.includes("/") ? d.split("/") : d.split("-");
    // If first part is 4 digits, assume YYYY-MM-DD
    return p[0].length === 4
      ? new Date(p[0], p[1] - 1, p[2])
      : new Date(p[2], p[1] - 1, p[0]);
  };

  const now = new Date();
  const s = parse(startdate);
  const e = enddate ? parse(enddate) : s; // Default end to start if missing

  // Set hours to 0 to compare dates only, or keep as is for time sensitivity
  if (now < s) return "upcoming";
  if (now > e) return "passed";
  return "live";
};

export default function Page() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(socket.connected);

  /* ================= FETCH DATA ================= */
  const fetchAllData = useCallback(async () => {
    try {
      const res = await fetch("https://bgmibackendzm.onrender.com/tournament", { 
        cache: "no-store" 
      });

      if (!res.ok) throw new Error("Failed to fetch");
      
      const data = await res.json();
      // Ensure data is an array before setting state
      setTournaments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= SOCKET.IO LOGIC ================= */
  useEffect(() => {
    fetchAllData();

    function onConnect() { setIsConnected(true); }
    function onDisconnect() { setIsConnected(false); }

    const handleUpdate = (data) => {
      const relevantEvents = [
        "TOURNAMENT_ADDED", 
        "TOURNAMENT_DETAIL_UPDATED", 
        "PASSED_MATCH_ADDED",
        "JOIN_MATCH"
      ];

      if (relevantEvents.includes(data?.event)) {
        fetchAllData();
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
  }, [fetchAllData]);

  return (
    <div className="min-h-screen bg-slate-50 space-y-6 px-4 py-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-cyan-600 flex items-center gap-2">
          <Swords className="w-7 h-7" /> Match Center
        </h1>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border text-[10px] font-bold shadow-sm">
          {isConnected ? (
            <><Wifi size={12} className="text-green-500" /> LIVE SYNC</>
          ) : (
            <><WifiOff size={12} className="text-red-500" /> OFFLINE</>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tournaments.length === 0 ? (
            <div className="col-span-full text-center py-10 text-slate-500">No tournaments found.</div>
          ) : (
            tournaments.map((t) => {
              const status = getTournamentStatus(t.startdate, t.enddate);
              
              // Dynamic Routing
              const detailLink = status === "passed" 
                  ? `/passed/${t.tournamentId}` 
                  : `/detail/${t.tournamentId}`;

              return (
                <div 
                  key={t.tournamentId || t._id} 
                  className={`group bg-white border rounded-2xl p-6 shadow-sm transition-all duration-300 ${
                      status === 'passed' ? 'opacity-80 grayscale-[0.3]' : 'hover:border-cyan-400 hover:shadow-md'
                  }`}
                >
                  <h2 className="text-xl font-bold mb-4 uppercase text-slate-800 group-hover:text-cyan-600 truncate">
                    {t.name || t.matchName || "Tournament"}
                  </h2>
                  
                  <div className="text-sm text-slate-600 space-y-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-slate-400" /> 
                      {t.startdate || "N/A"} {t.enddate ? `– ${t.enddate}` : ""}
                    </div>
                    {t.slots && (
                      <div className="flex items-center gap-2">
                          <Users size={14} className="text-slate-400" /> 
                          Slots: <span className="font-semibold text-slate-700">{t.slots}</span>
                      </div>
                    )}
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
                        <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <History size={12}/> FINISHED
                        </span>
                      )}
                    </div>
                    
                    <Link 
                      href={detailLink}
                      className={`text-sm font-bold flex items-center gap-1 transition-colors ${
                          status === 'passed' ? 'text-slate-500 hover:text-slate-800' : 'text-cyan-600 hover:text-cyan-800'
                      }`}
                    >
                      {status === "passed" ? "View Results →" : "View →"}
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
