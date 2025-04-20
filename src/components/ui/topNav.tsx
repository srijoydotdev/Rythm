// src/components/ui/topNav.tsx
"use client";

import Image from 'next/image';
import { Bell } from 'lucide-react';
import profilePic from '../../../public/profile-pic.jpg'; // Replace with the actual path to Frank's profile picture
import { FC } from 'react';

const TopNav: FC = () => {
  return (
    <div className="bg-[#080808]">
      {/* Sticky Right Section (Bell Icon and Profile Picture) */}
      <div className="fixed top-0 left-0 right-0 z-20 flex justify-end items-center px-4 md:px-6 lg:px-8 h-16">
        <div className="flex items-center space-x-4">
          {/* Notification Icon */}
          <button className="bg-gray-800 rounded-full p-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
            <Bell className="h-6 w-6" />
          </button>

          {/* Profile Picture */}
          <div className="relative rounded-full overflow-hidden h-10 w-10 md:h-12 md:w-12">
            <Image src={profilePic} alt="Frank's Profile" layout="fill" objectFit="cover" />
          </div>
        </div>
      </div>

      {/* Non-Sticky Left Section (Greeting) */}
      <div className="h-16 flex items-center px-4 md:px-6 lg:px-8">
        <div className="flex flex-col justify-center">
          <h1 className="text-white/40 font-semibold text-lg md:text-xl">
            Welcome, <span className="text-white font-bold text-lg">Srijoy</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base">Cut the distractions.</p>
        </div>
      </div>
    </div>
  );
};

export default TopNav;