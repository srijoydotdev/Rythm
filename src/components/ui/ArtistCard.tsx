// src/components/ui/ArtistCard.tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";

interface Artist {
  id: string;
  name: string;
  cover: string;
  isFollowing?: boolean;
}

interface ArtistCardProps {
  artist: Artist;
  onFollow?: (id: string) => void;
}

export default function ArtistCard({ artist, onFollow }: ArtistCardProps) {
  const handleFollow = () => {
    if (onFollow) {
      onFollow(artist.id);
    }
  };

  return (
    <motion.div
      className="rounded-lg overflow-hidden shadow-lg cursor-pointer bg-[#181818]"
      whileHover={{ scale: 1.05, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)" }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="relative w-20 h-20 mx-auto mt-4 rounded-full overflow-hidden">
        <Image
          src={artist.cover}
          alt={`${artist.name} profile`}
          fill
          className="object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-4 text-center">
        <h3 className="text-lg font-bold text-white truncate">{artist.name}</h3>
        <motion.button
          onClick={handleFollow}
          className={`mt-2 py-1 px-3 rounded-full font-medium transition-colors ${
            artist.isFollowing
              ? "bg-gray-600 text-white"
              : "bg-white text-black hover:bg-gray-200"
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
          disabled={!onFollow}
          aria-label={artist.isFollowing ? `Unfollow ${artist.name}` : `Follow ${artist.name}`}
        >
          {artist.isFollowing ? (
            "Following"
          ) : (
            <span className="flex items-center gap-1">
              <UserPlus className="w-4 h-4" />
              Follow
            </span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}