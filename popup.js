// ============================================================
// Email Harvester — popup logic
// Handles scanning, rendering chart on canvas, list, search,
// copy & CSV export, and persistent state.
// ============================================================

const state = {
  url: "",
  title: "",
  emails: [],
  filter: "",
};

// ----- DOM refs -----
const $ = (id) => document.getElementById(id);
const scanBtn = $("scanBtn");
const statTotal = $("statTotal");
const statDomains = $("statDomains");
const statTop = $("statTop");
const chartCanvas = $("chart");
const legendBox = $("legend");
const chartSub = $("chartSub");
const panelChart = $("panel-chart");
const panelList = $("panel-list");
const emptyState = $("emptyState");
const emailList = $("emailList");
const searchInput = $("searchInput");
const copyBtn = $("copyBtn");
const csvBtn = $("csvBtn");
const pageInfo = $("pageInfo");
const toast = $("toast");

// ----- Tabs -----
document.querySelectorAll(".tab").forEach((t) => {
  t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    const target = t.dataset.tab;
    if (target === "chart") {
      panelChart.classList.remove("hidden");
      panelList.classList.add("hidden");
    } else {
      panelChart.classList.add("hidden");
      panelList.classList.remove("hidden");
    }
  });
});

// ----- Toast -----
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1600);
}

// ----- Domain helpers -----
function domainOf(email) {
  const at = email.lastIndexOf("@");
  return at >= 0 ? email.slice(at + 1) : "";
}

function getDomainCounts(emails) {
  const counts = {};
  for (const e of emails) {
    const d = domainOf(e);
    if (!d) continue;
    counts[d] = (counts[d] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

// ----- Premium gold gradient palette for bars -----
const PALETTE = [
  ["#f5d28a", "#a87c2c"],
  ["#e9c79a", "#8a5a1f"],
  ["#d4a857", "#6b4416"],
  ["#c9b079", "#7c5a25"],
  ["#b89556", "#5b3d12"],
  ["#a8884a", "#4a3210"],
  ["#9d7e44", "#3f2a0d"],
  ["#8e7140", "#352309"],
];

function colorFor(i) {
  return PALETTE[i % PALETTE.length];
}

// ============================================================
// Custom canvas bar chart — designed for the premium dark UI
// ============================================================
function drawChart(canvas, data) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;

  // Resize to actual displayed size for sharp rendering.
  const cssW = canvas.clientWidth || 380;
  const cssH = canvas.clientHeight || 220;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.clearRect(0, 0, cssW, cssH);

  if (!data.length) {
    ctx.fillStyle = "#6b7385";
    ctx.font = "12px -apple-system, Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("No data available", cssW / 2, cssH / 2);
    return;
  }

  const top = data.slice(0, 8);
  const padL = 14;
  const padR = 14;
  const padT = 14;
  const padB = 36;
  const chartW = cssW - padL - padR;
  const chartH = cssH - padT - padB;
  const max = Math.max(...top.map((d) => d[1]));

  // Horizontal grid lines.
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  const gridSteps = 4;
  for (let i = 0; i <= gridSteps; i++) {
    const y = padT + (chartH / gridSteps) * i;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + chartW, y);
    ctx.stroke();
  }

  // Bars.
  const gap = 8;
  const barW = (chartW - gap * (top.length - 1)) / top.length;

  top.forEach((d, i) => {
    const [domain, count] = d;
    const h = max > 0 ? (count / max) * chartH : 0;
    const x = padL + i * (barW + gap);
    const y = padT + (chartH - h);

    // Gradient fill.
    const [c1, c2] = colorFor(i);
    const grad = ctx.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;

    // Rounded top.
    const r = Math.min(5, barW / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.lineTo(x + barW - r, y);
    ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
    ctx.lineTo(x + barW, y + h);
    ctx.closePath();
    ctx.fill();

    // Subtle inner highlight for premium feel.
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(x + 1, y + 1, barW - 2, 1);

    // Value label above bar.
    ctx.fillStyle = "#e9ecf1";
    ctx.font = "600 11px -apple-system, Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    if (h > 14) {
      ctx.fillText(String(count), x + barW / 2, y - 4);
    } else {
      ctx.fillText(String(count), x + barW / 2, y - 4);
    }

    // Domain label below bar.
    ctx.save();
    ctx.fillStyle = "#9aa3b2";
    ctx.font = "10px -apple-system, Inter, sans-serif";
    ctx.textAlign = "center";
    let label = domain;
    const maxLen = Math.floor(barW / 5.5);
    if (label.length > maxLen) label = label.slice(0, Math.max(3, maxLen - 1)) + "…";
    ctx.fillText(label, x + barW / 2, padT + chartH + 14);
    ctx.restore();
  });
}

// ----- Legend -----
function renderLegend(data) {
  legendBox.innerHTML = "";
  data.slice(0, 8).forEach((d, i) => {
    const [domain, count] = d;
    const [c1, c2] = colorFor(i);
    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `
      <span class="legend-dot" style="background: linear-gradient(135deg, ${c1}, ${c2});"></span>
      <span>${escapeHtml(domain)} · ${count}</span>
    `;
    legendBox.appendChild(item);
  });
}

// ----- Email list -----
function renderList() {
  const filter = state.filter.trim().toLowerCase();
  const items = state.emails.filter((e) => !filter || e.includes(filter));
  emailList.innerHTML = "";
  if (!items.length) {
    const li = document.createElement("li");
    li.className = "email-item";
    li.style.justifyContent = "center";
    li.style.color = "var(--text-mute)";
    li.textContent = filter ? "No matches" : "No emails collected yet";
    emailList.appendChild(li);
    return;
  }
  for (const email of items) {
    const li = document.createElement("li");
    li.className = "email-item";
    li.innerHTML = `
      <span class="email-text">${escapeHtml(email)}</span>
      <span class="email-domain">${escapeHtml(domainOf(email))}</span>
    `;
    li.title = "Click to copy";
    li.addEventListener("click", () => {
      navigator.clipboard.writeText(email).then(() => showToast("Copied: " + email));
    });
    emailList.appendChild(li);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m]));
}

// ----- Render orchestrator -----
function renderAll() {
  const total = state.emails.length;
  const counts = getDomainCounts(state.emails);
  statTotal.textContent = total;
  statDomains.textContent = counts.length;
  statTop.textContent = counts.length ? counts[0][0] : "—";

  if (total > 0) {
    emptyState.classList.add("hidden");
    // Show whichever panel is currently active.
    const activeTab = document.querySelector(".tab.active").dataset.tab;
    if (activeTab === "chart") {
      panelChart.classList.remove("hidden");
      panelList.classList.add("hidden");
    } else {
      panelList.classList.remove("hidden");
      panelChart.classList.add("hidden");
    }
    chartSub.textContent = `${counts.length} domain${counts.length === 1 ? "" : "s"} · ${total} email${total === 1 ? "" : "s"}`;
    drawChart(chartCanvas, counts);
    renderLegend(counts);
    renderList();
  } else {
    emptyState.classList.remove("hidden");
    panelChart.classList.add("hidden");
    panelList.classList.add("hidden");
  }

  pageInfo.textContent = state.url ? truncateUrl(state.url) : "—";
}

function truncateUrl(u) {
  try {
    const url = new URL(u);
    return url.hostname + (url.pathname.length > 1 ? url.pathname : "");
  } catch (e) {
    return u;
  }
}

// ============================================================
// Scan: inject content script into the active tab and collect.
// ============================================================
async function scanActiveTab() {
  scanBtn.classList.add("scanning");
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      showToast("No active tab");
      return;
    }
    if (
      !tab.url ||
      tab.url.startsWith("chrome://") ||
      tab.url.startsWith("edge://") ||
      tab.url.startsWith("chrome-extension://") ||
      tab.url.startsWith("about:")
    ) {
      showToast("Cannot scan this page");
      return;
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      files: ["content.js"],
    });

    // Merge results from all frames.
    const merged = new Set();
    let pageUrl = tab.url;
    let pageTitle = tab.title || "";
    for (const r of results || []) {
      if (r && r.result) {
        if (r.result.emails) r.result.emails.forEach((e) => merged.add(e));
        if (r.frameId === 0) {
          pageUrl = r.result.url || pageUrl;
          pageTitle = r.result.title || pageTitle;
        }
      }
    }

    state.emails = Array.from(merged).sort();
    state.url = pageUrl;
    state.title = pageTitle;
    await chrome.storage.local.set({
      lastScan: { url: state.url, title: state.title, emails: state.emails, ts: Date.now() },
    });

    renderAll();
    showToast(state.emails.length ? `Found ${state.emails.length} email${state.emails.length === 1 ? "" : "s"}` : "No emails found");
  } catch (err) {
    console.error(err);
    showToast("Scan failed: " + (err.message || "unknown"));
  } finally {
    scanBtn.classList.remove("scanning");
  }
}

// ----- Restore last scan from storage -----
async function restore() {
  try {
    const { lastScan } = await chrome.storage.local.get("lastScan");
    if (lastScan && lastScan.emails) {
      state.emails = lastScan.emails;
      state.url = lastScan.url || "";
      state.title = lastScan.title || "";
    }
  } catch (e) {}
  renderAll();
}

// ----- Copy & CSV -----
copyBtn.addEventListener("click", () => {
  if (!state.emails.length) return showToast("Nothing to copy");
  navigator.clipboard.writeText(state.emails.join("\n")).then(() =>
    showToast(`Copied ${state.emails.length} email${state.emails.length === 1 ? "" : "s"}`)
  );
});

csvBtn.addEventListener("click", () => {
  if (!state.emails.length) return showToast("Nothing to export");
  const rows = ["email,domain"].concat(
    state.emails.map((e) => `${e},${domainOf(e)}`)
  );
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `emails-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("CSV exported");
});

// ----- Search -----
searchInput.addEventListener("input", (e) => {
  state.filter = e.target.value;
  renderList();
});

// ----- Scan button -----
scanBtn.addEventListener("click", scanActiveTab);

// ----- Init -----
restore();
