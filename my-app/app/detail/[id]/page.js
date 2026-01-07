"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { socket } from "../../../lib/socket";

export default function DetailPage() {
  const params = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTournamentDetails = useCallback(async () => {
    // Ensure params.id exists (e.g., "deadzone")
    if (!params.id) return;

    try {
      const res = await fetch(
        `https://bgmibackendzm.onrender.com/tournamentdetail/${params.id}`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch");
      }

      const data = await res.json();
      setTournament(data);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchTournamentDetails();
  }, [fetchTournamentDetails]);

  // Socket listener remains the same
  useEffect(() => {
    const handler = (data) => {
      if (data.event === "TOURNAMENT_ADDED") {
        fetchTournamentDetails(); 
      }
    };
    socket.on("db-update", handler);
    return () => socket.off("db-update", handler);
  }, [fetchTournamentDetails]);

  if (loading) return <div className="text-center mt-20 animate-pulse">Loading {params.id}...</div>;
  if (error) return <div className="text-center mt-20 text-red-500 font-bold">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8">
        
        {/* Verification Check */}
        <div className="mb-4 text-xs font-mono text-slate-400">
          Viewing Record: {tournament.tournamentId}
        </div>

        <h1 className="text-3xl font-extrabold text-cyan-600 mb-6 uppercase">
          {tournament.name || "Unnamed Tournament"}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem label="Map" value={tournament.map} />
          <DetailItem label="Prize Pool" value={tournament.prizePool} />
          <DetailItem label="Start Date" value={tournament.startdate} />
          <DetailItem label="End Date" value={tournament.enddate} />
        </div>
      </div>
    </div>
  );
}

const DetailItem = ({ label, value }) => (
  <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
    <p className="text-sm text-slate-500 font-semibold uppercase">{label}</p>
    <p className="text-lg font-bold text-slate-800">{value || "TBA"}</p>
  </div>
);
