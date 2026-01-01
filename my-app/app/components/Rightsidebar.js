
    "use client";

import React, { useEffect, useState } from "react";
import { Clock, Swords } from "lucide-react";

const LiveScrimSidebar = () => {
  const [scrims, setScrims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScrims = async () => {
      try {
        const res = await fetch("http://localhost:5000/upcomingscrim");
        const data = await res.json();
        setScrims(data);
      } catch (err) {
        console.error("Failed to fetch scrims");
      } finally {
        setLoading(false);
      }
    };

    fetchScrims();
  }, []);

 const getScrimStatus = (time) => {
  if (!time) return "upcoming";

  const now = new Date();

  let hours, minutes;

  // Handle "1:04 am" or "10:30 pm"
  if (time.toLowerCase().includes("am") || time.toLowerCase().includes("pm")) {
    const [timePart, period] = time.toLowerCase().split(" ");
    let [h, m] = timePart.split(":").map(Number);

    if (period === "pm" && h !== 12) h += 12;
    if (period === "am" && h === 12) h = 0;

    hours = h;
    minutes = m;
  } 
  // Handle "13:04" (24-hour format)
  else {
    [hours, minutes] = time.split(":").map(Number);
  }

  const scrimTime = new Date();
  scrimTime.setHours(hours, minutes, 0, 0);

  const diff = (scrimTime - now) / 60000; // minutes

  // 🔴 LIVE: started within last 40 minutes
  if (diff <= 0 && diff >= -40) return "live";

  // ⏱ STARTING SOON: next 30 minutes
  if (diff > 0 && diff <= 30) return "soon";

  return "upcoming";
};


  const liveScrims = scrims.filter(
    (s) => getScrimStatus(s.time) === "live"
  );

  const soonScrims = scrims.filter(
    (s) => getScrimStatus(s.time) === "soon"
  );

  return (
         <aside className="hidden lg:block w-64 bg-white border-l border-slate-200 p-4">

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-5">

        {/* HEADER */}
        <h2 className="text-lg font-bold text-cyan-600 flex items-center gap-2">
          <Swords className="w-5 h-5" />
          Live Scrims
        </h2>

        {loading && (
          <p className="text-sm text-slate-500">Loading scrims…</p>
        )}

        {/* 🔴 LIVE */}
        {liveScrims.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-red-600 mb-2">
              🔴 LIVE NOW
            </h3>

            {liveScrims.map((scrim, idx) => (
              <div
                key={idx}
                className="border border-red-200 rounded-xl p-3 mb-2 bg-red-50"
              >
                <p className="font-bold text-slate-800">
                  {scrim.name}
                </p>
                <p className="text-xs text-slate-600">
                  {scrim.map || "Map TBA"}
                </p>

                <button className="mt-2 w-full text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg py-1">
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
                <p className="font-bold text-slate-800">
                  {scrim.name}
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {scrim.time}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && liveScrims.length === 0 && soonScrims.length === 0 && (
          <p className="text-sm text-slate-500 text-center">
            No live scrims right now
          </p>
        )}
      </div>
    </aside>
  );
};

export default LiveScrimSidebar;
