"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Share2,
  UserPlus,
  DollarSign,
  ChevronDown, // Add ChevronDown import
} from "lucide-react";
import toast from "react-hot-toast";
import { Song } from "@/types"; // Adjust path to your Song type

// Mock function to fetch song data from the cloud (same as Player component)
const fetchSongByName = async (songname: string): Promise<Song | null> => {
  try {
    // Your actual cloud API endpoint (same as used in Player component)
    const response = await fetch(`https://your-cloud-api/songs?name=${songname}`);
    if (!response.ok) return null;
    const song = await response.json();
    return {
      id: song.id,
      title: song.title,
      artist: song.artist,
      filePath: song.filePath, // Cloud-based URL
      cover: song.cover,
      liked: song.liked || false,
    } as Song;
  } catch (error) {
    console.error("Error fetching song:", error);
    return null;
  }
};

export default function SongFullscreenPage() {
  const router = useRouter();
  const params = useParams();
  const songname = params.songname as string;

  const audioRef = useRef<HTMLAudioElement>(null);
  const [song, setSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  // Fetch song data (same logic as Player)
  useEffect(() => {
    const loadSong = async () => {
      const fetchedSong = await fetchSongByName(songname);
      if (fetchedSong) {
        setSong(fetchedSong);
        setIsLiked(fetchedSong.liked || false);
        setIsPlaying(true); // Auto-play on load
      } else {
        toast.error("Song not found.");
        router.push("/"); // Redirect to home if song not found
      }
    };
    loadSong();
  }, [songname, router]);

  // Initialize audio (same logic as Player)
  useEffect(() => {
    if (audioRef.current && song) {
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackSpeed;
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error("Playback error:", err);
          toast.error("Failed to play song.");
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, song, volume, playbackSpeed]);

  // Update progress (same logic as Player)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setCurrentTime(audio.currentTime);
    const setDurationOnce = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", setDurationOnce);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", setDurationOnce);
    };
  }, []);

  // Persist volume (same logic as Player)
  useEffect(() => {
    localStorage.setItem("playerVolume", volume.toString());
  }, [volume]);

  // Format time (same logic as Player)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Seek (same logic as Player)
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Volume (same logic as Player)
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Toggle mute (same logic as Player)
  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  // Playback speed (same logic as Player)
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // Handle like
  const handleLike = () => {
    setIsLiked((prev) => !prev);
    // Call your API to update the liked status
    toast.success(isLiked ? "Unliked song" : "Liked song");
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: song?.title,
          text: `Listen to ${song?.title} by ${song?.artist}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share error:", err);
      }
    } else {
      // Fallback: Copy link to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href); // Use writeText
        toast.success("Link copied to clipboard!");
      } catch (err) {
        console.error("Clipboard error:", err);
        toast.error("Failed to copy link.");
      }
    }
  };

  // Handle follow artist
  const handleFollow = () => {
    // Call your API to follow the artist
    toast.success(`Followed ${song?.artist}`);
  };

  // Handle pay artist
  const handlePay = () => {
    // Redirect to payment gateway or open modal
    toast.success("Redirecting to payment...");
    // Example: window.location.href = "https://payment-gateway.com";
  };

  if (!song) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="relative flex flex-col h-screen items-center justify-center p-4 md:p-8"
      style={{
        backgroundImage: `url(${song.cover || "/images/placeholder.jpg"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Blurred Overlay */}
      <div
        className="absolute inset-0 backdrop-blur-xl bg-black/30"
        aria-hidden="true"
      ></div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-3xl">
        {/* Cover Image with White Border */}
        <div className="relative mb-6 md:mb-8">
          <div className="absolute inset-0 border-4 border-white rounded-lg md:rounded-xl shadow-lg"></div>
          <Image
            src={song.cover || "/images/placeholder.jpg"}
            alt={`Cover art for ${song.title} by ${song.artist}`}
            width={300}
            height={300}
            className="w-[250px] h-[250px] md:w-[400px] md:h-[300px] rounded-lg md:rounded-xl object-cover"
            onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
            priority
          />
        </div>

        {/* Song Info */}
        <div className="text-center mb-4 md:mb-6">
          <h3 className="text-xl md:text-3xl font-semibold text-white truncate">
            {song.title}
          </h3>
          <p className="text-sm md:text-lg text-gray-300 truncate">
            {song.artist}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center space-x-2 mb-4 md:mb-6">
          <span className="text-xs md:text-sm text-gray-300">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 rounded-full cursor-pointer appearance-none bg-gray-600"
            style={{
              background: `linear-gradient(to right, white ${
                (currentTime / duration) * 100
              }%, gray 0%)`,
            }}
            aria-label="Seek song position"
          />
          <span className="text-xs md:text-sm text-gray-300">
            -{formatTime(duration - currentTime)}
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex justify-center items-center space-x-4 md:space-x-6 mb-4 md:mb-6">
          <motion.button
            className="p-2 rounded-full bg-white text-black"
            whileTap={{ scale: 0.9 }}
            aria-label="Shuffle"
          >
            <Shuffle className="w-6 h-6" />
          </motion.button>
          <motion.button
            className="p-2 rounded-full bg-white text-black"
            whileTap={{ scale: 0.9 }}
            aria-label="Previous song"
          >
            <SkipBack className="w-6 h-6" strokeWidth={2} />
          </motion.button>
          <motion.button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-4 rounded-full bg-white text-black"
            whileTap={{ scale: 0.9 }}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" strokeWidth={2} />
            ) : (
              <Play className="w-8 h-8" strokeWidth={2} />
            )}
          </motion.button>
          <motion.button
            className="p-2 rounded-full bg-white text-black"
            whileTap={{ scale: 0.9 }}
            aria-label="Next song"
          >
            <SkipForward className="w-6 h-6" strokeWidth={2} />
          </motion.button>
          <motion.button
            className="p-2 rounded-full bg-white text-black"
            whileTap={{ scale: 0.9 }}
            aria-label="Repeat"
          >
            <Repeat className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Additional Buttons */}
        <div className="flex justify-center space-x-4 mb-4 md:mb-6">
          <motion.button
            onClick={handleLike}
            className="p-2 rounded-full bg-white text-black"
            whileTap={{ scale: 0.9 }}
            aria-label={isLiked ? "Unlike song" : "Like song"}
          >
            <Heart
              className={`w-6 h-6 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
              strokeWidth={2}
            />
          </motion.button>
          <motion.button
            onClick={handleShare}
            className="p-2 rounded-full bg-white text-black"
            whileTap={{ scale: 0.9 }}
            aria-label="Share song"
          >
            <Share2 className="w-6 h-6" />
          </motion.button>
          <motion.button
            onClick={handleFollow}
            className="p-2 rounded-full bg-white text-black"
            whileTap={{ scale: 0.9 }}
            aria-label="Follow artist"
          >
            <UserPlus className="w-6 h-6" />
          </motion.button>
          <motion.button
            onClick={handlePay}
            className="p-2 rounded-full bg-white text-black"
            whileTap={{ scale: 0.9 }}
            aria-label="Contribute to artist"
          >
            <DollarSign className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Exit Fullscreen Button */}
        <motion.button
          onClick={() => router.push("/")} // Redirect back to home
          className="absolute top-4 left-4 p-2 rounded-full bg-white text-black"
          whileTap={{ scale: 0.9 }}
          aria-label="Exit full screen"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.button>
      </div>

      <audio
        ref={audioRef}
        src={song.filePath}
        onEnded={() => router.push("/")} // Redirect on song end (adjust as needed)
        onError={(e) => {
          console.error("Audio playback error:", e);
          toast.error("Failed to load song.");
          setIsPlaying(false);
        }}
        preload="auto"
      />
    </div>
  );
}