// src/app/song/page.tsx
"use client";
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import Navbar from "@/components/ui/Navbar";
import LibrarySidebar from "@/components/ui/library";
import ArtistCard from "@/components/ui/ArtistCard";
import Player from "@/components/ui/player";
import SongCard from "@/components/ui/songcard";
import BottomNav from "@/components/ui/navmob";
import { Song, Artist } from "@/types";
import toast from "react-hot-toast";
import TopNav from "@/components/ui/topNav";
// Define interfaces for clarity and type safety
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Main component
export default function Music() {
  const [activeGenre, setActiveGenre] = useState<string>("All");
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeat, setRepeat] = useState<"none" | "all" | "one">("none");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Added for UX

  const genres = useMemo(
    () => [
      "All",
      "Pop",
      "Rock",
      "Indie",
      "HipHop",
      "Electronic",
      "Punjabi Pop",
      "Indie Rock",
      "Ghazal",
      "Bollywood",
    ],
    []
  );

  const [followedArtists, setFollowedArtists] = useState<Artist[]>([
    { id: "1", name: "Aditya", cover: "/images/blinding-lights.jpg", isFollowing: true },
    { id: "2", name: "Dua Lipa", cover: "/images/levitating.jpg", isFollowing: true },
    { id: "3", name: "Fleetwood Mac", cover: "/images/dreams.jpg", isFollowing: true },
  ]);

  const suggestedArtists = useMemo<Artist[]>(
    () => [
      { id: "4", name: "Billie Eilish", cover: "/images/night-we-met.jpg", isFollowing: false },
      { id: "5", name: "Arctic Monkeys", cover: "/images/sicko-mode.jpg", isFollowing: false },
      { id: "6", name: "Kendrick Lamar", cover: "/images/sweet-jane.jpg", isFollowing: false },
    ],
    []
  );

  // Fetch songs on mount
  useEffect(() => {
    async function fetchSongs() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/songs");
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const result: ApiResponse<Song[]> = await response.json();
        if (!result.success) {
          throw new Error(result.error || "API error fetching songs");
        }
        setSongs(result.data);
        setQueue(result.data);
      } catch (err) {
        console.error("Error fetching songs:", err);
        setError("Failed to load songs. Please try again.");
        toast.error("Failed to load songs.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSongs();
  }, []);

  // Memoize filtered songs to prevent unnecessary re-computation
  const filteredSongs = useMemo(
    () =>
      activeGenre === "All" ? songs : songs.filter((song) => song.genre === activeGenre),
    [activeGenre, songs]
  );

  // Handle artist follow/unfollow
  const handleFollow = useCallback((artistId: string) => {
    setFollowedArtists((prev) => {
      const isFollowed = prev.some((artist) => artist.id === artistId);
      if (isFollowed) {
        return prev.filter((artist) => artist.id !== artistId);
      }
      const artistToFollow = suggestedArtists.find((artist) => artist.id === artistId);
      return artistToFollow ? [...prev, { ...artistToFollow, isFollowing: true }] : prev;
    });
  }, [suggestedArtists]);

  // Play a song and update play count
  const playSong = useCallback(
    async (song: Song | null) => {
      if (!song) {
        setIsPlaying(false);
        setCurrentSong(null);
        return;
      }

      setCurrentSong(song);
      setIsPlaying(true);

      try {
        const response = await fetch("/api/songs/plays", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ songId: song.id }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const result: ApiResponse<{ plays: number }> = await response.json();
        if (!result.success) {
          throw new Error(result.error || "API error updating play count");
        }
        setSongs((prev) =>
          prev.map((s) => (s.id === song.id ? { ...s, plays: result.data.plays } : s))
        );
      } catch (err) {
        console.error("Error updating play count:", err);
        toast.error("Failed to update play count.");
      }
    },
    []
  );

  // Play next song in queue
  const playNext = useCallback(() => {
    if (!currentSong || queue.length === 0) {
      setIsPlaying(false);
      setCurrentSong(null);
      return;
    }

    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    if (currentIndex === -1) {
      setIsPlaying(false);
      setCurrentSong(null);
      return;
    }

    if (repeat === "one") {
      playSong(currentSong);
      return;
    }

    const nextIndex = shuffle
      ? Math.floor(Math.random() * queue.length)
      : (currentIndex + 1) % queue.length;

    if (nextIndex === 0 && repeat !== "all") {
      setIsPlaying(false);
      setCurrentSong(null);
      return;
    }

    const nextSong = queue[nextIndex];
    if (!nextSong) {
      setIsPlaying(false);
      setCurrentSong(null);
      return;
    }

    playSong(nextSong);
  }, [currentSong, queue, repeat, shuffle, playSong]);

  // Play previous song in queue
  const playPrevious = useCallback(() => {
    if (!currentSong || queue.length === 0) {
      return;
    }

    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    if (currentIndex === -1) {
      return;
    }

    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    playSong(queue[prevIndex]);
  }, [currentSong, queue, playSong]);

  // Toggle shuffle mode
  const toggleShuffle = useCallback(() => setShuffle((prev) => !prev), []);

  // Toggle repeat mode
  const toggleRepeat = useCallback(() => {
    setRepeat((prev) => (prev === "none" ? "all" : prev === "all" ? "one" : "none"));
  }, []);

  // Toggle like status for a song
  const toggleLike = useCallback(
    async (songId: string, retries = 2) => {
      const song = songs.find((s) => s.id === songId);
      if (!song) {
        toast.error("Song not found.");
        return;
      }

      try {
        const newLikedStatus = !song.liked;
        const response = await fetch("/api/songs/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ songId, liked: newLikedStatus }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `HTTP error: ${response.status} - ${errorData.error || "Unknown error"}`
          );
        }

        const result: ApiResponse<{ liked: boolean; likes: number }> =
          await response.json();
        if (!result.success) {
          throw new Error(result.error || "API error updating like status");
        }

        setSongs((prev) =>
          prev.map((s) =>
            s.id === songId ? { ...s, liked: result.data.liked, likes: result.data.likes } : s
          )
        );
        if (currentSong?.id === songId) {
          setCurrentSong((prev) =>
            prev ? { ...prev, liked: result.data.liked, likes: result.data.likes } : prev
          );
        }
      } catch (err: unknown) {
        console.error("Error updating like status:", err);
        if (retries > 0 && err instanceof Error && err.message.includes("500")) {
          setTimeout(() => toggleLike(songId, retries - 1), 1000);
        } else {
          toast.error("Failed to update like status.");
        }
      }
    },
    [songs, currentSong]
  );

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Navbar for desktop */}
      <div className="fixed top-0 left-0 right-0 z-10 hidden md:block">
        <Navbar />
      </div>
      <div className="fixed top-0 left-0 right-0 z-10  md:hidden">
        <TopNav/>
      </div>


      {/* Mobile header */}
     

      {/* Bottom navigation for mobile */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-50">
        <BottomNav />
      </div>

      <div className="flex">
        {/* Sidebar for desktop */}
        <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] z-10 hidden md:block">
          <LibrarySidebar />
        </div>

        {/* Main content */}
        <div
          className="flex-1 overflow-x-hidden mt-16 px-4 sm:px-6 md:ml-64 hide-scrollbar"
          style={{ height: "calc(100vh - 4rem)" }}
        >
          {error && (
            <div className="mb-4 p-4 bg-red-500 text-white rounded">{error}</div>
          )}

          {/* mobile layout */}
          <div className="md:hidden mt-3">
            <div>
              <h2 className="font-semibold text-xl text-white">Artist Recomendation</h2>

              <div className="flex overflow-x-auto space-x-4 pb-2">
              {suggestedArtists.map((artist) => (
                  <ArtistCard  key={artist.id} artist={artist} />
                ))}
              </div>
            </div>
         


          </div>
          {/* Genre filters */}
          <div className="flex items-center space-x-3 mb-6 overflow-x-auto ">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`py-1 mt-4 px-6 rounded-full hidden md:block font-medium transition-colors whitespace-nowrap ${
                  activeGenre === genre
                    ? "bg-white text-black"
                    : "bg-black text-white border border-white/20 hover:bg-white/10"
                }`}
                aria-label={`Filter by ${genre}`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Songs section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Songs</h2>
            {isLoading ? (
              <p className="text-gray-400">Loading songs...</p>
            ) : songs.length === 0 ? (
              <p className="text-gray-400">No songs available.</p>
            ) : (
              <div className="columns-2 gap-4 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
                {filteredSongs.map((song, index) => (
                  <div
                    key={song.id}
                    className={`mb-4 break-inside-avoid sm:mb-0 sm:break-inside-auto ${
                      index % 3 === 0
                        ? "h-[300px]"
                        : index % 2 === 0
                        ? "h-[240px]"
                        : "h-[200px]"
                    } sm:h-auto`}
                  >
                    <SongCard song={song} playSong={playSong} toggleLike={toggleLike} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Followed artists */}
          <div className="mb-12 hidden md:block">
            <h2 className="text-2xl font-bold mb-4">Your Artists</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {followedArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </div>
          
          {/* Suggested Artists - Desktop (Grid Layout) */}
          <div className="hidden md:block">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold">Suggested Artists</h2>
              <Link href="/artists" className="text-yellow-500 text-sm font-medium hover:underline">
                See More
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {suggestedArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Player */}
      {currentSong && (
        <Player
          song={currentSong}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          playNext={playNext}
          playPrevious={playPrevious}
          shuffle={shuffle}
          toggleShuffle={toggleShuffle}
          repeat={repeat}
          toggleRepeat={toggleRepeat}
          queue={queue}
          setQueue={setQueue}
          toggleLike={toggleLike}
        />
      )}
    </div>
  );
}