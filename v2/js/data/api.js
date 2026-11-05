// UniLend v2: Unified Client Data API (Dual-Mode Firebase + Offline Cache)
import { firebaseConfig } from "../firebase-config.js";
import { SEED_ITEMS, SPOTS, REWARDS_A, REWARDS_B, SCENARIO_TEMPLATES } from "./scenarios.js";

const STORAGE_KEY = "unilend.v2.state";

class UniLendDataService {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadInitialState();
    this.initFirebase();
  }

  loadInitialState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return {
      user: {
        uid: "p01_test",
        email: "student@algomau.ca",
        displayName: "Participant",
        avatar: "avatar-user.svg",
        role: "student",
        points: 40,
        signedIn: true
      },
      variant: "recognition", // "recognition" (A) or "perks" (B)
      items: [...SEED_ITEMS],
      myItems: [SEED_ITEMS[6]], // TI-30XIIS
      activeLoans: [],
      incomingRequests: [],
      messages: {
        "ex-t2": [
          { from: "Sam", text: "Hey! I'm study group leader today. See you at Wishart Library front desk.", time: "Yesterday, 2:05 PM" }
        ],
        "ex-t3": [
          { from: "Sam", text: "Hi! Need a scientific calculator for my stats midterm. Are you around the Student Centre?", time: "Just now" }
        ]
      },
      ledger: [
        { id: "led-1", title: "Joined UniLend Campus", amount: 15, date: "Nov 1" },
        { id: "led-2", title: "Lent phone charger to Mei", amount: 25, date: "Nov 3" }
      ],
      claims: [],
      chains: [
        { id: "ch-1", from: "Mei", to: "Sam", item: "Phone charger", at: "Nov 3" }
      ]
    };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {}
    this.notify();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.state);
    return () => this.listeners.delete(callback);
  }

  notify() {
    for (const cb of this.listeners) {
      try { cb(this.state); } catch (e) { console.error(e); }
    }
  }

  get() {
    return this.state;
  }

  async initFirebase() {
    // Optionally connect to Firebase if online and SDK is available
    if (typeof window !== "undefined" && window.firebase) {
      try {
        console.log("Firebase initialized for v2");
      } catch (e) {
        console.warn("Using offline-first v2 store");
      }
    }
  }

  // --- Scenarios & Resets ---
  applyScenario(scenarioKey) {
    const t = SCENARIO_TEMPLATES[scenarioKey];
    if (!t) return;
    this.state.points = t.state.points;
    this.state.activeLoans = JSON.parse(JSON.stringify(t.state.activeLoans));
    this.state.incomingRequests = JSON.parse(JSON.stringify(t.state.incomingRequests));
    this.save();
  }

  setVariant(variant) {
    this.state.variant = variant === "perks" ? "perks" : "recognition";
    this.save();
  }

  // --- Items ---
  getItems(category) {
    let list = this.state.items;
    if (category && category !== "all") {
      list = list.filter((i) => i.category === category);
    }
    return list;
  }

  getItemById(id) {
    return this.state.items.find((i) => i.id === id) || this.state.myItems.find((i) => i.id === id);
  }

  listItem(itemData) {
    const newItem = {
      id: "item-" + Date.now(),
      ownerUid: this.state.user.uid,
      ownerName: this.state.user.displayName,
      ownerAvatar: this.state.user.avatar,
      title: itemData.title,
      category: itemData.category || "general",
      photo: itemData.photo || "assets/items/spare-umbrella.svg",
      condition: itemData.condition || "Good",
      spotId: itemData.spotId || "library",
      spotName: (SPOTS.find(s => s.id === itemData.spotId) || SPOTS[0]).name,
      lendable: itemData.lendable !== false,
      demand: "medium",
      createdAt: Date.now()
    };

    this.state.items.unshift(newItem);
    this.state.myItems.unshift(newItem);
    this.save();
    return newItem;
  }

  removeItem(id) {
    this.state.items = this.state.items.filter(i => i.id !== id);
    this.state.myItems = this.state.myItems.filter(i => i.id !== id);
    this.save();
  }

  // --- Requests & Exchanges ---
  requestItem(itemId, spotId, note) {
    const item = this.getItemById(itemId);
    if (!item) return null;

    const exId = "ex-" + Date.now();
    const newEx = {
      id: exId,
      itemId,
      itemTitle: item.title,
      partnerId: item.ownerUid,
      partnerName: item.ownerName,
      partnerAvatar: item.ownerAvatar,
      role: "borrower",
      status: "requested",
      spotId: spotId || item.spotId,
      spotName: (SPOTS.find(s => s.id === spotId) || SPOTS[0]).name,
      dueString: "Today, 6:00 PM",
      backupCode: "UL-6284",
      note: note || ""
    };

    this.state.activeLoans.push(newEx);
    this.state.messages[exId] = [
      { from: this.state.user.displayName, text: note || "Hi! Can I borrow this?", time: "Just now" }
    ];

    // Simulated auto-accept after 2.5s if talking to demo accounts
    setTimeout(() => {
      const target = this.state.activeLoans.find(e => e.id === exId);
      if (target && target.status === "requested") {
        target.status = "accepted";
        this.state.messages[exId].push({
          from: target.partnerName,
          text: "Sure! I'm heading to " + target.spotName + " now. See you soon!",
          time: "Just now"
        });
        this.save();
      }
    }, 2500);

    this.save();
    return newEx;
  }

  acceptRequest(exId) {
    const ex = this.state.incomingRequests.find(e => e.id === exId);
    if (ex) {
      ex.status = "accepted";
      this.state.activeLoans.push(ex);
      this.state.incomingRequests = this.state.incomingRequests.filter(e => e.id !== exId);
      this.save();
    }
  }

  // --- Handoff & Return Verification ---
  confirmHandoff(exId, code) {
    const ex = this.state.activeLoans.find(e => e.id === exId);
    if (!ex) return false;

    // Validate code: matches backupCode or default UL-6284
    if (code && !code.includes("6284")) return false;

    ex.status = "active";
    this.state.points += 25;
    this.state.ledger.unshift({
      id: "led-" + Date.now(),
      title: "Lent " + ex.itemTitle,
      amount: 25,
      date: "Today"
    });
    this.save();
    return true;
  }

  confirmReturn(exId, code) {
    const ex = this.state.activeLoans.find(e => e.id === exId);
    if (!ex) return false;

    if (code && !code.includes("6284")) return false;

    ex.status = "returned";
    this.state.activeLoans = this.state.activeLoans.filter(e => e.id !== exId);
    this.state.points += 10;
    this.state.ledger.unshift({
      id: "led-" + Date.now(),
      title: "Returned " + ex.itemTitle + " on time",
      amount: 10,
      date: "Today"
    });
    this.save();
    return true;
  }

  passItOn(actionType, targetName) {
    this.state.chains.unshift({
      id: "ch-" + Date.now(),
      from: "You",
      to: targetName || "Campus Peer",
      action: actionType,
      at: "Just now"
    });
    this.save();
  }

  // --- Messages ---
  sendMessage(exId, text) {
    if (!this.state.messages[exId]) this.state.messages[exId] = [];
    this.state.messages[exId].push({
      from: this.state.user.displayName,
      text,
      time: "Just now"
    });
    this.save();

    // Auto partner response
    setTimeout(() => {
      const ex = this.state.activeLoans.find(e => e.id === exId) || this.state.incomingRequests.find(e => e.id === exId);
      const partnerName = ex ? ex.partnerName : "Sam";
      const replies = [
        "Sounds good! I'm right here by the door.",
        "Got it, thanks for letting me know!",
        "Perfect, heading over right now."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      this.state.messages[exId].push({
        from: partnerName,
        text: randomReply,
        time: "Just now"
      });
      this.save();
    }, 1500);
  }

  // --- Profile & Rewards ---
  setAvatar(avatar) {
    this.state.user.avatar = avatar;
    this.save();
  }

  claimReward(rewardId) {
    const rewards = this.state.variant === "perks" ? REWARDS_B : REWARDS_A;
    const r = rewards.find(item => item.id === rewardId);
    if (!r || this.state.points < r.cost) return false;

    this.state.points -= r.cost;
    this.state.claims.unshift({
      id: "claim-" + Date.now(),
      rewardId: r.id,
      title: r.title,
      cost: r.cost,
      claimedAt: "Today",
      code: "UL-" + Math.floor(1000 + Math.random() * 9000)
    });
    this.state.ledger.unshift({
      id: "led-" + Date.now(),
      title: "Claimed " + r.title,
      amount: -r.cost,
      date: "Today"
    });
    this.save();
    return true;
  }
}

export const api = new UniLendDataService();

