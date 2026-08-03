import { test, expect } from "@playwright/test";
import registerData from "../data/data_feature_a.json";

const BASE_URL = "http://localhost:5173/register";

test.describe("Pool A - FR-01: Account Registration", () => {
  for (const data of registerData) {
    test(`[${data.id}] ${data.type} - Register with email: ${data.email}`, async ({
      page,
    }) => {
      await page.goto(BASE_URL);

      // 1. Selector bằng CSS Adjacent Sibling
      await page.locator('label:has-text("Họ Tên") + input').fill(data.name);
      await page.locator('label:has-text("Email") + input').fill(data.email);
      await page.locator('input[type="password"]').fill(data.password);

      // await page.locator('label:has-text("Xác nhận mật khẩu") + input').fill(data.confirmPassword);

      // Click nút bằng getByRole
      await page.getByRole("button", { name: "Đăng Ký" }).click();

      // 2. Assertions
      if (data.expectedResult === "Success") {
        // Assertion Pattern 1: Kiểm tra trạng thái điều hướng của trang (Page State/URL Assertion)
        await expect(page).toHaveURL(/.*login/);
      } else {
        // Lấy thẻ div chứa thông báo lỗi
        const errorMsg = page.locator(".bg-red-100");
        // Assertion Pattern 2: Kiểm tra trạng thái hiển thị của DOM (Visibility Assertion)
        await expect(errorMsg).toBeVisible();
        // Assertion Pattern 3: Kiểm tra nội dung văn bản (Text Content Assertion)
        await expect(errorMsg).toContainText(data.expectedMessage, {
          ignoreCase: true,
        });
      }
    });
  }
});
