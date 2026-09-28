// Week 4 · Practice 2 — Population statistics
// Reads one CSV and draws two charts, each answering a different question.

const DATA_URL = "data/population.csv";

// Ten most populous countries in 2024 (used for the bar chart), with short labels.
const TOP_COUNTRIES = [
  { code: "IND", label: "India" },
  { code: "CHN", label: "China" },
  { code: "USA", label: "United States" },
  { code: "IDN", label: "Indonesia" },
  { code: "PAK", label: "Pakistan" },
  { code: "NGA", label: "Nigeria" },
  { code: "BRA", label: "Brazil" },
  { code: "BGD", label: "Bangladesh" },
  { code: "RUS", label: "Russia" },
  { code: "ETH", label: "Ethiopia" }
];

let chartLine = null;
let chartBar = null;

// Shorten large population numbers for the axis, e.g. 1,450,935,791 -> "1.45B".
function formatPopulation(value) {
  if (value >= 1e9) return (value / 1e9).toFixed(2) + "B";
  if (value >= 1e6) return (value / 1e6).toFixed(1) + "M";
  if (value >= 1e3) return (value / 1e3).toFixed(0) + "K";
  return String(value);
}

const axisTick = {
  callback: (value) => formatPopulation(Number(value))
};

function buildLineChart(rows) {
  const wanted = { KOR: true, JPN: true };

  // Keep only Korea/Japan rows with a number, then sort by year.
  const series = { KOR: [], JPN: [] };
  const years = new Set();

  rows.forEach((row) => {
    const code = row["Country Code"];
    const year = Number(row.Year);
    const value = Number(row.Value);
    if (!wanted[code]) return;
    if (!Number.isFinite(year) || !Number.isFinite(value)) return;
    series[code].push({ year, value });
    years.add(year);
  });

  // Sort each country's points by year.
  series.KOR.sort((a, b) => a.year - b.year);
  series.JPN.sort((a, b) => a.year - b.year);

  const labels = [...years].sort((a, b) => a - b);

  const datasetFor = (code, color) => ({
    label: code === "KOR" ? "South Korea" : "Japan",
    borderColor: color,
    backgroundColor: color,
    // Use the points we kept, keyed by year, so labels and data line up.
    data: labels.map((year) => {
      const point = series[code].find((p) => p.year === year);
      return point ? point.value : null;
    }),
    tension: 0.2
  });

  chartLine = new Chart(document.getElementById("chart-line"), {
    type: "line",
    data: {
      labels,
      datasets: [datasetFor("KOR", "#2f5fe0"), datasetFor("JPN", "#e05656")]
    },
    options: {
      plugins: {
        title: { display: true, text: "Total population, 1960–2024" }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: axisTick,
          title: { display: true, text: "Population (people)" }
        },
        x: { title: { display: true, text: "Year" } }
      }
    }
  });
}

function buildBarChart(rows) {
  const codeToLabel = Object.fromEntries(TOP_COUNTRIES.map((c) => [c.code, c.label]));
  const wanted = new Set(TOP_COUNTRIES.map((c) => c.code));

  // Collect each country's 2024 value (a whitelist keeps out aggregate rows).
  const values = {};
  rows.forEach((row) => {
    if (row.Year !== "2024") return;
    const code = row["Country Code"];
    const value = Number(row.Value);
    if (wanted.has(code) && Number.isFinite(value)) {
      values[code] = value;
    }
  });

  // Sort biggest first, like a ranked comparison.
  const ordered = TOP_COUNTRIES
    .filter((c) => values[c.code] !== undefined)
    .sort((a, b) => values[b.code] - values[a.code]);

  chartBar = new Chart(document.getElementById("chart-bar"), {
    type: "bar",
    data: {
      labels: ordered.map((c) => c.label),
      datasets: [
        {
          label: "Population (people)",
          data: ordered.map((c) => values[c.code]),
          backgroundColor: "#2f5fe0"
        }
      ]
    },
    options: {
      plugins: {
        title: { display: true, text: "Population in 2024, top 10 countries" },
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: axisTick,
          title: { display: true, text: "Population (people)" }
        }
      }
    }
  });
}

// Tab switching: show one panel, hide the other, then resize the revealed chart.
function showPanel(id) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.panel === id));
  });

  ["panel-line", "panel-bar"].forEach((panelId) => {
    document.getElementById(panelId).hidden = panelId !== id;
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (id === "panel-line" && chartLine) chartLine.resize();
      if (id === "panel-bar" && chartBar) chartBar.resize();
    });
  });
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => showPanel(btn.dataset.panel));
});

Papa.parse(DATA_URL, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: (results) => {
    const rows = results.data || [];
    if (rows.length === 0) {
      document.getElementById("load-notice").hidden = false;
      return;
    }
    buildLineChart(rows);
    buildBarChart(rows);
  },
  error: () => {
    document.getElementById("load-notice").hidden = false;
  }
});