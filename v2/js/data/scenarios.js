// UniLend v2 Scenario Templates & Seed Data

export const SEED_ITEMS = [
  {
    id: "charger-sam",
    ownerUid: "demo_sam",
    ownerName: "Sam",
    ownerAvatar: "avatar-sam.svg",
    title: "Phone charger (USB-C & Lightning)",
    category: "chargers",
    photo: "assets/items/phone-charger.svg",
    condition: "Good",
    spotId: "library",
    spotName: "Wishart Library Front Desk",
    lendable: true,
    demand: "high",
    createdAt: Date.now() - 86400000
  },
  {
    id: "charger-jordan",
    ownerUid: "demo_jordan",
    ownerName: "Jordan",
    ownerAvatar: "avatar-jordan.svg",
    title: "Fast USB-C laptop charger (65W)",
    category: "chargers",
    photo: "assets/items/fast-charger.svg",
    condition: "Like new",
    spotId: "student_centre",
    spotName: "Student Centre Lounge",
    lendable: false, // For unavailable flow
    demand: "high",
    createdAt: Date.now() - 72000000
  },
  {
    id: "adapter-mei",
    ownerUid: "demo_mei",
    ownerName: "Mei",
    ownerAvatar: "avatar-mei.svg",
    title: "HDMI to USB-C display adapter",
    category: "cables",
    photo: "assets/items/hdmi-adapter.svg",
    condition: "Good",
    spotId: "cafe",
    spotName: "Morning Star Cafe",
    lendable: true,
    demand: "medium",
    createdAt: Date.now() - 50000000
  },
  {
    id: "textbook-noor",
    ownerUid: "demo_noor",
    ownerName: "Noor",
    ownerAvatar: "avatar-noor.svg",
    title: "Introductory Psychology (PSYC 1106)",
    category: "books",
    photo: "assets/items/psychology-textbook.svg",
    condition: "Highlighted",
    spotId: "library",
    spotName: "Wishart Library Front Desk",
    lendable: true,
    demand: "high",
    createdAt: Date.now() - 40000000
  },
  {
    id: "labcoat-diego",
    ownerUid: "demo_diego",
    ownerName: "Diego",
    ownerAvatar: "avatar-diego.svg",
    title: "Chemistry lab coat (Size M, white)",
    category: "lab",
    photo: "assets/items/lab-coat.svg",
    condition: "Clean",
    spotId: "student_centre",
    spotName: "Student Centre Lounge",
    lendable: true,
    demand: "low",
    createdAt: Date.now() - 30000000
  },
  {
    id: "umbrella-priya",
    ownerUid: "demo_priya",
    ownerName: "Priya",
    ownerAvatar: "avatar-priya.svg",
    title: "Compact windproof umbrella",
    category: "general",
    photo: "assets/items/umbrella.svg",
    condition: "Good",
    spotId: "cafe",
    spotName: "Morning Star Cafe",
    lendable: true,
    demand: "high",
    createdAt: Date.now() - 20000000
  },
  {
    id: "calc-user",
    ownerUid: "me",
    ownerName: "You",
    ownerAvatar: "avatar-user.svg",
    title: "Scientific calculator (TI-30XIIS)",
    category: "calculators",
    photo: "assets/items/scientific-calculator.svg",
    condition: "Like new",
    spotId: "student_centre",
    spotName: "Student Centre Lounge",
    lendable: true,
    demand: "high",
    createdAt: Date.now() - 10000000
  }
];

export const SPOTS = [
  { id: "library", name: "Wishart Library Front Desk", icon: "assets/zones/zone-library.svg", desc: "Staffed pickup counter, ground floor" },
  { id: "student_centre", name: "Student Centre Lounge", icon: "assets/zones/zone-student-centre.svg", desc: "Main floor seating area by the fireplace" },
  { id: "cafe", name: "Morning Star Cafe", icon: "assets/zones/zone-cafe.svg", desc: "Common lobby entrance near counter" }
];

export const REWARDS_A = [
  { id: "badge", title: "Campus Contributor Badge", cost: 50, icon: "assets/rewards/reward-badge.svg", desc: "Verified profile badge shown across campus" },
  { id: "priority", title: "Priority Borrowing (7 days)", cost: 40, icon: "assets/rewards/reward-priority.svg", desc: "Jump to the top of borrower queues" },
  { id: "donate", title: "Donate $5 to Campus Food Pantry", cost: 60, icon: "assets/rewards/reward-donate.svg", desc: "Algoma University Student Food Security Fund" }
];

export const REWARDS_B = [
  ...REWARDS_A,
  { id: "coffee", title: "$5 Morning Star Cafe Voucher", cost: 75, icon: "assets/rewards/reward-coffee.svg", desc: "Redeemable at the campus coffee shop" },
  { id: "bookstore", title: "10% Off Algoma Bookstore", cost: 90, icon: "assets/rewards/reward-bookstore.svg", desc: "Valid on campus merchandise and supplies" }
];

export const SCENARIO_TEMPLATES = {
  t1: {
    name: "Task 1: Fresh Participant",
    desc: "Signed in, 15 points, ready to find and borrow a charger.",
    state: {
      points: 15,
      activeLoans: [],
      incomingRequests: []
    }
  },
  t2: {
    name: "Task 2: Active Loan to Return",
    desc: "Borrowed phone charger from Sam yesterday, due in 4 hours.",
    state: {
      points: 40,
      activeLoans: [
        {
          id: "ex-t2",
          itemId: "charger-sam",
          itemTitle: "Phone charger (USB-C & Lightning)",
          partnerId: "demo_sam",
          partnerName: "Sam",
          partnerAvatar: "avatar-sam.svg",
          role: "borrower",
          status: "active",
          spotId: "library",
          spotName: "Wishart Library Front Desk",
          dueString: "Today, 6:00 PM",
          backupCode: "UL-6284"
        }
      ],
      incomingRequests: []
    }
  },
  t3: {
    name: "Task 3: Incoming Request to Lend",
    desc: "Sam requested scientific calculator, ready to accept and hand off.",
    state: {
      points: 65,
      activeLoans: [],
      incomingRequests: [
        {
          id: "ex-t3",
          itemId: "calc-user",
          itemTitle: "Scientific calculator (TI-30XIIS)",
          partnerId: "demo_sam",
          partnerName: "Sam",
          partnerAvatar: "avatar-sam.svg",
          role: "lender",
          status: "requested",
          spotId: "student_centre",
          spotName: "Student Centre Lounge",
          backupCode: "UL-6284"
        }
      ]
    }
  },
  late: {
    name: "Overdue Loan State",
    desc: "Loan past due time with no penalty and one-tap extension.",
    state: {
      points: 30,
      activeLoans: [
        {
          id: "ex-late",
          itemId: "charger-sam",
          itemTitle: "Phone charger (USB-C & Lightning)",
          partnerId: "demo_sam",
          partnerName: "Sam",
          partnerAvatar: "avatar-sam.svg",
          role: "borrower",
          status: "overdue",
          spotId: "library",
          spotName: "Wishart Library Front Desk",
          dueString: "Yesterday, 6:00 PM",
          backupCode: "UL-6284"
        }
      ],
      incomingRequests: []
    }
  }
};

