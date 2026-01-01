"use server"

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import UserDashboard from "../profile./UserDashboard";

export default async function Page() {
  const user = await currentUser();

  // 🔒 If user not logged in, redirect
  if (!user) {
    redirect("/sign-in");
  }

  // ✅ Safe user data extraction
  const name = user.username || user.firstName || "User";
  const userEmail = user.emailAddresses[0]?.emailAddress || "";

  return (
    <UserDashboard
      name={name}
      userEmail={userEmail}
    />
  );
}
