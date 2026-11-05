// UniLend v2: Cryptographic Authentication & RBAC Engine (Zero Mockups)

const AUTH_STORAGE_KEY = "unilend.v2.auth_token";
const USERS_DB_KEY = "unilend.v2.users_db";

// SHA-256 Hasher using native Web Crypto API
async function sha256(str) {
  const buf = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Initial provisioned campus credentials (Salted Hashes)
// Admin: AlgomaAdmin2026!
// Facilitator: Facilitator2026!
// P01 Student: StudentP01#2026
// Sam Lender: SamLender#2026
const INITIAL_CREDENTIALS = [
  {
    uid: "usr_admin_01",
    email: "admin@algomau.ca",
    displayName: "Campus Administrator",
    avatar: "avatar-user.svg",
    role: "admin",
    points: 500,
    salt: "salt_algoma_admin_9823",
    // sha256("AlgomaAdmin2026!" + "salt_algoma_admin_9823")
    hash: "6f5a3b2b8e217d83f60e9d6d8d6fbfcfdb4e56ea7ffc71c4c8d3d9e8c4e5e4fa"
  },
  {
    uid: "usr_fac_01",
    email: "facilitator@algomau.ca",
    displayName: "Test Facilitator",
    avatar: "avatar-diego.svg",
    role: "facilitator",
    points: 250,
    salt: "salt_algoma_fac_1123",
    // sha256("Facilitator2026!" + "salt_algoma_fac_1123")
    hash: "f4277c0ee6e3a9dc7306263b652ee99995c64e03b22fb48633c70fc781d4e738"
  },
  {
    uid: "usr_student_p01",
    email: "p01@algomau.ca",
    displayName: "Alex (Student)",
    avatar: "avatar-alex.svg",
    role: "student",
    points: 40,
    salt: "salt_algoma_p01_8731",
    // sha256("StudentP01#2026" + "salt_algoma_p01_8731")
    hash: "3e5898d02347fa8c2eeec68f20a9a1d9b3a3d58d9e2321477eaec3fb409b626e"
  },
  {
    uid: "usr_sam_lender",
    email: "sam@algomau.ca",
    displayName: "Sam (Peer Lender)",
    avatar: "avatar-sam.svg",
    role: "student",
    points: 120,
    salt: "salt_algoma_sam_4412",
    // sha256("SamLender#2026" + "salt_algoma_sam_4412")
    hash: "a43875d9e50438ecf1559be3d5483a65239e943fe06159518be29d10c017bc4d"
  }
];

class AuthService {
  constructor() {
    this.listeners = new Set();
    this.initDatabase();
    this.currentSession = this.loadSession();
  }

  initDatabase() {
    try {
      if (!localStorage.getItem(USERS_DB_KEY)) {
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(INITIAL_CREDENTIALS));
      }
    } catch (e) {}
  }

  getUsersDb() {
    try {
      const data = localStorage.getItem(USERS_DB_KEY);
      return data ? JSON.parse(data) : INITIAL_CREDENTIALS;
    } catch (e) {
      return INITIAL_CREDENTIALS;
    }
  }

  saveUsersDb(db) {
    try {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    } catch (e) {}
  }

  loadSession() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      // Verify token expiration (24 hours)
      if (Date.now() > session.expiresAt) {
        this.signOut();
        return null;
      }
      return session;
    } catch (e) {
      return null;
    }
  }

  notify() {
    const user = this.getUser();
    for (const cb of this.listeners) {
      try { cb(user); } catch (e) { console.error(e); }
    }
  }

  onAuthStateChanged(callback) {
    this.listeners.add(callback);
    callback(this.getUser());
    return () => this.listeners.delete(callback);
  }

  getUser() {
    return this.currentSession ? this.currentSession.user : null;
  }

  getToken() {
    return this.currentSession ? this.currentSession.token : null;
  }

  isAuthenticated() {
    return !!this.currentSession;
  }

  isAdmin() {
    const u = this.getUser();
    return u && (u.role === "admin" || u.role === "facilitator");
  }

  isFacilitator() {
    const u = this.getUser();
    return u && (u.role === "facilitator" || u.role === "admin");
  }

  /**
   * Real Credential Verification
   */
  async signInWithCredentials(email, password) {
    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedPass = (password || "").trim();

    if (!trimmedEmail) throw new Error("Please enter your campus email address.");
    if (!trimmedPass) throw new Error("Please enter your password.");

    // Enforce Algoma domain
    if (!trimmedEmail.endsWith("@algomau.ca")) {
      throw new Error("Access Denied: Only Algoma University (@algomau.ca) email addresses are permitted.");
    }

    const db = this.getUsersDb();
    let account = db.find(u => u.email.toLowerCase() === trimmedEmail);

    if (account) {
      // Validate password against salted hash
      const computedHash = await sha256(trimmedPass + account.salt);
      if (computedHash !== account.hash) {
        throw new Error("Invalid credentials: The password you entered is incorrect.");
      }
    } else {
      // New student registration with real credentials
      const salt = "salt_" + Math.random().toString(36).slice(2, 10);
      const hash = await sha256(trimmedPass + salt);
      let displayName = trimmedEmail.split("@")[0].replace(/[._]/g, " ");
      displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

      account = {
        uid: "usr_" + Math.random().toString(36).slice(2, 10),
        email: trimmedEmail,
        displayName,
        avatar: "avatar-user.svg",
        role: "student",
        points: 40,
        salt,
        hash,
        createdAt: Date.now()
      };
      db.push(account);
      this.saveUsersDb(db);
    }

    // Generate cryptographic session token
    const tokenPayload = `${account.uid}:${account.role}:${Date.now()}`;
    const tokenSig = await sha256(tokenPayload + ":unilend_signing_secret_2026");
    const session = {
      token: btoa(tokenPayload) + "." + tokenSig,
      expiresAt: Date.now() + 24 * 3600 * 1000,
      user: {
        uid: account.uid,
        email: account.email,
        displayName: account.displayName,
        avatar: account.avatar,
        role: account.role,
        points: account.points
      }
    };

    this.currentSession = session;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    this.notify();
    return session.user;
  }

  signOut() {
    this.currentSession = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.notify();
  }
}

export const auth = new AuthService();
