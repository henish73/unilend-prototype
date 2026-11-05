/* State, task starting points and every action on the data. No reward-type logic. */
(function () {
  var KEY = "unilend.v1";
  var cfg = window.UNILEND_CONFIG;
  var data = window.UNILEND_DATA;
  var memoryFallback = null;

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : memoryFallback;
    } catch (e) {
      return memoryFallback;
    }
  }

  function write(s) {
    memoryFallback = s;
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch (e) {
      /* private window: the in-memory copy still works for this page load */
    }
  }

  function entry(id, label, amount) {
    return { id: id, label: label, amount: amount };
  }

  function base(variant) {
    return {
      variant: variant,
      task: "t1",
      signedIn: false,
      email: "",
      ledger: [entry("welcome", "Welcome to UniLend", 20)],
      exchanges: [],
      claims: [],
      offered: [],
      answered: [],
      takenItems: [],
      chain: ["Mei", "Sam", "You"],
      passOns: [],
      force: { scan: false, item: false, decline: false }
    };
  }

  /* The starting state for each test task. */
  function seed(task, variant, force) {
    var s = base(variant);
    s.task = task;
    s.force = { scan: !!(force && force.scan), item: !!(force && force.item), decline: !!(force && force.decline) };
    if (task === "t1") {
      s.email = "student@algomau.ca";
    }
    if (task === "t2") {
      s.signedIn = true;
      s.email = "student@algomau.ca";
      s.ledger.push(entry("seed-1", "Lent an umbrella last week", 15));
      s.exchanges.push({
        id: "ex-t2",
        itemId: "charger-sam",
        role: "borrower",
        partner: "Sam",
        zone: "library",
        status: "active",
        due: "Today, 6 p.m.",
        since: "Yesterday, 2:30 p.m."
      });
    }
    // Extra state, outside the three test tasks: a loan that has gone past its due time.
    if (task === "late") {
      s.signedIn = true;
      s.email = "student@algomau.ca";
      s.ledger.push(entry("seed-1", "Lent an umbrella last week", 15));
      s.exchanges.push({
        id: "ex-late",
        itemId: "charger-sam",
        role: "borrower",
        partner: "Sam",
        zone: "library",
        status: "active",
        overdue: true,
        due: "Yesterday, 6 p.m.",
        since: "Two days ago"
      });
    }
    if (task === "t3") {
      s.signedIn = true;
      s.email = "student@algomau.ca";
      s.ledger.push(entry("seed-1", "Lent an umbrella last week", 15));
      s.ledger.push(entry("seed-2", "Lent a textbook last month", 15));
      s.ledger.push(entry("seed-3", "Returned a lab coat on time", 5));
      s.ledger.push(entry("seed-4", "Passed help on to a classmate", 10));
      s.exchanges.push({
        id: "ex-t3",
        itemId: "calc-me",
        role: "lender",
        partner: "Sam",
        zone: "library",
        status: "incoming",
        due: "Today, 5 p.m.",
        message: "I have a quiz at 3 and forgot mine. Can I borrow yours until 5?"
      });
    }
    return s;
  }

  function itemById(id) {
    var all = data.items.concat(data.myItems);
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  function zoneById(id) {
    for (var i = 0; i < data.zones.length; i++) if (data.zones[i].id === id) return data.zones[i];
    return data.zones[0];
  }

  var state = null;
  var listeners = [];
  var timers = {};

  function save() {
    write(state);
    listeners.forEach(function (fn) {
      fn();
    });
  }

  function ex(id) {
    for (var i = 0; i < state.exchanges.length; i++) if (state.exchanges[i].id === id) return state.exchanges[i];
    return null;
  }

  function points() {
    return state.ledger.reduce(function (n, e) {
      return n + e.amount;
    }, 0);
  }

  function dropLedger(id) {
    state.ledger = state.ledger.filter(function (e) {
      return e.id !== id;
    });
  }

  /* The simulated partner replies by itself a few seconds after the participant acts. */
  function schedule(e) {
    if (timers[e.id]) return;
    var wait = cfg.simDelayMs;
    timers[e.id] = setTimeout(function () {
      delete timers[e.id];
      var cur = ex(e.id);
      if (!cur) return;
      if (cur.status === "requested" && state.force.decline) {
        state.force.decline = false;
        cur.status = "refused";
        save();
        api.notify(cur.partner + " can't lend it right now.", cur.id);
        return;
      }
      if (cur.status === "requested" || cur.status === "enroute") {
        var was = cur.status;
        cur.status = "accepted";
        save();
        api.notify(
          was === "requested"
            ? cur.partner + " accepted. Meet at " + zoneById(cur.zone).name + "."
            : cur.partner + " is at " + zoneById(cur.zone).name + ".",
          cur.id
        );
      }
    }, wait);
  }

  var api = {
    notify: function () {},

    init: function () {
      state = read();
      if (!state || !state.exchanges) state = seed("t1", cfg.rewards);
      if (cfg.lockVariant) state.variant = cfg.rewards;
      write(state);
      state.exchanges.forEach(function (e) {
        if (e.status === "requested" || e.status === "enroute") schedule(e);
      });
    },

    start: function (task, variant, force) {
      Object.keys(timers).forEach(function (k) {
        clearTimeout(timers[k]);
        delete timers[k];
      });
      var v = cfg.lockVariant ? cfg.rewards : variant || (state && state.variant) || cfg.rewards;
      state = seed(task, v, force);
      write(state);
    },

    get: function () {
      return state;
    },
    subscribe: function (fn) {
      listeners.push(fn);
    },
    item: itemById,
    zone: zoneById,
    exchange: ex,
    points: points,
    rewards: function () {
      return window.UNILEND_REWARDS[state.variant] || window.UNILEND_REWARDS.recognition;
    },

    signIn: function (email) {
      state.email = email;
      state.signedIn = true;
      save();
    },
    signOut: function () {
      state.signedIn = false;
      save();
    },

    /* Returns null when the item has just been taken (recovery state). */
    request: function (itemId, zone) {
      var it = itemById(itemId);
      var forced = state.force.item;
      if (forced) state.force.item = false;
      if (it.goesUnavailable || forced) {
        if (state.takenItems.indexOf(itemId) < 0) state.takenItems.push(itemId);
        save();
        return null;
      }
      var e = {
        id: "ex-" + Date.now(),
        itemId: itemId,
        role: "borrower",
        partner: it.owner,
        zone: zone,
        status: "requested",
        due: "Today, 6 p.m."
      };
      state.exchanges.push(e);
      save();
      schedule(e);
      return e;
    },

    cancelRequest: function (id) {
      state.exchanges = state.exchanges.filter(function (e) {
        return e.id !== id;
      });
      save();
    },

    accept: function (id) {
      var e = ex(id);
      e.status = "enroute";
      save();
      schedule(e);
    },
    decline: function (id) {
      ex(id).status = "declined";
      save();
    },
    undoDecision: function (id) {
      ex(id).status = "incoming";
      save();
    },

    /* First scan fails only when the facilitator has switched that on. */
    consumeForcedScanFail: function () {
      if (state.force.scan) {
        state.force.scan = false;
        save();
        return true;
      }
      return false;
    },

    confirmHandoff: function (id) {
      var e = ex(id);
      e.status = "active";
      e.since = "Today, just now";
      if (e.role === "lender") {
        var it = itemById(e.itemId);
        state.ledger.push(entry(id + ":handoff", "Lent your " + it.short + " to " + e.partner, it.points));
      }
      save();
    },
    undoHandoff: function (id) {
      ex(id).status = "accepted";
      dropLedger(id + ":handoff");
      save();
    },

    confirmReturn: function (id) {
      var e = ex(id);
      e.status = "returned";
      // On-time points only. A late return costs nothing, because UniLend has no fines.
      if (e.role === "borrower" && !e.overdue) {
        var it = itemById(e.itemId);
        state.ledger.push(entry(id + ":return", "Returned a " + it.short + " on time", data.points.returnOnTime));
      }
      save();
    },
    askForMoreTime: function (id) {
      var e = ex(id);
      e.previousDue = e.due;
      e.due = "Tomorrow, noon";
      e.overdue = false;
      e.extended = true;
      save();
    },
    undoMoreTime: function (id) {
      var e = ex(id);
      e.due = e.previousDue;
      e.overdue = true;
      e.extended = false;
      save();
    },
    undoReturn: function (id) {
      ex(id).status = "active";
      dropLedger(id + ":return");
      save();
    },

    /* Pass-It-On: either offer an item or answer an open request. */
    offerItem: function (itemId) {
      var pid = "pass-" + Date.now();
      state.offered.push(itemId);
      state.chain.push("Next classmate");
      state.passOns.push({ id: pid, kind: "offer", itemId: itemId });
      state.ledger.push(entry(pid, "Passed help on: offered your " + itemById(itemId).short, data.points.passItOn));
      save();
      return pid;
    },
    answerRequest: function (reqId) {
      var req = data.openRequests.filter(function (r) {
        return r.id === reqId;
      })[0];
      var pid = "pass-" + Date.now();
      var exId = "ex-" + reqId;
      state.answered.push(reqId);
      state.chain.push(req.who);
      state.passOns.push({ id: pid, kind: "answer", reqId: reqId, exId: exId });
      state.ledger.push(entry(pid, "Passed help on: answered " + req.who + "'s request", data.points.passItOn));
      state.exchanges.push({
        id: exId,
        itemId: req.itemId,
        role: "lender",
        partner: req.who,
        zone: req.zone,
        status: "enroute",
        due: "Today, 5 p.m."
      });
      save();
      schedule(ex(exId));
      return pid;
    },
    passOn: function (pid) {
      return state.passOns.filter(function (p) {
        return p.id === pid;
      })[0];
    },
    undoPassOn: function (pid) {
      var p = api.passOn(pid);
      if (!p) return;
      dropLedger(pid);
      state.passOns = state.passOns.filter(function (x) {
        return x.id !== pid;
      });
      state.chain.pop();
      if (p.kind === "offer") {
        state.offered = state.offered.filter(function (i) {
          return i !== p.itemId;
        });
      } else {
        state.answered = state.answered.filter(function (r) {
          return r !== p.reqId;
        });
        state.exchanges = state.exchanges.filter(function (e) {
          return e.id !== p.exId;
        });
      }
      save();
    },
    stopOffering: function (itemId) {
      state.offered = state.offered.filter(function (i) {
        return i !== itemId;
      });
      save();
    },

    /* The same claim steps and landing place for every catalogue item. */
    claim: function (rewardId) {
      var r = api.rewards().catalogue.filter(function (c) {
        return c.id === rewardId;
      })[0];
      var cid = "claim-" + Date.now();
      state.claims.push({ id: cid, rewardId: r.id, name: r.name, cost: r.cost });
      state.ledger.push(entry(cid, "Claimed: " + r.name, -r.cost));
      save();
      return cid;
    },
    undoClaim: function (cid) {
      state.claims = state.claims.filter(function (c) {
        return c.id !== cid;
      });
      dropLedger(cid);
      save();
    }
  };

  window.UNILEND_STORE = api;
})();
