"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton ,SignInButton,SignUpButton} from "@clerk/nextjs";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (path) =>
    `font-semibold transition ${
      pathname === path
        ? "text-cyan-600 underline"
        : "text-slate-700 hover:text-cyan-600"
    }`;

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
      
      {/* Logo */}
      <h1 className="text-xl font-extrabold text-cyan-600">
         <span className="text-2xl lg:text-3xl font-bold text-cyan-500">Fr</span>
          <span className="text-2xl lg:text-3xl font-bold text-red-600">ag</span>
          <span className="text-2xl lg:text-3xl font-bold text-cyan-500">Zo</span>
          <span className="text-2xl lg:text-3xl font-bold text-red-600">ne</span>
      </h1>

      

      {/* Right Side (Auth Section) */}
      <div className="flex items-center gap-4">
        
        {/* 🔓 Not Logged In */}
        <SignedOut>
          <SignInButton mode="modal">
  <button className="px-5 py-2 rounded-xl border border-cyan-600 text-cyan-600 font-semibold hover:bg-cyan-50 transition">
    Log In
  </button>
</SignInButton>

<SignUpButton mode="modal">
  <button className="px-5 py-2 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition shadow-sm">
    Sign Up
  </button>
</SignUpButton>

          
        </SignedOut>

        {/* 🔐 Logged In */}
        <SignedIn>
         <Link className="px-5 py-2 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition shadow-sm" href="/profile">Profile</Link>
        </SignedIn>
      </div>
    </nav>
  );
}
