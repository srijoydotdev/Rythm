// src/components/ui/Navbar.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Compass } from "lucide-react";
import { usePathname } from "next/navigation";
import SearchBar from "../searchbox";
import { supabase } from "../../app/lib/supabase";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  // Fetch user session
  useEffect(() => {
    async function fetchUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    }
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const compassVariants = {
    hover: { rotate: 360, transition: { duration: 0.5 } },
  };

  const isMusicPage = pathname === "/song";
  const isAudioPage = pathname === "/audio";
  const isShowPage = pathname === "/show";

  return (
    <div className="bg-[#1D1D1D] mt-2 py-3 px-4 flex justify-between items-center rounded-md max-w-7xl mx-auto backdrop-blur-md">
      {/* Left Section: Logo + Navigation */}
      <div className="flex items-center space-x-4">
        <img src="/logo.svg" alt="Logo" className="w-10 h-10" />
        <img src="/home.svg" alt="Home" className="w-6 h-6" />
        <div className="flex items-center space-x-1">
          <Link href="/song">
            <button
              className={`text-white bg-[#1D1D1D] px-3 py-1 cursor-pointer rounded-full border border-white/20 ${
                isMusicPage ? "bg-white text-black font-bold" : "hover:bg-white/10"
              }`}
            >
              Music
            </button>
          </Link>
          <button
            className={`text-white bg-[#1D1D1D] px-3 py-1 cursor-pointer rounded-full border border-white/20 ${
              isAudioPage ? "bg-white text-black font-bold" : "hover:bg-white/10"
            }`}
          >
            Audio
          </button>
          <button
            className={`text-white bg-[#1D1D1D] px-3 py-1 cursor-pointer rounded-full border border-white/20 ${
              isShowPage ? "bg-white text-black font-bold" : "hover:bg-white/10"
            }`}
          >
            Show
          </button>
        </div>
      </div>

      {/* Center Section: Search Bar + Compass */}
      <div className="flex items-center space-x-2">
        <SearchBar />
        <motion.div whileHover="hover" variants={compassVariants}>
          <Compass className="w-6 h-6 text-white cursor-pointer" />
        </motion.div>
      </div>

      {/* Right Section: Auth, Notifications, Profile */}
      <div className="flex items-center space-x-3">
        <Bell className="w-6 h-6 text-white cursor-pointer" />
        {user ? (
          <Link href="/profiles">
            <img
              src={user.user_metadata?.profilePic || "/default-profile-pic.jpg"}
              alt="Profile"
              className="w-8 h-8 rounded-full bg-gray-800 object-cover border border-white/20"
            />
          </Link>
        ) : (
          <div className="flex space-x-2">
            <Link href="/login">
              <button className="text-white bg-[#2A2A2A] px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 font-medium">
                Sign In
              </button>
            </Link>
            <Link href="/signup">
              <button className="text-black bg-white px-4 py-2 rounded-full font-medium hover:bg-gray-200">
                Sign Up
              </button>
            </Link>
          </div>
        )}
        <button className="text-black uppercase text-sm font-semibold bg-white px-4 py-2 rounded-full cursor-pointer hover:bg-gray-200">
          Subscription
        </button>
      </div>
    </div>
  );
}