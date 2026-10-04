import { expect, test } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

test("root index launches through file URL", async ({ page }) => {
  const fileUrl = `${pathToFileURL(resolve("index.html")).href}?difficulty=beginner&seed=201`;
  const consoleErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto(fileUrl);
  await expect(page.getByTestId("board")).toBeVisible();
  await page.getByTestId("cell-4-4").click();
  await expect(page.getByTestId("timer")).not.toHaveText("000");
  expect(consoleErrors).toEqual([]);
});

test("dev launcher does not try to load source modules through file URL", async ({ page }) => {
  const fileUrl = `${pathToFileURL(resolve("dev.html")).href}?difficulty=beginner&seed=202`;
  const consoleErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto(fileUrl);
  await expect(page).toHaveURL(/index\.html/);
  await expect(page.getByTestId("board")).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
