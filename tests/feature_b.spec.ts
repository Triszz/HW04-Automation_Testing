import { test, expect } from "@playwright/test";
import couponData from "../data/data_feature_b.json";

const CHECKOUT_URL = "http://localhost:5173/checkout";

test.describe("Pool B - FR-09: Apply Coupon", () => {
  for (const data of couponData) {
    test(`[${data.id}] ${data.type} - Áp dụng mã: ${data.code} với đơn hàng ${data.total_amount}đ`, async ({
      page,
    }) => {
      await page.goto(CHECKOUT_URL);

      const totalAmountInput = page.locator('input[type="number"]');
      await totalAmountInput.fill(data.total_amount.toString());

      const couponInput = page.getByPlaceholder("Nhập mã giảm giá...");
      const applyBtn = page.getByRole("button", { name: "Áp dụng" });

      await couponInput.fill(data.code);
      await expect(couponInput).toHaveValue(data.code);

      // --- FIX LỖI SCRIPT TC12: Xử lý nút Disable ---
      if (data.code === "") {
        // [Assertion Pattern] Kiểm tra trạng thái UI (Element State)
        await expect(applyBtn).toBeDisabled();
        return; // Kết thúc test case này tại đây, không click nữa
      }

      // Click nút để gọi API
      await applyBtn.click();
      await expect(applyBtn).toHaveText("Áp dụng");

      if (data.expectedStatus === 200) {
        const successMsg = page.locator(".text-green-700");
        await expect(successMsg).toBeVisible();
        await expect(successMsg).toContainText("Tiết kiệm", {
          ignoreCase: true,
        });
      } else {
        const errorMsg = page.locator("p.text-red-600");
        await expect(errorMsg).toBeVisible();

        await expect(errorMsg).toContainText(data.expectedError as string, {
          ignoreCase: true,
        });
      }
    });
  }
});
