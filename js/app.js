/* Screens and navigation. Screen numbers match the build plan in the report. */
(function () {
  var store = window.UNILEND_STORE;
  var data = window.UNILEND_DATA;
  var cfg = window.UNILEND_CONFIG;
  var screen = document.getElementById("screen");
  var tabs = document.getElementById("tabs");
  var toastEl = document.getElementById("toast");

  var ui = { query: "", category: "All", board: "Monthly", depth: 0, signinStep: "email", signinError: "", toastTimer: null, requestError: "" };

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var ICONS = {
    back: '<path d="M15 5l-7 7 7 7"/>',
    chev: '<path d="M9 5l7 7-7 7"/>',
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    swap: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
    gift: '<path d="M4 11h16v9H4zM3 7h18v4H3zM12 7v13"/><path d="M12 7C10 3 6 3 6 5.5S10 7 12 7zM12 7c2-4 6-4 6-1.5S14 7 12 7z"/>',
    people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-4 3-6 6.5-6s6 2 6.5 6"/><path d="M16 5a3.5 3.5 0 010 6.5M18 14.5c2 .7 3.2 2.6 3.5 5.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.7-4.5 3.8-7 8-7s7.3 2.5 8 7"/>',
    check: '<path d="M4 12.5l5.5 5.5L20 7"/>',
    alert: '<path d="M12 3L2 21h20z"/><path d="M12 10v5M12 18v.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    bolt: '<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>',
    plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 01-12 0zM12 17v4"/>',
    book: '<path d="M4 4h7a2 2 0 012 2v14a3 3 0 00-3-3H4zM20 4h-5a2 2 0 00-2 2"/><path d="M20 4v13h-6"/>',
    flask: '<path d="M9 3h6M10 3v6l-5.5 9.5A1.7 1.7 0 006 21h12a1.7 1.7 0 001.5-2.5L14 9V3M7.5 15h9"/>',
    umbrella: '<path d="M3 12a9 9 0 0118 0zM12 12v7a2 2 0 004 0M12 3V2"/>',
    calc: '<rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M8 6.5h8M8.5 11h.1M12 11h.1M15.5 11h.1M8.5 14.5h.1M12 14.5h.1M15.5 14.5h.1M8.5 18h.1M12 18h.1M15.5 18h.1"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    star: '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.3-5.5-3-5.5 3 1-6.3L3 9.7l6.2-.9z"/>',
    heart: '<path d="M12 20S3.5 15 3.5 8.8A4.6 4.6 0 0112 6.2a4.6 4.6 0 018.5 2.6C20.5 15 12 20 12 20z"/>',
    cup: '<path d="M5 8h12v7a5 5 0 01-5 5h-2a5 5 0 01-5-5zM17 10h1.5a2.5 2.5 0 010 5H17M9 2v3M13 2v3"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="8" cy="9" r="1.2"/>',
    link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>'
  };

  function icon(name, cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
  }

  function header(title, parent) {
    return '<header class="hdr"><button class="iconbtn" data-act="back" data-parent="' + esc(parent || "/home") + '" aria-label="Back">' + icon("back") + "</button><h1 tabindex=\"-1\">" + esc(title) + "</h1></header>";
  }

  function qr(seedText) {
    var n = 21, cells = "", h = 0, i, x, y;
    for (i = 0; i < seedText.length; i++) h = (h * 31 + seedText.charCodeAt(i)) >>> 0;
    function finder(cx, cy) {
      return '<path d="M' + cx + " " + cy + 'h7v7h-7z" fill="#000"/><path d="M' + (cx + 1) + " " + (cy + 1) + 'h5v5h-5z" fill="#fff"/><path d="M' + (cx + 2) + " " + (cy + 2) + 'h3v3h-3z" fill="#000"/>';
    }
    for (y = 0; y < n; y++) {
      for (x = 0; x < n; x++) {
        if ((x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)) continue;
        h = (h * 1664525 + 1013904223) >>> 0;
        if (h % 100 < 48) cells += "M" + x + " " + y + "h1v1h-1z";
      }
    }
    return '<svg class="qr" viewBox="0 0 21 21" aria-hidden="true" shape-rendering="crispEdges"><path d="' + cells + '" fill="#000"/>' + finder(0, 0) + finder(14, 0) + finder(0, 14) + "</svg>";
  }

  function chainHTML(extraNext) {
    var s = store.get();
    var nodes = s.chain.map(function (n) {
      var cls = n === "You" ? "node me" : n === "Next classmate" ? "node next" : "node";
      return '<li><span class="' + cls + '">' + esc(n) + "</span></li>";
    });
    if (extraNext) nodes.push('<li><span class="node next">?</span></li>');
    return '<ol class="chain" aria-label="Help chain: ' + esc(s.chain.join(", then ")) + '">' + nodes.join("") + "</ol>";
  }

  function chainCount() {
    return store.get().chain.length;
  }

  function itemRow(it, opts) {
    opts = opts || {};
    var sub = opts.sub || (it.owner ? it.owner + " · " + store.zone(it.zone).name : it.note);
    return '<button class="row" data-go="' + esc(opts.go || "/item/" + it.id) + '">' +
      '<span class="thumb">' + icon(it.icon) + "</span>" +
      '<span class="body"><span class="title">' + esc(it.name) + '</span><span class="sub">' + esc(sub) + "</span></span>" +
      icon("chev", "chev") + "</button>";
  }

  function statusLine(e) {
    var it = store.item(e.itemId), zone = store.zone(e.zone).name;
    var p = e.partner;
    switch (e.status) {
      case "incoming": return { title: p + " wants to borrow your " + it.short, sub: "Tap to answer" };
      case "requested": return { title: "Waiting for " + p + " to reply", sub: it.name };
      case "enroute": return { title: p + " is on the way to " + zone, sub: it.name };
      case "accepted": return { title: "Meet " + p + " at " + zone, sub: "Confirm the hand-off when you meet" };
      case "active": return e.role === "borrower"
        ? { title: it.name, sub: "Borrowed from " + p + " · Due " + e.due }
        : { title: it.name, sub: "Lent to " + p + " · Due back " + e.due };
      case "returned": return { title: it.name, sub: (e.role === "borrower" ? "Returned to " : "Returned by ") + p };
      case "declined": return { title: it.name, sub: "You declined " + p + "'s request" };
    }
    return { title: it.name, sub: "" };
  }

  function exchangeRoute(e) {
    if (e.status === "incoming" || e.status === "declined") return "/incoming/" + e.id;
    if (e.status === "active" || e.status === "returned") return "/loan/" + e.id;
    return "/exchange/" + e.id;
  }

  function exchangeRow(e, alert) {
    var it = store.item(e.itemId), l = statusLine(e);
    return '<button class="row' + (alert ? " alert-row" : "") + '" data-go="' + exchangeRoute(e) + '">' +
      '<span class="thumb">' + icon(it.icon) + "</span>" +
      '<span class="body"><span class="title">' + esc(l.title) + '</span><span class="sub">' + esc(l.sub) + "</span></span>" +
      icon("chev", "chev") + "</button>";
  }

  /* ---------- screens ---------- */
  var routes = {};

  // 1. Sign-in with campus email (simulated verification)
  routes.signin = function () {
    var s = store.get(), r = store.rewards();
    var top = '<div class="welcome"><span class="brand">UniLend</span><p>' + esc(r.welcomeLine) + "</p></div>";
    if (ui.signinStep === "code") {
      return top + '<form class="page" data-submit="verify">' +
        '<h1 tabindex="-1">Check your campus email</h1>' +
        '<p class="muted">We sent a 4-digit code to <strong>' + esc(s.email) + "</strong>.</p>" +
        '<label class="field">Verification code<input class="input" id="code" inputmode="numeric" autocomplete="one-time-code" maxlength="4" value="' + esc(cfg.demoCode) + '"></label>' +
        (ui.signinError ? '<p class="error" role="alert">' + esc(ui.signinError) + "</p>" : "") +
        '<p class="small muted">Prototype: no email is sent, and the code is filled in for you.</p>' +
        '<div class="actions"><button class="btn primary" type="submit">Verify and continue</button>' +
        '<button class="btn quiet" type="button" data-act="signinBack">Use a different email</button></div></form>';
    }
    return top + '<form class="page" data-submit="sendCode">' +
      '<h1 tabindex="-1">Sign in</h1>' +
      '<p class="muted">UniLend is only for verified Algoma students.</p>' +
      '<label class="field">Campus email<input class="input" id="email" type="email" autocomplete="email" value="' + esc(s.email) + '" placeholder="you@algomau.ca"></label>' +
      (ui.signinError ? '<p class="error" role="alert">' + esc(ui.signinError) + "</p>" : "") +
      '<div class="actions"><button class="btn primary" type="submit">Send verification code</button></div>' +
      '<p class="footnote">Prototype for a course project. All people and items are fictional.</p></form>';
  };

  // 2. Home feed with categories and search
  routes.home = function () {
    var s = store.get();
    var live = s.exchanges.filter(function (e) {
      return ["incoming", "requested", "enroute", "accepted", "active"].indexOf(e.status) >= 0;
    });
    var alerts = live.map(function (e) {
      return exchangeRow(e, e.status === "incoming" || e.status === "accepted");
    }).join("");
    var chips = data.categories.map(function (c) {
      return '<button class="chip" data-act="category" data-id="' + esc(c) + '" aria-pressed="' + (ui.category === c) + '">' + esc(c) + "</button>";
    }).join("");
    return '<header class="home-hdr"><h1 tabindex="-1" class="brand">UniLend</h1>' +
      '<button class="iconbtn" data-go="/profile" aria-label="Profile and help">' + icon("user") + "</button></header>" +
      '<div class="page">' +
      (alerts ? '<section class="list" aria-label="Your activity">' + alerts + "</section>" : "") +
      '<label class="field"><span class="small">What do you need?</span><input class="input" id="search" type="search" placeholder="Search items" value="' + esc(ui.query) + '" autocomplete="off"></label>' +
      '<div class="chips" role="group" aria-label="Categories">' + chips + "</div>" +
      '<section id="feed" class="list" aria-label="Items and requests">' + feedHTML() + "</section>" +
      '<button class="chain-mini" data-go="/community">' + icon("link") + "<span>The help chain has reached " + chainCount() + " people</span>" + icon("chev", "chev") + "</button>" +
      "</div>";
  };

  function feedHTML() {
    var s = store.get(), q = ui.query.trim().toLowerCase(), out = "";
    function matches(text) {
      return !q || text.toLowerCase().indexOf(q) >= 0;
    }
    if (ui.category !== "Open requests") {
      var pool = data.items.filter(function (i) {
        return s.takenItems.indexOf(i.id) < 0;
      }).concat(data.myItems.filter(function (i) {
        return s.offered.indexOf(i.id) >= 0;
      }));
      pool.filter(function (i) {
        return (ui.category === "All" || i.category === ui.category) && matches(i.name + " " + i.category);
      }).forEach(function (i) {
        out += itemRow(i, i.owner ? {} : { sub: "Your item · Offered to classmates" });
      });
    }
    if (ui.category === "All" || ui.category === "Open requests") {
      data.openRequests.filter(function (r) {
        return s.answered.indexOf(r.id) < 0 && matches(r.need + " " + r.who);
      }).forEach(function (r) {
        out += '<button class="row" data-go="/open-request/' + r.id + '"><span class="thumb">' + icon("people") + '</span><span class="body"><span class="title">' + esc(r.who) + " needs " + esc(r.need) + '</span><span class="sub">Open request · ' + esc(store.zone(r.zone).name) + "</span></span>" + icon("chev", "chev") + "</button>";
      });
    }
    if (!out) {
      out = '<div class="card empty"><p>Nothing matches that right now.</p><button class="btn" data-act="clearSearch">Show everything</button></div>';
    }
    return out;
  }

  // 3. Item detail
  routes.item = function (id) {
    var it = store.item(id);
    if (!it) return routes.notfound();
    if (!it.owner) {
      return header("Your item") + '<div class="page"><div class="card"><div class="thumb">' + icon(it.icon) + "</div><h2>" + esc(it.name) + '</h2><p class="muted">' + esc(it.note) + "</p></div>" +
        '<div class="actions">' + (store.get().offered.indexOf(id) >= 0 ? '<button class="btn" data-act="stopOffering" data-id="' + id + '">Stop offering this item</button>' : "") + '<button class="btn quiet" data-go="/home">Back to home</button></div></div>';
    }
    return header("Item details") + '<div class="page"><div class="card"><div class="thumb">' + icon(it.icon) + "</div><h2>" + esc(it.name) + "</h2><p>" + esc(it.note) + "</p>" +
      '<dl class="kv"><dt>Lender</dt><dd>' + esc(it.owner) + " · " + it.lends + " lends</dd><dt>Usually at</dt><dd>" + esc(store.zone(it.zone).name) + "</dd><dt>Return by</dt><dd>Today, 6 p.m.</dd><dt>Cost</dt><dd>Free to borrow</dd></dl>" +
      '<p class="small muted">' + esc(it.demand) + " demand. Lender earns " + it.points + " points, and you earn " + data.points.returnOnTime + " for returning on time.</p></div>" +
      '<div class="actions"><button class="btn primary" data-go="/request/' + id + '">Request this item</button></div></div>';
  };

  // 4. Request and pickup-zone choice
  routes.request = function (id) {
    var it = store.item(id);
    if (!it || !it.owner) return routes.notfound();
    var zones = data.zones.map(function (z) {
      return '<label class="choice"><input type="radio" name="zone" value="' + z.id + '"><span><span class="title">' + esc(z.name) + '</span><span class="sub">' + esc(z.note) + "</span></span></label>";
    }).join("");
    return header("Request item", "/item/" + id) + '<form class="page" data-submit="sendRequest" data-id="' + id + '"><p>Asking <strong>' + esc(it.owner) + "</strong> for the <strong>" + esc(it.short) + "</strong>.</p>" +
      '<fieldset class="list" style="border:0;padding:0;margin:0"><legend><h2 style="margin-bottom:8px">Choose a safe pickup spot</h2></legend>' + zones + "</fieldset>" +
      (ui.requestError ? '<p class="error" role="alert">' + esc(ui.requestError) + "</p>" : "") +
      '<div class="actions"><button class="btn primary" type="submit">Send request</button></div></form>';
  };

  // 12a. Recovery: item no longer available
  routes.unavailable = function (id) {
    var it = store.item(id);
    if (!it) return routes.notfound();
    var s = store.get();
    var similar = data.items.filter(function (i) {
      return i.category === it.category && i.id !== id && s.takenItems.indexOf(i.id) < 0;
    });
    return header("Item unavailable") + '<div class="page"><div class="state"><div class="mark bad">' + icon("alert") + "</div><h2>This item is no longer available</h2>" +
      '<p class="muted">Another student just got the ' + esc(it.short) + ". Your request was not sent. Here are similar items.</p></div>" +
      '<section class="list" aria-label="Similar items">' + similar.map(function (i) { return itemRow(i); }).join("") + "</section>" +
      '<div class="actions"><button class="btn quiet" data-go="/home">Back to all items</button></div></div>';
  };

  // Request status and meeting: leads to screen 5
  routes.exchange = function (id) {
    var e = store.exchange(id);
    if (!e) return routes.notfound();
    var it = store.item(e.itemId), zone = store.zone(e.zone).name, p = e.partner;
    if (e.status === "active" || e.status === "returned") return redirect("/loan/" + id);
    if (e.status === "incoming" || e.status === "declined") return redirect("/incoming/" + id);
    var body;
    if (e.status === "requested") {
      body = '<div class="state"><div class="mark wait"><div class="spin" aria-hidden="true"></div></div><h2>Request sent</h2><p class="muted">Waiting for ' + esc(p) + " to reply about the " + esc(it.short) + ".</p></div>" +
        '<dl class="card kv"><dt>Pickup spot</dt><dd>' + esc(zone) + "</dd></dl>" +
        '<div class="actions"><button class="btn danger" data-act="cancelRequest" data-id="' + id + '">Cancel request</button></div>';
    } else if (e.status === "enroute") {
      body = '<div class="state"><div class="mark wait"><div class="spin" aria-hidden="true"></div></div><h2>' + esc(p) + " is on the way</h2><p class=\"muted\">Head to " + esc(zone) + ". We will tell you when " + esc(p) + " arrives.</p></div>" +
        '<dl class="card kv"><dt>Item</dt><dd>' + esc(it.name) + "</dd><dt>Pickup spot</dt><dd>" + esc(zone) + "</dd></dl>";
    } else {
      var head = e.role === "borrower" ? esc(p) + " accepted your request" : esc(p) + " is here";
      body = '<div class="state"><div class="mark">' + icon("check") + "</div><h2>" + head + '</h2><p class="muted">Meet at <strong>' + esc(zone) + "</strong>" + (e.role === "borrower" ? " to pick up the " : " to hand over your ") + esc(it.short) + ".</p></div>" +
        '<dl class="card kv"><dt>Pickup spot</dt><dd>' + esc(zone) + "</dd><dt>Due back</dt><dd>" + esc(e.due) + "</dd></dl>" +
        '<div class="actions"><button class="btn primary" data-go="/scan/handoff/' + id + '">Confirm hand-off</button>' +
        (e.role === "borrower" ? '<button class="btn quiet" data-act="cancelRequest" data-id="' + id + '">Cancel request</button>' : "") + "</div>";
    }
    return header(e.role === "borrower" ? "Your request" : "Lending to " + p, "/home") + '<div class="page">' + body + "</div>";
  };

  // 5 and 7. Simulated QR scan (hand-off and return)
  routes.scan = function (kind, id) {
    var e = store.exchange(id);
    if (!e) return routes.notfound();
    var expected = kind === "handoff" ? "accepted" : "active";
    if (e.status !== expected) return redirect(exchangeRoute(e));
    var p = e.partner;
    return '<div class="scan">' + '<header class="hdr"><button class="iconbtn" data-act="back" data-parent="' + exchangeRoute(e) + '" aria-label="Back">' + icon("back") + '</button><h1 tabindex="-1">' + (kind === "handoff" ? "Confirm hand-off" : "Confirm return") + "</h1></header>" +
      '<div class="page"><p><strong>Scan ' + esc(p) + "'s QR code</strong></p>" +
      '<button id="viewfinder" class="viewfinder" data-act="scan" data-kind="' + kind + '" data-id="' + id + '" aria-label="Scan ' + esc(p) + "'s QR code\">" + qr(id + kind) + '<span class="scanline"></span></button>' +
      '<p class="hint small" id="scanhint">Prototype camera: tap the code to scan it.</p>' +
      '<div class="actions" style="width:100%"><button class="btn quiet" data-go="/scan-failed/' + kind + "/" + id + '">Code won\'t scan?</button></div></div></div>';
  };

  // 12b. Recovery: scan failed
  routes.scanfailed = function (kind, id) {
    var e = store.exchange(id);
    if (!e) return routes.notfound();
    var p = e.partner;
    return header("Scan problem", "/scan/" + kind + "/" + id) + '<form class="page" data-submit="backupCode" data-kind="' + kind + '" data-id="' + id + '">' +
      '<div class="state"><div class="mark bad">' + icon("x") + "</div><h2>The scan didn't work</h2><p class=\"muted\">Nothing has been confirmed yet. Try again, or enter the backup code " + esc(p) + "'s app shows: <strong>" + esc(cfg.demoCode) + "</strong>.</p></div>" +
      '<label class="field">Backup code<input class="input" id="backup" inputmode="numeric" maxlength="4" autocomplete="off"></label>' +
      (ui.backupError ? '<p class="error" role="alert">' + esc(ui.backupError) + "</p>" : "") +
      '<div class="actions"><button class="btn primary" type="button" data-act="retryScan" data-kind="' + kind + '" data-id="' + id + '">Try scanning again</button><button class="btn" type="submit">Use backup code</button></div></form>';
  };

  // Hand-off confirmation
  routes.handoffdone = function (id) {
    var e = store.exchange(id);
    if (!e) return routes.notfound();
    var it = store.item(e.itemId), lender = e.role === "lender";
    return header("Hand-off confirmed", "/home") + '<div class="page"><div class="state"><div class="mark">' + icon("check") + "</div><h2>Hand-off confirmed</h2>" +
      (lender
        ? "<p>" + esc(e.partner) + " has your " + esc(it.short) + '. Due back: ' + esc(e.due) + '</p><p class="gain">You earned ' + it.points + " points</p>"
        : "<p>You have the " + esc(it.short) + " from " + esc(e.partner) + ". Due back: " + esc(e.due) + "</p>") +
      "</div>" +
      '<div class="actions">' +
      (lender ? '<button class="btn primary" data-go="/rewards">See what you\'ve earned</button>' : '<button class="btn primary" data-go="/loan/' + id + '">View my loan</button>') +
      '<button class="btn" data-go="/home">Back to home</button>' +
      '<button class="btn quiet" data-act="undoHandoff" data-id="' + id + '">Undo hand-off</button></div></div>';
  };

  // 6. Active loan with return option
  routes.loan = function (id) {
    var e = store.exchange(id);
    if (!e) return routes.notfound();
    if (e.status !== "active" && e.status !== "returned") return redirect(exchangeRoute(e));
    var it = store.item(e.itemId), borrower = e.role === "borrower", done = e.status === "returned";
    var title = borrower ? "Your loan" : "Lent item";
    var kv = '<dl class="kv"><dt>' + (borrower ? "Lender" : "Borrower") + "</dt><dd>" + esc(e.partner) + "</dd><dt>Meet at</dt><dd>" + esc(store.zone(e.zone).name) + "</dd>" + (e.since ? "<dt>Since</dt><dd>" + esc(e.since) + "</dd>" : "") + "<dt>" + (done ? "Status" : "Due") + "</dt><dd>" + (done ? "Returned" : esc(e.due)) + "</dd></dl>";
    var action = "";
    if (!done) {
      action = '<div class="actions"><button class="btn primary" data-go="/scan/return/' + id + '">' + (borrower ? "Return this item" : "Confirm it came back") + "</button></div>";
    } else {
      action = '<div class="actions"><button class="btn" data-go="/loans">Back to loans</button></div>';
    }
    return header(title, "/loans") + '<div class="page"><div class="card"><div class="thumb">' + icon(it.icon) + "</div><h2>" + esc(it.name) + "</h2>" + kv + "</div>" +
      (done ? "" : '<p class="small muted">' + (borrower ? "Meet " + esc(e.partner) + " and confirm together so the return counts for both of you." : "When " + esc(e.partner) + " hands it back, confirm it here.") + "</p>") + action + "</div>";
  };

  // 7. Return confirmation
  routes.returndone = function (id) {
    var e = store.exchange(id);
    if (!e) return routes.notfound();
    var it = store.item(e.itemId), borrower = e.role === "borrower";
    return header("Return confirmed", "/home") + '<div class="page"><div class="state"><div class="mark">' + icon("check") + "</div><h2>Return confirmed</h2><p>" +
      (borrower ? esc(e.partner) + " has the " + esc(it.short) + " back. Thanks for returning it on time." : "Your " + esc(it.short) + " is back with you.") + "</p>" +
      (borrower ? '<p class="gain">You earned ' + data.points.returnOnTime + " points</p>" : "") + "</div>" +
      '<div class="actions">' + (borrower ? '<button class="btn primary" data-go="/pass-it-on">Continue</button>' : '<button class="btn primary" data-go="/home">Back to home</button>') +
      '<button class="btn quiet" data-act="undoReturn" data-id="' + id + '">Undo return</button></div></div>';
  };

  // 8. Pass-It-On prompt and chain counter
  routes.passiton = function () {
    return header("Pass it on", "/home") + '<div class="page"><h2 style="font-size:1.4rem;line-height:1.2">Someone helped you. Who can you help next?</h2>' +
      '<div class="chain-card">' + chainHTML(true) + '<p class="chain-count">This help has travelled through ' + chainCount() + " people so far.</p></div>" +
      '<p class="muted small">Passing it on earns you ' + data.points.passItOn + " points.</p>" +
      '<div class="actions"><button class="btn primary" data-go="/pass-it-on/offer">Offer one of my items</button>' +
      '<button class="btn primary" data-go="/pass-it-on/answer">Answer an open request</button>' +
      '<button class="btn quiet" data-go="/home">Not now</button></div></div>';
  };

  routes.passoffer = function () {
    var s = store.get();
    var free = data.myItems.filter(function (i) {
      return s.offered.indexOf(i.id) < 0 && !s.exchanges.some(function (e) {
        return e.itemId === i.id && ["enroute", "accepted", "active", "incoming"].indexOf(e.status) >= 0;
      });
    });
    return header("Offer an item", "/pass-it-on") + '<div class="page"><p>Choose an item to offer to classmates.</p><section class="list">' +
      (free.length ? free.map(function (i) {
        return '<button class="row" data-act="offer" data-id="' + i.id + '"><span class="thumb">' + icon(i.icon) + '</span><span class="body"><span class="title">' + esc(i.name) + '</span><span class="sub">' + esc(i.note) + "</span></span>" + icon("chev", "chev") + "</button>";
      }).join("") : '<div class="card empty"><p>All your items are already offered or out on loan.</p><button class="btn" data-go="/pass-it-on/answer">See open requests</button></div>') +
      "</section></div>";
  };

  routes.passanswer = function () {
    var s = store.get();
    var open = data.openRequests.filter(function (r) {
      return s.answered.indexOf(r.id) < 0;
    });
    return header("Open requests", "/pass-it-on") + '<div class="page"><p>Classmates who need something you own.</p><section class="list">' +
      (open.length ? open.map(function (r) {
        return '<div class="card"><h2>' + esc(r.who) + " needs " + esc(r.need) + '</h2><p class="muted small">"' + esc(r.note) + '"</p><p class="small">Meet at ' + esc(store.zone(r.zone).name) + '</p><button class="btn primary" data-act="answer" data-id="' + r.id + '">Help ' + esc(r.who) + "</button></div>";
      }).join("") : '<div class="card empty"><p>No open requests right now.</p><button class="btn" data-go="/home">Back to home</button></div>') +
      "</section></div>";
  };

  routes.openrequest = function (id) {
    var r = data.openRequests.filter(function (x) {
      return x.id === id;
    })[0];
    if (!r || store.get().answered.indexOf(id) >= 0) return redirect("/home");
    return header("Open request") + '<div class="page"><div class="card"><h2>' + esc(r.who) + " needs " + esc(r.need) + "</h2><p>\"" + esc(r.note) + '"</p><dl class="kv"><dt>Meet at</dt><dd>' + esc(store.zone(r.zone).name) + '</dd><dt>You have</dt><dd>' + esc(store.item(r.itemId).name) + "</dd></dl></div>" +
      '<div class="actions"><button class="btn primary" data-act="answer" data-id="' + r.id + '">Help ' + esc(r.who) + "</button></div></div>";
  };

  routes.passdone = function (pid) {
    var p = store.passOn(pid);
    if (!p) return redirect("/home");
    var msg, next;
    if (p.kind === "offer") {
      msg = "Your " + store.item(p.itemId).short + " is now offered to classmates in the feed.";
      next = '<button class="btn primary" data-go="/home">Back to home</button>';
    } else {
      var e = store.exchange(p.exId);
      msg = e.partner + " has been told you can help. Meet at " + store.zone(e.zone).name + ".";
      next = '<button class="btn primary" data-go="' + exchangeRoute(e) + '">See the meeting</button><button class="btn" data-go="/home">Back to home</button>';
    }
    return header("Passed on", "/home") + '<div class="page"><div class="state"><div class="mark">' + icon("check") + '</div><h2>You passed it on</h2><p>' + esc(msg) + '</p><p class="gain">You earned ' + data.points.passItOn + " points</p></div>" +
      '<div class="chain-card">' + chainHTML() + '<p class="chain-count">The help has now reached ' + chainCount() + " people.</p></div>" +
      '<div class="actions">' + next + '<button class="btn quiet" data-act="undoPassOn" data-id="' + pid + '">Undo</button></div></div>';
  };

  // 9. Incoming request (lender view)
  routes.incoming = function (id) {
    var e = store.exchange(id);
    if (!e) return routes.notfound();
    if (e.status !== "incoming" && e.status !== "declined") return redirect(exchangeRoute(e));
    var it = store.item(e.itemId);
    if (e.status === "declined") {
      return header("Request declined", "/home") + '<div class="page"><div class="state"><div class="mark wait">' + icon("check") + "</div><h2>You declined</h2><p>We let " + esc(e.partner) + ' know, and no reason is shared.</p></div><div class="actions"><button class="btn primary" data-go="/home">Back to home</button><button class="btn quiet" data-act="undoDecision" data-id="' + id + '">Undo</button></div></div>';
    }
    return header("Borrow request") + '<div class="page"><div class="card"><div class="thumb">' + icon(it.icon) + "</div><h2>" + esc(e.partner) + " wants to borrow your " + esc(it.short) + "</h2>" +
      (e.message ? '<p>"' + esc(e.message) + '"</p>' : "") +
      '<dl class="kv"><dt>Meet at</dt><dd>' + esc(store.zone(e.zone).name) + "</dd><dt>Back by</dt><dd>" + esc(e.due) + "</dd><dt>You earn</dt><dd>" + it.points + " points</dd></dl></div>" +
      '<div class="actions"><button class="btn primary" data-act="accept" data-id="' + id + '">Accept</button><button class="btn" data-act="decline" data-id="' + id + '">Decline</button></div></div>';
  };

  // Loans list: how a participant reaches screen 6
  routes.loans = function () {
    var s = store.get();
    function group(title, statuses, alert) {
      var rows = s.exchanges.filter(function (e) {
        return statuses.indexOf(e.status) >= 0;
      }).map(function (e) {
        return exchangeRow(e, alert);
      }).join("");
      return rows ? '<h2 class="section-title">' + title + '</h2><section class="list">' + rows + "</section>" : "";
    }
    var content = group("Needs your answer", ["incoming"], true) + group("In progress", ["requested", "enroute", "accepted"]) + group("Out on loan", ["active"]) + group("Finished", ["returned", "declined"]);
    return '<header class="hdr" style="padding-left:16px"><h1 tabindex="-1">Loans</h1></header><div class="page">' +
      (content || '<div class="card empty"><p>No loans yet. When you borrow or lend, it shows up here.</p><button class="btn" data-go="/home">Browse items</button></div>') + "</div>";
  };

  // 10. Points and Rewards. The catalogue is last, so its length moves nothing else.
  routes.rewards = function () {
    var s = store.get(), r = store.rewards(), pts = store.points();
    var catalogue = r.catalogue.map(function (c) {
      var can = pts >= c.cost;
      return '<button class="row reward" data-act="startClaim" data-id="' + c.id + '" data-can="' + can + '"><span class="thumb">' + icon(c.icon) + '</span><span class="body"><span class="title">' + esc(c.name) + '</span><span class="sub">' + esc(c.detail) + '</span></span><span class="cost">' + c.cost + " pts</span></button>";
    }).join("");
    return '<header class="hdr" style="padding-left:16px"><h1 tabindex="-1">Points and Rewards</h1></header><div class="page">' +
      '<div class="balance" aria-label="Your balance is ' + pts + ' points"><span>Your points</span><strong>' + pts + "</strong></div>" +
      '<button class="row" style="min-height:56px" data-go="/rewards/history"><span class="body"><span class="title">Points history and past claims</span></span>' + (s.claims.length ? '<span class="pill">' + s.claims.length + " claimed</span>" : "") + icon("chev", "chev") + "</button>" +
      '<h2 class="section-title">Claim a reward</h2><section class="list" aria-label="Rewards catalogue">' + catalogue + "</section>" +
      '<p class="footnote">Prototype: rewards shown here are fictional and no real prizes are given.</p></div>';
  };

  routes.history = function () {
    var s = store.get();
    var rows = s.ledger.slice().reverse().map(function (e) {
      return '<li><span class="who">' + esc(e.label) + '</span><strong>' + (e.amount > 0 ? "+" : "") + e.amount + "</strong></li>";
    }).join("");
    return header("Points history", "/rewards") + '<div class="page"><ul class="board">' + rows + "</ul>" +
      '<details class="card"><summary>How points work</summary><ul class="small"><li>Lenders earn more for items in high demand.</li><li>Borrowers earn ' + data.points.returnOnTime + " points for returning on time.</li><li>Passing help on earns " + data.points.passItOn + " points.</li><li>Points from the same person are capped each day, which keeps exchanges genuine.</li></ul></details></div>";
  };

  routes.claim = function (id) {
    var r = store.rewards().catalogue.filter(function (c) {
      return c.id === id;
    })[0];
    if (!r) return redirect("/rewards");
    var pts = store.points();
    return header("Claim reward", "/rewards") + '<div class="page"><div class="card"><div class="thumb">' + icon(r.icon) + "</div><h2>" + esc(r.name) + "</h2><p>" + esc(r.detail) + '</p><dl class="kv"><dt>Cost</dt><dd>' + r.cost + " points</dd><dt>Balance after</dt><dd>" + (pts - r.cost) + " points</dd></dl></div>" +
      '<div class="actions"><button class="btn primary" data-act="claim" data-id="' + id + '">Claim for ' + r.cost + ' points</button><button class="btn quiet" data-go="/rewards">Keep my points</button></div></div>';
  };

  routes.claimed = function (cid) {
    var c = store.get().claims.filter(function (x) {
      return x.id === cid;
    })[0];
    if (!c) return redirect("/rewards");
    return header("Reward claimed", "/rewards") + '<div class="page"><div class="state"><div class="mark">' + icon("check") + "</div><h2>Reward claimed</h2><p>" + esc(c.name) + '</p><p class="muted">' + c.cost + " points used. You have " + store.points() + " left.</p></div>" +
      '<div class="actions"><button class="btn primary" data-go="/rewards">Back to rewards</button><button class="btn" data-go="/community">See community impact</button><button class="btn quiet" data-act="undoClaim" data-id="' + cid + '">Undo claim</button></div></div>';
  };

  // 11. Community Impact and leaderboard
  routes.community = function () {
    var s = store.get(), r = store.rewards(), imp = data.impact;
    var me = { name: "You", points: store.points(), me: true };
    var board = data.leaderboard[ui.board].concat([me]).sort(function (a, b) {
      return b.points - a.points;
    }).map(function (p, i) {
      return '<li class="' + (p.me ? "me" : "") + '"><span class="rank">' + (i + 1) + '</span><span class="who">' + esc(p.name) + "</span><strong>" + p.points + "</strong></li>";
    }).join("");
    var lends = s.exchanges.filter(function (e) {
      return e.role === "lender" && (e.status === "active" || e.status === "returned");
    }).length;
    return '<header class="hdr" style="padding-left:16px"><h1 tabindex="-1">Community Impact</h1></header><div class="page">' +
      '<div class="chain-card"><h2>Your help chain</h2>' + chainHTML() + '<p class="chain-count">' + chainCount() + " people so far.</p>" +
      '<button class="btn" data-go="/pass-it-on">Keep it going</button></div>' +
      '<div class="stats"><div class="stat"><strong>' + (imp.itemsShared + lends) + '</strong><span>items shared this term</span></div><div class="stat"><strong>' + (imp.classmatesHelped + lends) + '</strong><span>classmates helped</span></div><div class="stat"><strong>' + imp.helpChains + '</strong><span>active help chains</span></div></div>' +
      '<h2 class="section-title">Leaderboard</h2><div class="banner">' + icon("star") + "<span>" + esc(r.leaderboardBanner) + "</span></div>" +
      '<div class="seg" role="group" aria-label="Leaderboard period"><button data-act="board" data-id="Monthly" aria-pressed="' + (ui.board === "Monthly") + '">Monthly</button><button data-act="board" data-id="Yearly" aria-pressed="' + (ui.board === "Yearly") + '">Yearly</button></div>' +
      '<ol class="board">' + board + "</ol>" +
      '<h2 class="section-title">Kindness Wall</h2><ul class="wall">' + data.kindnessWall.map(function (k) {
        return "<li>" + esc(k) + "</li>";
      }).join("") + "</ul></div>";
  };

  // Profile and help
  routes.profile = function () {
    var s = store.get();
    return header("Profile and help") + '<div class="page"><div class="card"><h2>' + esc(s.email || "Student") + '</h2><p class="muted small">Verified Algoma student</p></div>' +
      '<h2 class="section-title">My items</h2><section class="list">' + data.myItems.map(function (i) {
        return '<div class="row"><span class="thumb">' + icon(i.icon) + '</span><span class="body"><span class="title">' + esc(i.name) + '</span><span class="sub">' + (s.offered.indexOf(i.id) >= 0 ? "Offered to classmates" : "Not offered right now") + "</span></span>" +
          (s.offered.indexOf(i.id) >= 0 ? '<button class="btn" style="width:auto;min-height:44px" data-act="stopOffering" data-id="' + i.id + '">Stop</button>' : '<button class="btn" style="width:auto;min-height:44px" data-act="offer" data-id="' + i.id + '">Offer</button>') + "</div>";
      }).join("") + "</section>" +
      '<h2 class="section-title">Help</h2>' +
      '<details class="card"><summary>How does borrowing work?</summary><p class="small">Find an item, choose a safe pickup spot, and send a request. When you meet, scan the other student\'s QR code. Scan again when the item goes back.</p></details>' +
      '<details class="card"><summary>Why scan twice?</summary><p class="small">One scan at pickup and one at return confirm the exchange for both students, so nobody loses track of an item.</p></details>' +
      '<details class="card"><summary>Does anyone pay?</summary><p class="small">No. Borrowing is free, and there are no deposits or fines. Lenders and borrowers earn points.</p></details>' +
      '<div class="actions"><button class="btn" data-act="signOut">Sign out</button><a class="btn quiet" href="facilitator.html">Facilitator tools</a></div></div>';
  };

  routes.notfound = function () {
    return header("Not found") + '<div class="page"><div class="state"><div class="mark bad">' + icon("alert") + '</div><h2>We couldn\'t find that</h2></div><div class="actions"><button class="btn primary" data-go="/home">Back to home</button></div></div>';
  };

  /* ---------- router ---------- */
  var REDIRECT = {};
  var pendingRedirect = null;
  function redirect(path) {
    pendingRedirect = path;
    return REDIRECT;
  }

  function resolve(path) {
    var p = path.replace(/^\//, "").split("/");
    switch (p[0]) {
      case "signin": return routes.signin();
      case "home": case "": return routes.home();
      case "item": return routes.item(p[1]);
      case "request": return routes.request(p[1]);
      case "unavailable": return routes.unavailable(p[1]);
      case "exchange": return routes.exchange(p[1]);
      case "scan": return routes.scan(p[1], p[2]);
      case "scan-failed": return routes.scanfailed(p[1], p[2]);
      case "handoff-done": return routes.handoffdone(p[1]);
      case "loans": return routes.loans();
      case "loan": return routes.loan(p[1]);
      case "return-done": return routes.returndone(p[1]);
      case "pass-it-on":
        if (p[1] === "offer") return routes.passoffer();
        if (p[1] === "answer") return routes.passanswer();
        return routes.passiton();
      case "passed": return routes.passdone(p[1]);
      case "open-request": return routes.openrequest(p[1]);
      case "incoming": return routes.incoming(p[1]);
      case "rewards": return p[1] === "history" ? routes.history() : routes.rewards();
      case "claim": return routes.claim(p[1]);
      case "claimed": return routes.claimed(p[1]);
      case "community": return routes.community();
      case "profile": return routes.profile();
    }
    return routes.notfound();
  }

  function current() {
    return location.hash.replace(/^#/, "") || "/home";
  }

  function go(path, replace) {
    if (current() === path) return render();
    if (replace) {
      history.replaceState(null, "", "#" + path);
      render();
    } else {
      ui.depth++;
      location.hash = path;
    }
  }

  function renderTabs(path) {
    var root = path.split("/")[1] || "home";
    var show = { home: 1, loans: 1, rewards: 1, community: 1 };
    var inFlow = !store.get().signedIn || root === "scan";
    tabs.hidden = inFlow;
    if (inFlow) return;
    var waiting = store.get().exchanges.filter(function (e) {
      return e.status === "incoming" || e.status === "accepted";
    }).length;
    var defs = [["home", "Home", "home"], ["loans", "Loans", "swap"], ["rewards", "Rewards", "gift"], ["community", "Community", "people"]];
    tabs.innerHTML = defs.map(function (d) {
      var cur = show[root] && root === d[0];
      var badge = d[0] === "loans" && waiting ? '<span class="badge">' + waiting + "</span>" : "";
      return '<button class="tab" data-go="/' + d[0] + '"' + (cur ? ' aria-current="page"' : "") + (badge ? ' aria-label="' + d[1] + ", " + waiting + ' waiting"' : "") + ">" + icon(d[2]) + "<span>" + d[1] + "</span>" + badge + "</button>";
    }).join("");
  }

  function render() {
    var path = current();
    var s = store.get();
    if (!s.signedIn && path !== "/signin") {
      history.replaceState(null, "", "#/signin");
      path = "/signin";
    }
    if (s.signedIn && path === "/signin") {
      history.replaceState(null, "", "#/home");
      path = "/home";
    }
    var html = resolve(path);
    if (html === REDIRECT) {
      var to = pendingRedirect;
      pendingRedirect = null;
      history.replaceState(null, "", "#" + to);
      return render();
    }
    screen.innerHTML = html;
    screen.scrollTop = 0;
    renderTabs(path);
    document.title = "UniLend";
    var h = screen.querySelector("h1");
    if (h) h.focus({ preventScroll: true });
    wireInputs();
  }

  function wireInputs() {
    var search = document.getElementById("search");
    if (search) {
      search.addEventListener("input", function () {
        ui.query = search.value;
        document.getElementById("feed").innerHTML = feedHTML();
      });
    }
  }

  function toast(message, action) {
    clearTimeout(ui.toastTimer);
    toastEl.innerHTML = '<div class="toast-box"><span>' + esc(message) + "</span>" + (action ? '<button data-go="' + esc(action.go) + '">' + esc(action.label) + "</button>" : "") + "</div>";
    ui.toastTimer = setTimeout(function () {
      toastEl.innerHTML = "";
    }, action ? 8000 : 3500);
  }

  /* The simulated partner has responded */
  store.notify = function (message, exId) {
    var path = current();
    var onIt = path === "/exchange/" + exId;
    if (onIt) {
      render();
      toast(message);
    } else {
      renderTabs(path);
      if (path === "/home" || path === "/loans") render();
      toast(message, { label: "View", go: "/exchange/" + exId });
    }
  };

  /* ---------- actions ---------- */
  function finishScan(kind, id) {
    if (kind === "handoff") {
      store.confirmHandoff(id);
      go("/handoff-done/" + id, true);
    } else {
      store.confirmReturn(id);
      go("/return-done/" + id, true);
    }
  }

  var actions = {
    back: function (el) {
      if (ui.depth > 0) {
        ui.depth--;
        history.back();
      } else {
        go(el.getAttribute("data-parent") || "/home", true);
      }
    },
    signinBack: function () {
      ui.signinStep = "email";
      ui.signinError = "";
      render();
    },
    category: function (el) {
      ui.category = el.getAttribute("data-id");
      render();
    },
    clearSearch: function () {
      ui.query = "";
      ui.category = "All";
      render();
    },
    cancelRequest: function (el) {
      store.cancelRequest(el.getAttribute("data-id"));
      toast("Request cancelled");
      go("/home", true);
    },
    accept: function (el) {
      var id = el.getAttribute("data-id");
      store.accept(id);
      toast("You accepted");
      go("/exchange/" + id, true);
    },
    decline: function (el) {
      store.decline(el.getAttribute("data-id"));
      render();
    },
    undoDecision: function (el) {
      store.undoDecision(el.getAttribute("data-id"));
      toast("Decline undone");
      render();
    },
    scan: function (el) {
      if (el.classList.contains("reading")) return;
      el.classList.add("reading");
      var hint = document.getElementById("scanhint");
      if (hint) hint.textContent = "Reading code…";
      var kind = el.getAttribute("data-kind"), id = el.getAttribute("data-id");
      setTimeout(function () {
        if (store.consumeForcedScanFail()) {
          go("/scan-failed/" + kind + "/" + id, true);
        } else {
          finishScan(kind, id);
        }
      }, cfg.scanReadMs);
    },
    retryScan: function (el) {
      ui.backupError = "";
      go("/scan/" + el.getAttribute("data-kind") + "/" + el.getAttribute("data-id"), true);
    },
    undoHandoff: function (el) {
      var id = el.getAttribute("data-id");
      store.undoHandoff(id);
      toast("Hand-off undone");
      go("/exchange/" + id, true);
    },
    undoReturn: function (el) {
      var id = el.getAttribute("data-id");
      store.undoReturn(id);
      toast("Return undone");
      go("/loan/" + id, true);
    },
    offer: function (el) {
      var pid = store.offerItem(el.getAttribute("data-id"));
      go("/passed/" + pid);
    },
    answer: function (el) {
      var pid = store.answerRequest(el.getAttribute("data-id"));
      go("/passed/" + pid);
    },
    undoPassOn: function (el) {
      store.undoPassOn(el.getAttribute("data-id"));
      toast("Undone");
      go("/pass-it-on", true);
    },
    stopOffering: function (el) {
      store.stopOffering(el.getAttribute("data-id"));
      toast("No longer offered");
      if (current().indexOf("/item/") === 0) go("/home", true);
      else render();
    },
    startClaim: function (el) {
      if (el.getAttribute("data-can") !== "true") {
        var r = store.rewards().catalogue.filter(function (c) {
          return c.id === el.getAttribute("data-id");
        })[0];
        toast("You need " + (r.cost - store.points()) + " more points for this one.");
        return;
      }
      go("/claim/" + el.getAttribute("data-id"));
    },
    claim: function (el) {
      var cid = store.claim(el.getAttribute("data-id"));
      go("/claimed/" + cid, true);
    },
    undoClaim: function (el) {
      store.undoClaim(el.getAttribute("data-id"));
      toast("Claim undone. Points returned.");
      go("/rewards", true);
    },
    board: function (el) {
      ui.board = el.getAttribute("data-id");
      render();
    },
    signOut: function () {
      store.signOut();
      ui.signinStep = "email";
      render();
    }
  };

  var forms = {
    sendCode: function () {
      var email = document.getElementById("email").value.trim().toLowerCase();
      if (!/^[^@\s]+@algomau\.ca$/.test(email)) {
        ui.signinError = "Enter your campus email, ending in @algomau.ca.";
        store.get().email = email;
        return render();
      }
      store.get().email = email;
      ui.signinError = "";
      ui.signinStep = "code";
      render();
    },
    verify: function () {
      var code = document.getElementById("code").value.trim();
      if (code !== cfg.demoCode) {
        ui.signinError = "That code doesn't match. Try " + cfg.demoCode + ".";
        return render();
      }
      ui.signinError = "";
      ui.signinStep = "email";
      store.signIn(store.get().email);
      go("/home", true);
    },
    sendRequest: function (form) {
      var id = form.getAttribute("data-id");
      var picked = form.querySelector('input[name="zone"]:checked');
      if (!picked) {
        ui.requestError = "Choose a pickup spot first.";
        return render();
      }
      ui.requestError = "";
      var e = store.request(id, picked.value);
      if (!e) return go("/unavailable/" + id, true);
      toast("Request sent to " + e.partner);
      go("/exchange/" + e.id, true);
    },
    backupCode: function (form) {
      var code = document.getElementById("backup").value.trim();
      if (code !== cfg.demoCode) {
        ui.backupError = "That code doesn't match. Check it and try again.";
        return render();
      }
      ui.backupError = "";
      finishScan(form.getAttribute("data-kind"), form.getAttribute("data-id"));
    }
  };

  document.addEventListener("click", function (ev) {
    var el = ev.target.closest("[data-act],[data-go]");
    if (!el) return;
    var act = el.getAttribute("data-act");
    if (act) {
      ev.preventDefault();
      actions[act](el);
      return;
    }
    toastEl.innerHTML = "";
    go(el.getAttribute("data-go"));
  });

  document.addEventListener("submit", function (ev) {
    var f = ev.target.closest("[data-submit]");
    if (!f) return;
    ev.preventDefault();
    forms[f.getAttribute("data-submit")](f);
  });

  window.addEventListener("hashchange", render);

  /* ---------- boot: ?start=t1|t2|t3&rewards=recognition|perks&fail=scan,item ---------- */
  store.init();
  (function () {
    var q = new URLSearchParams(location.search);
    var start = q.get("start");
    var rewards = q.get("rewards");
    if (rewards !== "recognition" && rewards !== "perks") rewards = null;
    if (start === "t1" || start === "t2" || start === "t3") {
      var fail = (q.get("fail") || "").split(",");
      store.start(start, rewards, { scan: fail.indexOf("scan") >= 0, item: fail.indexOf("item") >= 0 });
      history.replaceState(null, "", location.pathname + (start === "t1" ? "#/signin" : "#/home"));
    } else if (rewards && !cfg.lockVariant) {
      store.get().variant = rewards;
    }
  })();
  render();
})();
