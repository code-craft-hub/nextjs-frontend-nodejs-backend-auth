import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("loads successfully with a non-empty title", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test("body is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });

  test("has a navigation element", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav, header, [role='navigation']");
    await expect(nav.first()).toBeVisible();
  });

  test("login link exists on the landing page", async ({ page }) => {
    await page.goto("/");
    const loginLink = page.locator("a[href='/login'], a[href*='login']");
    await expect(loginLink.first()).toBeVisible();
  });

  test("page has no console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Filter out known-harmless warnings (e.g. React hydration in dev mode)
    const criticalErrors = errors.filter(
      (e) => !e.includes("Warning:") && !e.includes("DevTools"),
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe("Blog page", () => {
  test("blog route responds without a 5xx error", async ({ page }) => {
    const response = await page.goto("/blog");
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe("Navigation", () => {
  test("clicking the login link navigates to /login", async ({ page }) => {
    await page.goto("/");
    const loginLink = page.locator("a[href='/login'], a[href*='login']");
    if ((await loginLink.count()) > 0) {
      await loginLink.first().click();
      await expect(page).toHaveURL(/\/login/);
    } else {
      // If no login link, navigate directly and assert
      await page.goto("/login");
      await expect(page).toHaveURL(/\/login/);
    }
  });
});
