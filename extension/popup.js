const API_BASE = "http://localhost:8000";
const DASHBOARD_BASE = "http://localhost:3000";
const TOKEN_KEY = "accessLensToken";

const loginView = document.getElementById("loginView");
const scanView = document.getElementById("scanView");
const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");
const urlEl = document.getElementById("currentUrl");
const statusEl = document.getElementById("status");
const scanButton = document.getElementById("scanButton");
const logoutButton = document.getElementById("logoutButton");

let currentTabUrl = "";

function getToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get([TOKEN_KEY], (result) => resolve(result[TOKEN_KEY] || null));
  });
}

function setToken(token) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [TOKEN_KEY]: token }, resolve);
  });
}

function clearToken() {
  return new Promise((resolve) => {
    chrome.storage.local.remove([TOKEN_KEY], resolve);
  });
}

async function showScanView() {
  loginView.classList.add("hidden");
  scanView.classList.remove("hidden");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTabUrl = tab?.url || "";
  urlEl.textContent = currentTabUrl || "No active tab URL found.";
  scanButton.disabled = !currentTabUrl || !currentTabUrl.startsWith("http");
}

function showLoginView() {
  scanView.classList.add("hidden");
  loginView.classList.remove("hidden");
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  loginStatus.textContent = "Logging in…";

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.detail || `Login failed (${res.status})`);

    await setToken(body.access_token);
    loginStatus.textContent = "";
    await showScanView();
  } catch (err) {
    loginStatus.textContent = err instanceof Error ? err.message : "Something went wrong.";
  }
}

async function handleLogout() {
  await clearToken();
  showLoginView();
}

async function scan() {
  const token = await getToken();
  if (!token) {
    showLoginView();
    return;
  }

  scanButton.disabled = true;
  statusEl.textContent = "Scanning… this drives a real headless browser, can take up to a minute.";

  try {
    const res = await fetch(`${API_BASE}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ url: currentTabUrl }),
    });
    if (res.status === 401) {
      await clearToken();
      showLoginView();
      loginStatus.textContent = "Your session expired. Please log in again.";
      return;
    }
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

async function init() {
  const token = await getToken();
  if (token) {
    await showScanView();
  } else {
    showLoginView();
  }
}

loginForm.addEventListener("submit", handleLogin);
scanButton.addEventListener("click", scan);
logoutButton.addEventListener("click", handleLogout);
init();
