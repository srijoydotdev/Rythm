// src/components/ui/library.tsx
"use client";

import Image from "next/image";
import BottomNav from "@/components/ui/navmob";
import Link from "next/link";

interface Playlist {
  name: string;
  href: string;
  song: string;
  cover: string;
}

interface Artist {
  name: string;
  href: string;
  cover: string;
}

const libraryLinks = [
  { name: "Monsoon", href: "/Monsoon", song: "10 songs", cover: "/monsoon.jpg" },
] satisfies Playlist[];

const following = [
  { name: "Aditya", href: "/aditya", cover: "/aditya.jpg" },
] satisfies Artist[];

export default function Library() {
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <main className="pb-16">
        <div className="px-4">
          <h2 className="text-2xl font-bold mt-6 mb-4">Playlists</h2>
          <div className="space-y-4">
            {libraryLinks.map((playlist) => (
              <Link
                key={playlist.href}
                href={playlist.href}
                className="flex items-center p-2 rounded-lg hover:bg-[#282828] transition-colors"
                prefetch={false}
              >
                <Image
                  src={playlist.cover}
                  alt={`${playlist.name} cover`}
                  width={60}
                  height={60}
                  className="rounded-md mr-4"
                  loading="lazy"
                />
                <div>
                  <h3 className="text-lg font-semibold">{playlist.name}</h3>
                  <p className="text-sm text-gray-400">{playlist.song}</p>
                </div>
              </Link>
            ))}
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">Following</h2>
          <div className="space-y-4">
            {following.map((artist) => (
              <Link
                key={artist.href}
                href={artist.href}
                className="flex items-center p-2 rounded-lg hover:bg-[#282828] transition-colors"
                prefetch={false}
              >
                <Image
                  src={artist.cover}
                  alt={`${artist.name} cover`}
                  width={60}
                  height={60}
                  className="rounded-full mr-4"
                  loading="lazy"
                />
                <div>
                  <h3 className="text-lg font-semibold">{artist.name}</h3>
                  <p className="text-sm text-gray-400">Artist</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}