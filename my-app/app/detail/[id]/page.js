"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { socket } from "../../../lib/socket";




export default function DetailPage() {
  const params = useParams();
  const [tournamentDetail, setTournamentDetail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH TOURNAMENT DETAILS ================= */
  const fetchTournamentDetails = async () => {
    try {
      const res = await fetch("https://bgmibackend.vercel.app/tournamentdetail");
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setTournamentDetail(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch tournament data.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchTournamentDetails();
  }, []);

  /* ================= SOCKET LISTENER ================= */
  useEffect(() => {
    socket.on("db-update", (data) => {
      if (data.event === "TOURNAMENT_DETAIL_UPDATED") {
        fetchTournamentDetails(); // 🔥 refetch ONCE
      }
    });

    return () => socket.off("db-update");
  }, []);

  const tournament = tournamentDetail.find(
    (t) => String(t.tournamentId).trim() === String(params.id).trim()
  );

  if (loading) {
    return (
      <p className="text-center mt-12 text-gray-500 text-lg">
        Loading tournament details...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center mt-12 text-red-500 text-lg">
        {error}
      </p>
    );
  }

  if (!tournament) {
    return (
      <p className="text-center mt-12 text-red-500 text-lg">
        Tournament not found.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-12 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6 md:p-8 lg:p-10">
        
        {/* TITLE */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center text-cyan-500 mb-8">
          {(tournament.name || "UNKNOWN TOURNAMENT").toUpperCase()}
        </h1>

        {/* DETAILS GRID */}
        <div className="grid sm:grid-cols-2 gap-6 text-slate-700">
          <DetailItem label="Start Date" value={tournament.startdate} />
          <DetailItem label="End Date" value={tournament.enddate} />
          <DetailItem label="Map" value={tournament.map || "TBA"} />
          <DetailItem label="Prize Pool" value={tournament.prizePool || "TBA"} />
        </div>
      </div>
    </div>
  );
}

/* ---------- SMALL REUSABLE COMPONENT ---------- */
const DetailItem = ({ label, value }) => (
  <div className="bg-slate-100 rounded-xl p-4 flex flex-col">
    <span className="text-sm font-semibold text-slate-500">
      {label}
    </span>
    <span className="text-lg font-bold text-slate-800 mt-1">
      {value}
    </span>
  </div>
);
