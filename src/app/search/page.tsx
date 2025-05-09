// src/app/signup/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "../../app/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("LISTENER");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!fullName || !age || !profilePic || !aboutMe) {
      setError("All fields are required.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          userType,
          fullName,
          age: parseInt(age),
          profilePic,
          aboutMe,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else if (data.user) {
      // Update profile in Prisma
      await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: data.user }),
      });
      router.push("/song"); // Redirect to song page
    } else {
      setError("Please check your email for confirmation.");
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
      <div className="bg-[#1D1D1D] rounded-lg p-8 max-w-md w-full shadow-lg">
        <img src="/logo.svg" alt="Logo" className="w-16 h-16 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white text-center mb-6">Sign Up</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSignup} className="space-y-4">
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
          <div>
            <label htmlFor="userType" className="text-white text-sm font-medium">
              User Type
            </label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full mt-1 p-3 bg-[#2A2A2A] text-white rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="LISTENER">Listener</option>
              <option value="ARTIST">Artist</option>
            </select>
          </div>
          <div>
            <label htmlFor="fullName" className="text-white text-sm font-medium">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full mt-1 p-3 bg-[#2A2A2A] text-white rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
              required
            />
          </div>
          <div>
            <label htmlFor="age" className="text-white text-sm font-medium">
              Age
            </label>
            <input
              type="number"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter your age"
              className="w-full mt-1 p-3 bg-[#2A2A2A] text-white rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
              required
            />
          </div>
          <div>
            <label htmlFor="profilePic" className="text-white text-sm font-medium">
              Profile Picture URL
            </label>
            <input
              type="url"
              id="profilePic"
              value={profilePic}
              onChange={(e) => setProfilePic(e.target.value)}
              placeholder="Enter profile picture URL"
              className="w-full mt-1 p-3 bg-[#2A2A2A] text-white rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
              required
            />
          </div>
          <div>
            <label htmlFor="aboutMe" className="text-white text-sm font-medium">
              About Me
            </label>
            <textarea
              id="aboutMe"
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="Tell us about yourself"
              className="w-full mt-1 p-3 bg-[#2A2A2A] text-white rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-white text-black font-semibold py-3 rounded-md hover:bg-gray-200 transition"
          >
            Sign Up
          </button>
        </form>
        <p className="text-white text-center mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-yellow-500 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}