/* All people, items and places here are fictional test data. */
window.UNILEND_DATA = {
  categories: ["All", "Tech & Chargers", "Textbooks & Notes", "Lab Gear", "Adapters", "Everyday", "Open requests"],

  // Pictures in assets/avatars, one per person. "You" is the participant.
  avatars: { Sam: "avatar-sam", Mei: "avatar-mei", Jordan: "avatar-jordan", Noor: "avatar-noor", Diego: "avatar-diego", Priya: "avatar-priya", Alex: "avatar-alex", You: "avatar-user" },

  zones: [
    { id: "library", name: "Library front desk", note: "Staffed until 9 p.m. Two-minute walk." },
    { id: "student-centre", name: "Student Centre lounge", note: "Busy and well lit. Four-minute walk." },
    { id: "cafe", name: "Campus cafe", note: "Open until 6 p.m. Three-minute walk." }
  ],

  // Items other students offer. `goesUnavailable` drives the recovery state.
  items: [
    { id: "charger-sam", img: "phone-charger", name: "Phone charger (USB-C and Lightning)", short: "phone charger", category: "Tech & Chargers", owner: "Sam", icon: "bolt", demand: "High", points: 25, zone: "library", lends: 14, note: "Two-in-one cable with a wall plug. Works with most phones." },
    { id: "charger-jordan", img: "fast-charger", name: "Fast phone charger (USB-C)", short: "fast phone charger", category: "Tech & Chargers", owner: "Jordan", icon: "bolt", demand: "High", points: 25, zone: "student-centre", lends: 6, note: "30W wall plug and a one-metre cable.", goesUnavailable: true },
    { id: "laptop-mei", img: "laptop-charger", name: "Laptop charger (65W USB-C)", short: "laptop charger", category: "Tech & Chargers", owner: "Mei", icon: "bolt", demand: "High", points: 25, zone: "library", lends: 9, note: "Fits most newer laptops." },
    { id: "hdmi-noor", img: "hdmi-adapter", name: "USB-C to HDMI adapter", short: "HDMI adapter", category: "Adapters", owner: "Noor", icon: "plug", demand: "Medium", points: 15, zone: "cafe", lends: 4, note: "Good for a short presentation." },
    { id: "text-diego", img: "psychology-textbook", name: "Intro to Psychology textbook", short: "psychology textbook", category: "Textbooks & Notes", owner: "Diego", icon: "book", demand: "Medium", points: 15, zone: "library", lends: 3, note: "Latest edition. Light highlighting." },
    { id: "coat-priya", img: "lab-coat", name: "Chemistry lab coat (medium)", short: "lab coat", category: "Lab Gear", owner: "Priya", icon: "flask", demand: "Medium", points: 15, zone: "student-centre", lends: 7, note: "Clean and ready for lab." },
    { id: "umbrella-mei", img: "umbrella", name: "Compact umbrella", short: "umbrella", category: "Everyday", owner: "Mei", icon: "umbrella", demand: "Medium", points: 15, zone: "cafe", lends: 5, note: "Folds down to fit a backpack." }
  ],

  // Items the participant owns.
  myItems: [
    { id: "calc-me", img: "scientific-calculator", name: "Scientific calculator", short: "scientific calculator", category: "Tech & Chargers", icon: "calc", demand: "High", points: 25, note: "Approved for exams." },
    { id: "hdmi-me", img: "hdmi-adapter", name: "HDMI adapter", short: "HDMI adapter", category: "Adapters", icon: "plug", demand: "Medium", points: 15, note: "USB-C to HDMI." },
    { id: "umbrella-me", img: "spare-umbrella", name: "Spare umbrella", short: "spare umbrella", category: "Everyday", icon: "umbrella", demand: "Medium", points: 15, note: "Full size." }
  ],

  // Requests other students have posted to the feed.
  openRequests: [
    { id: "req-alex", who: "Alex", need: "an HDMI adapter", itemId: "hdmi-me", zone: "student-centre", note: "Presentation in 30 minutes. Only need it for 10." },
    { id: "req-priya", who: "Priya", need: "an umbrella", itemId: "umbrella-me", zone: "cafe", note: "It just started raining and I have to cross campus." }
  ],

  leaderboard: {
    Monthly: [
      { name: "Mei", points: 240 },
      { name: "Sam", points: 205 },
      { name: "Noor", points: 160 },
      { name: "Diego", points: 110 },
      { name: "Priya", points: 80 }
    ],
    Yearly: [
      { name: "Sam", points: 1120 },
      { name: "Mei", points: 985 },
      { name: "Priya", points: 730 },
      { name: "Noor", points: 610 },
      { name: "Diego", points: 455 }
    ]
  },

  impact: { itemsShared: 312, classmatesHelped: 148, helpChains: 37 },

  kindnessWall: [
    "Noor lent an adapter to a classmate before a presentation.",
    "Sam passed on help after borrowing a textbook.",
    "Priya lent her lab coat three times this month."
  ],

  points: { returnOnTime: 5, passItOn: 10 }
};
