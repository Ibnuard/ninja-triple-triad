import { motion, animate } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  RANK_THRESHOLDS,
  GauntletRank,
  GAUNTLET_SCORING,
} from "@/constants/gauntlet";
import { ANIMATION_DURATIONS } from "@/constants/ui";
import { Cell } from "@/types/game";
import {
  getRankFromPoints,
  RANK_DISPLAY,
  RANK_POINTS,
} from "@/constants/onlineRanks";

interface GameResultModalProps {
  t: any;
  winner: string | null;
  isGauntletMode: boolean;
  justFinishedBoss: boolean;
  isBossBattle: boolean;
  iWon: boolean;
  player1: any;
  player2: any;
  isPOVPlayer2: boolean;
  board: Cell[][];
  isOnline: boolean;
  gauntletRank: string;
  gauntletScore: number;
  oldGauntletScore: number;
  gauntletResult: {
    scoreAdded: number;
    newRank: GauntletRank | null;
    coinsEarned?: number;
    isWinStreakBonus?: boolean;
  } | null;
  pendingReward: any;
  pendingRank: GauntletRank | null; // Added pendingRank
  onStartGame: (isRestart?: boolean) => void;
  onOnlineMenu: () => void;
  onShowRewardModal: () => void;
  onEndRun: () => void;
}

export function GameResultModal({
  t,
  winner,
  isGauntletMode,
  justFinishedBoss,
  isBossBattle,
  iWon,
  player1,
  player2,
  isPOVPlayer2,
  board,
  isOnline,
  gauntletRank,
  gauntletScore,
  oldGauntletScore,
  gauntletResult,
  pendingReward,
  pendingRank, // Added pendingRank
  onStartGame,
  onOnlineMenu,
  onShowRewardModal,
  onEndRun,
}: GameResultModalProps) {
  const formatName = (fullName: string | null) => {
    if (!fullName) return "";
    return fullName.split(" ")[0];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, scale: 0.8 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: {
              type: "spring",
              duration: ANIMATION_DURATIONS.RESULT_MODAL_SPRING,
              bounce: 0.4,
              staggerChildren: 0.15,
            },
          },
        }}
        className="bg-gray-900 border-2 border-white/10 p-6 md:p-8 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,1)] flex flex-col items-center max-w-[95vw] w-[400px] text-center relative overflow-hidden"
      >
        <div
          className={cn(
            "absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[80px] opacity-20",
            winner === "player1"
              ? "bg-blue-500"
              : winner === "player2"
              ? "bg-red-500"
              : "bg-yellow-500"
          )}
        />

        <motion.div
          variants={{
            hidden: { opacity: 0, y: -20 },
            visible: { opacity: 1, y: 0 },
          }}
          className="mb-6 relative z-10"
        >
          <h2 className="text-gray-500 text-[10px] font-black tracking-[0.4em] mb-2 uppercase italic">
            {isGauntletMode
              ? justFinishedBoss
                ? t.gauntlet.roundCleared
                : isBossBattle
                ? t.gauntlet.thresholdReached
                : t.gauntlet.roundCleared
              : t.matchFinished}
          </h2>
          <motion.h1
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: ANIMATION_DURATIONS.BOARD_INTRO,
              repeat: 0,
              delay: 0.5,
            }}
            className={cn(
              "text-5xl md:text-6xl font-black tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] italic",
              winner === "draw"
                ? "text-yellow-500"
                : iWon
                ? "text-blue-400"
                : "text-red-500"
            )}
          >
            {(() => {
              if (winner === "draw") {
                return justFinishedBoss ? t.gauntlet.rankUpFailed : t.draw;
              }

              if (iWon) {
                return justFinishedBoss ? t.gauntlet.bossDefeated : t.victory;
              } else {
                return justFinishedBoss ? t.gauntlet.rankUpFailed : t.defeat;
              }
            })()}
          </motion.h1>
          {justFinishedBoss && winner !== null && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-[10px] text-red-400 font-bold mt-2 tracking-widest uppercase"
            >
              {iWon ? t.gauntlet.provenWorth : t.gauntlet.bossTooStrong}
            </motion.p>
          )}
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1 },
          }}
          className="flex items-center justify-between w-full gap-4 mb-8 relative z-10"
        >
          <div className="flex flex-col items-center flex-1">
            <div className="relative mb-2">
              <div className="w-16 h-16 rounded-full border-2 border-blue-500/50 p-1 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.1)] flex items-center justify-center overflow-hidden">
                {(isPOVPlayer2 ? player2.avatar_url : player1.avatar_url) ? (
                  <img
                    src={isPOVPlayer2 ? player2.avatar_url : player1.avatar_url}
                    alt={isPOVPlayer2 ? player2.name : player1.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500/20 to-transparent flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full border-2 border-blue-500/30 flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-500/40 rounded-full" />
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md border border-white/20 shadow-lg">
                {t.you}
              </div>
            </div>
            <div className="text-3xl font-black text-white drop-shadow-md">
              {(() => {
                const targetOwner = isPOVPlayer2 ? "player2" : "player1";
                let count = 0;
                board.forEach((row) =>
                  row.forEach((cell) => {
                    if (cell.owner === targetOwner) count++;
                  })
                );
                return count;
              })()}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-sm font-black text-gray-700 italic">
              {t.vs}
            </div>
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="relative mb-2">
              <div className="w-16 h-16 rounded-full border-2 border-red-500/50 p-1 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.1)] flex items-center justify-center overflow-hidden">
                {(isPOVPlayer2 ? player1.avatar_url : player2.avatar_url) ? (
                  <img
                    src={isPOVPlayer2 ? player1.avatar_url : player2.avatar_url}
                    alt={formatName(isPOVPlayer2 ? player1.name : player2.name)}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-red-500/20 to-transparent flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full border-2 border-red-500/30 flex items-center justify-center">
                      <div className="w-3 h-3 bg-red-500/40 rounded-full" />
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -left-2 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md border border-white/20 shadow-lg">
                {isOnline || isGauntletMode
                  ? formatName(
                      isPOVPlayer2
                        ? player1.name || "Opponent"
                        : player2.name || "Opponent"
                    )
                  : t.cpu}
              </div>
            </div>
            <div className="text-3xl font-black text-white drop-shadow-md">
              {(() => {
                const targetOwner = isPOVPlayer2 ? "player1" : "player2";
                let count = 0;
                board.forEach((row) =>
                  row.forEach((cell) => {
                    if (cell.owner === targetOwner) count++;
                  })
                );
                return count;
              })()}
            </div>
          </div>
        </motion.div>

        {isGauntletMode && (
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="w-full bg-black/40 rounded-2xl p-4 border border-white/5 mb-6 relative z-10 flex flex-col gap-3"
          >
            <div className="flex justify-between items-end border-b border-white/5 pb-3">
              <div className="text-left relative">
                <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">
                  {t.gauntlet.rank}
                </div>
                <div className="text-yellow-400 font-black text-base relative h-6 w-24">
                  {(() => {
                    if (isBossBattle && pendingRank) {
                      return (
                        <div className="absolute top-0 left-0 flex flex-col">
                          <span className="text-yellow-400">
                            {gauntletRank}
                          </span>
                          <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.5,
                            }}
                            className="text-[8px] text-red-500 font-black"
                          >
                            BOSS CHALLENGE!
                          </motion.span>
                        </div>
                      );
                    }
                    return (
                      <div className="absolute top-0 left-0">
                        {gauntletRank}
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">
                  {t.gauntlet.totalScore}
                </div>
                <motion.div className="text-white font-black text-xl">
                  {/* Score Countup Animation */}
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    ref={(node) => {
                      if (node) {
                        animate(oldGauntletScore, gauntletScore, {
                          duration: ANIMATION_DURATIONS.SCORE_COUNTUP,
                          delay: 0.5,
                          onUpdate: (latest) => {
                            node.textContent = Math.round(latest).toString();
                          },
                        });
                      }
                    }}
                  />
                </motion.div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2 mb-2">
              <div className="flex flex-col text-left">
                <span className="text-gray-500 text-[8px] font-bold uppercase tracking-wider">
                  Win Points
                </span>
                <span className="text-white font-black">
                  {winner === "player1" ? `+${GAUNTLET_SCORING.BASE_WIN}` : "0"}
                </span>
              </div>

              <div className="flex flex-col text-right">
                <span className="text-gray-500 text-[8px] font-bold uppercase tracking-wider">
                  {t.gauntlet.boardBonus}
                </span>
                <span className="text-green-400 font-black">
                  +
                  {winner === "player1"
                    ? (() => {
                        let boardCardCount = 0;
                        board.forEach((row) =>
                          row.forEach((cell) => {
                            if (cell.owner === "player1") boardCardCount++;
                          })
                        );
                        return (
                          boardCardCount * GAUNTLET_SCORING.BOARD_BONUS_PER_CARD
                        );
                      })()
                    : "0"}
                </span>
              </div>
            </div>

            {gauntletResult?.coinsEarned !== undefined && (
              <div className="flex flex-col items-center py-2 border-b border-white/5 mb-2 bg-yellow-500/5 rounded-lg">
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-600 flex items-center justify-center shadow-[0_0_8px_rgba(255,215,0,0.4)]">
                    <span className="text-[9px] font-black text-yellow-900">
                      C
                    </span>
                  </div>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-yellow-500/80 font-black italic">
                    {t.gauntlet.coinsEarned}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-black text-yellow-500 drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                    +{gauntletResult.coinsEarned}
                  </span>
                  {gauntletResult.isWinStreakBonus && (
                    <motion.span
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[8px] font-black text-yellow-400 uppercase tracking-widest animate-pulse"
                    >
                      {t.gauntlet.winStreakBonus}
                    </motion.span>
                  )}
                </div>
              </div>
            )}

            {isGauntletMode &&
              winner !== "player1" &&
              winner !== null &&
              oldGauntletScore > gauntletScore && (
                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2 mb-1 bg-red-500/10 p-2 rounded-lg">
                  <div className="flex flex-col text-left">
                    <span className="text-red-400 text-[8px] font-bold uppercase tracking-wider">
                      {t.gauntlet.scoreReduction}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-red-400 text-[8px] font-bold uppercase tracking-wider">
                      Penalty
                    </span>
                    <span className="text-red-500 font-black">
                      -{Math.round(oldGauntletScore - gauntletScore)}
                    </span>
                  </div>
                </div>
              )}

            <div className="w-full mt-1">
              <div className="flex justify-between text-[8px] font-bold text-gray-600 mb-1 uppercase tracking-wider">
                <span>{t.gauntlet.progress}</span>
                <span>
                  {(() => {
                    const ranks: GauntletRank[] = [
                      "Genin",
                      "Chunin",
                      "Jounin",
                      "Anbu",
                      "Kage",
                      "Rikudo",
                    ];
                    const currentRankIndex = ranks.indexOf(
                      gauntletRank as GauntletRank
                    );
                    if (currentRankIndex === ranks.length - 1) return "MAX";
                    return ranks[currentRankIndex + 1];
                  })()}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{
                    width: (() => {
                      const ranks: GauntletRank[] = [
                        "Genin",
                        "Chunin",
                        "Jounin",
                        "Anbu",
                        "Kage",
                        "Rikudo",
                      ];
                      const currentRankIndex = ranks.indexOf(
                        gauntletRank as GauntletRank
                      );
                      if (currentRankIndex === ranks.length - 1) return "100%";
                      const currentThreshold =
                        RANK_THRESHOLDS[gauntletRank as GauntletRank];
                      const nextThreshold =
                        RANK_THRESHOLDS[ranks[currentRankIndex + 1]];
                      const progress = Math.min(
                        100,
                        Math.max(
                          0,
                          ((gauntletScore - currentThreshold) /
                            (nextThreshold - currentThreshold)) *
                            100
                        )
                      );
                      return `${progress}%`;
                    })(),
                  }}
                  transition={{
                    duration: 1,
                    ease: "easeOut",
                    delay: 0.5,
                  }}
                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400"
                />
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          className="flex flex-col gap-4 w-full relative z-10"
        >
          {isOnline ? (
            <>
              {/* Rank Point Change Display */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="bg-gray-900/80 border border-white/10 rounded-xl p-4 mb-4"
              >
                <div className="text-center">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">
                    {t.online?.rankChange || "Rank Points"}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={cn(
                        "text-2xl font-black",
                        iWon
                          ? "text-green-400"
                          : winner === "draw"
                          ? "text-yellow-400"
                          : "text-red-400"
                      )}
                    >
                      {iWon
                        ? `+${RANK_POINTS.WIN}`
                        : winner === "draw"
                        ? `+${RANK_POINTS.DRAW}`
                        : RANK_POINTS.LOSS}
                    </span>
                    <span className="text-gray-500 text-sm">pts</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    {iWon
                      ? t.online?.victoryBonus || "Victory Bonus!"
                      : winner === "draw"
                      ? t.online?.drawPoints || "Draw Points"
                      : t.online?.defeatPenalty || "Defeat Penalty"}
                  </div>
                </div>
              </motion.div>

              <button
                onClick={onOnlineMenu}
                className="w-full py-3 bg-blue-500 text-white font-black text-xs tracking-[0.2em] hover:bg-blue-400 transition-all rounded-xl shadow-[0_4px_0_rgb(30,64,175)] active:translate-y-1 active:shadow-none uppercase italic"
              >
                {t.online.backToOnlineMenu}
              </button>
            </>
          ) : isGauntletMode && winner === "player1" ? (
            <button
              onClick={() => {
                if (pendingReward) {
                  onShowRewardModal();
                } else {
                  onStartGame();
                }
              }}
              className="w-full py-3 bg-blue-500 text-white font-black text-xs tracking-[0.2em] hover:bg-blue-400 transition-all rounded-xl shadow-[0_4px_0_rgb(30,64,175)] active:translate-y-1 active:shadow-none uppercase italic"
            >
              {isBossBattle ? t.gauntlet.bossChallenge : t.gauntlet.nextBattle}
            </button>
          ) : (
            <button
              onClick={() => onStartGame(true)}
              className="w-full py-3 bg-white text-black font-black text-xs tracking-[0.2em] hover:bg-gray-200 transition-all rounded-xl shadow-[0_4px_0_rgb(156,163,175)] active:translate-y-1 active:shadow-none uppercase italic"
            >
              {t.playAgain}
            </button>
          )}

          {!isOnline && (
            <button
              onClick={onEndRun}
              className="w-full py-3 bg-red-600/10 text-red-500 border border-red-500/30 font-black text-xs tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all rounded-xl uppercase italic"
            >
              {t.gauntlet.surrender}
            </button>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
