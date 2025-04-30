"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Shirt, Star, Ticket, MessageCircle, Heart } from "lucide-react";
import toast from "react-hot-toast";

interface Artist {
  id: string;
  name: string;
  bio: string;
  banner: string;
}

export default function ContributePage({ params }: { params: { artistId: string } }) {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [donationAmount, setDonationAmount] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Mock artist data (replace with Supabase fetch in production)
  useEffect(() => {
    // Simulate fetching artist data based on artistId
    const fetchArtist = async () => {
      try {
        // Replace with Supabase query, e.g.:
        // const { data, error } = await supabase.from("artists").select("*").eq("id", params.artistId).single();
        const mockArtist: Artist = {
          id: params.artistId,
          name: "Test Artist",
          bio: "An underrated artist creating soulful music. Support their journey!",
          banner: "/images/artist-banner.jpg",
        };
        setArtist(mockArtist);
      } catch (err) {
        console.error("Error fetching artist:", err);
        toast.error("Failed to load artist data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtist();
  }, [params.artistId]);

  const handleDonation = () => {
    toast.success(`Thank you for donating $${donationAmount}!`);
    // Implement payment processing (e.g., Stripe) in production
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="loading-spinner border-4 border-t-white border-gray-700 rounded-full w-8 h-8 animate-spin"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white">
        <p>Artist not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <style jsx>{`
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .glassmorphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Header */}
      <div className="relative h-64 md:h-80">
        <Image
          src={artist.banner}
          alt={`${artist.name} banner`}
          fill
          className="object-cover"
          priority
          onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-between p-4">
          <Link href="/song" className="p-2 glassmorphism rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold">{artist.name}</h1>
          <div></div>
        </div>
      </div>

      {/* Bio */}
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <p className="text-gray-300 text-base md:text-lg mb-6">{artist.bio}</p>

        {/* Contribution Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Donation */}
          <motion.div
            className="p-4 glassmorphism rounded-lg shadow-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <CreditCard className="w-8 h-8 mb-2" />
            <h3 className="text-xl font-semibold mb-2">One-Time Donation</h3>
            <p className="text-gray-300 mb-4">Support with a donation.</p>
            <input
              type="number"
              min="1"
              value={donationAmount}
              onChange={(e) => setDonationAmount(Number(e.target.value))}
              className="w-full p-2 mb-4 bg-black/50 border border-white/20 rounded text-white"
              aria-label="Donation amount"
            />
            <motion.button
              onClick={handleDonation}
              className="w-full p-2 bg-white text-black rounded font-medium"
              whileTap={{ scale: 0.95 }}
            >
              Donate ${donationAmount}
            </motion.button>
          </motion.div>

          {/* Merch */}
          <motion.div
            className="p-4 glassmorphism rounded-lg shadow-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Shirt className="w-8 h-8 mb-2" />
            <h3 className="text-xl font-semibold mb-2">Buy Merch</h3>
            <p className="text-gray-300 mb-4">Get exclusive merch.</p>
            <Link href="/shop" passHref>
              <motion.button
                className="w-full p-2 bg-white text-black rounded font-medium"
                whileTap={{ scale: 0.95 }}
              >
                Shop Now
              </motion.button>
            </Link>
          </motion.div>

          {/* Crowdfunding */}
          <motion.div
            className="p-4 glassmorphism rounded-lg shadow-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Star className="w-8 h-8 mb-2" />
            <h3 className="text-xl font-semibold mb-2">Crowdfunding</h3>
            <p className="text-gray-300 mb-4">Back their next project.</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div className="bg-white h-2 rounded-full" style={{ width: "60%" }}></div>
            </div>
            <p className="text-sm text-gray-400">$6,000 of $10,000 raised</p>
          </motion.div>

          {/* Fan Subscription */}
          <motion.div
            className="p-4 glassmorphism rounded-lg shadow-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Heart className="w-8 h-8 mb-2" />
            <h3 className="text-xl font-semibold mb-2">Fan Subscription</h3>
            <p className="text-gray-300 mb-4">Get exclusive content.</p>
            <motion.button
              onClick={() => toast.success("Subscribed!")}
              className="w-full p-2 bg-white text-black rounded font-medium"
              whileTap={{ scale: 0.95 }}
            >
              Subscribe
            </motion.button>
          </motion.div>

          {/* Virtual Event */}
          <motion.div
            className="p-4 glassmorphism rounded-lg shadow-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Ticket className="w-8 h-8 mb-2" />
            <h3 className="text-xl font-semibold mb-2">Virtual Event</h3>
            <p className="text-gray-300 mb-4">Join a live stream.</p>
            <motion.button
              onClick={() => toast.success("Ticket purchased!")}
              className="w-full p-2 bg-white text-black rounded font-medium"
              whileTap={{ scale: 0.95 }}
            >
              Buy Ticket
            </motion.button>
          </motion.div>

          {/* Social Shoutout */}
          <motion.div
            className="p-4 glassmorphism rounded-lg shadow-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <MessageCircle className="w-8 h-8 mb-2" />
            <h3 className="text-xl font-semibold mb-2">Social Shoutout</h3>
            <p className="text-gray-300 mb-4">Get a shoutout on X.</p>
            <motion.button
              onClick={() => toast.success("Shoutout requested!")}
              className="w-full p-2 bg-white text-black rounded font-medium"
              whileTap={{ scale: 0.95 }}
            >
              Request Shoutout
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}