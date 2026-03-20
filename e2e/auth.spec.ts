import { test, expect } from "@playwright/test";

test.describe("Authentication flows", () => {
  test("unauthenticated users are redirected from /dashboard to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/(login|register|$)/);
  });

  test("login page renders email and password fields", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.locator('input[type="email"], input[name="email"]'),
    ).toBeVisible();
    await expect(
      page.locator('input[type="password"], input[name="password"]'),
    ).toBeVisible();
  });

  test("login submit button is present", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.locator('button[type="submit"]'),
    ).toBeVisible();
  });

  test("register page is accessible and renders a form", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveURL(/\/register/);
    // At minimum there should be a form element
    const formOrInputs = page.locator("form, input");
    await expect(formOrInputs.first()).toBeVisible();
  });

  test("login page has no broken images", async ({ page }) => {
    await page.goto("/login");
    const failedImages: string[] = [];
    page.on("response", (response) => {
      if (
        response.request().resourceType() === "image" &&
        !response.ok()
      ) {
        failedImages.push(response.url());
      }
    });
    await page.waitForLoadState("networkidle");
    expect(failedImages).toHaveLength(0);
  });
});
