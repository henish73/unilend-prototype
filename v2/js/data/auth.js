// UniLend v2: Authentication Service & Role-Based Access Control (RBAC)

const AUTH_STORAGE_KEY = "unilend.v2.auth";

export const TEST_ACCOUNTS = {
  admin: {
    uid: "admin_master",
    email: "admin@algomau.ca",
    displayName: "Campus Admin",
    avatar: "avatar-user.svg",
    role: "admin",
    points: 500,
    verified: true
  },
  facilitator: {
    uid: "facilitator_01",
    email: "facilitator@algomau.ca",
    displayName: "P2 Facilitator",
    avatar: "avatar-diego.svg",
    role: "facilitator",
    points: 250,
    verified: true
  },
  student: {
    uid: "p01_test",
    email: "p01@algomau.ca",
    displayName: "Alex (Student)",
    avatar: "avatar-alex.svg",
    role: "student",
    points: 40,
    verified: true
  },
  sam: {
    uid: "demo_sam",
    email: "sam@algomau.ca",
    displayName: "Sam (Peer Lender)",
    avatar: "avatar-sam.svg",
    role: "student",
    points: 120,
    verified: true
  }
};

class AuthService {
  constructor() {
    this.listeners = new Set();
    this.currentUser = this.loadUser();
  }

  loadUser() {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Default to signed-in student
    return TEST_ACCOUNTS.student;
  }

  saveUser(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    this.notify();
  }

  notify() {
    for (const listener of this.listeners) {
      try { listener(this.currentUser); } catch (e) { console.error(e); }
    }
  }

  onAuthStateChanged(callback) {
    this.listeners.add(callback);
    callback(this.currentUser);
    return () => this.listeners.delete(callback);
  }

  getUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  isAdmin() {
    return this.currentUser && (this.currentUser.role === "admin" || this.currentUser.role === "facilitator");
  }

  isFacilitator() {
    return this.currentUser && (this.currentUser.role === "facilitator" || this.currentUser.role === "admin");
  }

  /**
   * Campus Email Authentication
   * Rejects any non-@algomau.ca email address
   */
  async signInWithEmail(email, password = "") {
    const trimmed = (email || "").trim().toLowerCase();
    if (!trimmed.endsWith("@algomau.ca")) {
      throw new Error("Access Denied: Only Algoma University (@algomau.ca) email addresses are permitted.");
    }

    // Role determination
    let role = "student";
    let displayName = trimmed.split("@")[0].replace(/[._]/g, " ");
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    if (trimmed === "admin@algomau.ca") {
      role = "admin";
      displayName = "Campus Admin";
    } else if (trimmed === "facilitator@algomau.ca") {
      role = "facilitator";
      displayName = "Test Facilitator";
    }

    const user = {
      uid: "usr_" + btoa(trimmed).replace(/[^a-zA-Z0-9]/g, "").slice(0, 12),
      email: trimmed,
      displayName,
      avatar: "avatar-user.svg",
      role,
      points: role === "admin" ? 500 : 40,
      verified: true,
      lastLogin: Date.now()
    };

    this.saveUser(user);
    return user;
  }

  /**
   * Quick Switcher for study participants & testing
   */
  switchAccount(accountKey) {
    const acc = TEST_ACCOUNTS[accountKey] || TEST_ACCOUNTS.student;
    this.saveUser({ ...acc, lastLogin: Date.now() });
    return this.currentUser;
  }

  signOut() {
    this.saveUser(null);
  }
}

export const auth = new AuthService();
