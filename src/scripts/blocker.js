/* SPDX‑License‑Identifier: MIT */
/*  NO‑SCAN  v0.3.2
    – stops *everything* only when the global switch is on
    – no logs when disabled                                             */

(() => {
  /* ---------- default config ---------- */
  const DEF = {
    enabled: true, // master switch
    debug: false, // console logs
    clipboard: true, // all groups default to ON
    context: true,
    selection: true,
    focus: true,
    shortcuts: true,
    whitelist: [],
  };

  /* ---------- event groups ---------- */
  const GROUPS = {
    clipboard: ["copy", "cut", "paste"],
    context: ["contextmenu"],
    selection: ["selectionchange"],
    focus: ["visibilitychange", "blur", "focus"],
  };
  const SHORTCUT_KEYS = ["c", "v", "x", "a"];
  const ALL_EVENTS = Array.from(new Set(Object.values(GROUPS).flat()));

  /* ---------- runtime state ---------- */
  let CFG = { ...DEF };
  let blockedSet = new Set();
  let listenersInstalled = false;

  const log = (...a) =>
    CFG.debug && CFG.enabled && console.log("%cNO‑SCAN", "color:blue", ...a);

  /* ---------- build current blocked set ---------- */
  function rebuildBlockedSet() {
    blockedSet.clear();
    Object.entries(GROUPS).forEach(([group, evs]) => {
      if (CFG[group]) evs.forEach((e) => blockedSet.add(e));
    });
  }

  /* ---------- single, global handlers ---------- */
  function installListenersOnce() {
    if (listenersInstalled) return;
    listenersInstalled = true;

    /* Capture‑phase stopper */
    const stopper = (e) => {
      if (!CFG.enabled) return; // extension OFF → ignore
      if (blockedSet.has(e.type)) {
        e.stopImmediatePropagation();
        log("blocked", e.type);
      }
    };
    ALL_EVENTS.forEach((t) => window.addEventListener(t, stopper, true));

    /* Keyboard shortcuts */
    const keyHandler = (e) => {
      if (!CFG.enabled || !CFG.shortcuts) return;
      if (
        (e.ctrlKey || e.metaKey) &&
        SHORTCUT_KEYS.includes(e.key.toLowerCase())
      ) {
        e.stopImmediatePropagation();
        log("blocked shortcut", e.key);
      }
    };
    ["keydown", "keyup", "keypress"].forEach((t) =>
      window.addEventListener(t, keyHandler, true)
    );

    /* Monkey‑patch add/remove */
    const origAdd = EventTarget.prototype.addEventListener;
    const origRem = EventTarget.prototype.removeEventListener;

    EventTarget.prototype.addEventListener = function (t, l, o) {
      if (CFG.enabled && blockedSet.has(t)) return;
      return origAdd.call(this, t, l, o);
    };
    EventTarget.prototype.removeEventListener = function (t, l, o) {
      if (CFG.enabled && blockedSet.has(t)) return;
      return origRem.call(this, t, l, o);
    };

    /* Block element.onXXX properties once (harmless when disabled) */
    const protos = [
      Window.prototype,
      Document.prototype,
      HTMLElement.prototype,
    ];
    const blockProp = (p) =>
      protos.forEach((pr) =>
        Object.defineProperty(pr, p, {
          enumerable: false,
          configurable: false,
          get() {
            return null;
          },
          set() {},
        })
      );
    ALL_EVENTS.forEach((ev) => blockProp("on" + ev));
    ["keydown", "keyup", "keypress"].forEach((ev) => blockProp("on" + ev));
  }

  /* ---------- apply (or re‑apply) current config ---------- */
  async function applyConfig() {
    const stored = await chrome.storage.sync.get(DEF);
    CFG = { ...DEF, ...stored };

    const host = location.hostname.replace(/^www\./, "");
    const skip = CFG.whitelist.some(
      (d) => host === d || host.endsWith("." + d)
    );

    if (skip) {
      if (CFG.debug)
        console.log("%cNO‑SCAN – whitelist, not applied", "color:gray", host);
      return;
    }

    rebuildBlockedSet();
    installListenersOnce();

    if (CFG.enabled) log("active – blocking:", [...blockedSet]);
    else if (CFG.debug) console.log("%cNO‑SCAN disabled", "color:gray");
  }

  /* ---------- listen for popup changes ---------- */
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "updateConfig") applyConfig();
  });

  applyConfig(); // first run
})();
