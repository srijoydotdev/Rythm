"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface PlaylistModalProps {
  onClose: () => void;
  onCreate: (playlist: { name: string; description: string; isPublic: boolean }) => void;
}

export default function PlaylistModal({ onClose, onCreate }: PlaylistModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Playlist name is required.");
      return;
    }
    try {
      await onCreate({ name, description, isPublic });
      onClose();
    } catch (error) {
      toast.error("Failed to create playlist.");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[#1A1A1A] rounded-lg p-6 w-full max-w-md text-white"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Playlist</h2>
          <motion.button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full"
            whileTap={{ scale: 0.9 }}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-black border border-white/20 rounded text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 bg-black border border-white/20 rounded text-white"
              rows={4}
            />
          </div>
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isPublic" className="text-sm font-medium">
              Public Playlist
            </label>
          </div>
          <motion.button
            type="submit"
            className="w-full bg-yellow-500 text-black py-2 rounded hover:bg-yellow-400"
            whileTap={{ scale: 0.95 }}
          >
            Create
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}