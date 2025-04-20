// src/components/ui/player.tsx
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
  Maximize2,
  ChevronDown,
  Speaker,
  X,
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
      className="fixed top-0 right-0 h-full w-80 md:w-96 bg-gray-900 text-white p-6 z-40 shadow-lg overflow-y-auto sm:w-full"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex justify-between items-center mb-6">
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
                selectedDevice === device.deviceId ? "bg-gray-800" : "hover:bg-gray-800"
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
                className="w-4 h-4 text-white bg-gray-600 border-gray-600 focus:ring-white"
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
  const arrowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } },
  };

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
      rotate: [0, 10, -10, 0],
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    unliked: { scale: 1, rotate: 0 },
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

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-[#0E0E0E] text-white z-50 transition-all ${
        isFullScreen ? "top-0 h-screen flex flex-col" : "p-4 shadow-lg"
      }`}
    >
      {isFullScreen ? (
        // Fullscreen Player for Desktop and Mobile
        <div
          className="relative flex flex-col h-full p-4 md:p-8 lg:p-12"
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

          {/* Content on top of blurred background */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Top Section: Tabs */}
            <div className="flex justify-center space-x-4 mb-6 md:mb-8 lg:mb-10">
              {["Highlight", "Lyrics", "Video"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm md:text-base lg:text-lg font-medium uppercase ${
                    activeTab === tab ? "text-yellow-500" : "text-gray-400"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Album Cover */}
            <div className="flex-1 flex items-center justify-center">
              <Image
                src={song.cover || "/images/placeholder.jpg"}
                alt={`Cover art for ${song.title} by ${song.artist}`}
                width={300}
                height={300}
                className="w-3/4 md:w-1/2 lg:w-1/3 h-auto rounded-lg object-cover"
                onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                priority
              />
            </div>

            {/* Song Info */}
            <div className="text-center mb-4 md:mb-6 lg:mb-8">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold truncate">
                {song.title}
              </h3>
              <p className="text-sm md:text-lg lg:text-xl text-gray-400 truncate">
                {song.artist}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full flex items-center space-x-2 mb-4 md:mb-6 lg:mb-8">
              <span className="text-xs md:text-sm lg:text-base text-gray-400">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 md:h-2 lg:h-3 rounded-full cursor-pointer appearance-none bg-gray-600"
                style={{
                  background: `linear-gradient(to right, white ${(
                    (currentTime / duration) *
                    100
                  )}%, gray 0%)`,
                }}
                aria-label="Seek song position"
              />
              <span className="text-xs md:text-sm lg:text-base text-gray-400">
                -{formatTime(duration - currentTime)}
              </span>
            </div>

            {/* Playback Controls */}
            <div className="flex justify-center items-center space-x-6 md:space-x-8 lg:space-x-10 mb-4 md:mb-6 lg:mb-8">
              <motion.button
                onClick={toggleShuffle}
                className={`p-2 md:p-3 lg:p-4 rounded-full ${shuffle ? "text-white" : "text-gray-400"}`}
                whileTap={{ scale: 0.9 }}
                aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
              >
                <Shuffle className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />
              </motion.button>
              <motion.button
                onClick={playPrevious}
                className="p-2 md:p-3 lg:p-4 rounded-full text-white"
                whileTap={{ scale: 0.9 }}
                aria-label="Previous song"
              >
                <SkipBack className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" strokeWidth={2} />
              </motion.button>
              <motion.button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-4 md:p-5 lg:p-6 rounded-full bg-white text-black"
                whileTap={{ scale: 0.9 }}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" strokeWidth={2} />
                ) : (
                  <Play className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" strokeWidth={2} />
                )}
              </motion.button>
              <motion.button
                onClick={playNext}
                className="p-2 md:p-3 lg:p-4 rounded-full text-white"
                whileTap={{ scale: 0.9 }}
                aria-label="Next song"
              >
                <SkipForward className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" strokeWidth={2} />
              </motion.button>
              <motion.button
                onClick={toggleRepeat}
                className={`p-2 md:p-3 lg:p-4 rounded-full ${repeat !== "none" ? "text-white" : "text-gray-400"}`}
                whileTap={{ scale: 0.9 }}
                aria-label={`Repeat: ${repeat}`}
              >
                <Repeat className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />
              </motion.button>
            </div>

            {/* Bottom Section: Equalizer and Queue */}
            <div className="flex justify-between items-center">
              <button className="text-sm bg-black/50 p-2 rounded-full backdrop-blur-3xl md:text-lg lg:text-xl text-white hover:text-white">
                Equalizer Settings
              </button>
              <button
                onClick={() => setShowQueue(!showQueue)}
                className="text-sm md:text-lg lg:text-xl text-gray-400 hover:text-white"
              >
                Queue List
              </button>
            </div>

            {/* Exit Fullscreen Button */}
            <motion.button
              onClick={() => setIsFullScreen(false)}
              className="absolute top-4 left-4 p-2 md:p-3 lg:p-4 rounded-full text-white"
              whileTap={{ scale: 0.9 }}
              aria-label="Exit full screen"
            >
              <ChevronDown className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />
            </motion.button>
          </div>
        </div>
      ) : (
        // Default Mini Player
        <div
          className="flex items-center justify-between max-w-7xl mx-auto flex-col md:flex-row gap-4 p-4"
          {...swipeHandlers}
        >
          {/* Song Info */}
          <div className="flex items-center space-x-4 w-full md:w-1/3">
            <motion.div
              className="relative group"
              animate={isPlaying ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={{ repeat: isPlaying ? Infinity : 0, duration: 2, ease: "easeInOut" }}
            >
              <motion.div
                className="absolute inset-0 border-2 border-white/80 rounded-md -z-10 translate-x-1 translate-y-1"
                initial={{ scale: 0.95, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                aria-hidden="true"
              />
              <Image
                src={song.cover || "/images/placeholder.jpg"}
                alt={`Cover art for ${song.title} by ${song.artist}`}
                width={84}
                height={84}
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-md object-cover"
                onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                priority
              />
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 bg-black/80 rounded-full p-1.5 opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100"
                variants={arrowVariants}
                initial="hidden"
                animate="hidden"
                whileHover="visible"
                aria-hidden="true"
              >
                <ChevronDown className="w-5 h-5 text-white sm:w-6 sm:h-6" />
              </motion.div>
            </motion.div>
            <div>
              <h3 className="text-sm font-semibold truncate max-w-[200px]">{song.title}</h3>
              <p className="text-xs text-gray-400 truncate">{song.artist}</p>
            </div>
            <motion.button
              onClick={() => toggleLike(song.id)}
              className="p-2 rounded-full hover:bg-gray-800"
              whileTap={{ scale: 1.2 }}
              whileHover={{ scale: 1.1 }}
              aria-label={song.liked ? "Unlike song" : "Like song"}
            >
              <motion.div
                variants={heartVariants}
                animate={song.liked ? "liked" : "unliked"}
                initial={song.liked ? "liked" : "unliked"}
              >
                <Heart
                  className={`w-5 h-5 ${song.liked ? "fill-red-500 text-red-500" : "text-white"}`}
                  strokeWidth={2}
                />
              </motion.div>
            </motion.button>
          </div>

          {/* Playback Controls */}
          <div className="flex flex-col items-center w-full md:w-1/3">
            <div className="flex items-center space-x-4 mb-2">
              <motion.button
                onClick={toggleShuffle}
                className={`p-2 rounded-full text-gray-400 hover:text-white ${
                  shuffle ? "text-rose-500" : ""
                } relative`}
                whileTap={{ scale: 0.9 }}
                aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
              >
                <motion.div
                  animate={
                    shuffle
                      ? {
                          scale: [1, 1.2, 1],
                          rotate: [0, 15, -15, 0],
                        }
                      : { scale: 1, rotate: 0 }
                  }
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                    repeat: shuffle ? 1 : 0,
                  }}
                >
                  <Shuffle className="w-5 h-5" />
                </motion.div>
                {shuffle && (
                  <motion.div
                    className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full"
                    variants={dotVariants}
                    initial="hidden"
                    animate="visible"
                    aria-hidden="true"
                  />
                )}
              </motion.button>
              <motion.button
                onClick={playPrevious}
                className="p-2.5 rounded-full text-white hover:bg-gray-800"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Previous song"
              >
                <SkipBack className="w-5 h-5" strokeWidth={2} />
              </motion.button>
              <motion.button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3.5 rounded-full bg-white text-black hover:bg-gray-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" strokeWidth={2} />
                ) : (
                  <Play className="w-6 h-6" strokeWidth={2} />
                )}
              </motion.button>
              <motion.button
                onClick={playNext}
                className="p-2.5 rounded-full text-white hover:bg-gray-800"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Next song"
              >
                <SkipForward className="w-5 h-5" strokeWidth={2} />
              </motion.button>
              <motion.button
                onClick={toggleRepeat}
                className={`p-2 rounded-full ${
                  repeat !== "none" ? "text-purple-500" : "text-white"
                } hover:bg-gray-800`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Repeat: ${repeat}`}
              >
                <Repeat className={`w-5 h-5 ${repeat === "one" ? "text-purple-500" : ""}`} />
                {repeat === "one" && <span className="text-xs absolute">1</span>}
              </motion.button>
            </div>
            <div className="w-full flex items-center space-x-2">
              <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 rounded-full cursor-pointer appearance-none progress-bar"
                aria-label="Seek song position"
              />
              <span className="text-xs text-gray-400">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Additional Controls */}
          <div className="flex items-center space-x-4 w-full md:w-1/3 justify-end">
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-gray-800"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </motion.button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 rounded-full cursor-pointer appearance-none progress-bar"
              />
            </div>
            {isDeviceSelectionSupported && audioDevices.length > 1 && (
              <motion.button
                onClick={() => setShowDevicePanel(true)}
                className="p-2 rounded-full hover:bg-gray-800"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Open device selection panel"
              >
                <Speaker className="w-5 h-5 text-gray-400" />
              </motion.button>
            )}
            <motion.button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-full hover:bg-gray-800"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
            >
              <Maximize2 className="w-5 h-5" />
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
  );
}