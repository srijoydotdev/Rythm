"use client";

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [search, setSearch] = useState('');

  // Micro animation for the search bar
  const searchBarVariants: Variants = {
    initial: { scale: 1, boxShadow: '0 0 8px rgba(255, 255, 255, 0.1)' },
    focus: {
      scale: 1.03,
      boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
      transition: { duration: 0.3 },
    },
  };

 
  const searchIconVariants: Variants = {
    initial: { scale: 1 },
    focus: {
      scale: 1.2,
      transition: { duration: 0.5, repeat: Infinity, repeatType: 'reverse' },
    },
  };

  return (
    <motion.div
      className="relative rounded-full"
      
      initial="initial"
      whileFocus="focus"
      whileHover="focus"
    >
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search for music..."
        className="bg-black/30 text-white placeholder-gray-500 rounded-full pl-12 pr-4 py-2 w-100 focus:outline-none  focus:border-gradient-to-r focus:border-2 shadow-sm transition-all duration-300"
        aria-label="Search for music"
      />
      <motion.div
        className="absolute left-4 top-1/2 transform -translate-y-1/2"
        variants={searchIconVariants}
        initial="initial"
        animate={search ? 'focus' : 'initial'}
      >
        <Search className="w-5 h-5 text-gray-300" />
      </motion.div>
    </motion.div>
  );
}