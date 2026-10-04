import { expect, test } from "@playwright/test";
import { createGame, revealCell } from "../src/game/engine";

test("player can reveal a first safe cell and flag a hidden cell", async ({ page }) => {
  await page.goto("/?difficulty=beginner&seed=101");

  await page.getByTestId("cell-4-4").click();
  await expect(page.getByTestId("cell-4-4")).not.toHaveText("*");
  await expect(page.getByTestId("timer")).not.toHaveText("000");

  await page.getByTestId("cell-0-0").click({ button: "right" });
  await expect(page.getByTestId("cell-0-0")).toHaveText("F");
  await expect(page.getByTestId("mine-counter")).toHaveText("009");
});

test("keyboard controls move focus, flag, and reset", async ({ page }) => {
  await page.goto("/?difficulty=beginner&seed=102");

  await page.getByTestId("cell-0-0").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("cell-1-0")).toBeFocused();

  await page.keyboard.press("f");
  await expect(page.getByTestId("cell-1-0")).toHaveText("F");

  await page.keyboard.press("r");
  await expect(page.getByTestId("cell-1-0")).toHaveText("");
  await expect(page.getByTestId("mine-counter")).toHaveText("010");
});

test("loss reveals mines and marks the exploded mine", async ({ page }) => {
  const seed = 103;
  const firstReveal = { x: 0, y: 0 };
  const game = revealCell(createGame({ difficulty: "beginner", seed }), firstReveal, 0);
  const mine = game.board.find((cell) => cell.hasMine);

  expect(mine).toBeDefined();

  await page.goto(`/?difficulty=beginner&seed=${seed}`);
  await page.getByTestId("cell-0-0").click();
  await page.getByTestId(`cell-${mine!.x}-${mine!.y}`).click();

  await expect(page.getByTestId("status")).toContainText("Lost after");
  await expect(page.getByTestId("reset")).toHaveText("X(");
  await expect(page.getByTestId(`cell-${mine!.x}-${mine!.y}`)).toHaveText("!");
});

test("expert board keeps its settled dimensions on mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?difficulty=expert&seed=104");

  await expect(page.getByTestId("board")).toHaveCSS("grid-template-columns", /.+/);
  await expect(page.getByTestId("cell-29-15")).toBeVisible();
  await expect(page.getByTestId("status")).toContainText("30 x 16, 99 mines");
});
