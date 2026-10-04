import { describe, expect, it } from "vitest";
import { createGame, getCell, revealCell, toggleFlag, chordCell, moveFocus } from "./engine";

describe("Minesweeper game engine", () => {
  it("creates the settled beginner board", () => {
    const game = createGame({ difficulty: "beginner", seed: 123 });

    expect(game.difficulty.width).toBe(9);
    expect(game.difficulty.height).toBe(9);
    expect(game.difficulty.mines).toBe(10);
    expect(game.board).toHaveLength(81);
    expect(game.status).toBe("ready");
    expect(game.minesRemaining).toBe(10);
  });

  it("keeps the first reveal safe and starts the timer", () => {
    const game = revealCell(createGame({ difficulty: "beginner", seed: 1 }), { x: 4, y: 4 }, 1000);
    const firstCell = getCell(game, { x: 4, y: 4 });

    expect(firstCell.hasMine).toBe(false);
    expect(firstCell.revealed).toBe(true);
    expect(game.status).toBe("playing");
    expect(game.startedAt).toBe(1000);
  });

  it("toggles flags without starting the timer", () => {
    const game = toggleFlag(createGame({ difficulty: "beginner", seed: 2 }), { x: 0, y: 0 });
    const flagged = getCell(game, { x: 0, y: 0 });

    expect(flagged.flagged).toBe(true);
    expect(game.flagsPlaced).toBe(1);
    expect(game.minesRemaining).toBe(9);
    expect(game.status).toBe("ready");
    expect(game.startedAt).toBeNull();

    const unflagged = toggleFlag(game, { x: 0, y: 0 });
    expect(getCell(unflagged, { x: 0, y: 0 }).flagged).toBe(false);
    expect(unflagged.flagsPlaced).toBe(0);
  });

  it("reveals neighboring cells when chording a satisfied number", () => {
    let game = createGame({ difficulty: "beginner", seed: 20 });
    game = revealCell(game, { x: 0, y: 0 }, 0);

    const numbered = game.board.find((cell) => cell.revealed && cell.adjacentMines > 0);
    expect(numbered).toBeDefined();

    const hiddenMineNeighbor = game.board.find(
      (cell) =>
        !cell.revealed &&
        cell.hasMine &&
        Math.abs(cell.x - numbered!.x) <= 1 &&
        Math.abs(cell.y - numbered!.y) <= 1
    );
    expect(hiddenMineNeighbor).toBeDefined();

    game = toggleFlag(game, hiddenMineNeighbor!);
    const before = game.revealedSafeCells;
    const chorded = chordCell(game, numbered!, 5000);

    expect(chorded.revealedSafeCells).toBeGreaterThan(before);
    expect(chorded.status).toBe("playing");
  });

  it("marks loss details after revealing a mine", () => {
    let game = revealCell(createGame({ difficulty: "beginner", seed: 7 }), { x: 0, y: 0 }, 0);
    const mine = game.board.find((cell) => cell.hasMine && !cell.revealed);
    const safe = game.board.find((cell) => !cell.hasMine && !cell.revealed);

    expect(mine).toBeDefined();
    expect(safe).toBeDefined();

    game = toggleFlag(game, safe!);
    const lost = revealCell(game, mine!, 3000);

    expect(lost.status).toBe("lost");
    expect(lost.endedAt).toBe(3000);
    expect(getCell(lost, mine!).exploded).toBe(true);
    expect(getCell(lost, safe!).incorrectFlag).toBe(true);
    expect(lost.board.filter((cell) => cell.hasMine).every((cell) => cell.revealed)).toBe(true);
  });

  it("wins when every safe cell is revealed", () => {
    let game = revealCell(createGame({ difficulty: "beginner", seed: 11 }), { x: 0, y: 0 }, 0);

    for (const cell of game.board) {
      if (!cell.hasMine && !cell.revealed) {
        game = revealCell(game, cell, 9000);
      }
    }

    expect(game.status).toBe("won");
    expect(game.face).toBe("happy");
    expect(game.endedAt).toBe(9000);
    expect(game.elapsedSeconds).toBe(9);
  });

  it("moves focus within the board boundaries", () => {
    let game = createGame({ difficulty: "beginner", seed: 4 });

    game = moveFocus(game, "left");
    expect(game.focused).toEqual({ x: 0, y: 0 });

    game = moveFocus(game, "right");
    game = moveFocus(game, "down");
    expect(game.focused).toEqual({ x: 1, y: 1 });
  });
});
