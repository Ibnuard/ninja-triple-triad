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
      passiveInfo: "Passive Info",
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
        custom: {
          title: "Custom Mode",
          description:
            "Testing and debugging mode. Control both players locally to test cards and passives.",
        },
      },
    },
    passives: {
      title: "Elemental Passive",
      footer: "Ninja Arts: Elemental Mastery",
      fire: "If placed in a corner anywhere given +1 to all attributes.",
      water:
        "If placed in the center given +1 to all attributes. If placed in the center-left given +1 ATK. If placed in the center-right given +1 Jutsu.",
      earth: "If placed in the bottom row given +1 Chakra.",
      wind: "If placed in the top row given +1 DEF.",
      lightning:
        "If placed in the top given +0-2 DEF randomly. If placed in the middle given +0-1 ATK or Jutsu randomly. If placed in the bottom given +0-2 Chakra randomly.",
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
      passiveInfo: "Info Pasif",
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
        custom: {
          title: "Mode Kustom",
          description:
            "Mode debugging. Kamu bisa menjalankan dua sisi sekaligus untuk mencoba kartu dan pasif.",
        },
      },
    },
    passives: {
      title: "Passive Element",
      footer: "Ninja Arts: Elemental Mastery",
      fire: "Jika ditaruh di pojok (corner) manapun maka +1 semua atribut.",
      water:
        "Jika ditaruh di tepat tengah maka +1 semua atribut. Jika ditaruh di tengah kiri maka +1 ATK. Jika ditaruh di tengah kanan maka +1 Jutsu.",
      earth: "Jika ditaruh di baris paling bawah maka +1 Chakra.",
      wind: "Jika ditaruh di baris paling atas maka +1 DEF.",
      lightning:
        "Jika ditaruh di bagian atas maka +0-2 DEF secara acak. Jika ditaruh di bagian tengah maka +0-1 ATK atau Jutsu secara acak. Jika ditaruh di bagian bawah maka +0-2 Chakra secara acak.",
    },
  },
} as const;

export type TranslationKeys = typeof TRANSLATIONS.en;
