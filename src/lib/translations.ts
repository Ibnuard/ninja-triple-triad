export const TRANSLATIONS = {
  en: {
    home: {
      title: "TRIPLE\nTRIAD",
      subtitle: "Ninja Edition",
      singlePlayer: "Single Player",
      multiplayer: "Multiplayer",
      konami: "KONAMI CODE NOT ENABLED",
      start: "PRESS START",
    },
    game: {
      yourTurn: "Your Turn",
      opponentTurn: "Opponent Turn",
      waiting: "Waiting...",
      victory: "Victory",
      defeat: "Defeat",
      draw: "Draw",
      playAgain: "Play Again",
      exit: "Exit",
      player: "You",
      opponent: "Computer",
      gameResult: "Game Result",
      emptyHand: "Empty Hand",
    },
    lobby: {
      title: "Multiplayer Lobby",
      createTitle: "Create New Dojo",
      createDesc: "Start a new match and invite a rival.",
      createButton: "Create Room",
      createLoading: "Setting up...",
      or: "OR",
      joinTitle: "Join Existing Dojo",
      joinPlaceholder: "ENTER CODE",
      joinButton: "JOIN",
      back: "← Back to Main Menu",
    },
    spSelection: {
      title: "Select Mode",
      back: "Back to Home",
      trainingSub: {
        ownDeck: "Own Deck",
        randomDeck: "Random Deck",
      },
      modes: {
        gauntlet: {
          title: "Gauntlet Mode",
          description:
            "Embark on an adventure of defeating enemies to your limit. The further you go, the tougher the opponents become.",
        },
        training: {
          title: "Training",
          description:
            "Practice against a very easy AI to learn basic gameplay and the cards you're playing.",
        },
        draft: {
          title: "Draft Mode",
          description:
            "Battle the AI with a deck selected directly before the match begins.",
        },
      },
    },
  },
  id: {
    home: {
      title: "TRIPLE\nTRIAD",
      subtitle: "Edisi Ninja",
      singlePlayer: "Main Sendiri",
      multiplayer: "Main Bareng",
      konami: "KODE KONAMI TIDAK AKTIF",
      start: "TEKAN MULAI",
    },
    game: {
      yourTurn: "Giliranmu",
      opponentTurn: "Giliran Lawan",
      waiting: "Menunggu...",
      victory: "Menang",
      defeat: "Kalah",
      draw: "Seri",
      playAgain: "Main Lagi",
      exit: "Keluar",
      player: "Kamu",
      opponent: "Lawan",
      gameResult: "Hasil Pertandingan",
      emptyHand: "Tangan Kosong",
    },
    lobby: {
      title: "Lobi Multiplayer",
      createTitle: "Buat Dojo Baru",
      createDesc: "Mulai pertandingan baru dan undang rival.",
      createButton: "Buat Ruangan",
      createLoading: "Menyiapkan...",
      or: "ATAU",
      joinTitle: "Gabung Dojo",
      joinPlaceholder: "MASUKKAN KODE",
      joinButton: "GABUNG",
      back: "← Kembali ke Menu Utama",
    },
    spSelection: {
      title: "Pilih Mode",
      back: "Kembali ke Beranda",
      trainingSub: {
        ownDeck: "Dek Sendiri",
        randomDeck: "Dek Acak",
      },
      modes: {
        gauntlet: {
          title: "Mode Gauntlet",
          description:
            "Di mode ini kamu akan melakukan petualangan meangalahkan musuh sampai batas kemampuan yang kamu bisa, semakin jauh kamu melangkah maka akan semakin susah juga musuh musuhnya",
        },
        training: {
          title: "Mode Training",
          description:
            "Di mode ini kamu bisa melakukan latihan melawan AI yang sangat mudah untuk mengetahui basic gameplay dan kartu yang kamu mainkan",
        },
        draft: {
          title: "Mode Draft",
          description:
            "Di mode ini kamu akan melawan AI dengan deck yang dipilih secara langsung sebelum pertandingan dimulai",
        },
      },
    },
  },
} as const;

export type TranslationKeys = typeof TRANSLATIONS.en;
