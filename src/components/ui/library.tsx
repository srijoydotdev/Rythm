"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useState } from "react";
import { ChevronLeft, ChevronRight, Library, Plus, Users } from "lucide-react"; // Added Users icon for Following
import Image from "next/image";
import { motion, AnimatePresence } from 'framer-motion';

export default function LibrarySidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const libraryLinks = [
    { name: "Monsoon", href: "/Monsoon", song: "10 songs", cover: "/monsoon.jpg" },
  ];

  const Following = [
    { name: "Aditya", href: "/aditya", cover: "/aditya.jpg" },
  ];

  // Animation variants for the sidebar container
  const sidebarVariants = {
    expanded: { width: 256 }, // w-64 = 256px
    collapsed: { width: 80 },  // w-20 = 80px
  };

  // Animation variants for the content (header, link text, and button text)
  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -15 },
  };

  // Animation variants for the nav container (to stagger children)
  const navVariants = {
    expanded: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
    collapsed: { transition: { staggerChildren: 0.05 } },
  };

  // Animation variants for individual links
  const linkVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -15 },
  };

  return (
    <motion.div
      className="h-screen   bg-[#080808] backdrop-blur-md border-r border-white/10 text-white flex flex-col mt-3 p-4"
      variants={sidebarVariants}
      initial="expanded"
      animate={isExpanded ? "expanded" : "collapsed"}
      transition={{ type: "spring", stiffness: 100, damping: 15, duration: 0.5 }}
    >
      {/* Header with Toggle Button */}
      <div className="flex items-center justify-between mb-6">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="flex items-center gap-2"
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Library className="w-6 h-6" />
              <span className="font-bold text-xl">Your Library</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={toggleExpand} className="text-gray-400 hover:text-white">
          {isExpanded ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
        </button>
      </div>

      {/* Library Links */}
      <motion.nav
        className="flex flex-col gap-2"
        variants={navVariants}
        initial="expanded"
        animate={isExpanded ? "expanded" : "collapsed"}
      >
        {libraryLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.name} href={link.href}>
              <motion.div
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-400'
                }`}
                variants={linkVariants}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Cover Image (always visible) */}
                <div className="relative w-10 h-10 flex-shrink-0">
                  <Image
                    src={link.cover}
                    alt={`${link.name} cover`}
                    fill
                    className="object-cover rounded"
                  />
                </div>

                {/* Link Name and Song Count (only when expanded) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      className="flex flex-col"
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <span className="font-medium">{link.name}</span>
                      <span className="text-sm text-gray-500">{link.song}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </motion.nav>

      {/* Add to Playlist Button */}
      <div className="mt-4">
        <motion.button
          className={`flex items-center justify-center gap-2 w-full py-2 rounded-full font-bold cursor-pointer transition-colors ${
            isExpanded ? 'bg-white text-black px-4' : 'bg-white text-black'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="text"
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                Add to Playlist
              </motion.div>
            ) : (
              <motion.div
                key="icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Plus className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Following Section */}
      <div className="mt-6">
        {/* Following Header */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="flex items-center gap-2 mb-4"
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Users className="w-6 h-6" />
              <span className="font-bold text-xl">Following</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Following List */}
        <motion.div
          className="flex flex-col gap-2"
          variants={navVariants}
          initial="expanded"
          animate={isExpanded ? "expanded" : "collapsed"}
        >
          {Following.map((person) => {
            const isActive = pathname === person.href;
            return (
              <Link key={person.name} href={person.href}>
                <motion.div
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-400'
                  }`}
                  variants={linkVariants}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {/* Profile Image (always visible) */}
                  <div className="relative w-10 h-10 flex-shrink-0 rounded-full overflow-hidden">
                    <Image
                      src={person.cover}
                      alt={`${person.name} profile`}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Person Name (only when expanded) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        className="flex flex-col"
                        variants={contentVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <span className="font-medium">{person.name}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}