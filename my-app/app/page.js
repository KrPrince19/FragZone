import Typing from "./components/Typing";

export default function Home() {
  return (
    <div className="space-y-10">

      {/* HERO SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <Typing
          text="Compete. Win. Dominate BGMI Scrims."
          className="text-cyan-600"
        />
        <p className="mt-4 text-slate-600 text-lg">
          Join competitive BGMI scrims, tournaments & leaderboards
        </p>
      </div>

      {/* FEATURE CARDS */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            🎮 Daily Scrims
          </h3>
          <p className="text-slate-600">
            Participate in daily competitive scrims and improve your gameplay.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            💰 Prize Pools
          </h3>
          <p className="text-slate-600">
            Win exciting cash rewards and in-game prizes.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            🏆 Top Teams
          </h3>
          <p className="text-slate-600">
            Compete against the best BGMI teams and climb the rankings.
          </p>
        </div>
      </div>

      {/* RULES SECTION */}
     <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 shadow-sm">
  <h2 className="text-2xl font-extrabold text-amber-700 mb-4">
    📜 Important Rules & Guidelines
  </h2>

  <ul className="space-y-3 text-slate-700 text-sm md:text-base list-disc list-inside">
    <li>
      🔐 <span className="font-semibold">Login is mandatory</span> to join any scrim or tournament.
    </li>

    <li>
      📧 The <span className="font-semibold">email used to join the match must be the same</span> as your logged-in account email.
    </li>

    <li>
      🎮 <span className="font-semibold">In-game player names must match</span> the names submitted during match registration.
    </li>

    <li>
      ❌ Mismatch in email or player name may lead to
      <span className="font-semibold"> disqualification without refund</span>.
    </li>

    <li>
      🕒 Room ID & Password will be shared
      <span className="font-semibold"> 15 minutes before match start</span>.
    </li>

    <li>
      📢 <span className="font-semibold">
        Join our WhatsApp group immediately
      </span>{" "}
      to receive room details, match updates, schedule changes, and latest announcements.
      Go to your <span className="font-semibold">Profile</span> and tap
      <span className="font-semibold"> “Join WhatsApp”</span>.
    </li>

    <li>
      ⚖️ Any form of cheating, teaming, or unfair gameplay
      will result in a <span className="font-semibold">permanent ban</span>.
    </li>

    <li>
      🛡️ <span className="font-semibold">Admin decision is final</span> in case of disputes.
    </li>
  </ul>
</div>

    </div>
  );
}
