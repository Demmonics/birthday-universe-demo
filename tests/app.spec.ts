import { expect, test } from "@playwright/test";

test("the card table renders a WebGL card and the dealt hand", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Crazy Eights" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Game table" })).toBeVisible();
  await expect(page.locator('[data-testid="card-scene"] canvas')).toBeVisible();
  await expect(page.getByRole("button", { name: /^Play / })).toHaveCount(7);
  const hasWebGl = await page.locator('[data-testid="card-scene"] canvas').evaluate((element) => {
    if (!(element instanceof HTMLCanvasElement)) return false;
    return Boolean(element.getContext("webgl2") || element.getContext("webgl"));
  });
  expect(hasWebGl).toBe(true);
});

test("the card editor updates fictional preview text without a network form", async ({ page }) => {
  const nonGetRequests: string[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET") nonGetRequests.push(request.method());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Card Studio" }).click();
  await page.getByLabel("Card title").fill("A bright new day");
  await page.getByLabel("Card message").fill("Wishing you a day full of good surprises.");
  await expect(page.getByRole("article", { name: "Card preview" })).toContainText("A bright new day");
  await expect(page.getByRole("article", { name: "Card preview" })).toContainText("good surprises");
  expect(nonGetRequests).toEqual([]);
});

test("a human turn can draw and pass to the CPU", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Draw a card" }).click();
  await expect(page.getByRole("button", { name: "Pass turn" })).toBeVisible();
  await page.getByRole("button", { name: "Pass turn" }).click();
  const turnStatus = page.locator(".turn-row [role='status']");
  await expect(turnStatus).toHaveText("CPU turn.");
  await expect(turnStatus).toHaveText("Your turn.", { timeout: 5000 });
});

test("the mobile table fits without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator('[data-testid="card-scene"] canvas')).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
});
