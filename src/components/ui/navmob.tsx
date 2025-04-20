"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Search, Library, Settings } from "lucide-react";
import { FC, useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: <Home className="h-5 w-5 text-gray-400" /> },
  { label: "Search", href: "/search", icon: <Search className="h-5 w-5 text-gray-400" /> },
  { label: "Library", href: "/library", icon: <Library className="h-5 w-5 text-gray-400" /> },
  { label: "Setting", href: "/settings", icon: <Settings className="h-5 w-5 text-gray-400" /> },
];

const topNavItems = ["Music", "Audioshow", "Shows"];

const BottomNav: FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTopNavItem, setActiveTopNavItem] = useState("Music");

  return (
    <div className="fixed bottom-0 left-0 z-20 right-0 md:hidden">
      {/* Top Navigation */}
      <div className="bg-[#1E1E1E]/80 z-0 backdrop-blur-2xl mb-3 ml-4 mr-4 px-2 py-1 rounded-full flex items-center justify-center overflow-x-auto whitespace-nowrap scroll-smooth">
        <div className="flex items-center space-x-3 px-1">
          {topNavItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveTopNavItem(item)}
              className={`rounded-full px-3 py-2 text-sm transition-colors duration-200 ease-in-out focus:outline-none ${
                activeTopNavItem === item
                  ? "bg-white text-black font-medium shadow-md"
                  : "text-white hover:bg-gray-800"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-gradient-to-b from-black/10 to-black  flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={`flex flex-col items-center justify-center transition-colors duration-200 ease-in-out focus:outline-none ${
              pathname === item.href ? "text-yellow-500" : "text-gray-400 hover:text-white"
            }`}
            aria-label={item.label}
          >
            {item.icon}
            <span className="text-xs mt-1 text-gray-300">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default BottomNav;