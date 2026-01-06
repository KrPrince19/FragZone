"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CalendarDays, Swords, Users, Wifi, WifiOff } from "lucide-react";
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

  const fetchTournaments = useCallback(async () => {
    try {
      const res = await fetch("https://bgmibackendzm.onrender.com/tournament", { cache: "no-store" });
      const data = await res.json();
      setTournaments(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const handleUpdate = (data) => {
      console.log("📡 Socket Event:", data.event);
      if (data?.event === "TOURNAMENT_ADDED" || data?.event === "JOIN_MATCH") {
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-cyan-600 flex items-center gap-2">
          <Swords className="w-7 h-7" /> Tournaments
        </h1>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border text-[10px] font-bold">
          {isConnected ? <><Wifi size={12} className="text-green-500" /> LIVE SYNC</> 
                       : <><WifiOff size={12} className="text-red-500" /> SYNCING...</>}
        </div>
      </div>

      {loading ? <p className="text-center py-10">Loading...</p> : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tournaments.map((t, i) => {
            const status = getTournamentStatus(t.startdate, t.enddate);
            return (
              <div key={t.tournamentId || i} className="bg-white border rounded-2xl p-6 shadow-sm hover:border-cyan-400 transition-all">
                <h2 className="text-xl font-bold mb-4 uppercase">{t.name || "Tournament"}</h2>
                <div className="text-sm text-slate-600 space-y-2">
                  <div className="flex gap-2"><CalendarDays size={14} /> {t.startdate} – {t.enddate}</div>
                  <div className="flex gap-2"><Users size={14} /> Slots: {t.slots || "Unlimited"}</div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  {status === "live" && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">🟢 LIVE</span>}
                  {status === "upcoming" && <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-xs font-bold">⏳ UPCOMING</span>}
                  {status === "passed" && <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">⚫ PASSED</span>}
                  <Link href={`/detail/${t.tournamentId}`} className="text-cyan-600 text-sm font-semibold hover:underline">View Details</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
