window.SY = {
  metals: {
    silver: { name: "Sterling silver", tone: "linear-gradient(150deg,#f7f8f8 0%,#c5c9d0 48%,#f3f4f6 100%)" },
    vermeil: { name: "Gold vermeil", tone: "linear-gradient(150deg,#f8e7b6 0%,#d4ae58 46%,#f6e4ae 100%)" },
    gold14: { name: "14k yellow gold", tone: "linear-gradient(150deg,#f0d48a 0%,#b5873a 50%,#e8c56a 100%)" }
  },
  collections: [
    { id: "moonrise", name: "Moonrise", zh: "月出", line: "Small gold for ordinary daylight.", img: "assets/img/crescent.webp", portrait: "assets/img/portrait-800.webp" },
    { id: "tide", name: "Tide", zh: "潮汐", line: "Thin bands meant to be worn together.", img: "assets/img/band.webp", portrait: "assets/img/hoop-model.webp" },
    { id: "zodiac", name: "Zodiac", zh: "生肖", line: "A year sign, engraved if you want it.", img: "assets/img/disc.webp", portrait: "assets/img/disc.webp" },
    { id: "lantern", name: "Lantern", zh: "灯", line: "Lab-grown diamonds in quiet settings.", img: "assets/img/solitaire.webp", portrait: "assets/img/hands.webp" }
  ],
  products: [
    {
      id: "lantern-solitaire", name: "Lantern solitaire", col: "lantern",
      line: "A low halo, set close to the hand.",
      detail: "One round center stone sits inside a tight circle of smaller stones, low enough that a cuff does not catch it. Wear it on its own, or with Stack band on the next finger. The center and the halo are lab-grown diamonds, in sterling silver, gold vermeil, or 14k yellow gold.",
      price: 278, metals: { silver: -30, vermeil: 0, gold14: 90 },
      sizes: ["4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9"],
      oosSizes: ["9"], diamond: true,
      img: "assets/img/solitaire.webp", imgb: "assets/img/solitaire-b.webp",
      alt: "Round lab-grown diamond halo ring in yellow gold"
    },
    {
      id: "tide-line", name: "Tide line", col: "tide",
      line: "A thin diamond band for stacking.",
      detail: "Small stones run halfway around a narrow shank, so a second ring can rest against it without a bump. Pair it with Stack band, or leave it alone on a quiet hand. Lab-grown diamonds, in sterling silver, gold vermeil, or 14k yellow gold.",
      price: 118, metals: { silver: -24, vermeil: 0, gold14: 92 },
      sizes: ["4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9"],
      oosSizes: ["8"], diamond: true,
      img: "assets/img/band.webp", imgb: "assets/img/bands.webp",
      alt: "White gold diamond band on a pale ground"
    },
    {
      id: "year-pendant", name: "Year pendant", col: "zodiac",
      line: "A flat disc for a year or a short name.",
      detail: "The face is left smooth so ten letters can be cut into it and still be read. It hangs at the collarbone on a fine chain, over a shirt collar or on bare skin. Sterling silver, gold vermeil, or 14k yellow gold. Leave it blank, or add a year; once the letters are cut, the piece is made for you.",
      price: 156, metals: { silver: -28, vermeil: 0, gold14: 92 },
      engrave: true,
      img: "assets/img/disc-b.webp", imgb: "assets/img/disc.webp",
      alt: "Round gold disc pendant on a fine chain",
      engraveAt: { left: "40%", top: "86%" },
      pos: "center 72%"
    },
    {
      id: "rose-window", name: "Rose window", col: "lantern",
      line: "A pale pink center in a small diamond frame.",
      detail: "The pink stone is the one you notice; the frame around it stays thin. It looks softer in daylight than a white center, and it belongs with a plain band rather than a second halo. Lab-grown diamonds around a pink center, in gold vermeil or 14k yellow gold.",
      price: 186, metals: { vermeil: 0, gold14: 94 },
      sizes: ["4", "5", "6", "7", "8", "9"], oosSizes: ["4"], diamond: true,
      img: "assets/img/rose.webp", imgb: "assets/img/solitaire.webp",
      alt: "Pink center stone ring with a diamond halo"
    },
    {
      id: "moon-crescent", name: "Moon crescent", col: "moonrise",
      line: "A small crescent on a fine chain.",
      detail: "Tiny stones follow the curve, and the pendant stays light enough for a neckline that already has a collar. Wear it on its own, just below the throat. Sterling silver or gold vermeil.",
      price: 84, metals: { silver: -16, vermeil: 0 },
      img: "assets/img/crescent.webp", imgb: "assets/img/portrait-800.webp",
      pos: "center 78%",
      alt: "Gold crescent pendant and a fine chain"
    },
    {
      id: "paperclip", name: "Paperclip chain", col: "tide",
      line: "Light oval links for the wrist.",
      detail: "The links are oval and open, lighter than a curb, so the bracelet moves with the wrist. Wear it alone, or with a thin ring on the same hand. Gold vermeil or 14k yellow gold.",
      price: 96, metals: { vermeil: 0, gold14: 80 },
      img: "assets/img/paperclip.webp", imgb: "assets/img/hands.webp",
      alt: "Gold paperclip chain bracelet"
    },
    {
      id: "blue-drops", name: "Blue drops", col: "moonrise",
      line: "Small blue stones on plain wires.",
      detail: "Each earring is one stone and a short wire, close to the lobe, so it stays put under hair. They suit a crew neck on a day you are skipping a necklace. Gold vermeil.",
      price: 48, metals: { vermeil: 0 },
      img: "assets/img/drops.webp", imgb: "assets/img/drops.webp",
      alt: "Small blue drop earrings on white cloth"
    },
    {
      id: "stack-band", name: "Stack band", col: "tide",
      line: "A narrow plain band for the lower finger.",
      detail: "There are no stones, so it can sit under Tide line without lifting that ring. The edge is rounded for a hand that writes and washes up. Sterling silver or gold vermeil.",
      price: 58, metals: { silver: -12, vermeil: 0 },
      sizes: ["4", "5", "6", "7", "8", "9"], oosSizes: [],
      img: "assets/img/bands.webp", imgb: "assets/img/band.webp",
      alt: "Two thin stacking bands"
    }
  ]
};
