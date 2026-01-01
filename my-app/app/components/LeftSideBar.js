"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome } from "react-icons/fa";
import { FaTrophy } from "react-icons/fa";
import { GoTrophy } from "react-icons/go";
import { GiCrossedSwords } from "react-icons/gi";
import { MdLeaderboard, MdUpcoming } from "react-icons/md";
import { FaInstagram, FaYoutube } from "react-icons/fa6";

const navItems = [
  { name: "Home", href: "/", icon: FaHome },
  { name: "Tournaments", href: "/tournamentspage", icon: GoTrophy },
  { name: "Upcoming Tournaments", href: "/upcomingtournamentpage", icon: MdUpcoming },
  { name: "Scrims", href: "/scrimpage", icon: GiCrossedSwords },
  { name: "Winner", href: "/winnerpage", icon: FaTrophy },
  { name: "Leaderboard", href: "/leaderboardpage", icon: MdLeaderboard },
];

export default function LeftSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-slate-200 text-slate-700">
      
      {/* Logo */}
      <div className="px-6 py-6 text-2xl font-extrabold text-cyan-600">
        BGMI SCRIMS
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition
                ${
                  isActive
                    ? "bg-cyan-100 text-cyan-700"
                    : "hover:bg-slate-100 hover:text-slate-900"
                }`}
            >
              <Icon className="text-lg" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Social Links */}
      <div className="px-6 py-4 border-t border-slate-200">
        <p className="text-sm text-slate-500 mb-2">Join us</p>
        <div className="flex gap-4 text-xl">
          <Link href="/" className="text-red-500 hover:opacity-80 transition">
            <FaYoutube />
          </Link>
          <Link href="/" className="text-pink-500 hover:opacity-80 transition">
            <FaInstagram />
          </Link>
        </div>
      </div>
    </aside>
  );
}
