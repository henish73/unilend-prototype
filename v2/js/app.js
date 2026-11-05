// UniLend v2: Main Application Controller
import { api } from "./data/api.js";
import { auth } from "./data/auth.js";
import { SPOTS, REWARDS_A, REWARDS_B } from "./data/scenarios.js";

const AVATARS = [
  "avatar-sam.svg", "avatar-jordan.svg", "avatar-mei.svg", "avatar-noor.svg",
  "avatar-diego.svg", "avatar-priya.svg", "avatar-alex.svg", "avatar-user.svg"
];

let currentCat = "all";
let currentSearch = "";
let selectedItemId = null;
let activeExchangeId = null;

function init() {
  bindTabs();
  bindSearch();
  bindCategories();
  bindListItemModal();
  bindAvatarPicker();
  bindAuth();

  // Listen to Auth changes
  auth.onAuthStateChanged((user) => {
    updateAuthUI(user);
    if (user) {
      api.state.user = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role,
        points: user.points,
        signedIn: true
      };
      api.notify();
    }
  });

  // Listen to API store changes
  api.subscribe((state) => {
    renderHeader(state);
    renderFeed(state);
    renderActivity(state);
    renderRewards(state);
    renderProfile(state);
    if (activeExchangeId) {
      renderExchangeDetail(activeExchangeId);
    } else if (selectedItemId) {
      renderItemDetail(selectedItemId);
    }
  });

  // Check URL params for starting scenario
  const params = new URLSearchParams(location.search);
  const start = params.get("start");
  if (start && ["t1", "t2", "t3", "late"].includes(start)) {
    api.applyScenario(start);
  }
}

function updateAuthUI(user) {
  const headerPoints = document.getElementById("header-points");
  const avatarBtn = document.getElementById("avatar-btn");
  const btnHeaderSignin = document.getElementById("btn-header-signin");
  const headerAdminLink = document.getElementById("header-admin-link");
  const profileAdminLink = document.getElementById("profile-admin-link");
  const profileRoleBadge = document.getElementById("profile-role-badge");

  if (!user) {
    if (headerPoints) headerPoints.style.display = "none";
    if (avatarBtn) avatarBtn.style.display = "none";
    if (btnHeaderSignin) btnHeaderSignin.style.display = "block";
    if (headerAdminLink) headerAdminLink.style.display = "none";
    if (profileAdminLink) profileAdminLink.style.display = "none";
    return;
  }

  if (headerPoints) headerPoints.style.display = "flex";
  if (avatarBtn) avatarBtn.style.display = "flex";
  if (btnHeaderSignin) btnHeaderSignin.style.display = "none";

  const isAdminOrFacilitator = auth.isAdmin();
  if (headerAdminLink) headerAdminLink.style.display = isAdminOrFacilitator ? "inline-block" : "none";
  if (profileAdminLink) profileAdminLink.style.display = isAdminOrFacilitator ? "block" : "none";

  if (profileRoleBadge) {
    profileRoleBadge.textContent = user.role.toUpperCase();
    if (user.role === "admin") {
      profileRoleBadge.style.background = "var(--danger)";
      profileRoleBadge.style.color = "#FFF";
    } else if (user.role === "facilitator") {
      profileRoleBadge.style.background = "#2C5E50";
      profileRoleBadge.style.color = "#FFF";
    } else {
      profileRoleBadge.style.background = "rgba(11,79,67,0.1)";
      profileRoleBadge.style.color = "var(--brand)";
    }
  }

  const profileEmail = document.getElementById("profile-email");
  if (profileEmail) profileEmail.textContent = user.email;

  const profileAuthEmail = document.getElementById("profile-auth-email");
  if (profileAuthEmail) profileAuthEmail.textContent = user.email;

  const profileAuthRole = document.getElementById("profile-auth-role");
  if (profileAuthRole) profileAuthRole.textContent = `${user.role.toUpperCase()} (RBAC Verified)`;
}

function bindAuth() {
  const modal = document.getElementById("modal-auth");
  const closeBtn = document.getElementById("close-auth-modal");
  const form = document.getElementById("form-auth-login");
  const errorBox = document.getElementById("auth-error-box");
  const signinBtn = document.getElementById("btn-header-signin");
  const signoutBtn = document.getElementById("btn-profile-signout");

  const openModal = () => {
    errorBox.style.display = "none";
    modal.style.display = "flex";
  };
  const closeModal = () => { modal.style.display = "none"; };

  signinBtn?.addEventListener("click", openModal);
  closeBtn?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.style.display = "none";
    const email = document.getElementById("auth-email-input").value;
    const pass = document.getElementById("auth-pass-input").value;

    try {
      await auth.signInWithCredentials(email, pass);
      closeModal();
      form.reset();
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.style.display = "block";
    }
  });

  signoutBtn?.addEventListener("click", () => {
    auth.signOut();
    openModal();
  });
}

function renderHeader(state) {
  document.getElementById("user-points-val").textContent = state.points + " pts";
  document.getElementById("user-avatar-img").src = "assets/avatars/" + state.user.avatar;
}

function bindTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.getAttribute("data-tab");

      document.getElementById("view-feed").style.display = tab === "feed" ? "flex" : "none";
      document.getElementById("view-activity").style.display = tab === "activity" ? "flex" : "none";
      document.getElementById("view-rewards").style.display = tab === "rewards" ? "flex" : "none";
      document.getElementById("view-profile").style.display = tab === "profile" ? "flex" : "none";
    });
  });

  document.getElementById("avatar-btn").addEventListener("click", () => {
    document.querySelector('.tab-btn[data-tab="profile"]').click();
  });
}

function bindSearch() {
  const searchInput = document.getElementById("feed-search");
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value.toLowerCase().trim();
    renderFeed(api.get());
  });
}

function bindCategories() {
  document.querySelectorAll(".chip-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".chip-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCat = btn.getAttribute("data-cat");
      renderFeed(api.get());
    });
  });
}

function renderFeed(state) {
  const container = document.getElementById("item-list-container");
  container.innerHTML = "";

  let items = api.getItems(currentCat);
  if (currentSearch) {
    items = items.filter(i => i.title.toLowerCase().includes(currentSearch) || i.category.toLowerCase().includes(currentSearch));
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:32px 16px; color:var(--soft);">
        <img src="assets/illustrations/empty-search.svg" style="max-width:140px; margin-bottom:12px;">
        <p>No campus items match your search.</p>
      </div>`;
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <img src="${item.photo}" class="item-thumb" alt="${item.title}">
      <div class="item-meta">
        <div>
          <div class="item-status-tag">${item.lendable ? "Available" : "On Loan"}</div>
          <h3 class="item-title" style="margin-top:4px;">${item.title}</h3>
        </div>
        <div class="item-sub">
          <img src="assets/avatars/${item.ownerAvatar}" style="width:20px; height:20px; border-radius:50%;">
          <span>${item.ownerName}</span> &bull; <span>${item.spotName}</span>
        </div>
      </div>
    `;
    card.addEventListener("click", () => {
      selectedItemId = item.id;
      activeExchangeId = null;
      renderItemDetail(item.id);
    });
    container.appendChild(card);
  });
}

function renderItemDetail(itemId) {
  const item = api.getItemById(itemId);
  const container = document.getElementById("detail-content");
  if (!item) return;

  container.innerHTML = `
    <img src="${item.photo}" class="detail-img" alt="${item.title}">
    <div>
      <div class="item-status-tag" style="margin-bottom:6px;">${item.lendable ? "Available Now" : "Currently On Loan"}</div>
      <h2 style="font-size:1.4rem; font-weight:800;">${item.title}</h2>
      <p style="color:var(--soft); font-size:0.95rem; margin-top:4px;">Condition: <strong>${item.condition}</strong></p>
    </div>

    <div style="background:var(--paper); border:1px solid var(--line); border-radius:var(--radius); padding:14px; display:flex; align-items:center; gap:12px;">
      <img src="assets/avatars/${item.ownerAvatar}" style="width:44px; height:44px; border-radius:50%;">
      <div>
        <div style="font-weight:700;">${item.ownerName} (Algoma Student)</div>
        <div style="color:var(--soft); font-size:0.85rem;">Usually meets at ${item.spotName}</div>
      </div>
    </div>

    <div style="margin-top:10px;">
      <label style="font-size:0.85rem; font-weight:700; display:block; margin-bottom:6px;">Choose Pickup Spot</label>
      <select id="req-pickup-spot" class="search-input" style="width:100%; margin-bottom:12px;">
        ${SPOTS.map(s => `<option value="${s.id}" ${s.id === item.spotId ? "selected" : ""}>${s.name}</option>`).join("")}
      </select>
      <button class="primary-btn" id="btn-submit-request" style="width:100%;" ${!item.lendable ? "disabled" : ""}>
        ${item.lendable ? "Request to Borrow Item" : "Item Unavailable"}
      </button>
    </div>
  `;

  document.getElementById("btn-submit-request")?.addEventListener("click", () => {
    if (!auth.isAuthenticated()) {
      document.getElementById("modal-auth").style.display = "flex";
      return;
    }
    const spot = document.getElementById("req-pickup-spot").value;
    const ex = api.requestItem(item.id, spot, "Hi! Can I borrow this?");
    if (ex) {
      activeExchangeId = ex.id;
      selectedItemId = null;
      renderExchangeDetail(ex.id);
    }
  });
}

function renderActivity(state) {
  const container = document.getElementById("active-loans-list");
  container.innerHTML = "";

  const allActive = [...state.activeLoans, ...state.incomingRequests];
  if (allActive.length === 0) {
    container.innerHTML = `<p style="color:var(--soft); font-size:0.9rem;">No active exchanges right now.</p>`;
  } else {
    allActive.forEach((ex) => {
      const card = document.createElement("div");
      card.className = "item-card";
      card.innerHTML = `
        <div class="item-meta">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <span class="item-status-tag">${ex.status.toUpperCase()}</span>
              <h3 class="item-title" style="margin-top:4px;">${ex.itemTitle}</h3>
            </div>
            <span style="font-size:0.8rem; font-weight:700; color:var(--soft);">${ex.dueString || "Active"}</span>
          </div>
          <div class="item-sub" style="margin-top:10px;">
            <img src="assets/avatars/${ex.partnerAvatar}" style="width:20px; height:20px; border-radius:50%;">
            <span>${ex.role === "borrower" ? "Lender: " : "Borrower: "} ${ex.partnerName}</span> &bull; <span>${ex.spotName}</span>
          </div>
        </div>
      `;
      card.addEventListener("click", () => {
        activeExchangeId = ex.id;
        selectedItemId = null;
        renderExchangeDetail(ex.id);
      });
      container.appendChild(card);
    });
  }

  // Render Ledger History
  const ledgerContainer = document.getElementById("ledger-history-list");
  ledgerContainer.innerHTML = "";
  state.ledger.forEach((entry) => {
    const row = document.createElement("div");
    row.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:var(--card); padding:10px 14px; border:1px solid var(--line); border-radius:8px;";
    row.innerHTML = `
      <div>
        <div style="font-weight:700; font-size:0.9rem;">${entry.title}</div>
        <div style="color:var(--soft); font-size:0.75rem;">${entry.date}</div>
      </div>
      <div style="font-weight:800; font-size:0.95rem; color:${entry.amount > 0 ? "var(--brand)" : "var(--danger)"};">
        ${entry.amount > 0 ? "+" + entry.amount : entry.amount} pts
      </div>
    `;
    ledgerContainer.appendChild(row);
  });
}

function renderExchangeDetail(exId) {
  const state = api.get();
  const ex = state.activeLoans.find(e => e.id === exId) || state.incomingRequests.find(e => e.id === exId);
  const container = document.getElementById("detail-content");
  if (!ex) return;

  const messages = state.messages[ex.id] || [];

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <span class="item-status-tag">${ex.status.toUpperCase()}</span>
      <span style="font-size:0.85rem; font-weight:700; color:var(--soft);">${ex.dueString || "Campus Exchange"}</span>
    </div>

    <h2 style="font-size:1.35rem; font-weight:800; margin-top:4px;">${ex.itemTitle}</h2>

    <div style="background:var(--paper); border:1px solid var(--line); border-radius:var(--radius); padding:12px; display:flex; align-items:center; gap:12px;">
      <img src="assets/avatars/${ex.partnerAvatar}" style="width:40px; height:40px; border-radius:50%;">
      <div>
        <div style="font-weight:700; font-size:0.9rem;">Partner: ${ex.partnerName}</div>
        <div style="color:var(--soft); font-size:0.8rem;">Meeting spot: ${ex.spotName}</div>
      </div>
    </div>

    <!-- Action Section based on status -->
    <div id="exchange-actions" style="display:flex; flex-direction:column; gap:8px;">
      ${ex.status === "requested" && ex.role === "lender" ? `
        <button class="primary-btn" id="btn-accept-request">Accept Request</button>
      ` : ex.status === "requested" && ex.role === "borrower" ? `
        <p style="font-size:0.85rem; color:var(--soft);">Waiting for ${ex.partnerName} to accept…</p>
      ` : ex.status === "accepted" ? `
        <button class="primary-btn" id="btn-confirm-handoff">Confirm Hand-off (Scan QR)</button>
      ` : ex.status === "active" || ex.status === "overdue" ? `
        <button class="primary-btn" id="btn-confirm-return">Confirm Return (Scan QR)</button>
      ` : `
        <p style="font-size:0.85rem; color:var(--brand); font-weight:700;">Exchange completed!</p>
      `}
    </div>

    <!-- In-Exchange Live Chat -->
    <div class="chat-thread-container" style="margin-top:12px;">
      <div style="padding:10px 14px; background:var(--card); font-weight:700; font-size:0.85rem; border-bottom:1px solid var(--line);">
        In-Exchange Chat with ${ex.partnerName}
      </div>
      <div class="chat-messages" id="chat-messages-box">
        ${messages.map(m => `
          <div class="chat-bubble ${m.from === state.user.displayName ? "mine" : "other"}">
            <div style="font-size:0.75rem; opacity:0.8; margin-bottom:2px;">${m.from}</div>
            <div>${m.text}</div>
          </div>
        `).join("")}
      </div>
      <div class="chat-input-bar">
        <input type="text" id="chat-text-input" class="chat-text-input" placeholder="Type a message…">
        <button class="primary-btn" id="chat-send-btn" style="min-height:42px; padding:0 14px;">Send</button>
      </div>
    </div>
  `;

  // Bind Chat
  const chatInput = document.getElementById("chat-text-input");
  const sendBtn = document.getElementById("chat-send-btn");
  const doSend = () => {
    const val = chatInput.value.trim();
    if (val) {
      api.sendMessage(ex.id, val);
      chatInput.value = "";
    }
  };
  sendBtn.addEventListener("click", doSend);
  chatInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doSend(); });

  // Bind Actions
  document.getElementById("btn-accept-request")?.addEventListener("click", () => {
    api.acceptRequest(ex.id);
  });

  document.getElementById("btn-confirm-handoff")?.addEventListener("click", () => {
    showScanModal(ex, "handoff");
  });

  document.getElementById("btn-confirm-return")?.addEventListener("click", () => {
    showScanModal(ex, "return");
  });
}

function showScanModal(ex, kind) {
  const modal = document.createElement("div");
  modal.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:300; display:flex; align-items:center; justify-content:center; padding:16px;";
  modal.innerHTML = `
    <div style="background:var(--card); width:100%; max-width:440px; border-radius:var(--radius); padding:20px;">
      <h2 style="font-size:1.25rem; font-weight:800; margin-bottom:4px;">${kind === "handoff" ? "Confirm Hand-off" : "Confirm Return"}</h2>
      <p style="font-size:0.85rem; color:var(--soft); margin-bottom:14px;">Scan ${ex.partnerName}'s QR code or use backup code <strong>UL-6284</strong>.</p>
      
      <div class="viewfinder-card">
        <img src="assets/illustrations/scan-qr.svg" style="width:140px; opacity:0.85;" alt="QR Scanner">
        <div class="viewfinder-scanline"></div>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px; margin-top:16px;">
        <button class="primary-btn" id="btn-simulate-scan">Simulate Scan QR</button>
        <button class="secondary-btn" id="btn-use-backup">Use Backup Code (UL-6284)</button>
        <button style="background:none; border:none; color:var(--soft); font-weight:600; cursor:pointer;" id="btn-cancel-scan">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const finish = (success) => {
    if (success) {
      if (kind === "handoff") api.confirmHandoff(ex.id, "6284");
      else api.confirmReturn(ex.id, "6284");
    }
    modal.remove();
  };

  modal.querySelector("#btn-simulate-scan").addEventListener("click", () => finish(true));
  modal.querySelector("#btn-use-backup").addEventListener("click", () => finish(true));
  modal.querySelector("#btn-cancel-scan").addEventListener("click", () => finish(false));
}

function renderRewards(state) {
  const container = document.getElementById("rewards-list-container");
  container.innerHTML = "";
  const rewards = state.variant === "perks" ? REWARDS_B : REWARDS_A;

  rewards.forEach((r) => {
    const card = document.createElement("div");
    card.className = "item-card";
    const canAfford = state.points >= r.cost;
    card.innerHTML = `
      <img src="${r.icon}" class="item-thumb" alt="${r.title}">
      <div class="item-meta">
        <div>
          <h3 class="item-title">${r.title}</h3>
          <p style="font-size:0.85rem; color:var(--soft); margin-top:2px;">${r.desc}</p>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
          <span style="font-weight:800; font-size:0.95rem; color:var(--brand);">${r.cost} pts</span>
          <button class="primary-btn btn-claim" data-id="${r.id}" style="min-height:34px; font-size:0.8rem; padding:0 12px;" ${!canAfford ? "disabled" : ""}>
            ${canAfford ? "Claim" : "Need " + (r.cost - state.points) + " more"}
          </button>
        </div>
      </div>
    `;
    card.querySelector(".btn-claim")?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (api.claimReward(r.id)) {
        alert("Claimed " + r.title + "!");
      }
    });
    container.appendChild(card);
  });
}

function renderProfile(state) {
  document.getElementById("profile-name").textContent = state.user.displayName;
  document.getElementById("profile-avatar-large").src = "assets/avatars/" + state.user.avatar;
}

function bindAvatarPicker() {
  const container = document.getElementById("avatar-grid-picker");
  container.innerHTML = "";
  AVATARS.forEach((av) => {
    const btn = document.createElement("button");
    btn.style.cssText = "background:none; border:2px solid transparent; border-radius:50%; padding:2px; cursor:pointer;";
    btn.innerHTML = `<img src="assets/avatars/${av}" style="width:52px; height:52px; border-radius:50%;">`;
    btn.addEventListener("click", () => {
      api.setAvatar(av);
    });
    container.appendChild(btn);
  });
}

function bindListItemModal() {
  const modal = document.getElementById("modal-list-item");
  const openBtn = document.getElementById("btn-open-list");
  const closeBtn = document.getElementById("close-list-modal");
  const form = document.getElementById("form-create-item");

  openBtn.addEventListener("click", () => {
    if (!auth.isAuthenticated()) {
      document.getElementById("modal-auth").style.display = "flex";
      return;
    }
    modal.style.display = "flex";
  });
  closeBtn.addEventListener("click", () => { modal.style.display = "none"; });
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("new-item-title").value;
    const category = document.getElementById("new-item-cat").value;
    const condition = document.getElementById("new-item-cond").value;
    const spotId = document.getElementById("new-item-spot").value;

    api.listItem({ title, category, condition, spotId });
    modal.style.display = "none";
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", init);
