/* Session log. It supports the note-taker and does not replace them.
   Each task run records taps, screens, backtracks, recovery states and Pass-It-On,
   on this device only, under a participant ID. No names or personal data are kept. */
(function () {
  var KEY = "unilend.log.v1";
  var mem = null;
  var store = window.UNILEND_STORE;

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return mem || { participant: "P01", runs: [] };
  }
  function write(d) {
    mem = d;
    try {
      localStorage.setItem(KEY, JSON.stringify(d));
    } catch (e) {}
  }

  var END = {
    // A task ends at its confirmation, as defined in the task table
    t1: function (path) {
      var m = path.match(/^\/handoff-done\/(.+)$/);
      if (!m) return false;
      var e = store.exchange(m[1]);
      return !!e && e.role === "borrower";
    },
    t2: function (path) {
      return /^\/return-done\//.test(path);
    },
    t3: function (path) {
      if (!/^\/claimed\//.test(path)) return false;
      return store.get().exchanges.some(function (e) {
        return e.id === "ex-t3" && (e.status === "active" || e.status === "returned");
      });
    }
  };

  function current(d) {
    var r = d.runs[d.runs.length - 1];
    return r && !r.closed ? r : null;
  }

  var api = {
    participant: function (id) {
      var d = read();
      if (id) {
        d.participant = id;
        write(d);
      }
      return d.participant;
    },

    start: function (task, variant, source) {
      var d = read();
      d.runs.forEach(function (r) {
        r.closed = true;
      });
      d.runs.push({
        participant: d.participant,
        variant: variant === "perks" ? "B" : "A",
        task: task,
        source: source,
        startedAt: new Date().toISOString(),
        start: Date.now(),
        end: null,
        taps: 0,
        backtracks: 0,
        recovery: [],
        passSeen: false,
        passTaken: false,
        path: []
      });
      write(d);
    },

    tap: function () {
      var d = read(), r = current(d);
      if (!r) return;
      if (!r.end) r.taps++;
      write(d);
    },

    backtrack: function () {
      var d = read(), r = current(d);
      if (!r) return;
      if (!r.end) r.backtracks++;
      write(d);
    },

    view: function (path) {
      var d = read(), r = current(d);
      if (!r) return;
      if (r.path[r.path.length - 1] !== path && r.path.length < 80) r.path.push(path);
      var rec = null;
      if (/^\/unavailable\//.test(path)) rec = "item";
      if (/^\/scan-failed\//.test(path)) rec = "scan";
      if (/^\/no-show\//.test(path)) rec = "no-show";
      var ex = path.match(/^\/exchange\/(.+)$/);
      if (ex && store.exchange(ex[1]) && store.exchange(ex[1]).status === "refused") rec = "refused";
      if (rec && r.recovery.indexOf(rec) < 0) r.recovery.push(rec);
      if (path === "/pass-it-on") r.passSeen = true;
      if (/^\/passed\//.test(path)) r.passTaken = true;
      if (!r.end && END[r.task] && END[r.task](path)) r.end = Date.now();
      write(d);
    },

    runs: function () {
      return read().runs;
    },

    rows: function () {
      return read().runs.map(function (r) {
        var pass = "";
        if (r.task === "t2") pass = r.passTaken ? "taken" : r.passSeen ? "declined" : "not_seen";
        return {
          participant_id: r.participant,
          variant: r.variant,
          task: r.task.toUpperCase(),
          started_at: r.startedAt,
          started_by: r.source,
          end_reached: r.end ? "yes" : "no",
          auto_time_sec: r.end ? Math.round((r.end - r.start) / 100) / 10 : "",
          taps_to_end: r.taps,
          backtracks_to_end: r.backtracks,
          recovery_seen: r.recovery.length ? r.recovery.join("+") : "none",
          pass_it_on: pass,
          screens: r.path.join(" > ")
        };
      });
    },

    csv: function () {
      var rows = api.rows();
      var cols = ["participant_id", "variant", "task", "started_at", "started_by", "end_reached", "auto_time_sec", "taps_to_end", "backtracks_to_end", "recovery_seen", "pass_it_on", "screens"];
      function cell(v) {
        v = String(v);
        return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      }
      return [cols.join(",")].concat(rows.map(function (r) {
        return cols.map(function (c) {
          return cell(r[c]);
        }).join(",");
      })).join("\n");
    },

    clear: function () {
      var d = read();
      d.runs = [];
      write(d);
    }
  };

  window.UNILEND_LOG = api;
})();
