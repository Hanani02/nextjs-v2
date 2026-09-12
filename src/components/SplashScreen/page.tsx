"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuCode } from "react-icons/lu";

type SplashScreenProps = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 2500); // Durasi splash screen (2.5 detik)

    return () => clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence onExitComplete={onFinish}>
      {isMounted && isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white"
        >
          {/* Logo Animasi */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-500 to-blue-800 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/30">
              <LuCode />
            </div>
            <span className="text-2xl font-bold tracking-tight">Kanagara Studio</span>
          </motion.div>

          {/* Progress Line Subtle */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="h-[2px] bg-primary/80 mt-6 rounded-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}