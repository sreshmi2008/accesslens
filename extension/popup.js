const API_BASE = "http://localhost:8000";
const DASHBOARD_BASE = "http://localhost:3000";

const urlEl = document.getElementById("currentUrl");
const statusEl = document.getElementById("status");
const scanButton = document.getElementById("scanButton");

let currentTabUrl = "";

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTabUrl = tab?.url || "";
  urlEl.textContent = currentTabUrl || "No active tab URL found.";
  scanButton.disabled = !currentTabUrl || !currentTabUrl.startsWith("http");
}

async function scan() {
  scanButton.disabled = true;
  statusEl.textContent = "Scanning… this drives a real headless browser, can take up to a minute.";

  try {
    const res = await fetch(`${API_BASE}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: currentTabUrl }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || `Scan failed (${res.status})`);
    }
    const report = await res.json();
    statusEl.textContent = "Done — opening results.";
    chrome.tabs.create({ url: `${DASHBOARD_BASE}/dashboard/results?reportId=${report.id}` });
  } catch (err) {
    statusEl.textContent = err instanceof Error ? err.message : "Something went wrong.";
  } finally {
    scanButton.disabled = false;
  }
}

scanButton.addEventListener("click", scan);
init();
