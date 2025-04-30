"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast.success("Signed up! Please check your email to confirm.");
      } else {
        await signInWithEmail(email, password);
        toast.success("Logged in!");
        router.push("/song");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1A1A] p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6">{isSignUp ? "Sign Up" : "Log In"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-black border border-white/20 rounded text-white"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-black border border-white/20 rounded text-white"
              required
            />
          </div>
          <motion.button
            type="submit"
            className="w-full bg-yellow-500 text-black py-2 rounded hover:bg-yellow-400"
            whileTap={{ scale: 0.95 }}
          >
            {isSignUp ? "Sign Up" : "Log In"}
          </motion.button>
        </form>
        <motion.button
          onClick={handleGoogleSignIn}
          className="w-full mt-4 bg-white text-black py-2 rounded hover:bg-gray-200"
          whileTap={{ scale: 0.95 }}
        >
          Sign in with Google
        </motion.button>
        <p className="mt-4 text-center text-sm">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-yellow-500 hover:underline ml-1"
          >
            {isSignUp ? "Log In" : "Sign Up"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}