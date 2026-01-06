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
      setScrims(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Failed to fetch scrims:", err);
      setScrims([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScrims();
  }, [fetchScrims]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    const handler = (data) => {
      if (data?.event === "UPCOMING_SCRIM_ADDED") {
        fetchScrims();
      }
    };

    socket.on("db-update", handler);
    return () => socket.off("db-update", handler);
  }, [fetchScrims]);

  /* ================= GUARANTEED STATUS LOGIC ================= */
  const getScrimStatus = (startdate, time) => {
    if (!startdate || !time) return "upcoming";

    const cleanTime = time
      .toUpperCase()
      .replace(" AM", "")
      .replace(" PM", "");

    let [hours, minutes] = cleanTime.split(":").map(Number);

    if (time.toUpperCase().includes("PM") && hours < 12) hours += 12;
    if (time.toUpperCase().includes("AM") && hours === 12) hours = 0;

    const scrimDateTime = new Date(
      `${startdate}T${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:00`
    );

    const now = new Date();
    const diff = (scrimDateTime - now) / 60000;

    if (diff <= 0 && diff >= -40) return "live";
    if (diff > 0 && diff <= 30) return "soon";
    return "upcoming";
  };

  const liveScrims = scrims.filter(
    (s) => getScrimStatus(s.startdate, s.time) === "live"
  );

  const soonScrims = scrims.filter(
    (s) => getScrimStatus(s.startdate, s.time) === "soon"
  );

  return (
    <aside className="hidden lg:block w-64 bg-white border-l p-4">
      <div className="bg-white border rounded-2xl p-4 space-y-5">

        <h2 className="text-lg font-bold text-cyan-600 flex items-center gap-2">
          <Swords className="w-5 h-5" />
          Live Scrims
        </h2>

        {/* LIVE */}
        {liveScrims.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-red-600 mb-2">🔴 LIVE NOW</h3>
            {liveScrims.map((s, i) => (
              <div key={i} className="bg-red-50 p-3 rounded-xl mb-2">
                <p className="font-bold">{s.name}</p>
                <p className="text-xs">Map: {s.map}</p>
              </div>
            ))}
          </div>
        )}

        {/* SOON */}
        {soonScrims.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-amber-600 mb-2">
              ⏱ STARTING SOON
            </h3>
            {soonScrims.map((s, i) => (
              <div key={i} className="bg-amber-50 p-3 rounded-xl mb-2">
                <p className="font-bold">{s.name}</p>
                <p className="text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {s.time}
                </p>
              </div>
            ))}
          </div>
        )}

        {!loading && liveScrims.length === 0 && soonScrims.length === 0 && (
          <p className="text-center text-slate-400">No active scrims</p>
        )}
      </div>
    </aside>
  );
};

export default LiveScrimSidebar;
