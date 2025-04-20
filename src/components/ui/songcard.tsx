import { Song } from "@/types";
import { motion } from "framer-motion";
import { Play, UserPlus } from "lucide-react";

interface SongCardProps {
  song: Song;
  playSong: (song: Song) => void;
  viewMode?: "grid" | "list";
  toggleLike?: (songId: string) => Promise<void>;
  toggleFollow?: (artistId: string) => Promise<void>;
}

export default function SongCard({
  song,
  playSong,
  viewMode = "grid",
  toggleLike,
  toggleFollow,
}: SongCardProps) {
  // Placeholder data for streams and genres
  const streams = "1.5M"; // Temporary placeholder
  const genres = ["Pop", "Hip-Hop"]; // Temporary placeholder

  return (
    <motion.div
      className={`
        relative
        rounded-xl
        overflow-hidden
        shadow-lg
        hover:shadow-2xl
        transition-all
        duration-300
        cursor-pointer
        bg-cover
        bg-center
        group
        ${
          viewMode === "grid"
            ? "w-full max-w-[220px] h-[220px] sm:max-w-[250px] sm:h-[250px]"
            : "w-full h-[100px] flex items-center"
        }
      `}
      style={{ backgroundImage: `url(${song.cover})` }}
      onClick={() => playSong(song)}
      role="button"
      aria-label={`Play ${song.title} by ${song.artist}`}
      whileHover={{ scale: 1.05 }}
    >
     
      <div
        className={`
          absolute inset-0
          bg-gradient-to-t from-black/80 via-black/50 to-transparent
          flex flex-col
          ${viewMode === "grid" ? "justify-end p-4" : "flex-row items-center p-3"}
        `}
      >
        {viewMode === "grid" ? (
          <>
           
            <div className="text-white space-y-1">
              <h3 className="text-base font-bold truncate">{song.title}</h3>
              <p className="text-sm text-gray-300 truncate">{song.artist}</p>
              <p className="text-xs text-gray-400">{streams} streams</p>
              <div className="flex flex-wrap gap-1">
                {genres.map((genre) => (
                  <span
                    key={genre}
                    className="text-xs bg-gray-800/60 rounded-full px-2 py-1"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-3">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFollow?.(song.id); // Using song.id as placeholder for artistId
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
                className="bg-[#01344f] hover:bg-[#01344f] text-white cursor-pointer rounded-full p-2"
                whileTap={{ scale: 0.95 }}
                aria-label="Play song"
              >
                <Play className="w-5 h-5 rounded-2xl " />
              </motion.button>
            </div>

            {/* Like Button */}
            {toggleLike && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(song.id);
                }}
                className="absolute top-2 right-2 p-1 rounded-full bg-gray-900/50 hover:bg-gray-800"
                whileTap={{ scale: 1.2 }}
                aria-label={song.liked ? "Unlike song" : "Like song"}
              >
                <svg
                  className={`w-5 h-5 ${
                    song.liked ? "text-red-500 fill-red-500" : "text-white"
                  }`}
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
          </>
        ) : (
          <>
            {/* List View */}
            <div className="flex-1 text-white">
              <h3 className="text-sm font-semibold truncate">{song.title}</h3>
              <p className="text-xs text-gray-300 truncate">{song.artist}</p>
            </div>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                playSong(song);
              }}
              className="bg-[#01344f]  text-white rounded-full p-2"
              whileTap={{ scale: 0.95 }}
              aria-label="Play song"
            >
              <Play className="w-4 h-4" />
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
}