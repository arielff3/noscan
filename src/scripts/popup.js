const ids = [
  "enabled",
  "debug",
  "clipboard",
  "context",
  "selection",
  "focus",
  "shortcuts",
];

const $ = (id) => document.getElementById(id);

async function load() {
  const def = {
    enabled: true,
    debug: false,
    clipboard: true,
    context: true,
    selection: true,
    focus: true,
    shortcuts: true,
    whitelist: [],
  };
  const cfg = await chrome.storage.sync.get(def);
  ids.forEach((k) => ($(k).checked = cfg[k]));
  $("whitelist").value = (cfg.whitelist || []).join("\n");
}
load();

$("save").onclick = async () => {
  const cfg = {};
  ids.forEach((k) => (cfg[k] = $(k).checked));

  cfg.whitelist = $("whitelist")
    .value.split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  await chrome.storage.sync.set(cfg);
  chrome.runtime.sendMessage({ type: "updateConfig" });
  const status = document.getElementById("status");
  status.style.display = "block";
  setTimeout(() => (status.style.display = "none"), 1500);
};
