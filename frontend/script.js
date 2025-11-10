// frontend/script.js
// Rubik's Cube Solver - Clean + Fixed UI + Step-by-Step Display

const faces = ["Front", "Back", "Top", "Bottom", "Left", "Right"];
const colors = {
  white: "#ffffff",
  yellow: "#ffff00",
  red: "#ff0000",
  orange: "#ffa500",
  blue: "#0000ff",
  green: "#008000"
};

// Fixed centers (standard cube orientation)
const fixedCenters = {
  Front: "blue",
  Back: "green",
  Top: "white",
  Bottom: "yellow",
  Left: "orange",
  Right: "red"
};

// --- DOM Elements ---
const cubeContainer = document.getElementById("cube");
const colorPicker = document.getElementById("colorPicker");
const message = document.getElementById("message");
const resultEl = document.getElementById("result");

// --- Layout ---
cubeContainer.style.display = "grid";
cubeContainer.style.gridTemplateColumns = "repeat(3, auto)";
cubeContainer.style.gridTemplateRows = "repeat(2, auto)";
cubeContainer.style.gap = "32px";
cubeContainer.style.justifyContent = "center";
cubeContainer.style.alignItems = "center";
cubeContainer.style.marginTop = "25px";

// --- Build Faces ---
faces.forEach(faceName => {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.alignItems = "center";
  wrapper.style.gap = "8px";

  const label = document.createElement("div");
  label.textContent = faceName;
  label.style.fontWeight = "600";
  label.style.marginBottom = "4px";

  const faceDiv = document.createElement("div");
  faceDiv.classList.add("face");
  faceDiv.dataset.face = faceName;
  faceDiv.style.display = "grid";
  faceDiv.style.gridTemplateColumns = "repeat(3, 48px)";
  faceDiv.style.gridGap = "6px";

  for (let i = 0; i < 9; i++) {
    const sticker = document.createElement("div");
    sticker.classList.add("sticker");
    sticker.style.width = "48px";
    sticker.style.height = "48px";
    sticker.style.borderRadius = "6px";
    sticker.style.backgroundColor = "#f0f0f0";
    sticker.style.transition = "transform 0.15s ease";
    sticker.style.cursor = "pointer";

    // Hover animation
    sticker.addEventListener("mouseenter", () => (sticker.style.transform = "scale(1.05)"));
    sticker.addEventListener("mouseleave", () => (sticker.style.transform = "scale(1)"));

    // Center stickers fixed
    if (i === 4) {
      const c = fixedCenters[faceName];
      sticker.style.backgroundColor = colors[c];
      sticker.dataset.color = c;
      sticker.style.cursor = "not-allowed";
    } else {
      sticker.addEventListener("click", () => {
        if (!selectedColor) {
          message.style.color = "#cc0000";
          message.textContent = "Select a color first.";
          return;
        }
        const prev = sticker.dataset.color;
        if (prev) colorCounts[prev] = Math.max(0, colorCounts[prev] - 1);

        if (colorCounts[selectedColor] >= 9) {
          message.style.color = "#cc0000";
          message.textContent = `⚠️ Each color can be used only 9 times.`;
          if (prev) colorCounts[prev]++;
          return;
        }

        sticker.style.backgroundColor = colors[selectedColor];
        sticker.dataset.color = selectedColor;
        colorCounts[selectedColor]++;
        message.textContent = "";
      });
    }

    faceDiv.appendChild(sticker);
  }

  wrapper.appendChild(label);
  wrapper.appendChild(faceDiv);
  cubeContainer.appendChild(wrapper);
});

// --- Color Picker ---
const colorCounts = { white: 0, yellow: 0, red: 0, orange: 0, blue: 0, green: 0 };
let selectedColor = null;

// Count existing center stickers
document.querySelectorAll(".sticker").forEach(s => {
  if (s.dataset.color) colorCounts[s.dataset.color]++;
});

Object.entries(colors).forEach(([name, hex]) => {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";
  container.style.gap = "6px";

  const swatch = document.createElement("div");
  swatch.classList.add("color-option");
  swatch.style.backgroundColor = hex;
  swatch.style.width = "44px";
  swatch.style.height = "44px";
  swatch.style.borderRadius = "8px";
  swatch.style.cursor = "pointer";
  swatch.style.boxShadow = "0 0 0 1px #ccc";

  const label = document.createElement("div");
  label.textContent = name.charAt(0).toUpperCase() + name.slice(1);
  label.style.fontSize = "12px";

  swatch.addEventListener("click", () => {
    document.querySelectorAll(".color-option").forEach(opt => (opt.style.boxShadow = "0 0 0 1px #ccc"));
    swatch.style.boxShadow = "0 0 0 3px #000";
    selectedColor = name;
    message.textContent = "";
  });

  container.appendChild(swatch);
  container.appendChild(label);
  colorPicker.appendChild(container);
});

// --- Reset Button ---
document.getElementById("resetBtn").addEventListener("click", () => {
  selectedColor = null;
  document.querySelectorAll(".color-option").forEach(opt => (opt.style.boxShadow = "0 0 0 1px #ccc"));
  document.querySelectorAll(".sticker").forEach(s => {
    if (s.style.cursor === "not-allowed") {
      const c = s.dataset.color;
      s.style.backgroundColor = colors[c];
    } else {
      s.style.backgroundColor = "#f0f0f0";
      delete s.dataset.color;
    }
  });
  Object.keys(colorCounts).forEach(k => (colorCounts[k] = 0));
  document.querySelectorAll(".sticker").forEach(s => {
    if (s.dataset.color) colorCounts[s.dataset.color]++;
  });
  message.textContent = "";
  message.style.color = "";
  resultEl.textContent = "";
});

// --- Helpers ---
function getCubeState() {
  const state = {};
  document.querySelectorAll(".face").forEach(face => {
    const key = face.dataset.face.toLowerCase();
    state[key] = [...face.querySelectorAll(".sticker")].map(s => s.dataset.color || null);
  });
  return state;
}

function validateCube(state) {
  for (let f in state)
    if (state[f].some(x => x === null))
      return "⚠️ Fill all colours before solving.";
  const flat = Object.values(state).flat();
  const counts = {};
  flat.forEach(c => (counts[c] = (counts[c] || 0) + 1));
  for (let k in colors)
    if ((counts[k] || 0) !== 9)
      return `⚠️ Each color must appear exactly 9 times (${k} appears ${counts[k] || 0}).`;
  return null;
}

// --- Color Mapping for Solver ---
const colorToLetter = {
  white: "U",
  red: "R",
  green: "F",
  yellow: "D",
  orange: "L",
  blue: "B"
};
const kociembaOrder = ["Top", "Right", "Front", "Bottom", "Left", "Back"];

// --- Solve Button ---
document.getElementById("solveBtn").addEventListener("click", async () => {
  const state = getCubeState();
  const e = validateCube(state);
  if (e) {
    message.style.color = "#cc0000";
    message.textContent = e;
    return;
  }

  const cubeString = kociembaOrder.map(f =>
    state[f.toLowerCase()].map(c => colorToLetter[c]).join("")
  ).join("");

  console.log("🧩 Cube string:", cubeString);
  resultEl.textContent = "🧠 Solving... please wait";
  message.textContent = "";
  message.style.color = "";

  try {
    const res = await fetch("/solve", { // ✅ relative path works locally & deployed
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cube: cubeString })
    });

    const json = await res.json();

    if (!res.ok || json.error) {
      message.style.color = "#cc0000";
      message.textContent = json.error || "❌ Unknown error while solving.";
      resultEl.textContent = "";
      return;
    }

    message.style.color = "#009900";
    message.textContent = "✅ Cube solved successfully!";

    // Step-by-step move display
    const solution = json.solution || "";
    const moves = solution.trim().split(/\s+/).filter(Boolean);

    resultEl.innerHTML = `
      <div style="margin-top:20px; text-align:center;">
        <h2>✅ Solution Found!</h2>
        <p style="font-weight:600; color:#333;">${moves.length} Moves</p>
        <div id="movesList" style="
          display:flex; flex-wrap:wrap; justify-content:center;
          gap:8px; margin-top:12px; font-size:18px; font-weight:600;">
          ${moves.map((m,i)=>`<div class="move-step" style="
            background:#f4f4f4; border:1px solid #ccc; border-radius:6px;
            padding:6px 10px; min-width:40px; text-align:center;">${i+1}. ${m}</div>`).join("")}
        </div>
        <div style="margin-top:15px;">
          <button id="prevStepBtn" style="
            padding:8px 16px; background:#ddd; border:none; border-radius:6px; margin:0 10px; cursor:pointer;">
            ◀ Prev
          </button>
          <button id="nextStepBtn" style="
            padding:8px 16px; background:#007BFF; color:white; border:none; border-radius:6px; margin:0 10px; cursor:pointer;">
            Next ▶
          </button>
        </div>
      </div>
    `;

    let currentStep = -1;
    const stepDivs = document.querySelectorAll(".move-step");
    function highlightStep(index) {
      stepDivs.forEach((div, i) => {
        div.style.background = i === index ? "#007BFF" : "#f4f4f4";
        div.style.color = i === index ? "white" : "black";
      });
    }
    document.getElementById("nextStepBtn").addEventListener("click", () => {
      if (currentStep < moves.length - 1) currentStep++;
      highlightStep(currentStep);
    });
    document.getElementById("prevStepBtn").addEventListener("click", () => {
      if (currentStep > 0) currentStep--;
      highlightStep(currentStep);
    });

  } catch (err) {
    message.style.color = "#cc0000";
    message.textContent = "❌ Backend error: " + err.message;
  }
});