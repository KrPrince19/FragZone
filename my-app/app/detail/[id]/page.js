"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { socket } from "../../../lib/socket";

export default function DetailPage() {
  const params = useParams();
  // Change state to null because we are fetching ONE object, not an array
  const [tournament, setTournament] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH TOURNAMENT DETAILS ================= */
  const fetchTournamentDetails = useCallback(async () => {
    if (!params.id) return;

    try {
      // ✅ FIX 1: Send the ID directly to the backend route we created
      const res = await fetch(
        `https://bgmibackendzm.onrender.com/tournamentdetail/${params.id}`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        if (res.status === 404) throw new Error("Tournament not found");
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setTournament(data);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to fetch tournament data.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchTournamentDetails();
  }, [fetchTournamentDetails]);

  /* ================= SOCKET.IO LISTENER ================= */
  useEffect(() => {
    const handler = (data) => {
      // ✅ FIX 2: Match the event name emitted by your backend
      if (data.event === "TOURNAMENT_ADDED") {
        console.log("📡 Detail Page refreshing due to update");
        fetchTournamentDetails(); 
      }
    };

    socket.on("db-update", handler);

    return () => {
      socket.off("db-update", handler);
    };
  }, [fetchTournamentDetails]);

  // LOADING STATE
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        <p className="ml-4 text-gray-500 text-lg">Loading details...</p>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-500 text-xl font-bold">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-cyan-500 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  // NOT FOUND STATE
  if (!tournament) {
    return <p className="text-center mt-12 text-gray-500 text-lg">No data found.</p>;
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
          <DetailItem label="Tournament ID" value={tournament.tournamentId} />
          <DetailItem label="Status" value={tournament.slots === "0" ? "Full" : "Open"} />
          <DetailItem label="Start Date" value={tournament.startdate} />
          <DetailItem label="End Date" value={tournament.enddate} />
          <DetailItem label="Map" value={tournament.map || "TBA"} />
          <DetailItem label="Prize Pool" value={tournament.prizePool || "TBA"} />
        </div>

        {/* EXTRA DETAILS (Optional) */}
        {tournament.rules && (
          <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <h3 className="font-bold text-amber-800">Rules:</h3>
            <p className="text-amber-900 mt-2 text-sm whitespace-pre-wrap">{tournament.rules}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- SMALL REUSABLE COMPONENT ---------- */
const DetailItem = ({ label, value }) => (
  <div className="bg-slate-100 rounded-xl p-4 flex flex-col border border-slate-200">
    <span className="text-sm font-semibold text-slate-500">
      {label}
    </span>
    <span className="text-lg font-bold text-slate-800 mt-1">
      {value || "N/A"}
    </span>
  </div>
);
