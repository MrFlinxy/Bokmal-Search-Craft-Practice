const image = document.getElementById("practice-image");
const input = document.getElementById("typing-input");
const feedback = document.getElementById("feedback");
const keyboard = document.getElementById("keyboard");
const hintButton = document.getElementById("hint-button");
const hint = document.getElementById("hint");

let expectedAnswer = "";
let currentImage = "";

const images = {
  "fns.webp": "å",
  "bucket.png": "bø",
  "wool.png": " u",
  "nether bricks.png": "gl",
  "boat.webp": "bå",
  "iron pickaxe.webp": "nha",
  "iron.webp": "rr",
  "gold.webp": "rr",
  "bread.webp": "rø",
  "gold pickaxe.png": "lh",
  "golden helmet.webp": "lh",
  "golden carrot.png": "lr",
  "bed.webp": "l",
  "iron axe.webp": "nø",
  "stick.webp": "nn",
  "glowstone.webp": "gl",
  "respawn anchor.webp": "liv",
  "bow.webp": "ue",
};

const keyRemaps = {
  1: "u",
  2: "e",
  3: "i",
  4: "v",
  q: "Home",
  w: "l",
  e: "r",
  r: "g",
  a: "Backspace",
  s: "n",
  d: "h",
  f: "a",
  z: "å",
  x: "ø",
  c: "b",
  v: "4",
};

// Select a random image.
function loadRandomImage() {
  const filenames = Object.keys(images);

  if (filenames.length === 0) {
    currentImage = "";
    expectedAnswer = "";
    image.removeAttribute("src");
    input.value = "";
    feedback.textContent = "No images configured.";
    hint.hidden = true;
    return;
  }

  // Avoid selecting the same image twice in a row when possible.
  const availableImages = filenames.filter(
    (filename) => filename !== currentImage,
  );

  const randomIndex = Math.floor(Math.random() * availableImages.length);

  currentImage = availableImages[randomIndex];

  image.src = `images/${currentImage}`;
  image.alt = "Image to identify";

  // Get the expected answer from the image map.
  expectedAnswer = images[currentImage];

  // Reset the exercise.
  input.value = "";
  feedback.textContent = "";

  // Reset the hint.
  hint.hidden = true;
  hint.textContent = "";
  hintButton.textContent = "Show hint";
  hintButton.setAttribute("aria-expanded", "false");

  input.focus();
}

// Calculate edit distance for typo detection.
function levenshteinDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0),
  );

  for (let i = 0; i <= a.length; i++) {
    dp[i][0] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }

  return dp[a.length][b.length];
}

// Check the typed filename.

function checkAnswer() {
  const typed = input.value.toLowerCase();
  const expected = expectedAnswer.toLowerCase();

  if (typed === expected) {
    feedback.textContent = "Correct!";
    feedback.style.color = "#4ade80";

    // Load the next random image after a short delay.
    setTimeout(() => {
      loadRandomImage();
    }, 500);

    return;
  }

  if (typed.length === 0) {
    feedback.textContent = "";
    return;
  }

  if (expected.startsWith(typed)) {
    feedback.textContent = "Keep going...";
    feedback.style.color = "#aaaaaa";
    return;
  }

  const distance = levenshteinDistance(typed, expected);

  feedback.textContent = `Typo detected — ${distance} edit(s) away from the answer.`;

  feedback.style.color = "#f87171";
}

// Highlight the physical key being pressed.
function highlightKey(code, pressed) {
  const key = keyboard.querySelector(`[data-key="${code}"]`);

  if (key) {
    key.classList.toggle("pressed", pressed);
  }
}

document.addEventListener("keydown", (event) => {
  if (!event.ctrlKey && !event.altKey && !event.metaKey) {
    highlightKey(event.code, true);
  }
});

document.addEventListener("keyup", (event) => {
  highlightKey(event.code, false);
});

window.addEventListener("blur", () => {
  keyboard.querySelectorAll(".key.pressed").forEach((key) => {
    key.classList.remove("pressed");
  });
});

input.addEventListener("input", checkAnswer);

input.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.altKey || event.metaKey) {
    return;
  }

  const key = event.key.toLowerCase();
  const remapped = keyRemaps[key];

  if (!remapped) return;

  event.preventDefault();

  const start = input.selectionStart;
  const end = input.selectionEnd;
  const value = input.value;

  if (event.shiftKey && remapped === "Home") {
    event.preventDefault();

    input.setSelectionRange(0, input.selectionStart);
    return;
  }

  switch (remapped) {
    case "Backspace": {
      if (start === end && start > 0) {
        input.value = value.slice(0, start - 1) + value.slice(end);

        input.setSelectionRange(start - 1, start - 1);
      } else if (start !== end) {
        input.value = value.slice(0, start) + value.slice(end);

        input.setSelectionRange(start, start);
      }
      break;
    }

    case "Delete": {
      if (start === end && end < value.length) {
        input.value = value.slice(0, start) + value.slice(end + 1);
      } else if (start !== end) {
        input.value = value.slice(0, start) + value.slice(end);

        input.setSelectionRange(start, start);
      }
      break;
    }

    case "Home":
      input.setSelectionRange(0, 0);
      return;

    case "End":
      input.setSelectionRange(value.length, value.length);
      return;

    default: {
      // Remap to a regular character.
      if (remapped.length !== 1) return;

      input.value = value.slice(0, start) + remapped + value.slice(end);

      const cursor = start + remapped.length;
      input.setSelectionRange(cursor, cursor);
    }
  }

  input.dispatchEvent(new Event("input", { bubbles: true }));
});

hintButton.addEventListener("click", () => {
  const showHint = hint.hidden;

  hint.hidden = !showHint;
  hint.textContent = showHint ? expectedAnswer : "";
  hintButton.textContent = showHint ? "Hide hint" : "Show hint";
  hintButton.setAttribute("aria-expanded", String(showHint));
});

// Load a random image when the application starts.
if (Object.keys(images).length > 0) {
  loadRandomImage();
} else {
  feedback.textContent = "No images configured.";
}
