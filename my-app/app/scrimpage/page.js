"use client";

import React, { useEffect, useState } from "react";
import { CalendarDays, Clock, Swords } from "lucide-react";
import socket from "../../lib/socket"; // ✅ adjust path if needed

/* =================================================
   SAFE STATUS CALCULATION (DATE + TIME)
================================================= */
const getScrimStatus = (startdate, time) => {
  if (!startdate || !time) return "upcoming";

  const now = new Date();
  let day, month, year;

  if (startdate.includes("-") && startdate.split("-")[0].length === 4) {
    [year, month, day] = startdate.split("-").map(Number);
  } else {
    const parts = startdate.includes("/")
      ? startdate.split("/")
      : startdate.split("-");
    [day, month, year] = parts.map(Number);
  }

  const [timePart, period] = time.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  const scrimStart = new Date(year, month - 1, day, hours, minutes, 0);
  const scrimEnd = new Date(scrimStart.getTime() + 60 * 60000);

  if (now < scrimStart) return "upcoming";
  if (now >= scrimStart && now <= scrimEnd) return "live";
  return "passed";
};

const Page = () => {
  const [upcomingScrim, setScrim] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH SCRIMS ================= */
  const fetchScrims = async () => {
    try {
      const res = await fetch("http://localhost:5000/upcomingscrim");
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setScrim(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to fetch scrims");
    } finally {
      setLoading(false);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchScrims();
  }, []);

  /* ================= SOCKET LISTENER ================= */
  useEffect(() => {
    socket.on("db-update", (data) => {
      if (
        data.event === "UPCOMING_SCRIM_ADDED" ||
        data.event === "TOURNAMENT_ADDED"
      ) {
        fetchScrims(); // 🔥 KEY LINE (refetch)
      }
    });

    return () => socket.off("db-update");
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 space-y-6 px-4 py-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-cyan-600 flex items-center gap-2">
          <Swords className="w-7 h-7" />
          Scrims
        </h1>
        <span className="text-sm text-slate-500">
          Practice • Compete • Improve
        </span>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-slate-500">
          Loading scrims...
        </p>
      )}

      {/* ERROR */}
      {error && (
        <p className="text-center text-red-500">
          {error}
        </p>
      )}

      {/* EMPTY */}
      {!loading && !error && upcomingScrim.length === 0 && (
        <div className="text-center mt-20">
          <p className="text-xl font-semibold text-slate-600">
            📭 No scrims available
          </p>
          <p className="text-sm text-slate-500 mt-2">
            New scrims will appear here soon. Stay tuned!
          </p>
        </div>
      )}

      {/* SCRIM CARDS */}
      {!loading && !error && upcomingScrim.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {upcomingScrim.map((scrim, index) => {
            const status = getScrimStatus(scrim.startdate, scrim.time);

            return (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-2xl p-6
                           shadow-sm hover:shadow-md hover:border-cyan-400
                           transition-all"
              >
                <h2 className="text-xl font-bold text-slate-800 mb-4">
                  {(scrim.name || "UNKNOWN SCRIM").toUpperCase()}
                </h2>

                <div className="space-y-3 text-slate-600 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-cyan-500" />
                    <span>{scrim.startdate || "TBA"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-500" />
                    <span>{scrim.time || "TBA"}</span>
                  </div>
                </div>

                <div className="mt-5">
                  {status === "upcoming" && (
                    <span className="inline-block text-xs font-bold px-3 py-1 rounded-full
                                     bg-cyan-100 text-cyan-700">
                      ⏳ Upcoming
                    </span>
                  )}

                  {status === "live" && (
                    <span className="inline-block text-xs font-bold px-3 py-1 rounded-full
                                     bg-red-100 text-red-700 animate-pulse">
                      🔴 Live
                    </span>
                  )}

                  {status === "passed" && (
                    <span className="inline-block text-xs font-bold px-3 py-1 rounded-full
                                     bg-slate-200 text-slate-600">
                      ⚫ Passed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Page;
