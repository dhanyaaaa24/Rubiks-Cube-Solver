// frontend/script.js
// Clean, corrected, full script for UI + solve + playback

const faces = ['Front', 'Back', 'Top', 'Bottom', 'Left', 'Right'];
const colors = {
  white: '#ffffff',
  yellow: '#ffff00',
  red: '#ff0000',
  orange: '#ffa500',
  blue: '#0000ff',
  green: '#008000'
};

// fixed centers (map to your physical cube orientation)
const fixedCenters = {
  Front: 'blue',
  Back: 'green',
  Top: 'white',
  Bottom: 'yellow',
  Left: 'orange',
  Right: 'red'
};

const cubeContainer = document.getElementById('cube');
const colorPicker = document.getElementById('colorPicker');
const message = document.getElementById('message');
const resultEl = document.getElementById('result');

// layout (ensures 3 top + 3 bottom)
cubeContainer.style.display = "grid";
cubeContainer.style.gridTemplateColumns = "repeat(3, auto)";
cubeContainer.style.gridTemplateRows = "repeat(2, auto)";
cubeContainer.style.gap = "28px";
cubeContainer.style.justifyContent = "center";
cubeContainer.style.alignItems = "center";

// build faces
faces.forEach(faceName => {
  const wrapper = document.createElement('div');
  wrapper.classList.add('face-wrapper');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '6px';

  const label = document.createElement('div');
  label.textContent = faceName;
  label.style.fontWeight = '700';

  const faceDiv = document.createElement('div');
  faceDiv.classList.add('face');
  faceDiv.dataset.face = faceName;
  faceDiv.style.display = 'grid';
  faceDiv.style.gridTemplateColumns = 'repeat(3, 48px)';
  faceDiv.style.gridGap = '6px';

  for (let i = 0; i < 9; i++) {
    const s = document.createElement('div');
    s.classList.add('sticker');
    s.style.width = '48px';
    s.style.height = '48px';
    s.style.borderRadius = '6px';
    s.style.backgroundColor = '#e1e1e1ff';
    s.style.cursor = 'pointer';
    s.style.transition = 'transform 0.12s ease';

    s.addEventListener('mouseenter', () => s.style.transform = 'scale(1.04)');
    s.addEventListener('mouseleave', () => s.style.transform = 'scale(1)');

    if (i === 4) {
      const c = fixedCenters[faceName];
      s.style.backgroundColor = colors[c];
      s.dataset.color = c;
      s.style.cursor = 'not-allowed';
    } else {
      s.addEventListener('click', () => {
        if (!selectedColor) {
          message.textContent = 'Select a color first.';
          return;
        }
        const prev = s.dataset.color;
        if (prev) colorCounts[prev] = Math.max(0, (colorCounts[prev] || 0) - 1);

        if ((colorCounts[selectedColor] || 0) >= 9) {
          message.textContent = `⚠️ Each color can be used only 9 times.`;
          // restore previous count if we decremented it
          if (prev) colorCounts[prev] = (colorCounts[prev] || 0) + 1;
          return;
        }

        s.style.backgroundColor = colors[selectedColor];
        s.dataset.color = selectedColor;
        colorCounts[selectedColor] = (colorCounts[selectedColor] || 0) + 1;
        message.textContent = '';
      });
    }

    faceDiv.appendChild(s);
  }

  wrapper.appendChild(label);
  wrapper.appendChild(faceDiv);
  cubeContainer.appendChild(wrapper);
});

// color counts & initial center counting
const colorCounts = { white: 0, yellow: 0, red: 0, orange: 0, blue: 0, green: 0 };
document.querySelectorAll('.sticker').forEach(s => {
  if (s.dataset && s.dataset.color) colorCounts[s.dataset.color] = (colorCounts[s.dataset.color] || 0) + 1;
});

let selectedColor = null;
// build color picker (swatches + name)
for (let [name, hex] of Object.entries(colors)) {
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center';
  container.style.gap = '6px';

  const swatch = document.createElement('div');
  swatch.classList.add('color-option');
  swatch.style.backgroundColor = hex;
  swatch.style.width = '44px';
  swatch.style.height = '44px';
  swatch.style.borderRadius = '8px';
  swatch.style.boxShadow = '0 0 0 1px #ddd';
  swatch.style.cursor = 'pointer';

  const label = document.createElement('div');
  label.classList.add('color-name');
  label.textContent = name.charAt(0).toUpperCase() + name.slice(1);
  label.style.fontSize = '13px';

  swatch.addEventListener('click', () => {
    document.querySelectorAll('.color-option').forEach(c => c.style.boxShadow = '0 0 0 1px #ddd');
    swatch.style.boxShadow = '0 0 0 2px #000';
    selectedColor = name;
    message.textContent = '';
  });

  container.appendChild(swatch);
  container.appendChild(label);
  colorPicker.appendChild(container);
}

// Reset button
const resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    selectedColor = null;
    document.querySelectorAll('.color-option').forEach(c => c.style.boxShadow = '0 0 0 1px #ddd');
    document.querySelectorAll('.sticker').forEach(s => {
      if (s.style.cursor === 'not-allowed') {
        const c = s.dataset.color;
        s.style.backgroundColor = colors[c];
      } else {
        s.style.backgroundColor = '#e1e1e1ff';
        delete s.dataset.color;
      }
    });
    // recount centers
    Object.keys(colorCounts).forEach(k => colorCounts[k] = 0);
    document.querySelectorAll('.sticker').forEach(s => {
      if (s.dataset && s.dataset.color) colorCounts[s.dataset.color] = (colorCounts[s.dataset.color] || 0) + 1;
    });
    message.textContent = '';
    resultEl.textContent = '';
    // clear playback if present
    if (typeof loadPlayback === 'function') loadPlayback('');
  });
}

// Helpers to read cube state + validate
function getCubeState() {
  const state = {};
  document.querySelectorAll('.face').forEach(face => {
    const key = face.dataset.face.toLowerCase();
    state[key] = [...face.querySelectorAll('.sticker')].map(s => s.dataset.color || null);
  });
  return state;
}

function validateCube(state) {
  // ensure no nulls
  for (let f in state) {
    if (state[f].some(x => x === null)) return '⚠️ Fill colours in all blocks before solving.';
  }
  // each color count must be 9
  const flat = Object.values(state).flat();
  const counts = {};
  flat.forEach(c => counts[c] = (counts[c] || 0) + 1);
  for (let k of Object.keys(colors)) {
    if ((counts[k] || 0) !== 9) return `⚠️ Each color must appear exactly 9 times. '${k}' appears ${counts[k] || 0} times.`;
  }
  return null;
}

// color => Kociemba letter mapping
const colorToLetter = {
  white: 'U',
  red: 'R',
  green: 'F',
  yellow: 'D',
  orange: 'L',
  blue: 'B'
};

// Kociemba face order expected by solver
const kociembaOrder = ['Top', 'Right', 'Front', 'Bottom', 'Left', 'Back'];

// Solve button handler
const solveBtn = document.getElementById('solveBtn');
if (solveBtn) {
  solveBtn.addEventListener('click', async () => {
    const state = getCubeState();
    const error = validateCube(state);
    if (error) {
      message.textContent = error;
      return;
    }

    // build 54-char string
    const cubeString = kociembaOrder.map(face =>
      state[face.toLowerCase()].map(c => colorToLetter[c]).join('')
    ).join('');

    console.log('🧩 Cube string:', cubeString);
    resultEl.textContent = '🧠 Solving... please wait';
    message.textContent = '';

    // quick sanity regex (only U R F D L B letters, 54 chars)
    if (!/^[URFDLB]{54}$/.test(cubeString)) {
      resultEl.textContent = '❌ Error: constructed cube string invalid.';
      return;
    }

    try {
      // use relative path so same origin works in dev/prod (adjust if needed)
      const res = await fetch('/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cube: cubeString })
      });

      const json = await res.json();
      if (!res.ok) {
        const errMsg = json.error || JSON.stringify(json);
        resultEl.textContent = '❌ Error solving: ' + errMsg;
        return;
      }

      const solution = json.solution || '';
      resultEl.textContent = '✅ Solution: ' + solution;
      // load playback if function exists
      if (typeof loadPlayback === 'function') loadPlayback(solution);
    } catch (err) {
      resultEl.textContent = '❌ Error contacting backend: ' + err.message;
    }
  });
}

// ---------------- Playback support (optional; used by UI if present) ----------------
/* 
  If you have the playback UI (move list, controls), keep the functions below in your page:
  - loadPlayback(solution) - populates move list & enables play/next/prev
  The site you gave earlier already included playback code. If not present, this simple stub exists.
*/

if (typeof window.loadPlayback !== 'function') {
  // Provide a minimal stub so calling loadPlayback won't throw if playback UI not present
  window.loadPlayback = function (solution) {
    // If movesContainer exists, fill it (many of your pages include it)
    const movesContainer = document.getElementById('movesContainer');
    if (!movesContainer) return;
    movesContainer.innerHTML = '';
    const moves = (solution || '').trim().split(/\s+/).filter(Boolean);
    if (moves.length === 0) {
      movesContainer.textContent = '(no moves)';
      return;
    }
    const ol = document.createElement('ol');
    moves.forEach(m => {
      const li = document.createElement('li');
      li.textContent = m;
      ol.appendChild(li);
    });
    movesContainer.appendChild(ol);
  };
}