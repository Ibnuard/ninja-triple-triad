export const TRANSLATIONS = {
  en: {
    home: {
      title: "TRIPLE\nTRIAD",
      subtitle: "Ninja Edition",
      singlePlayer: "Single Player",
      multiplayer: "Multiplayer",
      konami: "KONAMI CODE NOT ENABLED",
      start: "PRESS START",
      howToPlay: "How to Play",
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
      mechanics: {
        randomElemental: {
          title: "Elemental Board",
          desc: "The board has been infused with {element} energy. All cards with the {element} element receive +1 to all stats.",
        },
        poison: {
          title: "Poison Board",
          desc: "Toxic fumes cover the battlefield. All cards suffer -1 to all stats.",
        },
        foggy: {
          title: "Foggy Board",
          desc: "Dense fog obscures the battlefield. For the first 2 moves, you cannot see opponent card stats unless you capture them.",
        },
        joker: {
          title: "Joker Board",
          desc: "Chaotic energy fills the air. For the first 2 moves, all cards receive random stat modifiers between -2 and +2.",
        },
      },
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
            "Endless battles. Survive as long as you can while the board grows more hostile.",
          submenu: {
            survivalMode: "Survival Mode",
            deckStatus: "Deck Status",
            startGauntlet: "Start Gauntlet",
            manageDeck: "Manage Deck",
            selectCards: "Select 5 Cards",
            cancel: "Cancel",
            saveDeck: "Save Deck",
          },
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
            "Control both players locally to test cards and passives.",
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
    tutorial: {
      title: "How to Play",
      back: "Back",
      sections: {
        basics: {
          title: "The Basics",
          content:
            "Triple Triad is a card game played on a 3x3 grid. Each player brings 5 cards into battle. The goal is to capture as many of the opponent's cards as possible.",
        },
        anatomy: {
          title: "Card Anatomy",
          desc: "Every card has 4 main attributes arranged in a diamond grid:",
          cp: "Chakra (Top): Used for vertical defense.",
          atk: "Attack (Right): Used for horizontal offense.",
          jt: "Jutsu (Left): Used for horizontal defense.",
          df: "Defense (Bottom): Used for bottom-up defense.",
          element:
            "Elemental Badge: Indicates the card's element (Fire, Water, etc.).",
          buff: "GREEN numbers represent currently buffed stats (+1 or more).",
          debuff:
            "RED numbers represent currently debuffed stats (-1 or less).",
          buffIndicator: "Bonus Indicator",
          debuffIndicator: "Debuff Indicator",
        },
        capturing: {
          title: "Capturing Cards",
          desc: "To capture a card, place your card adjacent to an opponent's card. If your card's side-facing stat is higher than the opponent's adjacent stat, the opponent's card flips to your color!",
          captured: "CAPTURED!",
          ready: "GET READY TO CAPTURE...",
          comparison: "9 VS 6 → CAPTURED!",
        },
        elements: {
          title: "Elemental Mastery",
          desc: "Each element has a unique passive ability triggered based on the card's position on the game board.",
          note: "Important: Elemental bonuses are only active if the card is placed in the correct position as described above. Strategy is everything!",
        },
        winning: {
          title: "Victory",
          desc: "Once all 9 spaces on the board are filled, the player who controls the majority of the cards wins the match.",
        },
        mechanics: {
          title: "Board Mechanics",
          random: {
            title: "Elemental Board",
            desc: "The board changes to a specific elemental type. All cards sharing the same element as the board grant +1 to all attributes.",
          },
          poison: {
            title: "Poison Board",
            desc: "All cards suffer -1 to all attributes.",
          },
          foggy: {
            title: "Foggy Board",
            desc: "For the first 2 moves, players cannot see opponent card attributes unless they successfully capture the card.",
          },
          joker: {
            title: "Joker Board",
            desc: "For the first 2 moves, each player gets random attribute modifiers between -2 and +2.",
          },
        },
      },
      footer: "Elemental mastery is the key to victory",
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
      howToPlay: "Cara Bermain",
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
      mechanics: {
        randomElemental: {
          title: "Papan Elemental",
          desc: "Papan telah dipenuhi energi {element}. Semua kartu dengan elemen {element} mendapat +1 untuk semua stat.",
        },
        poison: {
          title: "Papan Racun",
          desc: "Asap beracun menutupi medan perang. Semua kartu mendapat -1 untuk semua stat.",
        },
        foggy: {
          title: "Papan Berkabut",
          desc: "Kabut tebal mengaburkan medan perang. Untuk 2 langkah pertama, kamu tidak bisa melihat stat kartu lawan kecuali kamu menangkapnya.",
        },
        joker: {
          title: "Papan Joker",
          desc: "Energi kacau memenuhi udara. Untuk 2 langkah pertama, semua kartu mendapat modifier stat acak antara -2 dan +2.",
        },
      },
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
            "Pertarungan tanpa akhir. Bertahanlah selama mungkin saat board semakin kejam.",
          submenu: {
            survivalMode: "Mode Survival",
            deckStatus: "Status Dek",
            startGauntlet: "Mulai Gauntlet",
            manageDeck: "Atur Dek",
            selectCards: "Pilih 5 Kartu",
            cancel: "Batal",
            saveDeck: "Simpan Dek",
          },
        },
        training: {
          title: "Mode Training",
          description:
            "Latihan melawan AI yang sangat mudah untuk mengetahui basic gameplay dan kartu yang kamu mainkan",
        },
        draft: {
          title: "Mode Draft",
          description:
            "Melawan AI dengan deck yang dipilih secara langsung sebelum pertandingan dimulai",
        },
        custom: {
          title: "Mode Kustom",
          description:
            "Kamu bisa menjalankan dua sisi sekaligus untuk mencoba kartu dan pasif.",
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
    tutorial: {
      title: "Cara Bermain",
      back: "Kembali",
      sections: {
        basics: {
          title: "Dasar Permainan",
          content:
            "Triple Triad dimainkan di atas grid 3x3. Setiap pemain membawa 5 kartu ke medan tempur. Tujuannya adalah menangkap kartu lawan sebanyak mungkin.",
        },
        anatomy: {
          title: "Anatomi Kartu",
          desc: "Setiap kartu memiliki 4 atribut utama yang disusun dalam pola diamond:",
          cp: "Chakra (Atas): Digunakan untuk pertahanan atas.",
          atk: "Attack (Kanan): Digunakan untuk serangan samping.",
          jt: "Jutsu (Kiri): Digunakan untuk pertahanan samping.",
          df: "Defense (Bawah): Digunakan untuk pertahanan bawah.",
          element: "Badge Elemen: Menunjukkan elemen kartu (Api, Air, dll).",
          buff: "Angka HIJAU melambangkan status yang sedang diperkuat (+1 atau lebih).",
          debuff:
            "Angka MERAH melambangkan status yang sedang dikurangi (-1 atau kurang).",
          buffIndicator: "Indikator Bonus",
          debuffIndicator: "Indikator Debuff",
        },
        capturing: {
          title: "Menangkap Kartu",
          desc: "Untuk menangkap kartu, letakkan kartumu di sebelah kartu lawan. Jika angka atribut kartumu yang menghadap lawan lebih besar, maka kartu lawan akan ter-flip menjadi warnamu!",
          captured: "TERTANGKAP!",
          ready: "BERSIAP UNTUK MENANGKAP...",
          comparison: "9 VS 6 → TERTANGKAP!",
        },
        elements: {
          title: "Masteri Elemen",
          desc: "Setiap elemen memiliki pasif unik yang dipicu berdasarkan posisi kartu di papan permainan.",
          note: "Penting: Bonus elemen hanya aktif jika kartu diletakkan di posisi yang tepat sesuai deskripsi di atas. Strategi penempatan adalah kunci utama!",
        },
        winning: {
          title: "Kemenangan",
          desc: "Setelah seluruh 9 kotak di papan terisi, pemain yang memiliki jumlah kartu terbanyak dengan warnanya akan memenangkan pertandingan.",
        },
        mechanics: {
          title: "Mekanik Papan",
          random: {
            title: "Elemental Board",
            desc: "Board akan berubah menjadi tipe elemen tertentu, semua kartu dengan elemen yang sama dengan board akan mendapatkan +1 di semua atribut.",
          },
          poison: {
            title: "Poison Board",
            desc: "Semua kartu akan -1 di semua atribut.",
          },
          foggy: {
            title: "Foggy Board",
            desc: "Untuk 2 langkah pertama setiap player tidak dapat melihat atribut kartu milik lawan, kecuali secara kebetulan berhasil mengalahkan kartunya maka atribut akan terlihat.",
          },
          joker: {
            title: "Joker Board",
            desc: "Untuk 2 langkah pertama setiap player akan mendapatkan random atribut antara + 0-2 atau - 0-2.",
          },
        },
      },
      footer: "Masteri elemen adalah kunci kemenangan",
    },
  },
} as const;

export type TranslationKeys = typeof TRANSLATIONS.en;
