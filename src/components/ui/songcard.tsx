"use client";

import { Song, Playlist } from "@/app/types";
import { motion } from "framer-motion";
import { Play, UserPlus, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

interface SongCardProps {
  song: Song;
  playSong: (song: Song) => Promise<void>;
  viewMode?: "grid" | "list";
  toggleLike?: (songId: string) => Promise<void>;
  toggleFollow?: (artistId: string) => Promise<void>;
  className?: string;
  playlists: Playlist[];
  addToPlaylist: (playlistId: number, songId: string) => Promise<void>;
}

export default function SongCard({
  song,
  playSong,
  viewMode = "grid",
  toggleLike,
  toggleFollow,
  className = "",
  playlists,
  addToPlaylist,
}: SongCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleAddToPlaylist = async (playlistId: number) => {
    try {
      await addToPlaylist(playlistId, song.id);
      toast.success(`Added to playlist!`);
      setShowMenu(false);
    } catch (error) {
      console.error("Error adding to playlist:", error);
      toast.error("Failed to add to playlist.");
    }
  };

  return (
    <motion.div
      className={`
        relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl
        transition-all duration-300 cursor-pointer group
        ${viewMode === "grid" ? "w-full max-w-[220px] h-[220px] sm:max-w-[250px] sm:h-[250px]" : "w-full h-[100px] flex items-center"}
        ${className}
      `}
      onClick={() => playSong(song)}
      role="button"
      aria-label={`Play ${song.title} by ${song.artistId}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `url(${song.cover || "/images/placeholder.jpg"})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <Image
          src={song.cover || "/images/placeholder.jpg"}
          alt={`Cover art for ${song.title}`}
          fill
          className="object-cover opacity-0" // Hidden but ensures image is loaded
          onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
        />
      </div>
      <div
        className={`
          absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent
          flex ${viewMode === "grid" ? "flex-col justify-end p-4" : "flex-row items-center p-3"}
        `}
      >
        {viewMode === "grid" ? (
          <>
            <div className="text-white space-y-1">
              <h3 className="text-base font-bold truncate">{song.title}</h3>
              <p className="text-sm text-gray-300 truncate">{song.artistId}</p>
              <p className="text-xs text-gray-400">{song.plays.toLocaleString()} streams</p>
              {song.genre && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs bg-gray-800/60 rounded-full px-2 py-1">{song.genre}</span>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-3">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFollow?.(song.artistId);
                }}
                className="flex items-center gap-1 bg-gray-900/50 hover:bg-gray-800 text-white text-xs font-medium py-1 px-3 rounded-full"
                whileTap={{ scale: 0.95 }}
                aria-label="Follow artist"
              >
                <UserPlus className="w-4 h-4" />
                Follow
              </motion.button>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  playSong(song);
                }}
                className="bg-[#01344f] hover:bg-[#024d75] text-white rounded-full p-2"
                whileTap={{ scale: 0.95 }}
                aria-label="Play song"
              >
                <Play className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Like and More Buttons */}
            <div className="absolute top-2 right-2 flex space-x-2">
              {toggleLike && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(song.id);
                  }}
                  className="p-1 rounded-full bg-gray-900/50 hover:bg-gray-800"
                  whileTap={{ scale: 1.2 }}
                  aria-label={song.liked ? "Unlike song" : "Like song"}
                >
                  <svg
                    className={`w-5 h-5 ${song.liked ? "text-red-500 fill-red-500" : "text-white"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </motion.button>
              )}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 rounded-full bg-gray-900/50 hover:bg-gray-800"
                whileTap={{ scale: 1.2 }}
                aria-label="More options"
              >
                <MoreHorizontal className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            {/* Playlist Menu */}
            {showMenu && (
              <motion.div
                className="absolute top-10 right-2 bg-[#2A2A2A] rounded-lg shadow-lg z-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ul className="py-2">
                  {playlists.length === 0 ? (
                    <li className="px-4 py-2 text-sm text-gray-400">No playlists available</li>
                  ) : (
                    playlists.map((playlist) => (
                      <li
                        key={playlist.id}
                        className="px-4 py-2 text-sm hover:bg-[#3A3A3A] cursor-pointer"
                        onClick={() => handleAddToPlaylist(playlist.id)}
                      >
                        Add to {playlist.name}
                      </li>
                    ))
                  )}
                </ul>
              </motion.div>
            )}
          </>
        ) : (
          <>
            {/* List View */}
            <div className="flex-1 text-white">
              <h3 className="text-sm font-semibold truncate">{song.title}</h3>
              <p className="text-xs text-gray-300 truncate">{song.artistId}</p>
            </div>
            <div className="flex items-center space-x-2">
              {toggleLike && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(song.id);
                  }}
                  className="p-1"
                  whileTap={{ scale: 1.2 }}
                  aria-label={song.liked ? "Unlike song" : "Like song"}
                >
                  <svg
                    className={`w-4 h-4 ${song.liked ? "text-red-500 fill-red-500" : "text-white"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </motion.button>
              )}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1"
                whileTap={{ scale: 1.2 }}
                aria-label="More options"
              >
                <MoreHorizontal className="w-4 h-4 text-white" />
              </motion.button>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  playSong(song);
                }}
                className="bg-[#01344f] hover:bg-[#024d75] text-white rounded-full p-2"
                whileTap={{ scale: 0.95 }}
                aria-label="Play song"
              >
                <Play className="w-4 h-4" />
              </motion.button>
            </div>
            {showMenu && (
              <motion.div
                className="absolute top-10 right-2 bg-[#2A2A2A] rounded-lg shadow-lg z-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ul className="py-2">
                  {playlists.length === 0 ? (
                    <li className="px-4 py-2 text-sm text-gray-400">No playlists available</li>
                  ) : (
                    playlists.map((playlist) => (
                      <li
                        key={playlist.id}
                        className="px-4 py-2 text-sm hover:bg-[#3A3A3A] cursor-pointer"
                        onClick={() => handleAddToPlaylist(playlist.id)}
                      >
                        Add to {playlist.name}
                      </li>
                    ))
                  )}
                </ul>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}