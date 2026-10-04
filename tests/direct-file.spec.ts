import { expect, test } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

test("built game launches through file URL", async ({ page }) => {
  const fileUrl = `${pathToFileURL(resolve("dist-file/index.html")).href}?difficulty=beginner&seed=201`;
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
