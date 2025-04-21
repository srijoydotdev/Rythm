// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "../../app/lib/supabase";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      window.location.href = "/song"; // Redirect to song page
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "http://localhost:3000/api/auth/callback" },
    });
    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
      <div className="bg-[#1D1D1D] rounded-lg p-8 max-w-md w-full shadow-lg">
        <img src="/logo.svg" alt="Logo" className="w-16 h-16 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white text-center mb-6">Sign In</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-white text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full mt-1 p-3 bg-[#2A2A2A] text-white rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="text-white text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full mt-1 p-3 bg-[#2A2A2A] text-white rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-white text-black font-semibold py-3 rounded-md hover:bg-gray-200 transition"
          >
            Sign In
          </button>
        </form>
        <button
          onClick={handleGoogleLogin}
          className="w-full mt-4 bg-[#2A2A2A] text-white font-semibold py-3 rounded-md border border-white/20 hover:bg-white/10 flex items-center justify-center gap-2"
        >
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
          Sign In with Google
        </button>
        <p className="text-white text-center mt-4">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-yellow-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}