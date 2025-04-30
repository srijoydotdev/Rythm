"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Compass, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import SearchBar from "../searchbox";
import { createClient } from "@/utils/client";
import toast from "react-hot-toast";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

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
      if (event === "SIGNED_OUT") {
        toast.success("Signed out successfully");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setShowProfileMenu(false);
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

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
      <div className="flex items-center space-x-3 relative">
        <Bell className="w-6 h-6 text-white cursor-pointer" />
        {user ? (
          <div className="relative">
            <motion.button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="focus:outline-none"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle profile menu"
            >
              <img
                src={user.user_metadata?.profilePic || "/default-profile-pic.jpg"}
                alt="Profile"
                className="w-8 h-8 rounded-full bg-gray-800 object-cover border border-white/20"
              />
            </motion.button>
            {showProfileMenu && (
              <motion.div
                className="absolute right-0 mt-2 w-48 bg-[#2A2A2A] rounded-lg shadow-lg z-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ul className="py-2">
                  <li>
                    <Link href="/profiles">
                      <span className="block px-4 py-2 text-sm text-white hover:bg-[#3A3A3A] cursor-pointer">
                        Profile
                      </span>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3A3A3A] flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </li>
                </ul>
              </motion.div>
            )}
          </div>
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