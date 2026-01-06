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
      title: "ELEMENTAL FATE",
      footer: "Ninja Arts: Elemental Mastery",
      fire: "If placed in a corner -> +1 to all attributes.",
      water:
        "Center (1,1): +1 all stats. Center-Left: +1 ATK. Center-Right: +1 Jutsu.",
      earth: "If placed in the bottom row (row 2) -> +1 Chakra.",
      wind: "If placed in the top row (row 0) -> +1 DEF.",
      lightning:
        "Top: +0-2 DEF. Mid: +0-1 ATK/JT. Bottom: +0-2 Chakra. (Stable random per card).",
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
      title: "NASIB ELEMEN",
      footer: "Ninja Arts: Elemental Mastery",
      fire: "Jika ditaruh di pojok (corner) -> +1 semua atribut.",
      water:
        "Tengah (1,1): +1 semua atribut. Tengah Kiri: +1 ATK. Tengah Kanan: +1 Jutsu.",
      earth: "Jika ditaruh di baris paling bawah (row 2) -> +1 Chakra.",
      wind: "Jika ditaruh di baris paling atas (row 0) -> +1 DEF.",
      lightning:
        "Atas: +0-2 DEF. Tengah: +0-1 ATK/JT. Bawah: +0-2 Chakra. (Acak per kartu).",
    },
  },
} as const;

export type TranslationKeys = typeof TRANSLATIONS.en;
