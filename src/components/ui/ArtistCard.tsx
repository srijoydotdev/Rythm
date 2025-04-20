// src/components/ui/ArtistCard.tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";

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

export default function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <motion.div
      className="flex flex-col  items-center mt-4"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Circular Artist Cover */}
      <div className="relative w-20 h-20  rounded-full overflow-hidden mb-2">
        <Image
          src={artist.cover}
          alt={`${artist.name} profile`}
          fill
          className="object-cover"
          loading="lazy"
        />
      </div>

    
      <h3 className="text-sm font-regular text-white truncate max-w-[120px] text-center">
        {artist.name}
      </h3>
    </motion.div>
  );
}