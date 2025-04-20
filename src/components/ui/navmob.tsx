"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Search, Library, Star } from "lucide-react";
import { FC } from "react";

// Define navigation item type
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// Navigation items array
const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: <Home className="h-6 w-6" /> },
  { label: "Search", href: "/search", icon: <Search className="h-6 w-6" /> },
  { label: "Library", href: "/library", icon: <Library className="h-6 w-6" /> },
  { label: "Subscription", href: "/premium", icon: <Star className="h-6 w-6" /> },
];

const BottomNav: FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#282828] flex justify-around items-center h-16 md:hidden">
      {navItems.map((item) => (
        <button
          key={item.href}
          onClick={() => router.push(item.href)}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            pathname === item.href ? "text-green-500" : "text-gray-400 hover:text-white"
          }`}
          aria-label={item.label}
        >
          {item.icon}
          <span className="text-xs mt-1">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;