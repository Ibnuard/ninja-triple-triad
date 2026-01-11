"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import { User as UserIcon } from "lucide-react";

export function UserProfile() {
  const { user } = useAuthStore();
  const [imgError, setImgError] = useState(false);

  if (!user) return null;

  const avatarUrl = user.user_metadata?.avatar_url;
  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || "Ninja";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-6 left-6 z-50 flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10 p-1 pr-4"
    >
      <div className="relative">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)] bg-black/40 flex items-center justify-center">
          {avatarUrl && !imgError ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <UserIcon className="w-4 h-4 text-white/40" />
          )}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
      </div>
      
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-1">
          Authenticated
        </span>
        <span className="text-xs font-black text-white uppercase italic tracking-wider leading-none">
          {fullName}
        </span>
      </div>
    </motion.div>
  );
}
