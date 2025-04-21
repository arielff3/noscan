### What is NO SCAN?

NO SCAN is a lightweight, open‑source extension that **blocks web pages from intercepting sensitive browser events** such as:

* copy, cut and paste  
* right‑click context‑menu  
* text selection  
* tab / window focus and visibility  
* common Ctrl / ⌘ keyboard shortcuts  

The goal is **privacy protection**: some sites use these events to fingerprint, track behaviour or even break normal clipboard usage.  
With NO SCAN you decide which groups to block, and you can disable everything with a single switch.

---

### Features

* ✅ One‑click *ON/OFF* master switch  
* ✅ Per‑group toggles (clipboard, context‑menu, selection, focus, shortcuts)  
* ✅ Optional console logs for debugging  
* ✅ Works automatically on every website  
* ✅ Zero network requests – 100 % local  
* ✅ Open‑source (MIT)  

---

### How it works

* Runs a tiny content script that stops events in the **capture phase** before page scripts can see them.  
* Patches `addEventListener`/`removeEventListener` and element `on*` properties so future listeners are ignored.  
* Saves your settings with `chrome.storage.sync` (no external servers).

---

### Permissions

| Permission | Why it is needed |
|------------|------------------|
| **storage** | Store your blocking preferences and debug flag locally. |

No other permissions are requested.

---

### Privacy

NO SCAN **does not collect, transmit or store** any personal data.  
All logic runs locally in your browser.  
Source code: <https://github.com/arielff3/noscan>

---

### Changelog

**0.3.2** – Initial public version

## License
MIT – see the [LICENSE](LICENSE) file for details.