"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Volume2,
  VolumeX,
  ChevronDown,
  Speaker,
  X,
  UserPlus,
  DollarSign,
  Plus,
  Maximize2,
} from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Song, Playlist } from "@/app/types";
import toast from "react-hot-toast";
import { useSwipeable } from "react-swipeable";

interface PlayerProps {
  song: Song;
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  playNext: () => void;
  playPrevious: () => void;
  shuffle: boolean;
  toggleShuffle: () => void;
  repeat: "none" | "all" | "one";
  toggleRepeat: () => void;
  queue: Song[];
  setQueue: Dispatch<SetStateAction<Song[]>>;
  toggleLike: (songId: string) => void;
  playlists: Playlist[];
  addToPlaylist?: (playlistId: number, songId: string) => Promise<void>;
}

interface AudioDevice {
  deviceId: string;
  label: string;
  key: string;
}

interface DeviceSelectionPanelProps {
  devices: AudioDevice[];
  selectedDevice: string;
  onDeviceChange: (deviceId: string) => void;
  onClose: () => void;
}

const DeviceSelectionPanel: React.FC<DeviceSelectionPanelProps> = ({
  devices,
  selectedDevice,
  onDeviceChange,
  onClose,
}) => {
  return (
    <motion.div
      className="fixed top-0 right-0 h-[80%] w-64 md:w-96 bg-black rounded-2xl m-4 mb-6 text-white p-6 z-50 shadow-lg overflow-y-auto"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Select Audio Output</h2>
        <motion.button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-800"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Close device selection panel"
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>
      <ul className="space-y-2">
        {devices.map((device) => (
          <li key={device.key}>
            <motion.button
              className={`w-full text-left p-3 rounded-md flex items-center space-x-2 ${
                selectedDevice === device.deviceId ? "bg-white/20" : "hover:bg-white/10"
              }`}
              onClick={() => onDeviceChange(device.deviceId)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Select ${device.label} as audio output`}
            >
              <input
                type="radio"
                checked={selectedDevice === device.deviceId}
                onChange={() => {}}
                className="w-4 h-4 cursor-pointer"
                aria-hidden="true"
              />
              <span className="text-sm truncate">{device.label}</span>
            </motion.button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default function Player({
  song,
  isPlaying,
  setIsPlaying,
  playNext,
  playPrevious,
  shuffle,
  toggleShuffle,
  repeat,
  toggleRepeat,
  queue,
  setQueue,
  toggleLike,
  playlists,
  addToPlaylist,
}: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("default");
  const [isDeviceSelectionSupported, setIsDeviceSelectionSupported] = useState(false);
  const [showDevicePanel, setShowDevicePanel] = useState(false);
  const [activeTab, setActiveTab] = useState("Video");
  const [videoError, setVideoError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

  // Handle adding to playlist
  const handleAddToPlaylist = async (playlistId: number) => {
    if (!addToPlaylist) return;
    try {
      await addToPlaylist(playlistId, song.id);
      setShowPlaylistMenu(false);
      toast.success(`Added to playlist!`);
    } catch (error) {
      console.error("Error adding to playlist:", error);
      toast.error("Failed to add to playlist.");
    }
  };

  // Check for setSinkId support
  useEffect(() => {
    if (audioRef.current && "setSinkId" in HTMLMediaElement.prototype) {
      setIsDeviceSelectionSupported(true);
    }
  }, []);

  // Enumerate audio devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const outputDevices = devices
          .filter((device) => device.kind === "audiooutput")
          .map((device, index) => ({
            deviceId: device.deviceId || `default-${index}`,
            label: device.label || `Device ${index + 1}`,
            key: device.deviceId ? `device-${device.deviceId}` : `default-${index}`,
          }));

        setAudioDevices([
          { deviceId: "default", label: "Default", key: "default" },
          ...outputDevices.filter((device) => device.deviceId !== "default"),
        ]);

        if (audioRef.current && outputDevices.length > 0) {
          await audioRef.current.setSinkId("default");
        }
      } catch (err) {
        console.error("Error enumerating devices:", err);
        toast.error("Failed to access audio devices.");
        setAudioDevices([{ deviceId: "default", label: "Default", key: "default" }]);
      }
    };

    if (isDeviceSelectionSupported) {
      fetchDevices();
    }
  }, [isDeviceSelectionSupported]);

  // Handle device change
  const handleDeviceChange = async (deviceId: string) => {
    setSelectedDevice(deviceId);
    if (audioRef.current) {
      try {
        await audioRef.current.setSinkId(deviceId);
        toast.success(
          `Audio output set to ${
            audioDevices.find((d) => d.deviceId === deviceId)?.label || "device"
          }`
        );
        setShowDevicePanel(false);
      } catch (err) {
        console.error("Error setting audio output:", err);
        toast.error("Failed to change audio output device.");
        setSelectedDevice("default");
      }
    }
  };

  // Preload next video
  useEffect(() => {
    if (queue.length > 0 && activeTab === "Video") {
      const nextSong = queue[0];
      if (nextSong.coverVideo) {
        const preloadVideo = document.createElement("video");
        preloadVideo.src = nextSong.coverVideo;
        preloadVideo.preload = "auto";
      }
    }
  }, [queue, activeTab, song]);

  // Initialize audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error("Audio playback error:", err);
          toast.error("Failed to play song.");
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, song, volume, isMuted, setIsPlaying]);

  // Sync video playback with audio
  useEffect(() => {
    if (videoRef.current && activeTab === "Video" && !videoError) {
      videoRef.current.currentTime = audioRef.current?.currentTime || 0;
      if (isPlaying) {
        videoRef.current.play().catch((err) => {
          console.error("Video playback error:", err);
          toast.error("Failed to play video.");
          setVideoError(true);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, activeTab, videoError, song]);

  // Update progress and handle buffering
  useEffect(() => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setProgressPercentage((audio.currentTime / duration) * 100);
      if (video && activeTab === "Video" && !videoError) {
        const diff = Math.abs(video.currentTime - audio.currentTime);
        if (diff > 0.1) {
          video.currentTime = audio.currentTime;
        }
      }
    };
    const setDurationOnce = () => setDuration(audio.duration);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", setDurationOnce);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    if (video && activeTab === "Video") {
      video.addEventListener("waiting", handleWaiting);
      video.addEventListener("playing", handlePlaying);
    }

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", setDurationOnce);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      if (video) {
        video.removeEventListener("waiting", handleWaiting);
        video.removeEventListener("playing", handlePlaying);
      }
    };
  }, [activeTab, duration, videoError]);

  // Persist volume
  useEffect(() => {
    localStorage.setItem("playerVolume", volume.toString());
  }, [volume]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === "ArrowRight") {
        playNext();
      } else if (e.code === "ArrowLeft") {
        playPrevious();
      } else if (e.code === "KeyM") {
        setIsMuted((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [setIsPlaying, playNext, playPrevious]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    setProgressPercentage((time / duration) * 100);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    if (videoRef.current && activeTab === "Video") {
      videoRef.current.currentTime = time;
    }
  };

  // Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  // Double-tap to like
  const handleDoubleTap = () => {
    toggleLike(song.id);
    toast.success(song.liked ? "Unliked" : "Liked");
  };

  // Toggle controls visibility
  const handleVideoTap = () => {
    setShowControls((prev) => !prev);
  };

  // Swipe handlers for Reels-like navigation
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => {
      if (activeTab === "Video" && isFullScreen) {
        playNext();
        setVideoError(false);
        navigator.vibrate?.(50);
      }
    },
    onSwipedDown: () => {
      if (activeTab === "Video" && isFullScreen) {
        playPrevious();
        setVideoError(false);
        navigator.vibrate?.(50);
      }
    },
    onSwipedLeft: () => {
      if (!isFullScreen) {
        playNext();
        setVideoError(false);
        navigator.vibrate?.(50);
      }
    },
    onSwipedRight: () => {
      if (!isFullScreen) {
        playPrevious();
        setVideoError(false);
        navigator.vibrate?.(50);
      }
    },
    trackMouse: false,
    delta: 30,
  });

  // Animation variants
  const controlsVariants = {
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    hidden: { opacity: 0, y: 20, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const videoVariants = {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -100, transition: { duration: 0.4, ease: "easeIn" } },
  };

  return (
    <>
      <style jsx global>{`
        input[type="range"].progress-bar,
        input[type="range"].volume-bar {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
          width: 100%;
        }

        input[type="range"].progress-bar::-webkit-slider-runnable-track,
        input[type="range"].volume-bar::-webkit-slider-runnable-track {
          background: rgba(255, 255, 255, 0.3);
          height: 4px;
          border-radius: 2px;
        }

        input[type="range"].progress-bar::-webkit-slider-thumb,
        input[type="range"].volume-bar::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          margin-top: -4px;
          background: #ffffff;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
        }

        input[type="range"].progress-bar::-moz-range-track,
        input[type="range"].volume-bar::-moz-range-track {
          background: rgba(255, 255, 255, 0.3);
          height: 4px;
          border-radius: 2px;
        }

        input[type="range"].progress-bar::-moz-range-thumb,
        input[type="range"].volume-bar::-moz-range-thumb {
          background: #ffffff;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          border: none;
        }

        input[type="range"].progress-bar::-moz-range-progress,
        input[type="range"].volume-bar::-moz-range-progress {
          background: #ffffff;
          height: 4px;
          border-radius: 2px;
        }

        input[type="range"].progress-bar::-webkit-progress-bar,
        input[type="range"].volume-bar::-webkit-progress-bar {
          background: rgba(255, 255, 255, 0.3);
          height: 4px;
          border-radius: 2px;
        }

        input[type="range"].progress-bar::-webkit-progress-value,
        input[type="range"].volume-bar::-webkit-progress-value {
          background: #ffffff;
          border-radius: 2px;
        }

        .video-player {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
          will-change: transform, opacity;
        }

        .video-player-fullscreen {
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          object-fit: cover;
          z-index: 0;
          will-change: transform, opacity;
        }

        .controls-overlay {
          background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent 50%);
          z-index: 10;
          padding: 16px;
        }

        .progress-ring {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 40px;
          height: 40px;
        }

        .progress-ring__circle {
          stroke: #ffffff;
          stroke-width: 3;
          fill: transparent;
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
        }

        .progress-ring__background {
          stroke: rgba(255, 255, 255, 0.3);
        }

        .loading-spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid #ffffff;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .controls-overlay {
            padding: 12px;
          }
        }
      `}</style>

      <div
        className={`fixed bottom-0 rounded-2xl mb-4 mx-2 w-full max-w-3xl bg-[#0E0E0E] text-white z-50 transition-all ${
          isFullScreen
            ? "top-0 left-0 h-screen w-screen m-0 p-0 rounded-none"
            : "py-2 shadow-lg"
        } ${isFullScreen ? "" : "sm:flex sm:justify-center sm:left-1/2 sm:transform sm:-translate-x-1/2"}`}
        {...swipeHandlers}
      >
        {isFullScreen ? (
          // Fullscreen Player
          <div className="relative flex flex-col h-full">
            <AnimatePresence mode="wait">
              {activeTab === "Video" && song.coverVideo && !videoError ? (
                <motion.div
                  key={song.id}
                  variants={videoVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute inset-0"
                >
                  <video
                    ref={videoRef}
                    src={song.coverVideo}
                    className="video-player-fullscreen"
                    muted
                    loop
                    playsInline
                    preload="auto"
                    onError={() => {
                      toast.error("Failed to load video.");
                      setVideoError(true);
                    }}
                    onClick={handleVideoTap}
                    onDoubleClick={handleDoubleTap}
                  />
                  {isBuffering && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="loading-spinner"></div>
                    </div>
                  )}
                  <svg className="progress-ring" viewBox="0 0 40 40">
                    <circle
                      className="progress-ring__background"
                      cx="20"
                      cy="20"
                      r="18"
                      strokeWidth="3"
                    />
                    <circle
                      className="progress-ring__circle"
                      cx="20"
                      cy="20"
                      r="18"
                      strokeDasharray="113"
                      strokeDashoffset={113 - (progressPercentage / 100) * 113}
                    />
                  </svg>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 controls-overlay"
                    variants={controlsVariants}
                    animate={showControls ? "visible" : "hidden"}
                  >
                    <div className="flex justify-center space-x-4 mb-4">
                      {["Highlight", "Lyrics", "Video"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`text-sm font-medium uppercase ${
                            activeTab === tab ? "text-white" : "text-gray-300"
                          } hover:text-white transition-colors`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-semibold truncate">{song.title}</h3>
                      <p className="text-base text-gray-300 truncate">{song.artist}</p>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-sm text-gray-300">{formatTime(currentTime)}</span>
                      <input
                        type="range"
                        min={0}
                        max={duration}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 rounded-full cursor-pointer progress-bar"
                        aria-label="Seek song position"
                      />
                      <span className="text-sm text-gray-300">
                        -{formatTime(duration - currentTime)}
                      </span>
                    </div>
                    <div className="flex justify-center items-center space-x-6 mb-4">
                      <motion.button
                        onClick={toggleShuffle}
                        className={`p-2 ${shuffle ? "text-white" : "text-gray-300"} hover:text-white`}
                        whileTap={{ scale: 0.9 }}
                        aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
                      >
                        <Shuffle className="w-6 h-6" />
                      </motion.button>
                      <motion.button
                        onClick={playPrevious}
                        className="p-2 text-white hover:text-gray-300"
                        whileTap={{ scale: 0.9 }}
                        aria-label="Previous song"
                      >
                        <SkipBack className="w-7 h-7" strokeWidth={2} />
                      </motion.button>
                      <motion.button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-4 rounded-full bg-white text-black shadow-lg"
                        whileTap={{ scale: 0.9 }}
                        aria-label={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? (
                          <Pause className="w-7 h-7" strokeWidth={2} />
                        ) : (
                          <Play className="w-7 h-7" strokeWidth={2} />
                        )}
                      </motion.button>
                      <motion.button
                        onClick={playNext}
                        className="p-2 text-white hover:text-gray-300"
                        whileTap={{ scale: 0.9 }}
                        aria-label="Next song"
                      >
                        <SkipForward className="w-7 h-7" strokeWidth={2} />
                      </motion.button>
                      <motion.button
                        onClick={toggleRepeat}
                        className={`p-2 ${repeat !== "none" ? "text-white" : "text-gray-300"} hover:text-white`}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Repeat: ${repeat}`}
                      >
                        <Repeat className="w-6 h-6" />
                      </motion.button>
                    </div>
                    <div className="flex justify-center space-x-3 relative">
                      <motion.button
                        onClick={() => toggleLike(song.id)}
                        className="p-2 text-white hover:text-gray-300"
                        whileTap={{ scale: 0.9 }}
                        aria-label={song.liked ? "Unlike song" : "Like song"}
                      >
                        <Heart
                          className={`w-6 h-6 ${song.liked ? "text-red-500 fill-current" : "text-white"}`}
                          strokeWidth={2}
                        />
                      </motion.button>
                      <motion.button
                        onClick={() => console.log("Follow artist")}
                        className="p-2 text-white hover:text-gray-300"
                        whileTap={{ scale: 0.9 }}
                        aria-label="Follow artist"
                      >
                        <UserPlus className="w-6 h-6" />
                      </motion.button>
                      <motion.button
                        onClick={() => console.log("Tip artist")}
                        className="p-2 text-white hover:text-gray-300"
                        whileTap={{ scale: 0.9 }}
                        aria-label="Tip artist"
                      >
                        <DollarSign className="w-6 h-6" />
                      </motion.button>
                      <motion.button
                        onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                        className="p-2 text-white hover:text-gray-300"
                        whileTap={{ scale: 0.9 }}
                        aria-label="Add to playlist"
                      >
                        <Plus className="w-6 h-6" />
                      </motion.button>
                      {showPlaylistMenu && (
                        <motion.div
                          className="absolute bottom-12 right-0 bg-[#2A2A2A] rounded-lg shadow-lg z-20"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                        >
                          <ul className="py-2">
                            {playlists.length === 0 ? (
                              <li className="px-4 py-2 text-sm text-gray-400">
                                No playlists available
                              </li>
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
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key={song.id}
                  variants={videoVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="relative flex flex-col h-full"
                  style={{
                    backgroundImage: `url(${song.cover || "/images/placeholder.jpg"})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div
                    className="absolute inset-0 backdrop-blur-md bg-black/50"
                    aria-hidden="true"
                  ></div>
                  <div className="relative z-10 flex flex-col h-full px-4 py-6">
                    <div className="flex justify-center space-x-4 mb-6">
                      {["Highlight", "Lyrics", "Video"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`text-sm font-medium uppercase ${
                            activeTab === tab ? "text-white" : "text-gray-300"
                          } hover:text-white transition-colors`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <Image
                        src={song.cover || "/images/placeholder.jpg"}
                        alt={`Cover art for ${song.title} by ${song.artist}`}
                        width={400}
                        height={300}
                        className="w-3/4 max-w-[600px] h-auto rounded-lg object-cover aspect-[4/3] shadow-lg"
                        onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                        priority
                      />
                    </div>
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold truncate">{song.title}</h3>
                      <p className="text-base text-gray-300 truncate">{song.artist}</p>
                      <div className="flex justify-center space-x-3 mt-2">
                        <motion.button
                          onClick={() => toggleLike(song.id)}
                          className="p-2 text-white hover:text-gray-300"
                          whileTap={{ scale: 0.9 }}
                          aria-label={song.liked ? "Unlike song" : "Like song"}
                        >
                          <Heart
                            className={`w-6 h-6 ${song.liked ? "text-red-500 fill-current" : "text-white"}`}
                            strokeWidth={2}
                          />
                        </motion.button>
                        <motion.button
                          onClick={() => console.log("Follow artist")}
                          className="p-2 text-white hover:text-gray-300"
                          whileTap={{ scale: 0.9 }}
                          aria-label="Follow artist"
                        >
                          <UserPlus className="w-6 h-6" />
                        </motion.button>
                        <motion.button
                          onClick={() => console.log("Tip artist")}
                          className="p-2 text-white hover:text-gray-300"
                          whileTap={{ scale: 0.9 }}
                          aria-label="Tip artist"
                        >
                          <DollarSign className="w-6 h-6" />
                        </motion.button>
                        <motion.button
                          onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                          className="p-2 text-white hover:text-gray-300"
                          whileTap={{ scale: 0.9 }}
                          aria-label="Add to playlist"
                        >
                          <Plus className="w-6 h-6" />
                        </motion.button>
                        {showPlaylistMenu && (
                          <motion.div
                            className="absolute bottom-12 right-0 bg-[#2A2A2A] rounded-lg shadow-lg z-20"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                          >
                            <ul className="py-2">
                              {playlists.length === 0 ? (
                                <li className="px-4 py-2 text-sm text-gray-400">
                                  No playlists available
                                </li>
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
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-6">
                      <span className="text-sm text-gray-300">{formatTime(currentTime)}</span>
                      <input
                        type="range"
                        min={0}
                        max={duration}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 rounded-full cursor-pointer progress-bar"
                        aria-label="Seek song position"
                      />
                      <span className="text-sm text-gray-300">
                        -{formatTime(duration - currentTime)}
                      </span>
                    </div>
                    <div className="flex justify-center items-center space-x-6 mb-6">
                      <motion.button
                        onClick={toggleShuffle}
                        className={`p-2 ${shuffle ? "text-white" : "text-gray-300"} hover:text-white`}
                        whileTap={{ scale: 0.9 }}
                        aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
                      >
                        <Shuffle className="w-6 h-6" />
                      </motion.button>
                      <motion.button
                        onClick={playPrevious}
                        className="p-2 text-white hover:text-gray-300"
                        whileTap={{ scale: 0.9 }}
                        aria-label="Previous song"
                      >
                        <SkipBack className="w-7 h-7" strokeWidth={2} />
                      </motion.button>
                      <motion.button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-4 rounded-full bg-white text-black shadow-lg"
                        whileTap={{ scale: 0.9 }}
                        aria-label={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? (
                          <Pause className="w-7 h-7" strokeWidth={2} />
                        ) : (
                          <Play className="w-7 h-7" strokeWidth={2} />
                        )}
                      </motion.button>
                      <motion.button
                        onClick={playNext}
                        className="p-2 text-white hover:text-gray-300"
                        whileTap={{ scale: 0.9 }}
                        aria-label="Next song"
                      >
                        <SkipForward className="w-7 h-7" strokeWidth={2} />
                      </motion.button>
                      <motion.button
                        onClick={toggleRepeat}
                        className={`p-2 ${repeat !== "none" ? "text-white" : "text-gray-300"} hover:text-white`}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Repeat: ${repeat}`}
                      >
                        <Repeat className="w-6 h-6" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              onClick={() => setIsFullScreen(false)}
              className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-white hover:text-gray-300 shadow-lg"
              whileTap={{ scale: 0.9 }}
              aria-label="Exit full screen"
            >
              <ChevronDown className="w-6 h-6" />
            </motion.button>
          </div>
        ) : (
          // Mini Player
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-3 py-2">
            <div className="flex items-center space-x-2 w-1/3">
              <Image
                src={song.cover || "/images/placeholder.jpg"}
                alt={`Cover art for ${song.title} by ${song.artist}`}
                width={56}
                height={48}
                className="w-14 h-12 rounded-md object-cover shadow-sm"
                onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                priority
              />
              <div className="min-w-0">
                <h3 className="text-sm font-semibold truncate max-w-[130px]">{song.title}</h3>
                <p className="text-xs text-gray-400 truncate">{song.artist}</p>
              </div>
            </div>
            <div className="flex flex-col items-center w-1/3">
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={playPrevious}
                  className="p-1 text-white hover:text-gray-300"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Previous song"
                >
                  <SkipBack className="w-5 h-5" strokeWidth={2} />
                </motion.button>
                <motion.button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-full bg-white text-black shadow-lg"
                  whileTap={{ scale: 0.9 }}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" strokeWidth={2} />
                  ) : (
                    <Play className="w-5 h-5" strokeWidth={2} />
                  )}
                </motion.button>
                <motion.button
                  onClick={playNext}
                  className="p-1 text-white hover:text-gray-300"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Next song"
                >
                  <SkipForward className="w-5 h-5" strokeWidth={2} />
                </motion.button>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2 w-1/3 justify-end">
              <div className="flex items-center space-x-1">
                <motion.button
                  onClick={toggleMute}
                  className="p-1 text-white hover:text-gray-300"
                  whileTap={{ scale: 0.9 }}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </motion.button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 rounded-full cursor-pointer volume-bar"
                  aria-label="Volume control"
                />
              </div>
              {isDeviceSelectionSupported && audioDevices.length > 1 && (
                <motion.button
                  onClick={() => setShowDevicePanel(true)}
                  className="p-1 text-white hover:text-gray-300"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Open device selection panel"
                >
                  <Speaker className="w-5 h-5" />
                </motion.button>
              )}
              <motion.button
                onClick={() => setIsFullScreen(true)}
                className="p-1 text-white hover:text-gray-300"
                whileTap={{ scale: 0.9 }}
                aria-label="Enter full screen"
              >
                <Maximize2 className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        )}

        {showDevicePanel && (
          <DeviceSelectionPanel
            devices={audioDevices}
            selectedDevice={selectedDevice}
            onDeviceChange={handleDeviceChange}
            onClose={() => setShowDevicePanel(false)}
          />
        )}

        <audio
          ref={audioRef}
          src={song.audio} // Changed from song.filePath
          onEnded={playNext}
          onError={(e) => {
            console.error("Audio playback error:", e);
            toast.error("Failed to load song.");
            setIsPlaying(false);
          }}
          preload="auto"
        />
      </div>
    </>
  );
}