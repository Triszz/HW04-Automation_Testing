import { test, expect } from "@playwright/test";
import couponData from "../data/data_feature_b.json";

const CHECKOUT_URL = "http://localhost:5173/checkout";

test.describe("Pool B - FR-09: Apply Coupon", () => {
  for (const data of couponData) {
    test(`[${data.id}] ${data.type} - Áp dụng mã: ${data.code} với đơn hàng ${data.total_amount}đ`, async ({
      page,
    }) => {
      await page.goto(CHECKOUT_URL);

      // --- CẬP NHẬT 1: Tận dụng "Backdoor" nhập trực tiếp tổng tiền ---
      const totalAmountInput = page.locator('input[type="number"]');
      await totalAmountInput.fill(data.total_amount.toString());

      // --- CẬP NHẬT 2: Sửa chính xác Placeholder ---
      const couponInput = page.getByPlaceholder("Nhập mã giảm giá...");
      const applyBtn = page.getByRole("button", { name: "Áp dụng" });

      // Điền mã giảm giá
      await couponInput.fill(data.code);

      // [Assertion Pattern 1]: Kiểm tra UI có giữ đúng text vừa nhập không
      await expect(couponInput).toHaveValue(data.code);

      // Click nút để gọi API
      await applyBtn.click();

      // Đợi 1 chút để API phản hồi (Dev có trạng thái applyingCoupon = true/false)
      // Playwright auto-wait rất thông minh, nhưng ta có thể đảm bảo nút đã hết loading
      await expect(applyBtn).toHaveText("Áp dụng");

      // --- CẬP NHẬT 3: Sửa chính xác Class CSS theo mã nguồn React ---
      if (data.expectedStatus === 200) {
        // Class của thông báo thành công theo React code: text-green-700
        const successMsg = page.locator(".text-green-700");

        // [Assertion Pattern 2]: Visibility
        await expect(successMsg).toBeVisible();

        // [Assertion Pattern 3]: Text Content (Dev có thêm dấu ✅, ta tìm chữ "Tiết kiệm")
        await expect(successMsg).toContainText("Tiết kiệm", {
          ignoreCase: true,
        });
      } else {
        // Class của thông báo lỗi theo React code: text-red-600
        const errorMsg = page.locator(".text-red-600");

        // [Assertion Pattern 2]: Visibility
        await expect(errorMsg).toBeVisible();

        // [Assertion Pattern 3]: Text Content
        await expect(errorMsg).toContainText(data.expectedError as string, {
          ignoreCase: true,
        });
      }
    });
  }
});
