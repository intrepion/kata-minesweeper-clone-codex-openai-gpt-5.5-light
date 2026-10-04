import "./styles.css";
import { DIFFICULTIES } from "./game/difficulties";
import {
  chordCell,
  createGame,
  focusCell,
  getCell,
  moveFocus,
  revealCell,
  setFace,
  toggleFlag,
  updateElapsed
} from "./game/engine";
import type { Cell, DifficultyName, GameState, Position } from "./game/types";

const app = document.querySelector<HTMLDivElement>("#app");
const difficultyStorageKey = "minesweeper:selectedDifficulty";
const longPressDelay = 420;
let game = createGame({
  difficulty: readInitialDifficulty(),
  seed: readInitialSeed()
});
let longPressTimer: number | null = null;

if (!app) {
  throw new Error("App root was not found.");
}

const root = app;

render();
window.setInterval(() => {
  if (game.status === "playing") {
    game = updateElapsed(game);
    updateHeader();
  }
}, 250);

function render(): void {
  root.innerHTML = `
    <main class="app-shell">
      <section class="game-panel" aria-label="Minesweeper game">
        <header class="topbar">
          <label class="difficulty-picker">
            <span>Difficulty</span>
            <select data-testid="difficulty">
              ${Object.values(DIFFICULTIES)
                .map(
                  (difficulty) =>
                    `<option value="${difficulty.name}" ${
                      difficulty.name === game.difficulty.name ? "selected" : ""
                    }>${difficulty.label}</option>`
                )
                .join("")}
            </select>
          </label>
          <div class="meters" aria-label="Game meters">
            <output class="meter" data-testid="mine-counter" aria-label="Mines remaining">${formatMeter(
              game.minesRemaining
            )}</output>
            <button class="reset-face" type="button" data-testid="reset" aria-label="Reset game">${faceText(
              game.face
            )}</button>
            <output class="meter" data-testid="timer" aria-label="Elapsed seconds">${formatMeter(
              game.elapsedSeconds
            )}</output>
          </div>
        </header>
        <div class="board-wrap">
          <div
            class="board"
            data-testid="board"
            role="grid"
            aria-label="${game.difficulty.label} board"
            style="--board-width: ${game.difficulty.width}; --board-height: ${game.difficulty.height};"
          >
            ${game.board.map(renderCell).join("")}
          </div>
        </div>
        <footer class="status-line" data-testid="status">${statusText()}</footer>
      </section>
    </main>
  `;

  bindEvents();
  focusRenderedCell();
}

function renderCell(cell: Cell): string {
  const classes = [
    "cell",
    cell.revealed ? "cell-revealed" : "cell-hidden",
    cell.flagged ? "cell-flagged" : "",
    cell.exploded ? "cell-exploded" : "",
    cell.incorrectFlag ? "cell-wrong" : "",
    game.focused.x === cell.x && game.focused.y === cell.y ? "cell-focused" : "",
    cell.revealed && cell.adjacentMines > 0 ? `number-${cell.adjacentMines}` : ""
  ]
    .filter(Boolean)
    .join(" ");

  return `
    <button
      class="${classes}"
      type="button"
      role="gridcell"
      data-testid="cell-${cell.x}-${cell.y}"
      data-x="${cell.x}"
      data-y="${cell.y}"
      aria-label="${cellLabel(cell)}"
      aria-selected="${game.focused.x === cell.x && game.focused.y === cell.y}"
      ${game.focused.x === cell.x && game.focused.y === cell.y ? 'tabindex="0"' : 'tabindex="-1"'}
    >${cellText(cell)}</button>
  `;
}

function bindEvents(): void {
  root.querySelector<HTMLSelectElement>("[data-testid='difficulty']")?.addEventListener("change", (event) => {
    const difficulty = (event.currentTarget as HTMLSelectElement).value as DifficultyName;
    localStorage.setItem(difficultyStorageKey, difficulty);
    game = createGame({ difficulty, seed: readInitialSeed() });
    render();
  });

  root.querySelector<HTMLButtonElement>("[data-testid='reset']")?.addEventListener("click", () => {
    game = createGame({ difficulty: game.difficulty.name, seed: readInitialSeed() });
    render();
  });

  for (const button of root.querySelectorAll<HTMLButtonElement>(".cell")) {
    button.addEventListener("click", () => {
      const position = positionFromButton(button);
      const cell = getCell(game, position);
      game = focusCell(game, position);
      game = cell.revealed ? chordCell(game, position) : revealCell(game, position);
      render();
    });

    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      const position = positionFromButton(button);
      game = toggleFlag(focusCell(game, position), position);
      render();
    });

    button.addEventListener("pointerdown", () => {
      const position = positionFromButton(button);
      game = setFace(focusCell(game, position), "surprised");
      updateHeader();
      longPressTimer = window.setTimeout(() => {
        game = toggleFlag(game, position);
        longPressTimer = null;
        render();
      }, longPressDelay);
    });

    button.addEventListener("pointerup", clearLongPress);
    button.addEventListener("pointerleave", clearLongPress);
    button.addEventListener("keydown", handleCellKeydown);
  }
}

function handleCellKeydown(event: KeyboardEvent): void {
  const button = event.currentTarget as HTMLButtonElement;
  const position = positionFromButton(button);

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
    const direction = event.key.replace("Arrow", "").toLowerCase() as "up" | "down" | "left" | "right";
    game = moveFocus(game, direction);
    render();
    return;
  }

  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    const cell = getCell(game, position);
    game = cell.revealed ? chordCell(game, position) : revealCell(game, position);
    render();
    return;
  }

  if (event.key.toLowerCase() === "f") {
    event.preventDefault();
    game = toggleFlag(game, position);
    render();
    return;
  }

  if (event.key.toLowerCase() === "r") {
    event.preventDefault();
    game = createGame({ difficulty: game.difficulty.name, seed: readInitialSeed() });
    render();
  }
}

function clearLongPress(): void {
  if (longPressTimer !== null) {
    window.clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  if (game.status === "ready" || game.status === "playing") {
    game = setFace(game, "neutral");
    updateHeader();
  }
}

function updateHeader(): void {
  root.querySelector("[data-testid='mine-counter']")!.textContent = formatMeter(game.minesRemaining);
  root.querySelector("[data-testid='timer']")!.textContent = formatMeter(game.elapsedSeconds);
  root.querySelector("[data-testid='reset']")!.textContent = faceText(game.face);
  root.querySelector("[data-testid='status']")!.textContent = statusText();
}

function focusRenderedCell(): void {
  root
    .querySelector<HTMLButtonElement>(`[data-testid='cell-${game.focused.x}-${game.focused.y}']`)
    ?.focus({ preventScroll: true });
}

function positionFromButton(button: HTMLButtonElement): Position {
  return {
    x: Number(button.dataset.x),
    y: Number(button.dataset.y)
  };
}

function cellText(cell: Cell): string {
  if (cell.incorrectFlag) {
    return "X";
  }
  if (cell.flagged && !cell.revealed) {
    return "F";
  }
  if (!cell.revealed) {
    return "";
  }
  if (cell.hasMine) {
    return cell.exploded ? "!" : "*";
  }
  return cell.adjacentMines > 0 ? String(cell.adjacentMines) : "";
}

function cellLabel(cell: Cell): string {
  const name = `Cell ${cell.x + 1}, ${cell.y + 1}`;
  if (cell.incorrectFlag) {
    return `${name}, incorrectly flagged`;
  }
  if (cell.flagged && !cell.revealed) {
    return `${name}, flagged`;
  }
  if (!cell.revealed) {
    return `${name}, hidden`;
  }
  if (cell.hasMine) {
    return cell.exploded ? `${name}, exploded mine` : `${name}, mine`;
  }
  if (cell.adjacentMines === 0) {
    return `${name}, clear`;
  }
  return `${name}, ${cell.adjacentMines} adjacent mines`;
}

function statusText(): string {
  if (game.status === "won") {
    return `Won in ${game.elapsedSeconds} seconds.`;
  }
  if (game.status === "lost") {
    return `Lost after ${game.elapsedSeconds} seconds.`;
  }
  return `${game.difficulty.label}: ${game.difficulty.width} x ${game.difficulty.height}, ${game.difficulty.mines} mines.`;
}

function faceText(face: GameState["face"]): string {
  return {
    neutral: ":)",
    surprised: ":O",
    happy: "B)",
    dead: "X("
  }[face];
}

function formatMeter(value: number): string {
  return String(value).padStart(3, "0");
}

function readInitialDifficulty(): DifficultyName {
  const search = new URLSearchParams(window.location.search);
  const queryDifficulty = search.get("difficulty");
  if (isDifficultyName(queryDifficulty)) {
    return queryDifficulty;
  }

  const storedDifficulty = localStorage.getItem(difficultyStorageKey);
  if (isDifficultyName(storedDifficulty)) {
    return storedDifficulty;
  }

  return "beginner";
}

function readInitialSeed(): number {
  const seed = Number(new URLSearchParams(window.location.search).get("seed"));
  return Number.isFinite(seed) && seed > 0 ? seed : Date.now();
}

function isDifficultyName(value: string | null): value is DifficultyName {
  return value === "beginner" || value === "intermediate" || value === "expert";
}
