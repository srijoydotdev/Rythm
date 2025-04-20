// src/app/search/page.tsx
"use client";

import { useState, useCallback } from "react";
import BottomNav from "@/components/ui/navmob";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Genre {
  name: string;
  href: string;
  color: string;
  image?: string;
}

const genres = [
  { name: "Pop", href: "/genres/pop", color: "bg-pink-600/80", image: "/pop.jpg" },
  { name: "Rock", href: "/genres/rock", color: "bg-red-600/80", image: "/rock.jpg" },
  { name: "Hip Hop", href: "/genres/hiphop", color: "bg-yellow-600/80", image: "/hip-hop.jpg" },
  { name: "Jazz", href: "/genres/jazz", color: "bg-blue-600/80", image: "/jazz.jpg" },
  { name: "Electronic", href: "/genres/electronic", color: "bg-purple-600/80", image: "/electronic.jpg" },
  { name: "Classical", href: "/genres/classical", color: "bg-gray-600/80", image: "/classical.jpg" },
] satisfies Genre[];

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic (e.g., API call) here
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <main className="pb-20 pt-20">
        {/* Fixed Top Search Bar */}
        <div className="fixed top-0 left-0 right-0 bg-[#181818] z-10 p-4 shadow-md">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Songs, artists, or albums"
              className="w-full py-3 px-5 pr-12 bg-[#282828] text-white rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 text-base transition-all duration-300 shadow-sm hover:bg-[#303030]"
              aria-label="Search for songs, artists, or albums"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
              aria-label="Search"
            >
              <Search className="h-6 w-6" />
            </button>
          </form>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mt-8 mb-6">Browse Genres</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {genres.map((genre) => (
              <Link
                key={genre.href}
                href={genre.href}
                className={`relative flex items-center justify-center h-32 sm:h-40 rounded-lg ${genre.color} overflow-hidden hover:scale-105 hover:shadow-lg transition-transform duration-300 shadow-md group`}
                prefetch={false}
              >
                {genre.image && (
                  <Image
                    src={genre.image}
                    alt={`${genre.name} cover`}
                    fill
                    className="object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-300"
                    loading="lazy"
                  />
                )}
                <span className="relative text-xl sm:text-2xl font-semibold text-white z-10 drop-shadow-md">
                  {genre.name}
                </span>
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-opacity duration-300" />
              </Link>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}