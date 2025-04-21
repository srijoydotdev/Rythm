// src/app/dashboard/page.tsx
import { supabase } from "../lib/supabase";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect to login if no session
  if (!session) {
    redirect("/login");
  }

  // Render the dashboard for authenticated users
  return <div>Welcome to your dashboard, {session.user.email}!</div>;
}