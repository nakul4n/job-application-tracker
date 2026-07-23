import { expect, test } from "@playwright/test";

test.describe("job application workflow", () => {
  test.skip(!process.env.E2E_BASE_URL, "Requires a running app and seeded test database.");

  test("redirects an unauthenticated user", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/sign-in/);
  });

  test("completes the primary application journey", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL || "demo@example.com");
    await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD || "DemoPassword1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.getByRole("link", { name: "Add application" }).first().click();
    await page.getByLabel("Company").fill("Example Company");
    await page.getByLabel("Role title").fill("Product Designer");
    await page.getByLabel("Current stage").selectOption("APPLIED");
    await page.getByRole("button", { name: "Create application" }).click();
    await expect(page.getByRole("heading", { name: "Product Designer" })).toBeVisible();
    await page.getByLabel("Update stage").selectOption("RECRUITER_SCREENING");
    await page.getByRole("button", { name: "Update stage" }).click();
    await expect(page.getByText("Stage changed to Recruiter screening")).toBeVisible();
    await page.goto("/analytics");
    await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible();
  });

  test("shows validation feedback for an invalid application", async ({ page }) => {
    await page.goto("/applications/new");
    await page.getByRole("button", { name: "Create application" }).click();
    await expect(page.getByLabel("Company")).toBeFocused();
  });

  test("handles a missing application without leaking details", async ({ page }) => {
    await page.goto("/applications/not-a-real-id");
    await expect(page.getByRole("heading", { name: "That record is not available" })).toBeVisible();
  });
});
