export type DifficultyName = "beginner" | "intermediate" | "expert";

export type GameStatus = "ready" | "playing" | "won" | "lost";

export type FaceState = "neutral" | "surprised" | "happy" | "dead";

export interface Difficulty {
  readonly name: DifficultyName;
  readonly label: string;
  readonly width: number;
  readonly height: number;
  readonly mines: number;
}

export interface Position {
  readonly x: number;
  readonly y: number;
}

export interface Cell {
  readonly x: number;
  readonly y: number;
  readonly hasMine: boolean;
  readonly adjacentMines: number;
  readonly revealed: boolean;
  readonly flagged: boolean;
  readonly exploded: boolean;
  readonly incorrectFlag: boolean;
}

export interface GameState {
  readonly difficulty: Difficulty;
  readonly seed: number;
  readonly status: GameStatus;
  readonly board: readonly Cell[];
  readonly firstRevealDone: boolean;
  readonly startedAt: number | null;
  readonly endedAt: number | null;
  readonly elapsedSeconds: number;
  readonly flagsPlaced: number;
  readonly minesRemaining: number;
  readonly revealedSafeCells: number;
  readonly focused: Position;
  readonly face: FaceState;
}
