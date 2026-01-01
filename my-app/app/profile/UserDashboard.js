"use client";

import { UserButton } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import socket from "../../lib/socket"; // ✅ adjust path if needed

export default function UserDashboard({ userEmail, name }) {
  const [Joindata, setJoindata] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH JOINED MATCHES ================= */
  const fetchTournamentDetails = async () => {
    try {
      const res = await fetch("http://localhost:5000/joinmatches");
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setJoindata(data);
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
      if (data.event === "JOIN_MATCH") {
        fetchTournamentDetails(); // 🔥 refetch ONCE
      }
    });

    return () => socket.off("db-update");
  }, []);

  /* ================= FIND USER MATCH ================= */
  useEffect(() => {
    if (Joindata.length > 0 && userEmail) {
      const foundTournament = Joindata.find(
        (t) => String(t.playerEmail).trim() === userEmail.trim()
      );
      setTournament(foundTournament || null);
    }
  }, [Joindata, userEmail]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <p className="text-center mt-20 text-lg font-semibold text-slate-600">
        Loading tournament details...
      </p>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <p className="text-red-500 text-center mt-20 font-semibold">
        {error}
      </p>
    );
  }

  /* ================= NO JOINED MATCH ================= */
  if (!tournament) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <UserButton />
          </div>

          <h1 className="text-xl font-bold text-slate-800 mb-2">
            Hi, {name} 👋
          </h1>

          <p className="text-slate-600 mb-4">
            Welcome to <span className="font-semibold text-cyan-600">FragZone</span>
          </p>

          <p className="text-sm text-red-500">
            No joined match found for
          </p>
          <p className="text-sm font-semibold text-slate-700 mt-1">
            {userEmail}
          </p>
        </div>
      </div>
    );
  }

  /* ================= JOINED MATCH ================= */
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-sm p-8">

        {/* HEADER */}
        <div className="flex flex-col items-center mb-6">
          <UserButton />
          <h1 className="text-xl font-bold text-slate-800 mt-2">
            Hi, {name} 👋
          </h1>
          <p className="text-slate-500">
            Welcome to <span className="text-cyan-600 font-semibold">FragZone</span>
          </p>
        </div>

        {/* MATCH DETAILS */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <h2 className="text-center text-2xl font-extrabold text-slate-800 mb-6">
            🎮 Joined Match
          </h2>

          <Detail label="Tournament" value={tournament.tournamentName} />
          <Detail label="1st Player" value={tournament.firstPlayer} />
          <Detail label="2nd Player" value={tournament.secondPlayer} />
          <Detail label="3rd Player" value={tournament.thirdPlayer} />
          <Detail label="4th Player" value={tournament.fourthPlayer} />
        </div>

        {/* WHATSAPP INFO */}
        <div className="mt-6 text-center">
          <p className="text-orange-500 font-semibold mb-4">
            📢 Room ID & Password will be shared on WhatsApp  
            <br />
            15 minutes before match starts
          </p>

          <a
            href="https://chat.whatsapp.com/B4ueuPnqiI3450tsudC2jt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-500 hover:bg-green-600
                       text-white font-bold px-6 py-3 rounded-xl
                       transition-all shadow-sm"
          >
            👉 Join WhatsApp Group
          </a>
        </div>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */
const Detail = ({ label, value }) => (
  <div className="flex justify-between items-center border-b border-slate-200 py-3 last:border-none">
    <span className="font-semibold text-slate-600">{label}</span>
    <span className="font-bold text-slate-800">
      {value?.toUpperCase() || "N/A"}
    </span>
  </div>
);
