"use client";

import { Playlist } from "@/app/types";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface PlaylistCardProps {
  playlist: Playlist;
  onPlay: () => void;
  onDelete: (playlistId: number) => void;
}

export default function PlaylistCard({ playlist, onPlay, onDelete }: PlaylistCardProps) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onDelete(playlist.id);
    } catch (error) {
      toast.error("Failed to delete playlist.");
    }
  };

  return (
    <motion.div
      className="relative bg-[#1A1A1A] rounded-lg p-4 cursor-pointer hover:bg-[#2A2A2A] transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onPlay}
    >
      <div className="relative w-full h-40 mb-4">
        <Image
          src={playlist.songs[0]?.song.cover || "/images/placeholder.jpg"}
          alt={`Cover for ${playlist.name}`}
          fill
          className="rounded-md object-cover"
          onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
          whileHover={{ opacity: 1 }}
        >
          <Play className="w-12 h-12 text-white" />
        </motion.div>
      </div>
      <h3 className="text-lg font-semibold truncate">{playlist.name}</h3>
      <p className="text-sm text-gray-400 truncate">{playlist.songs.length} songs</p>
      <motion.button
        onClick={handleDelete}
        className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-400"
        whileTap={{ scale: 0.9 }}
        aria-label="Delete playlist"
      >
        <Trash2 className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
}