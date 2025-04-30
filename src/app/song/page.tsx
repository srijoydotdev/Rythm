"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Navbar from "@/components/ui/Navbar";
import LibrarySidebar from "@/components/ui/library";
import ArtistCard from "@/components/ui/ArtistCard";
import Player from "@/components/ui/player";
import SongCard from "@/components/ui/songcard";
import BottomNav from "@/components/ui/navmob";
import PlaylistCard from "@/components/ui/PlaylistCard";
import PlaylistModal from "@/components/ui/PlaylistModal";
import { Song, Artist, Playlist } from "@/app/types";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import debounce from "lodash/debounce";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export default function Music() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [activeGenre, setActiveGenre] = useState<string>("All");
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeat, setRepeat] = useState<"none" | "all" | "one">("none");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const isPlayingSong = useRef(false);

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

  // Fetch songs
  useEffect(() => {
    async function fetchSongs() {
      try {
        setIsLoading(true);
        setError(null);
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = {};
        if (session) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }
        const response = await fetch("/api/songs", { headers });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error: ${response.status}`);
        }
        const result: ApiResponse<Song[]> = await response.json();
        if (!result.success) throw new Error(result.error || "API error fetching songs");
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
  }, [supabase]);

  // Fetch playlists
  useEffect(() => {
    async function fetchPlaylists() {
      if (!user) {
        setPlaylists([]);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("No session found");
        const response = await fetch("/api/playlists", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error: ${response.status}`);
        }
        const result: ApiResponse<Playlist[]> = await response.json();
        if (!result.success) throw new Error(result.error || "API error fetching playlists");
        // Transform playlist data to match expected Playlist type
        const formattedPlaylists = result.data.map((playlist) => ({
          ...playlist,
          createdAt: playlist.createdAt.toString(),
          songs: playlist.songs.map((ps) => ({
            song: {
              ...ps.song,
              created_at: ps.song.createdAt.toString(),
            },
            addedAt: ps.addedAt.toString(),
            order: ps.order,
          })),
        }));
        setPlaylists(formattedPlaylists);
      } catch (err) {
        console.error("Error fetching playlists:", err);
        setError("Failed to load playlists. Please try again.");
        toast.error("Failed to load playlists.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlaylists();
  }, [user, supabase]);

  // Define filteredSongs before useEffect
  const filteredSongs = useMemo(
    () => (activeGenre === "All" ? songs : songs.filter((song) => song.genre === activeGenre)),
    [activeGenre, songs]
  );

  // Sync queue with filtered songs
  useEffect(() => {
    setQueue(filteredSongs);
    if (currentSong && !filteredSongs.some((s) => s.id === currentSong.id)) {
      setCurrentSong(filteredSongs[0] || null);
      setIsPlaying(false);
    }
  }, [filteredSongs, currentSong]);

  const handleFollow = useCallback(
    (artistId: string) => {
      setFollowedArtists((prev) => {
        const isFollowed = prev.some((artist) => artist.id === artistId);
        if (isFollowed) return prev.filter((artist) => artist.id !== artistId);
        const artistToFollow = suggestedArtists.find((artist) => artist.id === artistId);
        return artistToFollow ? [...prev, { ...artistToFollow, isFollowing: true }] : prev;
      });
    },
    [suggestedArtists]
  );

  const playSong = useCallback(
    debounce(
      async (song: Song | null) => {
        if (!song || !song.audio) {
          setIsPlaying(false);
          setCurrentSong(null);
          isPlayingSong.current = false;
          toast.error("No valid song or audio file.");
          return;
        }

        if (isPlayingSong.current && currentSong?.id === song.id && isPlaying) {
          return;
        }

        isPlayingSong.current = true;
        setCurrentSong(song);
        setIsPlaying(true);

        if (!user) {
          isPlayingSong.current = false;
          return;
        }

        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error("No session found");
          const response = await fetch("/api/songs/plays", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ songId: song.id }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error: ${response.status}`);
          }
          const result: ApiResponse<{ plays: number }> = await response.json();
          if (!result.success) throw new Error(result.error || "API error updating play count");
          setSongs((prev) =>
            prev.map((s) => (s.id === song.id ? { ...s, plays: result.data.plays } : s))
          );
        } catch (err) {
          console.error("Error in playSong:", err);
          toast.error("Failed to update play count. Playback will continue.");
        } finally {
          isPlayingSong.current = false;
        }
      },
      100,
      { leading: true, trailing: false }
    ),
    [supabase, user, currentSong, isPlaying]
  );

  const playNext = useCallback(
    debounce(
      () => {
        if (!currentSong || queue.length === 0) {
          setIsPlaying(false);
          setCurrentSong(null);
          isPlayingSong.current = false;
          return;
        }

        if (repeat === "one") {
          playSong(currentSong);
          return;
        }

        const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
        const nextIndex = shuffle
          ? Math.floor(Math.random() * queue.length)
          : currentIndex + 1;

        if (nextIndex >= queue.length) {
          if (repeat === "all") {
            playSong(queue[0]);
          } else {
            setIsPlaying(false);
            setCurrentSong(null);
            isPlayingSong.current = false;
          }
          return;
        }

        playSong(queue[nextIndex]);
      },
      100,
      { leading: true, trailing: false }
    ),
    [currentSong, queue, repeat, shuffle, playSong]
  );

  const playPrevious = useCallback(
    debounce(
      () => {
        if (!currentSong || queue.length === 0) return;
        const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
        if (currentIndex <= 0) {
          playSong(queue[queue.length - 1]);
          return;
        }
        playSong(queue[currentIndex - 1]);
      },
      100,
      { leading: true, trailing: false }
    ),
    [currentSong, queue, playSong]
  );

  const toggleShuffle = useCallback(() => setShuffle((prev) => !prev), []);

  const toggleRepeat = useCallback(() => {
    setRepeat((prev) => (prev === "none" ? "all" : prev === "all" ? "one" : "none"));
  }, []);

  const toggleLike = useCallback(
    async (songId: string, retries = 2) => {
      if (!user) {
        toast.error("Please sign in to like songs.");
        return;
      }

      const song = songs.find((s) => s.id === songId);
      if (!song) {
        toast.error("Song not found.");
        return;
      }

      try {
        const newLikedStatus = !song.liked;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("No session found");
        const response = await fetch("/api/songs/likes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ songId, liked: newLikedStatus }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error: ${response.status}`);
        }
        const result: ApiResponse<{ liked: boolean; likes: number }> = await response.json();
        if (!result.success) throw new Error(result.error || "API error updating like status");
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
        toast.success(newLikedStatus ? "Song liked!" : "Song unliked!");
      } catch (err: any) {
        console.error("Error updating like status:", err);
        if (retries > 0) {
          setTimeout(() => toggleLike(songId, retries - 1), 1000);
        } else {
          toast.error(err.message || "Failed to update like status. Please try again.");
        }
      }
    },
    [songs, currentSong, supabase, user]
  );

  const createPlaylist = useCallback(
    async (playlist: { name: string; description: string; isPublic: boolean }) => {
      if (!user) {
        toast.error("Please sign in to create playlists.");
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("No session found");
        const response = await fetch("/api/playlists", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(playlist),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error: ${response.status}`);
        }
        const result: ApiResponse<Playlist> = await response.json();
        if (!result.success) throw new Error(result.error || "API error creating playlist");
        setPlaylists((prev) => [
          {
            ...result.data,
            createdAt: result.data.createdAt.toString(),
            songs: result.data.songs.map((ps) => ({
              song: {
                ...ps.song,
                created_at: ps.song.createdAt.toString(),
              },
              addedAt: ps.addedAt.toString(),
              order: ps.order,
            })),
          },
          ...prev,
        ]);
        toast.success("Playlist created!");
      } catch (err: any) {
        console.error("Error creating playlist:", err);
        toast.error(err.message || "Failed to create playlist.");
      }
    },
    [supabase, user]
  );

  const addToPlaylist = useCallback(
    async (playlistId: number, songId: string) => {
      if (!user) {
        toast.error("Please sign in to add songs to playlists.");
        return;
      }

      const song = songs.find((s) => s.id === songId);
      if (!song) {
        toast.error("Song not found.");
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("No session found");
        const response = await fetch("/api/playlists/songs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ playlistId, songId }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error: ${response.status}`);
        }
        const result: ApiResponse<any> = await response.json();
        if (!result.success) throw new Error(result.error || "API error adding song to playlist");
        setPlaylists((prev) =>
          prev.map((p) =>
            p.id === playlistId
              ? {
                  ...p,
                  songs: [
                    ...p.songs,
                    {
                      song,
                      addedAt: new Date().toISOString(),
                      order: p.songs.length + 1,
                    },
                  ],
                }
              : p
          )
        );
        toast.success("Song added to playlist!");
      } catch (err: any) {
        console.error("Error adding song to playlist:", err);
        toast.error(err.message || "Failed to add song to playlist.");
      }
    },
    [songs, supabase, user]
  );

  const deletePlaylist = useCallback(
    async (playlistId: number) => {
      if (!user) {
        toast.error("Please sign in to delete playlists.");
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("No session found");
        const response = await fetch(`/api/playlists/${playlistId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error: ${response.status}`);
        }
        const result: ApiResponse<{}> = await response.json();
        if (!result.success) throw new Error(result.error || "API error deleting playlist");
        setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
        toast.success("Playlist deleted!");
      } catch (err: any) {
        console.error("Error deleting playlist:", err);
        toast.error(err.message || "Failed to delete playlist.");
      }
    },
    [supabase, user]
  );

  const playPlaylist = useCallback(
    (playlistSongs: { song: Song; addedAt: string; order: number }[]) => {
      if (playlistSongs.length === 0) {
        toast.error("Playlist is empty.");
        return;
      }
      const sortedSongs = playlistSongs
        .sort((a, b) => a.order - b.order)
        .map((ps) => ps.song);
      setQueue(sortedSongs);
      playSong(sortedSongs[0]);
    },
    [playSong]
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logged out!");
      router.push("/login");
    } catch (err) {
      toast.error("Failed to log out.");
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <div className="fixed top-0 left-0 right-0 z-10 hidden md:block">
        <Navbar />
      </div>
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-50">
        <BottomNav />
      </div>
      <div className="flex">
        <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] z-10 hidden md:block">
          <LibrarySidebar />
        </div>
        <div
          className="flex-1 overflow-x-hidden mt-16 px-4 sm:px-6 md:ml-64 hide-scrollbar"
          style={{ height: "calc(100vh - 4rem)" }}
        >
          {error && (
            <div className="mb-4 p-4 bg-red-500 text-white rounded">{error}</div>
          )}

          <div className="md:hidden mt-3">
            <div>
              <h2 className="font-semibold text-xl text-white">Artist Recommendation</h2>
              <div className="flex overflow-x-auto space-x-4 pb-2">
                {suggestedArtists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </div>
          </div>

          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Playlists</h2>
              {user && (
                <motion.button
                  onClick={() => setShowPlaylistModal(true)}
                  className="flex items-center text-yellow-500 hover:text-yellow-400"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Create new playlist"
                >
                  <Plus className="w-5 h-5 mr-1" />
                  New Playlist
                </motion.button>
              )}
            </div>
            {isLoading ? (
              <p className="text-gray-400">Loading playlists...</p>
            ) : playlists.length === 0 ? (
              <p className="text-gray-400">
                {user ? "No playlists yet. Create one!" : "Sign in to view playlists."}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {playlists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onPlay={() => playPlaylist(playlist.songs)}
                    onDelete={user ? deletePlaylist : undefined}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 mb-6 overflow-x-auto">
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

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Songs</h2>
            {isLoading ? (
              <p className="text-gray-400">Loading songs...</p>
            ) : songs.length === 0 ? (
              <p className="text-gray-400">No songs available. Please try again later.</p>
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
                    <SongCard
                      song={song}
                      playSong={playSong}
                      toggleLike={toggleLike}
                      playlists={playlists}
                      addToPlaylist={user ? addToPlaylist : undefined}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-12 hidden md:block">
            <h2 className="text-2xl font-bold mb-4">Your Artists</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {followedArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold">Suggested Artists</h2>
              <Link
                href="/artists"
                className="text-yellow-500 text-sm font-medium hover:underline"
              >
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
          playlists={playlists}
          addToPlaylist={user ? addToPlaylist : undefined}
        />
      )}

      {showPlaylistModal && user && (
        <PlaylistModal onClose={() => setShowPlaylistModal(false)} onCreate={createPlaylist} />
      )}
    </div>
  );
}