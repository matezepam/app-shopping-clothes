export const en = {
  nav: {
    home: "Home",
    men: "Men",
    women: "Women",
    souvenirs: "Souvenirs",
    cart: "Cart",
    login: "Sign in",
    logout: "Sign out",
    wishlist: "Wishlist",
    about: "About",
    privacy: "Privacy",
    history: "Orders",
    admin: "Admin stats",
    returns: "Returns",
  },
  home: {
    badge: "Ecuador memories · Made for travelers",
    title: "Wear the story of Ecuador.",
    subtitle:
      "Caps, apparel, and art inspired by Galapagos, the Andes, Otavalo, and the coast — each piece carries context you can share.",
    ctaShop: "Shop collections",
    ctaConcepts: "Explore concepts",
    sections: "Shop by traveler path",
    conceptsTitle: "Concepts with depth",
    conceptsLead:
      "Every line references a real place. Swap language anytime — we built Eagle for international guests.",
  },
  categories: {
    men: "Men",
    women: "Women",
    souvenirs: "Souvenirs",
    shirts: "T-shirts",
    hoodies: "Hoodies",
    caps: "Caps",
    art: "Art & prints",
  },
  concepts: {
    galapagos: {
      title: "Galápagos",
      desc: "Biodiversity and scientific legacy — subtle nods to endemic species and volcanic shores.",
    },
    quito: {
      title: "Historic Quito",
      desc: "Altitude, colonial geometry, and contemporary energy above the clouds.",
    },
    otavalo: {
      title: "Otavalo",
      desc: "Textile rhythm, market color, and Andean craft traditions reimagined for travel.",
    },
    andes: {
      title: "The Andes",
      desc: "Summits, páramo light, and the long spine of mountains through Ecuador.",
    },
    amazonia: {
      title: "Amazonía",
      desc: "Humidity, green depth, and river stories from the oriente.",
    },
    coast: {
      title: "Pacific coast",
      desc: "Warm light, fishing towns, and easy ocean breeze.",
    },
  },
  products: {
    "galapagos-tee": {
      story:
        "A tee that whispers Darwin’s islands — not a postcard cliché, but a clean graphic story for travelers who walked the lava trails.",
    },
    "quito-hoodie": {
      story:
        "Quito at night, stitched in layers: old stone, new skyline, and the thin air that makes every sunset sharper.",
    },
    "otavalo-cap": {
      story:
        "Pattern language borrowed from market textiles — wearable, minimal, respectful of Otavalo’s weaving heritage.",
    },
    "andes-canvas": {
      story:
        "A wall piece for the memory of cordillera crossings — for guests who want art that still feels like a travel journal.",
    },
    "amazonia-tee-w": {
      story:
        "Mist and canopy translated into a modern silhouette — for travelers who heard the forest before they saw it.",
    },
    "coast-souvenir": {
      story:
        "A small bundle of coast cues: salt, sun-fade palettes, and the calm of Ecuador’s Pacific towns.",
    },
  },
  product: {
    story: "The story",
    add: "Add to cart",
    concept: "Concept",
  },
  cart: {
    title: "Your cart",
    empty: "Your cart is empty.",
    total: "Total",
    checkout: "Checkout",
    note: "Demo checkout creates a real order in the API when you are signed in.",
  },
  auth: {
    title: "Welcome to Eagle",
    register: "Create account",
    login: "Sign in",
    name: "Name",
    email: "Email",
    password: "Password",
    submitLogin: "Sign in",
    submitRegister: "Create account",
    hint: "Admins use a seeded account (see README).",
  },
  history: {
    title: "Order history",
    empty: "No orders yet.",
    date: "Date",
    status: "Status",
    total: "Total",
    returnCta: "Request return",
  },
  returns: {
    title: "My returns",
    empty: "No return requests.",
    reason: "Reason",
    status: "Status",
    qty: "Qty",
  },
  returnForm: {
    title: "Request a return",
    quantity: "Quantity",
    reason: "Reason",
    submit: "Submit request",
    placeholder: "Describe the issue (size, defect, changed mind…)",
  },
  admin: {
    title: "Sales intelligence",
    subtitle: "Top movers, revenue, and return pipeline.",
    top: "Top products",
    units: "Units",
    revenue: "Revenue",
    summaryOrders: "Orders",
    summaryRevenue: "Revenue (USD)",
    summaryUnits: "Units sold",
    summaryReturns: "Returns pending",
    chart: "Revenue (last days)",
    returnsTitle: "Manage returns",
    approve: "Approve",
    reject: "Reject",
    refund: "Mark refunded",
    note: "Admin note",
    forbidden: "You need an admin account to view this page.",
  },
  wishlist: {
    title: "Your wishlist",
    items: "items",
    empty: "Your wishlist is empty. Tap the heart on products you love.",
    ctaHelp: "Checkout will place the saved items as an order.",
    buy: "Checkout wishlist",
  },
  about: {
    title: "About Eagle",
    body:
      "Eagle is a modern souvenir shop designed for travelers. Every piece carries a story from Ecuador—Galápagos, Quito, Otavalo, the Andes, the Amazon, and the coast—so you can wear your trip memories.",
  },
  privacy: {
    title: "Privacy policy",
    body:
      "This is a demo policy. In production, you should describe how you store data, manage accounts, and handle orders, including payment provider terms.",
  },
  common: {
    language: "Language",
    currency: "Currency",
    loginRequired: "Please sign in to continue.",
    loading: "Loading…",
    error: "Something went wrong",
  },
  footer: {
    about: "About",
    aboutLink: "Our story",
    privacyLink: "Privacy policy",
    socials: "Social",
    payments: "Payment",
    paymentHint: "We accept major cards. (Demo)",
  },
} as const;
