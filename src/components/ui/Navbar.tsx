"use client"; // Required for Framer Motion and state in Next.js

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Compass, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import path from 'path';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import SearchBar from '../searchbox';



export default function Navbar() {
  const [search, setSearch] = useState('');
  const pathname = usePathname();
  // Micro animation for the Compass icon
  const compassVariants = {
    hover: { rotate: 360, transition: { duration: 0.5 } },
   
  };
  const isMusicPage = pathname =='/music';
  const isAudioPage = pathname == '/audio';
  const isShowPage = pathname == '/show';

  const [isFocused, setIsFocused] = useState(false);

  const inputVariants = {
    initial: { boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' },
    focused: { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', scale: 1.02 },
  };

  const iconVariants = {
    initial: { scale: 1, opacity: 0.6, x: '0%' },
    focused: { scale: 1.1, opacity: 1, x: '5%' },
  };

  return (
    <div className="bg-[#1D1D1D] mt-2 py-3 px-4 flex justify-between items-center rounded-md max-w-7xl mx-auto backdrop-blur-md">
      {/* Left Section: Home Icon + Buttons */}
      <div className='flex items-center'>
       
      </div>
      <div className="flex items-center mr-auto space-x-4">
      <img src='/logo.svg' className='w-10 h-10'/>
        <img src="/home.svg" alt="Home" className="w-6 h-6" />
        <div className='flex items-center space-x-1'>
          <Link href={'/music'}>
        <button  className={`text-white bg-[#1D1D1D] px-3 py-1 cursor-pointer rounded-full border-1 border-white hover:text-black ${
              isMusicPage ? 'bg-white text-black font-' : 'hover:bg-white t'
            }`}>
          Music
        </button>
        </Link>
        <button className={`text-white bg-[#1D1D1D] px-3 py-1 cursor-pointer rounded-full border-1  hover:text-black border-white ${
              isAudioPage ? 'bg-white text-black font-' : 'hover:bg-white'
            }`}>
          Audio
        </button>
        <button className={`text-white bg-[#1D1D1D] px-3 py-1 cursor-pointer rounded-full border-1  hover:text-black  border-white ${
              isShowPage ? 'bg-white text-black font-' : 'hover:bg-white'
            }`}>
          Show
        </button>
        </div>
      </div>

      {/* Center Section: Search Bar + Compass Icon */}
      <div className="flex items-center mr-auto space-x-2">
      <SearchBar/>
        <motion.div whileHover="hover" variants={compassVariants}>
          <Compass className="w-6 h-6 text-white cursor-pointer" />
        </motion.div>
      </div>

      {/* Right Section: Notifications, Profile Pic, Subscription Button */}
      <div className="flex items-center space-x-3">
        <Bell className="w-6 h-6 text-white cursor-pointer " />
        <img
          src="/profile-pic.jpg" // Replace with actual profile pic path
          alt="Profile"
          className="w-8 h-8 rounded-full bg-gray-800"
        />
        <button className="text-black uppercase text-sm font-semibold underline undeline-black  bg-white px-4 py-2 rounded-full cursor-pointer">
          Subscription
        </button>
      </div>
    </div>
  );
}