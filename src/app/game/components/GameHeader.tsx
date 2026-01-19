import { motion } from "framer-motion"; // v10.16.4
import { Info, LogOut, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { IMAGE_PATHS } from "@/constants/assets";
import { BoardMechanicState } from "@/types/game";

interface GameHeaderProps {
  t: any;
  isOnline: boolean;
  isGauntletMode: boolean;
  isBossBattle: boolean;
  isCustomMode: boolean;
  phase: string;
  isMyTurn: boolean;
  player1: any; // User's perspective player
  player2: any; // Opponent's perspective player
  isPOVPlayer2: boolean;
  mechanic: BoardMechanicState;
  showInfoButton?: boolean;
  onShowInfo: () => void;
  onShowSettings: () => void;
  onShowExitConfirm: () => void;
  onShowMechanicModal: () => void;
}

export function GameHeader({
  t,
  isOnline,
  isGauntletMode,
  isBossBattle,
  isCustomMode,
  phase,
  isMyTurn,
  player1,
  player2,
  isPOVPlayer2,
  mechanic,
  onShowInfo,
  onShowSettings,
  onShowExitConfirm,
  onShowMechanicModal,
}: GameHeaderProps) {
  // Helper: Format name to first name only
  const formatName = (fullName: string | null) => {
    if (!fullName) return "";
    return fullName.split(" ")[0];
  };

  return (
    <div className="absolute top-1 lg:top-4 left-0 right-0 z-[60] px-2 lg:px-6 pointer-events-none">
      <div className="flex items-center w-full max-w-[1600px] mx-auto h-12 lg:h-16">
        {/* [LEFT COLUMN] Badges & Single Player Info */}
        <div className="flex-1 flex items-center justify-start gap-1.5 lg:gap-3 pointer-events-auto min-w-0">
          {isOnline && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-2 py-1.5 lg:px-5 lg:py-2.5 bg-black/80 border border-white/10 rounded-2xl shadow-xl flex items-center gap-2 lg:gap-3 backdrop-blur-md flex-shrink-0"
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-white/20 overflow-hidden bg-gray-800 flex-shrink-0">
                {(isPOVPlayer2 ? player1.avatar_url : player2.avatar_url) ? (
                  <img
                    src={isPOVPlayer2 ? player1.avatar_url : player2.avatar_url}
                    alt="Opponent"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-500/20 to-black flex items-center justify-center">
                    <span className="text-red-500 text-[10px] font-bold">
                      ?
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col hidden lg:flex">
                <span className="text-[8px] lg:text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">
                  {t.opponent}
                </span>
                <span className="text-sm lg:text-lg font-black text-white tracking-tight leading-none uppercase italic">
                  {formatName(isPOVPlayer2 ? player1.name : player2.name)}
                </span>
              </div>
            </motion.div>
          )}

          {isGauntletMode && isBossBattle && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-2 py-1.5 lg:px-5 lg:py-2.5 bg-red-950/40 border border-red-500/30 rounded-2xl shadow-xl flex items-center gap-2 lg:gap-3 backdrop-blur-md flex-shrink-0"
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-red-500/30 overflow-hidden bg-red-950/50 flex-shrink-0 animate-pulse">
                {player2.avatar_url ? (
                  <img
                    src={player2.avatar_url}
                    alt="Boss"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-red-900/40 flex items-center justify-center">
                    <span className="text-red-500 text-[10px] font-bold">
                      ☠️
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col hidden lg:flex">
                <span className="text-[8px] lg:text-[10px] font-black text-red-500/60 uppercase tracking-widest leading-none mb-1 text-shadow-sm">
                  BOSS CHALLENGE
                </span>
                <span className="text-sm lg:text-lg font-black text-red-200 tracking-tight leading-none uppercase italic text-shadow-sm">
                  {formatName(player2.name)}
                </span>
              </div>
            </motion.div>
          )}

          {/* Single Player: Info & Rank/Effect Chips */}
          {!isOnline && (
            <div className="flex items-center gap-1.5 lg:gap-2">
              {mechanic.type !== "none" && (
                <button
                  onClick={onShowMechanicModal}
                  className="h-8 lg:h-11 flex items-center gap-2 px-2.5 lg:px-5 rounded-xl bg-black/60 border border-white/10 text-white shadow-xl hover:bg-black hover:border-white/20 transition-all backdrop-blur-md active:scale-95 group"
                >
                  <div className="flex items-center justify-center transition-transform group-hover:scale-110">
                    {mechanic.type === "random_elemental" && (
                      <div
                        className={cn(
                          "w-4 h-4 lg:w-6 lg:h-6 rounded-full flex items-center justify-center",
                          mechanic.activeElement === "fire" && "bg-red-500/20",
                          mechanic.activeElement === "water" &&
                            "bg-blue-500/20",
                          mechanic.activeElement === "earth" &&
                            "bg-amber-800/20",
                          mechanic.activeElement === "wind" &&
                            "bg-emerald-500/20",
                          mechanic.activeElement === "lightning" &&
                            "bg-yellow-400/20"
                        )}
                      >
                        <img
                          src={
                            IMAGE_PATHS.ELEMENTS[
                              (
                                (mechanic.activeElement as string) || "FIRE"
                              ).toUpperCase() as keyof typeof IMAGE_PATHS.ELEMENTS
                            ]
                          }
                          alt={mechanic.activeElement || "element"}
                          className="w-[70%] h-[70%] object-contain"
                        />
                      </div>
                    )}
                    {mechanic.type === "poison" && (
                      <span className="text-sm lg:text-base">☠️</span>
                    )}
                    {mechanic.type === "foggy" && (
                      <span className="text-sm lg:text-base">🌫️</span>
                    )}
                    {mechanic.type === "joker" && (
                      <span className="text-sm lg:text-base">🎲</span>
                    )}
                  </div>
                  <span className="hidden sm:inline text-[8px] lg:text-xs font-black tracking-widest uppercase italic opacity-80">
                    {mechanic.type.split("_").join(" ")}
                  </span>
                </button>
              )}
              <button
                onClick={onShowInfo}
                className="h-8 lg:h-11 w-8 lg:w-11 flex items-center justify-center rounded-xl border border-white/10 bg-black/60 text-white/60 hover:text-white hover:border-white/20 transition-all backdrop-blur-md active:scale-95 group"
                title={t.passiveInfo}
              >
                <Info className="w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover:rotate-12" />
              </button>
            </div>
          )}
        </div>

        {/* [CENTER COLUMN] Turn Status & Online Info */}
        <div className="flex-shrink-0 flex items-center justify-center gap-1.5 lg:gap-3 pointer-events-auto px-1 sm:px-4">
          {isOnline && mechanic.type !== "none" && (
            <button
              onClick={onShowMechanicModal}
              className="h-8 lg:h-12 flex items-center gap-2 px-2.5 lg:px-5 rounded-full bg-black/80 border border-white/10 text-white shadow-xl hover:bg-black hover:border-white/20 transition-all backdrop-blur-md active:scale-95 group"
            >
              <div className="flex items-center justify-center transition-transform group-hover:scale-110">
                {mechanic.type === "random_elemental" && (
                  <div
                    className={cn(
                      "w-5 h-5 lg:w-7 lg:h-7 rounded-full flex items-center justify-center",
                      mechanic.activeElement === "fire" && "bg-red-500/20",
                      mechanic.activeElement === "water" && "bg-blue-500/20",
                      mechanic.activeElement === "earth" && "bg-amber-800/20",
                      mechanic.activeElement === "wind" && "bg-emerald-500/20",
                      mechanic.activeElement === "lightning" &&
                        "bg-yellow-400/20"
                    )}
                  >
                    <img
                      src={
                        IMAGE_PATHS.ELEMENTS[
                          (
                            (mechanic.activeElement as string) || "FIRE"
                          ).toUpperCase() as keyof typeof IMAGE_PATHS.ELEMENTS
                        ]
                      }
                      alt={mechanic.activeElement || "element"}
                      className="w-[65%] h-[65%] object-contain"
                    />
                  </div>
                )}
                {mechanic.type === "poison" && (
                  <span className="text-sm lg:text-lg">☠️</span>
                )}
                {mechanic.type === "foggy" && (
                  <span className="text-sm lg:text-lg">🌫️</span>
                )}
                {mechanic.type === "joker" && (
                  <span className="text-sm lg:text-lg">🎲</span>
                )}
              </div>
              <span className="hidden lg:inline text-xs lg:text-sm font-black tracking-widest uppercase italic opacity-80">
                {mechanic.type.split("_").join(" ")}
              </span>
            </button>
          )}

          {phase !== "game_over" && (
            <div
              className={cn(
                "h-8 lg:h-12 px-4 lg:px-8 rounded-full border bg-black/80 font-black flex items-center justify-center shadow-xl transition-all duration-500 whitespace-nowrap",
                isMyTurn
                  ? "border-blue-500/50 text-blue-400 ring-1 ring-blue-500/20 shadow-blue-900/40"
                  : "border-red-500/50 text-red-500 shadow-red-900/40"
              )}
            >
              <motion.span
                animate={isMyTurn ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-[10px] lg:text-lg tracking-[0.2em] lg:tracking-[0.3em] uppercase italic"
              >
                {isMyTurn
                  ? t.yourTurn
                  : isOnline
                  ? t.opponentTurn
                  : isGauntletMode
                  ? formatName(player2.name)
                  : isCustomMode
                  ? "PLAYER 2"
                  : t.opponentTurn}
              </motion.span>
            </div>
          )}

          {isOnline && (
            <button
              onClick={onShowInfo}
              className="h-8 lg:h-12 w-8 lg:w-20 flex items-center justify-center lg:gap-2 lg:px-5 rounded-full border border-white/10 bg-black/80 text-white/60 hover:text-white hover:border-white/20 transition-all backdrop-blur-md active:scale-95 group"
              title={t.passiveInfo}
            >
              <Info className="w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover:rotate-12" />
              <span className="hidden lg:inline text-xs font-black tracking-widest uppercase italic">
                INFO
              </span>
            </button>
          )}
        </div>

        {/* [RIGHT COLUMN] Settings & Exit Buttons */}
        <div className="flex-1 flex justify-end items-center gap-1.5 lg:gap-2 pointer-events-auto">
          {phase !== "game_over" && (
            <>
              <button
                onClick={onShowSettings}
                className="p-2 lg:p-3 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:text-purple-300 hover:border-purple-400 transition-all shadow-lg backdrop-blur-sm"
                title={t.settings.title}
              >
                <SettingsIcon className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
              <button
                onClick={onShowExitConfirm}
                className="p-2 lg:p-3 rounded-full border border-red-500/30 bg-red-500/10 text-red-500/70 hover:text-red-400 hover:border-red-400 transition-colors shadow-lg backdrop-blur-sm"
                title={t.exit}
              >
                <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
