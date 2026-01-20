import { motion } from "framer-motion"; // v10.16.4
import { Info, LogOut, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { IMAGE_PATHS } from "@/constants/assets";
import { BoardMechanicState } from "@/types/game";
import { getRankFromPoints, RANK_DISPLAY } from "@/constants/onlineRanks";

interface GameHeaderProps {
  t: any;
  isOnline: boolean;
  isGauntletMode: boolean;
  isBossBattle: boolean;
  isCustomMode: boolean;
  phase: string;
  isMyTurn: boolean;
  player1: any;
  player2: any;
  isPOVPlayer2: boolean;
  mechanic: BoardMechanicState;
  opponentRankPoints?: number;
  myRankPoints?: number;
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
  opponentRankPoints = 0,
  myRankPoints = 0,
  onShowInfo,
  onShowSettings,
  onShowExitConfirm,
  onShowMechanicModal,
}: GameHeaderProps) {
  const formatName = (fullName: string | null) => {
    if (!fullName) return "";
    return fullName.split(" ")[0];
  };

  const opponentName = formatName(isPOVPlayer2 ? player1.name : player2.name);
  const opponentAvatar = isPOVPlayer2 ? player1.avatar_url : player2.avatar_url;

  const getMechanicIcon = () => {
    if (mechanic.type === "random_elemental") {
      return (
        <div
          className={cn(
            "w-4 h-4 rounded-full flex items-center justify-center",
            mechanic.activeElement === "fire" && "bg-red-500/30",
            mechanic.activeElement === "water" && "bg-blue-500/30",
            mechanic.activeElement === "earth" && "bg-amber-700/30",
            mechanic.activeElement === "wind" && "bg-emerald-500/30",
            mechanic.activeElement === "lightning" && "bg-yellow-400/30",
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
            className="w-3 h-3 object-contain"
          />
        </div>
      );
    }
    if (mechanic.type === "poison") return <span className="text-xs">☠️</span>;
    if (mechanic.type === "foggy") return <span className="text-xs">🌫️</span>;
    if (mechanic.type === "joker") return <span className="text-xs">🃏</span>;
    return null;
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-[60] pointer-events-none">
      <div className="absolute inset-0 h-16 lg:h-20 bg-gradient-to-b from-black/60 via-black/30 to-transparent pointer-events-none" />

      <div className="relative flex items-center w-full px-2 lg:px-4 py-2 lg:py-3">
        {/* [LEFT] - Opponent Info + Board Type */}
        <div className="flex-1 flex items-center gap-2 pointer-events-auto min-w-0">
          {isOnline && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 lg:gap-2 pl-1"
            >
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-white/20 overflow-hidden bg-gray-900/80 flex-shrink-0 shadow-md">
                {opponentAvatar ? (
                  <img
                    src={opponentAvatar}
                    alt="Opponent"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <span className="text-white/40 text-[10px] font-bold">
                      ?
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] text-white/30 uppercase tracking-wider font-medium leading-none hidden lg:block">
                  vs
                </span>
                <span className="text-xs lg:text-sm font-semibold text-white/80 truncate max-w-[80px] lg:max-w-[120px]">
                  {opponentName || "???"}
                </span>
              </div>
              {/* Opponent Rank Badge */}
              {isOnline && opponentRankPoints !== undefined && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-black/40 rounded border border-white/10">
                  <span className="text-[10px] lg:text-xs">
                    {RANK_DISPLAY[getRankFromPoints(opponentRankPoints)].icon}
                  </span>
                  <span className="text-[9px] lg:text-[10px] text-white/60 font-bold tabular-nums">
                    {opponentRankPoints}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* Online: Board Type Info Button - Always visible */}
          {isOnline && (
            <button
              onClick={onShowMechanicModal}
              className="h-7 lg:h-8 flex items-center gap-1.5 px-2 lg:px-3 rounded-lg bg-black/50 border border-white/10 text-white/80 hover:bg-black/70 hover:border-white/20 transition-all"
            >
              {mechanic.type !== "none" ? (
                <>
                  {getMechanicIcon()}
                  <span className="hidden sm:inline uppercase text-[10px] tracking-wide opacity-70">
                    {mechanic.type.replace("_", " ")}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs">📋</span>
                  <span className="hidden sm:inline uppercase text-[10px] tracking-wide opacity-70">
                    RULES
                  </span>
                </>
              )}
            </button>
          )}

          {/* Boss Battle Badge */}
          {isGauntletMode && isBossBattle && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 pl-1"
            >
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-red-500/40 overflow-hidden bg-red-950/50 flex-shrink-0 animate-pulse shadow-md shadow-red-900/30">
                {player2.avatar_url ? (
                  <img
                    src={player2.avatar_url}
                    alt="Boss"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-red-900/40 flex items-center justify-center">
                    <span className="text-red-500/80 text-xs">☠️</span>
                  </div>
                )}
              </div>
              <span className="text-xs font-bold text-red-400/90 hidden lg:block">
                BOSS
              </span>
            </motion.div>
          )}

          {/* Single Player: Mechanic Badge */}
          {!isOnline && mechanic.type !== "none" && (
            <button
              onClick={onShowMechanicModal}
              className="h-7 lg:h-8 flex items-center gap-1.5 px-2 lg:px-3 rounded-lg bg-black/50 border border-white/10 text-white/80 hover:bg-black/70 hover:border-white/20 transition-all text-xs font-medium"
            >
              {getMechanicIcon()}
              <span className="hidden sm:inline uppercase text-[10px] tracking-wide opacity-70">
                {mechanic.type.replace("_", " ")}
              </span>
            </button>
          )}
        </div>

        {/* [CENTER] - Turn Indicator (Absolutely Centered) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-2 lg:top-3 flex items-center justify-center pointer-events-auto">
          {phase !== "game_over" && (
            <motion.div
              layout
              className={cn(
                "h-7 lg:h-8 px-4 lg:px-6 rounded-lg font-bold flex items-center justify-center transition-all duration-300",
                isMyTurn
                  ? "bg-gradient-to-r from-blue-600/90 to-blue-500/90 text-white border border-blue-400/40 shadow-lg shadow-blue-900/40"
                  : "bg-gradient-to-r from-red-600/80 to-red-500/80 text-white border border-red-400/30 shadow-lg shadow-red-900/30",
              )}
            >
              <motion.span
                animate={isMyTurn ? { opacity: [1, 0.7, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-[10px] lg:text-xs tracking-widest uppercase"
              >
                {isMyTurn
                  ? t.yourTurn
                  : isOnline
                    ? t.opponentTurn
                    : isGauntletMode
                      ? formatName(player2.name)
                      : isCustomMode
                        ? "P2"
                        : t.opponentTurn}
              </motion.span>
            </motion.div>
          )}
        </div>

        {/* [RIGHT] - Action Buttons */}
        <div className="flex-1 flex justify-end items-center gap-1 lg:gap-1.5 pointer-events-auto">
          {phase !== "game_over" && (
            <>
              {/* My Rank Badge */}
              {isOnline && myRankPoints !== undefined && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-black/40 rounded border border-white/10 mr-1 lg:mr-2">
                  <span className="text-[10px] lg:text-xs">
                    {RANK_DISPLAY[getRankFromPoints(myRankPoints)].icon}
                  </span>
                  <span className="text-[9px] lg:text-[10px] text-white/60 font-bold tabular-nums">
                    {myRankPoints}
                  </span>
                </div>
              )}

              <button
                onClick={onShowInfo}
                className="h-7 lg:h-8 w-7 lg:w-8 flex items-center justify-center rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400/80 hover:text-yellow-300 hover:border-yellow-400/50 hover:bg-yellow-500/20 transition-all"
                title={t.passiveInfo}
              >
                <Info className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              </button>
              <button
                onClick={onShowSettings}
                className="h-7 lg:h-8 w-7 lg:w-8 flex items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400/70 hover:text-purple-300 hover:border-purple-400/50 transition-all"
                title={t.settings.title}
              >
                <SettingsIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              </button>
              <button
                onClick={onShowExitConfirm}
                className="h-7 lg:h-8 w-7 lg:w-8 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-400/50 transition-all"
                title={t.exit}
              >
                <LogOut className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
