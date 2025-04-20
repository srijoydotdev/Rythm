"use client";
import Image from "next/image";
import Navbar from "@/components/ui/Navbar";
import { useState, useEffect } from "react";
import { motion, useTransform, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
export default function Home() {
  const [rotationLeft, setRotationLeft] = useState(0);
  const [rotationRight, setRotationRight] = useState(0);
  const [blurCenter, setBlurCenter] = useState(0);
  const [opacityCenterText, setOpacityCenterText] = useState(1);
  const [scaleCenterText, setScaleCenterText] = useState(1);

  const { scrollYProgress } = useScroll();

  const rotateLeft = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0, -15, 15, 0]
  );
  const rotateRight = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0, 15, -15, 0]
  );
  const blur = useTransform(scrollYProgress, [0, 0.5, 1], [0, 10, 0]);
  const opacityText = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 0.6, 0.6, 1]);
  const scaleText = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 0.9, 0.9, 1]);

  const springRotationLeft = useSpring(rotateLeft, { stiffness: 50, damping: 10 });
  const springRotationRight = useSpring(rotateRight, { stiffness: 50, damping: 10 });
  const springBlurCenter = useSpring(blur, { stiffness: 30, damping: 8 });
  const springOpacityCenterText = useSpring(opacityText, { stiffness: 40, damping: 10 });
  const springScaleCenterText = useSpring(scaleText, { stiffness: 40, damping: 10 });

  useEffect(() => {
    springRotationLeft.onChange((v) => setRotationLeft(v));
    springRotationRight.onChange((v) => setRotationRight(v));
    springBlurCenter.onChange((v) => setBlurCenter(v));
    springOpacityCenterText.onChange((v) => setOpacityCenterText(v));
    springScaleCenterText.onChange((v) => setScaleCenterText(v));
  }, [springRotationLeft, springRotationRight, springBlurCenter, springOpacityCenterText, springScaleCenterText]);

  return (
    <div className="bg-black min-h-screen text-white overflow-hidden ">
      <Navbar/>
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row pt-12 w-full mx-auto items-center justify-center relative">
        {/* Left Image */}
        <motion.div
          className="h-[500px] w-[30%] md:w-[30%] relative overflow-hidden"
          style={{ rotate: rotationLeft }}
        >
          <Image
            src="/main1.jpg"
            alt="Chaos of Life 1"
            fill
            className="object-cover opacity-70 transition-all duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
        </motion.div>

        {/* Center Abstract Text Section */}
        <motion.div
  className="relative w-[40%] md:w-[40%] h-[500px] flex flex-col items-center justify-center text-center"
  style={{
    filter: `blur(${blurCenter}px)`, 
    opacity: opacityCenterText,
    scale: scaleCenterText,
  }}
>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight uppercase text-red-500 leading-snug drop-shadow-md">
            when life is static
            <br />
            turn the rhythm up
          </h1>

          <p className="text-sm md:text-base tracking-widest text-white/60 mt-4 italic">
            sound waves. soul saves.
          </p>

          <div className="text-5xl mt-6 text-white/40 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l6-6m0 0l-6 6m7 11a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </motion.div>

        {/* Right Image */}
        <motion.div
          className="h-[500px] w-[30%] md:w-[30%] relative overflow-hidden"
          style={{ rotate: rotationRight }}
        >
          <Image
            src="/main2.jpg"
            alt="Chaos of Life 2"
            fill
            className="object-cover opacity-70 transition-all duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/80 to-transparent"></div>
        </motion.div>
      </div>

      
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-gradient-to-br from-red-500 to-pink-500 rounded-full blur-xl opacity-30 animate-pulse duration-1500"></div>
      <div className="absolute bottom-1/4 right-10 w-48 h-48 bg-gradient-to-tl from-blue-500 to-purple-500 rounded-full blur-2xl opacity-40 animate-pulse delay-500 duration-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-yellow-500 rounded-full blur-xl opacity-20 animate-ping duration-1000"></div>
      <div className="flex flex-col items-center">
      <Link href="/song" className="py-4">
  <motion.button
    onClick={() => console.log("Navigating to /pages/music")}
    className="px-6 py-3 rounded-full font-extrabold uppercase tracking-wider text-red-600 bg-white shadow-md transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400 hover:bg-red-700 hover:text-white hover:shadow-lg"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-6 h-6 inline-block mr-2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0-10V5a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2zm10 18v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0-10V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2z"
      />
    </svg>
    TUNE IN
  </motion.button>
</Link>

      </div>
    </div>
  );
}