"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  message: string;
}

export function LoadingOverlay({ message }: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm"
    >
      <div className="relative flex flex-col items-center">
        {/* Ninja-themed loading ring */}
        <div className="relative w-24 h-24 lg:w-32 lg:h-32">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-0 border-4 border-t-red-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="absolute inset-4 border-4 border-t-transparent border-r-yellow-500 border-b-transparent border-l-green-500 rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src="/images/logo.webp" 
              alt="Logo" 
              className="w-12 h-12 lg:w-16 lg:h-16 object-contain animate-pulse"
              onError={(e) => {
                // Fallback if logo doesn't exist
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <h3 className="text-xl lg:text-2xl font-luckiest tracking-widest text-white uppercase italic">
            {message}
          </h3>
          <div className="mt-4 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                className="w-2 h-2 rounded-full bg-red-500"
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.2)_0%,transparent_70%)]" />
      </div>
    </motion.div>
  );
}
