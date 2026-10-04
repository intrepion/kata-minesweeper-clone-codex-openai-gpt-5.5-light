import { getDifficulty } from "./difficulties";
import { createSeededRandom } from "./random";
import type { Cell, DifficultyName, GameState, Position } from "./types";

interface CreateGameOptions {
  readonly difficulty: DifficultyName;
  readonly seed?: number;
}

type Direction = "up" | "down" | "left" | "right";

export function createGame(options: CreateGameOptions): GameState {
  const difficulty = getDifficulty(options.difficulty);
  const seed = options.seed ?? Date.now();
  const board = createEmptyBoard(difficulty.width, difficulty.height);

  return summarize({
    difficulty,
    seed,
    status: "ready",
    board,
    firstRevealDone: false,
    startedAt: null,
    endedAt: null,
    elapsedSeconds: 0,
    flagsPlaced: 0,
    minesRemaining: difficulty.mines,
    revealedSafeCells: 0,
    focused: { x: 0, y: 0 },
    face: "neutral"
  });
}

export function getCell(game: GameState, position: Position): Cell {
  const cell = game.board[indexFor(game, position)];
  if (!cell) {
    throw new Error(`Cell is outside the board: ${position.x},${position.y}`);
  }
  return cell;
}

export function revealCell(game: GameState, position: Position, now = Date.now()): GameState {
  if (game.status === "won" || game.status === "lost") {
    return game;
  }

  const target = getCell(game, position);
  if (target.flagged || target.revealed) {
    return game;
  }

  let next = game;
  if (!game.firstRevealDone) {
    next = {
      ...game,
      board: placeMines(game, position),
      firstRevealDone: true,
      startedAt: now,
      status: "playing"
    };
  } else if (game.status === "ready") {
    next = { ...game, startedAt: now, status: "playing" };
  }

  const cell = getCell(next, position);
  if (cell.hasMine) {
    return loseGame(next, position, now);
  }

  const board = revealSafeArea(next, position);
  return maybeWin(summarize({ ...next, board }), now);
}

export function toggleFlag(game: GameState, position: Position): GameState {
  if (game.status === "won" || game.status === "lost") {
    return game;
  }

  const target = getCell(game, position);
  if (target.revealed) {
    return game;
  }

  return summarize({
    ...game,
    board: replaceCell(game, position, { flagged: !target.flagged })
  });
}

export function chordCell(game: GameState, position: Position, now = Date.now()): GameState {
  if (game.status !== "playing") {
    return game;
  }

  const target = getCell(game, position);
  if (!target.revealed || target.adjacentMines === 0) {
    return game;
  }

  const neighbors = getNeighbors(game, position);
  const flaggedNeighbors = neighbors.filter((cell) => cell.flagged).length;
  if (flaggedNeighbors !== target.adjacentMines) {
    return game;
  }

  let next = game;
  for (const neighbor of neighbors) {
    if (!neighbor.flagged && !neighbor.revealed) {
      next = revealCell(next, neighbor, now);
      if (next.status === "lost") {
        return next;
      }
    }
  }

  return next;
}

export function moveFocus(game: GameState, direction: Direction): GameState {
  const delta = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  }[direction];

  const focused = {
    x: clamp(game.focused.x + delta.x, 0, game.difficulty.width - 1),
    y: clamp(game.focused.y + delta.y, 0, game.difficulty.height - 1)
  };

  return { ...game, focused };
}

export function setFace(game: GameState, face: GameState["face"]): GameState {
  if (game.status === "won" || game.status === "lost") {
    return game;
  }
  return { ...game, face };
}

function createEmptyBoard(width: number, height: number): readonly Cell[] {
  const cells: Cell[] = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      cells.push({
        x,
        y,
        hasMine: false,
        adjacentMines: 0,
        revealed: false,
        flagged: false,
        exploded: false,
        incorrectFlag: false
      });
    }
  }
  return cells;
}

function placeMines(game: GameState, firstReveal: Position): readonly Cell[] {
  const safePositions = new Set(
    [getCell(game, firstReveal), ...getNeighbors(game, firstReveal)].map(positionKey)
  );
  const candidates = game.board.filter((cell) => !safePositions.has(positionKey(cell)));
  const random = createSeededRandom(game.seed);
  const mineKeys = new Set<string>();

  while (mineKeys.size < game.difficulty.mines && candidates.length > 0) {
    const index = Math.floor(random() * candidates.length);
    const [cell] = candidates.splice(index, 1);
    mineKeys.add(positionKey(cell));
  }

  const mined = game.board.map((cell) => ({
    ...cell,
    hasMine: mineKeys.has(positionKey(cell))
  }));

  return mined.map((cell) => ({
    ...cell,
    adjacentMines: countAdjacentMines(game, mined, cell)
  }));
}

function revealSafeArea(game: GameState, position: Position): readonly Cell[] {
  const board = [...game.board];
  const queue: Position[] = [position];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = positionKey(current);
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);

    const cell = board[indexFor(game, current)];
    if (!cell || cell.flagged || cell.revealed || cell.hasMine) {
      continue;
    }

    board[indexFor(game, current)] = { ...cell, revealed: true };

    if (cell.adjacentMines === 0) {
      for (const neighbor of getNeighbors(game, current)) {
        if (!neighbor.flagged && !neighbor.revealed) {
          queue.push(neighbor);
        }
      }
    }
  }

  return board;
}

function loseGame(game: GameState, exploded: Position, now: number): GameState {
  const board = game.board.map((cell) => ({
    ...cell,
    revealed: cell.hasMine ? true : cell.revealed,
    exploded: cell.x === exploded.x && cell.y === exploded.y,
    incorrectFlag: cell.flagged && !cell.hasMine
  }));

  return summarize({
    ...game,
    board,
    status: "lost",
    endedAt: now,
    face: "dead"
  });
}

function maybeWin(game: GameState, now: number): GameState {
  if (game.revealedSafeCells !== game.board.length - game.difficulty.mines) {
    return game;
  }

  return summarize({
    ...game,
    status: "won",
    endedAt: now,
    face: "happy"
  });
}

function summarize(game: GameState): GameState {
  const flagsPlaced = game.board.filter((cell) => cell.flagged).length;
  const revealedSafeCells = game.board.filter((cell) => cell.revealed && !cell.hasMine).length;
  const elapsedSeconds =
    game.startedAt === null
      ? 0
      : Math.floor(((game.endedAt ?? Date.now()) - game.startedAt) / 1000);

  return {
    ...game,
    elapsedSeconds,
    flagsPlaced,
    minesRemaining: game.difficulty.mines - flagsPlaced,
    revealedSafeCells
  };
}

function replaceCell(game: GameState, position: Position, patch: Partial<Cell>): readonly Cell[] {
  return game.board.map((cell) =>
    cell.x === position.x && cell.y === position.y ? { ...cell, ...patch } : cell
  );
}

function getNeighbors(game: GameState, position: Position): readonly Cell[] {
  const cells: Cell[] = [];
  for (let y = position.y - 1; y <= position.y + 1; y += 1) {
    for (let x = position.x - 1; x <= position.x + 1; x += 1) {
      if (x === position.x && y === position.y) {
        continue;
      }
      if (x >= 0 && y >= 0 && x < game.difficulty.width && y < game.difficulty.height) {
        cells.push(getCell(game, { x, y }));
      }
    }
  }
  return cells;
}

function countAdjacentMines(game: GameState, board: readonly Cell[], position: Position): number {
  return getNeighborPositions(game, position).filter((neighbor) => {
    const cell = board[indexFor(game, neighbor)];
    return cell?.hasMine;
  }).length;
}

function getNeighborPositions(game: GameState, position: Position): readonly Position[] {
  const positions: Position[] = [];
  for (let y = position.y - 1; y <= position.y + 1; y += 1) {
    for (let x = position.x - 1; x <= position.x + 1; x += 1) {
      if (x === position.x && y === position.y) {
        continue;
      }
      if (x >= 0 && y >= 0 && x < game.difficulty.width && y < game.difficulty.height) {
        positions.push({ x, y });
      }
    }
  }
  return positions;
}

function indexFor(game: GameState, position: Position): number {
  return position.y * game.difficulty.width + position.x;
}

function positionKey(position: Position): string {
  return `${position.x},${position.y}`;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
