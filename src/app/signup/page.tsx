// src/app/signup/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("LISTENER");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password || !fullName || !age || !aboutMe) {
      toast.error("All fields are required.");
      setIsLoading(false);
      return;
    }

    try {
      // Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            userType,
            fullName,
            age: parseInt(age),
            aboutMe,
            profilePic: "/profile-pic.jpg", // Use default profile picture from public folder
            profileSetup: true,
          },
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (!data.user) {
        throw new Error("Please check your email for confirmation.");
      }

      // Debug session
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session after signup:", session);

      // Sync with Prisma
      await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            ...data.user,
            user_metadata: {
              userType,
              fullName,
              age: parseInt(age),
              aboutMe,
              profilePic: "/profile-pic.jpg", // Use default profile picture
              profileSetup: true,
            },
          },
        }),
      });

      toast.success("Account created successfully!");
      router.push("/song");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#1D1D1D] rounded-lg p-8 max-w-md w-full shadow-lg"
      >
        <img src="/logo.svg" alt="Logo" className="w-16 h-16 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Create Your Account
        </h1>
        {error && (
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: [-10, 10, -10, 10, 0] }}
            transition={{ duration: 0.3 }}
            className="mb-4 p-3 bg-red-500/20 text-red-400 rounded"
          >
            {error}
          </motion.div>
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
              I am a
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
            disabled={isLoading}
            className={`w-full py-3 rounded-md font-semibold transition flex items-center justify-center ${
              isLoading
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-white text-black hover:bg-gray-200"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
        <p className="text-white text-center mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-yellow-500 hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}