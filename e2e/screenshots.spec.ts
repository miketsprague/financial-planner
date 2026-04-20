import { test } from "@playwright/test";

const pages = [
  { name: "homepage", path: "/" },
];

for (const { name, path } of pages) {
  test(`screenshot: ${name}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: `screenshots/${name}.png`,
      fullPage: true,
    });
  });
}
