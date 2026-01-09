"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CalendarDays, Swords, Users, Wifi, WifiOff, History } from "lucide-react";
import { socket } from "@/lib/socket";

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
  const [isConnected, setIsConnected] = useState(socket.connected);

  /* ================= FETCH DATA FROM BOTH COLLECTIONS ================= */
  const fetchAllData = useCallback(async () => {
    try {
      // Fetching from both tournament and passedmatch
      const [res1, res2] = await Promise.all([
        fetch("https://bgmibackendzm.onrender.com/tournament", { cache: "no-store" }),
        fetch("https://bgmibackendzm.onrender.com/passedmatch", { cache: "no-store" })
      ]);

      const data1 = res1.ok ? await res1.json() : [];
      const data2 = res2.ok ? await res2.json() : [];

      // Combine and remove duplicates based on tournamentId if necessary
      setTournaments([...data1, ...data2]);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= SOCKET.IO LOGIC ================= */
  useEffect(() => {
    fetchAllData();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const handleUpdate = (data) => {
      const relevantEvents = [
        "TOURNAMENT_ADDED", 
        "TOURNAMENT_DETAIL_UPDATED", 
        "PASSED_MATCH_ADDED", // Added listener for passed matches
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
          {tournaments.map((t, i) => {
            const status = getTournamentStatus(t.startdate, t.enddate);
            
            // DYNAMIC ROUTING LOGIC
            // If status is passed, go to /passed, otherwise go to /detail
            const detailLink = status === "passed" 
                ? `/passed/${t.tournamentId}` 
                : `/detail/${t.tournamentId}`;

            return (
              <div 
                key={t.tournamentId || i} 
                className={`group bg-white border rounded-2xl p-6 shadow-sm transition-all duration-300 ${
                    status === 'passed' ? 'opacity-80 grayscale-[0.3]' : 'hover:border-cyan-400 hover:shadow-md'
                }`}
              >
                <h2 className="text-xl font-bold mb-4 uppercase text-slate-800 group-hover:text-cyan-600">
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
                    className={`text-sm font-bold flex items-center gap-1 ${
                        status === 'passed' ? 'text-slate-500 hover:text-slate-700' : 'text-cyan-600 hover:text-cyan-700'
                    }`}
                  >
                    {status === "passed" ? "View Results →" : "Join Tournament →"}
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