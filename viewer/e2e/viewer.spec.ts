import { test, expect } from "@playwright/test";

test("picks a document then shows sheets", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Выберите схему/i })).toBeVisible();
  await page.getByRole("button", { name: /e36z3 99|Z3|BMW/i }).first().click();
  await expect(page.getByText("Листы")).toBeVisible();
  await expect(page.getByPlaceholder("Sheet code, компонент…")).toBeVisible();
});
