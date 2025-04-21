"use client";

import { useState, useEffect, useRef } from "react";
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
  Volume2,
  VolumeX,
  List,
  ChevronDown,
  Speaker,
  X,
  UserPlus,
  Link,
  DollarSign,
  Plus,
  Maximize2,
} from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Song } from "@/types";
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
      className="fixed top-0 right-0 h-[80%] scrollbar-hidden w-50 md:w-96 bg-black rounded-2xl m-4 mb-6 text-white p-6 z-40 shadow-lg overflow-y-auto sm:w-full"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex justify-between items-center mb-15">
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
              className={`w-full text-left cursor-pointer p-3 rounded-md flex items-center space-x-2 ${
                selectedDevice === device.deviceId ? "bg-white/30" : "hover:bg-white/30"
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
                className="w-4 h-4 cursor-pointer bg-gray-600 border-gray-600"
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
}: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("default");
  const [isDeviceSelectionSupported, setIsDeviceSelectionSupported] = useState(false);
  const [showDevicePanel, setShowDevicePanel] = useState(false);
  const [activeTab, setActiveTab] = useState("Lyrics");

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
        const permission = await navigator.permissions.query({ name: "microphone" });
        if (permission.state === "prompt" || permission.state === "denied") {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        }

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
        toast.error("Failed to access audio devices. Using default output.");
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
        toast.success(`Audio output set to ${audioDevices.find((d) => d.deviceId === deviceId)?.label || "device"}`);
        setShowDevicePanel(false);
      } catch (err) {
        console.error("Error setting audio output:", err);
        toast.error("Failed to change audio output device.");
        setSelectedDevice("default");
      }
    }
  };

  // Initialize audio
  useEffect(() => {
    if (audioRef.current) {
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
  }, [isPlaying, song, volume, playbackSpeed, setIsPlaying]);

  // Update progress
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
      } else if (e.code === "KeyS") {
        toggleShuffle();
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [setIsPlaying, playNext, playPrevious, toggleShuffle]);

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
    if (audioRef.current) {
      audioRef.current.currentTime = time;
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

  // Playback speed
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // Queue management
  const removeFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  };

  // Animation variants
  const dotVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  const heartVariants = {
    liked: {
      scale: [1, 1.3, 1],
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    unliked: { scale: 1 },
  };

  // Swipe gesture handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      playNext();
      navigator.vibrate?.(50);
    },
    onSwipedRight: () => {
      playPrevious();
      navigator.vibrate?.(50);
    },
    trackMouse: false,
    delta: 50,
  });

  // Handle click to toggle fullscreen on mobile
  const handleMiniPlayerClick = (e: React.MouseEvent) => {
    if (window.innerWidth < 640) {
      // Prevent clicks on buttons from triggering fullscreen
      if ((e.target as HTMLElement).closest("button")) return;
      setIsFullScreen(true);
    }
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
          background: #4b4b4b;
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
        }

        input[type="range"].progress-bar::-moz-range-track,
        input[type="range"].volume-bar::-moz-range-track {
          background: #4b4b4b;
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
          background: #4b4b4b;
          height: 4px;
          border-radius: 2px;
        }

        input[type="range"].progress-bar::-webkit-progress-value,
        input[type="range"].volume-bar::-webkit-progress-value {
          background: #ffffff;
          border-radius: 2px;
        }
      `}</style>

      <div
        className={`fixed bottom-0 rounded-2xl mb-4 mx-2 w-full max-w-3xl bg-[#0E0E0E] text-white z-50 transition-all ${
          isFullScreen
            ? "top-0 left-0 h-screen w-screen sm:m-0 sm:p-0 sm:rounded-none"
            : "py-2 shadow-lg"
        } ${isFullScreen ? "" : "sm:flex sm:justify-center sm:left-1/2 sm:transform sm:-translate-x-1/2"}`}
        onClick={handleMiniPlayerClick}
      >
        {isFullScreen ? (
          // Fullscreen Player
          <div
            className="relative flex flex-col h-full p-4 sm:p-0"
            style={{
              backgroundImage: `url(${song.cover || "/images/placeholder.jpg"})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div
              className="absolute inset-0 backdrop-blur-md bg-black/50"
              aria-hidden="true"
            ></div>

            <div className="relative z-10 flex flex-col h-full px-4 sm:px-8 md:px-12 py-4 sm:py-6 md:py-8">
              <div className="flex justify-center space-x-4 mb-4 sm:mb-6">
                {["Highlight", "Lyrics", "Video"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-sm sm:text-base font-medium uppercase ${
                      activeTab === tab ? "text-white" : "text-gray-400"
                    } hover:text-gray-300`}
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
                  className="w-3/4 sm:w-2/5 md:w-1/3 max-w-[600px] h-auto rounded-lg object-cover aspect-[4/3]"
                  onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                  priority
                />
              </div>

              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold truncate">
                  {song.title}
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-400 truncate">
                  {song.artist}
                </p>
                <div className="flex justify-center space-x-2 mt-2">
                  <motion.button
                    onClick={() => console.log("Follow artist")}
                    className="p-1 text-white hover:text-gray-300"
                    whileTap={{ scale: 0.9 }}
                    aria-label="Follow artist"
                  >
                    <UserPlus className="w-5 h-5 fill-current" />
                  </motion.button>
                  <motion.button
                    onClick={() => console.log("Go to artist page")}
                    className="p-1 text-white hover:text-gray-300"
                    whileTap={{ scale: 0.9 }}
                    aria-label="Go to artist page"
                  >
                    <Link className="w-5 h-5 fill-current" />
                  </motion.button>
                  <motion.button
                    onClick={() => console.log("Tip artist")}
                    className="p-1 text-white hover:text-gray-300"
                    whileTap={{ scale: 0.9 }}
                    aria-label="Tip artist"
                  >
                    <DollarSign className="w-5 h-5 fill-current" />
                  </motion.button>
                  <motion.button
                    onClick={() => console.log("Add to playlist")}
                    className="p-1 text-white hover:text-gray-300"
                    whileTap={{ scale: 0.9 }}
                    aria-label="Add to playlist"
                  >
                    <Plus className="w-5 h-5 fill-current" />
                  </motion.button>
                </div>
              </div>

              <div className="w-full flex items-center space-x-2 mb-4 sm:mb-6">
                <span className="text-xs sm:text-sm text-gray-400">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 rounded-full cursor-pointer progress-bar"
                  aria-label="Seek song position"
                />
                <span className="text-xs sm:text-sm text-gray-400">
                  -{formatTime(duration - currentTime)}
                </span>
              </div>

              <div className="flex justify-center items-center space-x-4 sm:space-x-6 mb-4 sm:mb-6">
                <motion.button
                  onClick={toggleShuffle}
                  className={`p-1.5 ${shuffle ? "text-white" : "text-gray-400"} hover:text-gray-300`}
                  whileTap={{ scale: 0.9 }}
                  aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
                >
                  <Shuffle className="w-5 h-5 fill-current" />
                </motion.button>
                <motion.button
                  onClick={playPrevious}
                  className="p-1.5 text-white hover:text-gray-300"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Previous song"
                >
                  <SkipBack className="w-6 h-6 fill-current" strokeWidth={2} />
                </motion.button>
                <motion.button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-full bg-white text-black"
                  whileTap={{ scale: 0.9 }}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" strokeWidth={2} />
                  ) : (
                    <Play className="w-6 h-6 fill-current" strokeWidth={2} />
                  )}
                </motion.button>
                <motion.button
                  onClick={playNext}
                  className="p-1.5 text-white hover:text-gray-300"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Next song"
                >
                  <SkipForward className="w-6 h-6 fill-current" strokeWidth={2} />
                </motion.button>
                <motion.button
                  onClick={toggleRepeat}
                  className={`p-1.5 ${repeat !== "none" ? "text-white" : "text-gray-400"} hover:text-gray-300`}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Repeat: ${repeat}`}
                >
                  <Repeat className="w-5 h-5 fill-current" />
                </motion.button>
              </div>

              <div className="flex justify-between items-center">
                <button className="text-sm bg-black/50 p-2 rounded-full backdrop-blur-3xl text-white hover:text-gray-300">
                  Equalizer Settings
                </button>
                <button
                  onClick={() => setShowQueue(!showQueue)}
                  className="text-sm text-gray-400 hover:text-gray-300"
                >
                  Queue List
                </button>
              </div>

              <motion.button
                onClick={() => setIsFullScreen(false)}
                className="absolute top-4 left-4 p-2 rounded-full text-white hover:text-gray-300"
                whileTap={{ scale: 0.9 }}
                aria-label="Exit full screen"
              >
                <ChevronDown className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        ) : (
          // Default Mini Player (Compact)
          <div
            className="flex items-center justify-between w-full max-w-7xl mx-auto px-3 py-2"
            {...swipeHandlers}
          >
            {/* Song Info */}
            <div className="flex items-center space-x-2 w-1/3">
              <Image
                src={song.cover || "/images/placeholder.jpg"}
                alt={`Cover art for ${song.title} by ${song.artist}`}
                width={56}
                height={48}
                className="w-14 h-12 rounded-md object-cover"
                onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                priority
              />
              <div className="min-w-0">
                <h3 className="text-sm font-semibold truncate max-w-[100px] sm:max-w-[130px]">
                  {song.title}
                </h3>
                <p className="text-xs text-gray-400 truncate">{song.artist}</p>
              </div>
              <div className="flex items-center space-x-1">
                <motion.button
                  onClick={() => toggleLike(song.id)}
                  className="p-1 text-white hover:text-gray-300"
                  whileTap={{ scale: 0.9 }}
                  aria-label={song.liked ? "Unlike song" : "Like song"}
                >
                  <motion.div
                    variants={heartVariants}
                    animate={song.liked ? "liked" : "unliked"}
                    initial={song.liked ? "liked" : "unliked"}
                  >
                    <Heart
                      className={`w-4 h-4 fill-current ${song.liked ? "text-red-500" : "text-white"}`}
                      strokeWidth={2}
                    />
                  </motion.div>
                </motion.button>
                <motion.button
                  onClick={() => console.log("Follow artist")}
                  className="p-1 text-white hover:text-gray-300"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Follow artist"
                >
                  <UserPlus className="w-4 h-4 fill-current" />
                </motion.button>
                <motion.button
                  onClick={() => console.log("Go to artist page")}
                  className="p-1 text-white hover:text-gray-300"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Go to artist page"
                >
                  <Link className="w-4 h-4 fill-current" />
                </motion.button>
                <motion.button
                  onClick={() => console.log("Tip artist")}
                  className="p-1 text-white hover:text-gray-300"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Tip artist"
                >
                  <DollarSign className="w-4 h-4 fill-current" />
                </motion.button>
                <motion.button
                  onClick={() => console.log("Add to playlist")}
                  className="p-1 text-white hover:text-gray-300"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Add to playlist"
                >
                  <Plus className="w-4 h-4 fill-current" />
                </motion.button>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex flex-col items-center w-1/3">
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={toggleShuffle}
                  className={`p-1 ${shuffle ? "text-white" : "text-gray-400"} hover:text-gray-300 relative`}
                  whileTap={{ scale: 0.9 }}
                  aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
                >
                  <Shuffle className="w-4 h-4 fill-current" />
                  {shuffle && (
                    <motion.div
                      className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                      variants={dotVariants}
                      initial="hidden"
                      animate="visible"
                      aria-hidden="true"
                    />
                  )}
                </motion.button>
                <motion.button
                  onClick={playPrevious}
                  className="p-1 text-white hover:text-gray-300"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Previous song"
                >
                  <SkipBack className="w-5 h-5 fill-current" strokeWidth={2} />
                </motion.button>
                <motion.button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-full bg-white text-black"
                  whileTap={{ scale: 0.9 }}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" strokeWidth={2} />
                  ) : (
                    <Play className="w-5 h-5 fill-current" strokeWidth={2} />
                  )}
                </motion.button>
                <motion.button
                  onClick={playNext}
                  className="p-1 text-white hover:text-gray-300"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Next song"
                >
                  <SkipForward className="w-5 h-5 fill-current" strokeWidth={2} />
                </motion.button>
                <motion.button
                  onClick={toggleRepeat}
                  className={`p-1 ${repeat !== "none" ? "text-white" : "text-gray-400"} hover:text-gray-300 relative`}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Repeat: ${repeat}`}
                >
                  <Repeat className="w-4 h-4 fill-current" />
                  {repeat === "one" && (
                    <span className="text-[10px] absolute bottom-0 right-0">1</span>
                  )}
                </motion.button>
              </div>
              <div className="w-full flex items-center space-x-1 mt-1">
                <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 rounded-full cursor-pointer progress-bar"
                  aria-label="Seek song position"
                />
                <span className="text-xs text-gray-400">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Additional Controls (Desktop Only) */}
            <div className="hidden sm:flex items-center space-x-2 w-1/3 justify-end">
              <div className="flex items-center space-x-1">
                <motion.button
                  onClick={toggleMute}
                  className="p-1 text-white hover:text-gray-300"
                  whileTap={{ scale: 0.9 }}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5 fill-current" />
                  ) : (
                    <Volume2 className="w-5 h-5 fill-current" />
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
                />
              </div>
              {isDeviceSelectionSupported && audioDevices.length > 1 && (
                <motion.button
                  onClick={() => setShowDevicePanel(true)}
                  className="p-1 text-white hover:text-gray-300"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Open device selection panel"
                >
                  <Speaker className="w-5 h-5 fill-current" />
                </motion.button>
              )}
              <motion.button
                onClick={() => setIsFullScreen(true)}
                className="p-1 text-white hover:text-gray-300"
                whileTap={{ scale: 0.9 }}
                aria-label="Enter full screen"
              >
                <Maximize2 className="w-5 h-5 fill-current" />
              </motion.button>
            </div>
          </div>
        )}

        {/* Queue Panel */}
        {showQueue && (
          <motion.div
            className="absolute bottom-16 left-0 right-0 bg-gray-800 p-4 rounded-t-lg max-h-64 overflow-y-auto"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
          >
            <h4 className="text-lg font-bold mb-2">Queue</h4>
            {queue.length === 0 ? (
              <p className="text-gray-400">No songs in queue.</p>
            ) : (
              <ul>
                {queue.map((qSong, index) => (
                  <li key={qSong.id} className="flex justify-between items-center py-2">
                    <span>
                      {qSong.title} - {qSong.artist}
                    </span>
                    <button
                      onClick={() => removeFromQueue(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}

        {/* Device Selection Panel */}
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
          src={song.filePath}
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