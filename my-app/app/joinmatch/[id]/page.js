"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const Page = () => {
  const params = useParams();
  const router = useRouter(); // ✅ ADD

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [mobileHint, setMobileHint] = useState("");

  const [form, setForm] = useState({
    tournamentName: "",
    firstPlayer: "",
    secondPlayer: "",
    thirdPlayer: "",
    fourthPlayer: "",
    playerEmail: "",
    playerMobileNumber: "",
  });

  /* ---------------- Set Tournament Name ---------------- */
  useEffect(() => {
    if (params.id) {
      setForm((prev) => ({
        ...prev,
        tournamentName: params.id.toUpperCase(),
      }));
    }
  }, [params]);

  /* ---------------- Reset ---------------- */
  const handleReset = () => {
    setForm({
      tournamentName: params.id ? params.id.toUpperCase() : "",
      firstPlayer: "",
      secondPlayer: "",
      thirdPlayer: "",
      fourthPlayer: "",
      playerEmail: "",
      playerMobileNumber: "",
    });
    setError("");
    setSuccess("");
    setMobileHint("");
  };

  /* ---------------- Change Handler ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "playerMobileNumber") {
      const digits = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [name]: digits }));

      if (!digits) setMobileHint("");
      else if (digits.length !== 10)
        setMobileHint("⚠️ Mobile number must be 10 digits");
      else setMobileHint("✅ Valid mobile number");

      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Submit ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!mobileHint.startsWith("✅")) {
      setError("❌ Enter a valid mobile number");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/joinmatches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "❌ Something went wrong");
        return;
      }

      // ✅ SUCCESS MESSAGE
      setSuccess("🎉 Joined successfully! Redirecting...");
      setLoading(false);

      // ✅ REDIRECT AFTER 2 SECONDS
      setTimeout(() => {
        router.push("/profile");
      }, 2000);

    } catch {
      setError("❌ Failed to connect to server");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-sm p-8"
      >
        <h1 className="text-3xl font-extrabold text-center text-slate-800 mb-6">
          🎮 Join Scrim
        </h1>

        {/* Tournament */}
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
          <p className="text-sm font-semibold text-slate-500 mb-1">
            Tournament
          </p>
          <input
            readOnly
            value={form.tournamentName}
            className="w-full text-center text-xl font-bold bg-transparent outline-none text-cyan-600"
          />
        </div>

        <Input label="First Player" name="firstPlayer" placeholder="Team Leader Name" value={form.firstPlayer} onChange={handleChange} />
        <Input label="Second Player" name="secondPlayer" placeholder="Player 2 In-game Name" value={form.secondPlayer} onChange={handleChange} />
        <Input label="Third Player" name="thirdPlayer" placeholder="Player 3 In-game Name" value={form.thirdPlayer} onChange={handleChange} />
        <Input label="Fourth Player" name="fourthPlayer" placeholder="Player 4 In-game Name" value={form.fourthPlayer} onChange={handleChange} />
        <Input label="Email" name="playerEmail" type="email" placeholder="Same as logged-in email" value={form.playerEmail} onChange={handleChange} />
        <Input label="Mobile Number" name="playerMobileNumber" placeholder="Team Leader WhatsApp number" value={form.playerMobileNumber} onChange={handleChange} maxLength={10} />

        {mobileHint && (
          <p className={`text-sm mb-3 ${mobileHint.startsWith("✅") ? "text-green-600" : "text-orange-500"}`}>
            {mobileHint}
          </p>
        )}

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-3">{success}</p>}

        <button
          type="submit"
          disabled={loading || success}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-70"
        >
          {loading ? "Submitting..." : "Join Now"}
        </button>
      </form>
    </div>
  );
};

/* ---------------- INPUT COMPONENT ---------------- */
const Input = ({ label, value, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-slate-600 mb-1">
      {label}
    </label>
    <input
      {...props}
      value={value ?? ""}
      required
      className="w-full bg-slate-50 border border-slate-300 rounded-xl
                 px-4 py-2.5 text-slate-800
                 placeholder:text-slate-400
                 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
    />
  </div>
);

export default Page;
