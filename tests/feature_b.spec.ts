import { test, expect } from "@playwright/test";
import couponData from "../data/data_feature_b.json";

const CHECKOUT_URL = "http://localhost:5173/checkout";

test.describe("Pool B - FR-09: Apply Coupon", () => {
  for (const data of couponData) {
    test(`[${data.id}] ${data.type} - Áp dụng mã: ${data.code} với đơn hàng ${data.total_amount}đ`, async ({
      page,
    }) => {
      if (["TC01", "TC03"].includes(data.id)) {
        test.fail(
          true,
          "Bug: Lỗi logic biên (Boundary), hệ thống dùng > thay vì >= cho min_order",
        );
      }
      if (["TC09", "TC10"].includes(data.id)) {
        test.fail(
          true,
          "Bug: Lỗi bảo mật nghiêm trọng, API bỏ qua check Auth Token và số lượt dùng",
        );
      }
      if (data.id === "TC11") {
        test.fail(true, "Bug: Thiếu validation chặn số tiền âm");
      }

      await page.goto(CHECKOUT_URL);

      const totalAmountInput = page.locator('input[type="number"]');
      await totalAmountInput.fill(data.total_amount.toString());

      const couponInput = page.getByPlaceholder("Nhập mã giảm giá...");
      const applyBtn = page.getByRole("button", { name: "Áp dụng" });

      await couponInput.fill(data.code);

      // [Assertion Pattern 1]: Element Property / Value Assertion
      // Kiểm tra xem trường input có thực sự nhận và giữ đúng giá trị vừa truyền vào hay không.
      await expect(couponInput).toHaveValue(data.code);

      if (data.code === "") {
        // [Assertion Pattern 2]: Element State Assertion
        // Kiểm tra trạng thái của phần tử (Disabled/Enabled) để chặn thao tác click không hợp lệ.
        await expect(applyBtn).toBeDisabled();
        return;
      }

      await applyBtn.click();

      // Mở rộng Pattern 4: Exact Text Match
      // Đảm bảo nút đã hoàn thành trạng thái loading "..." và quay về trạng thái text gốc.
      await expect(applyBtn).toHaveText("Áp dụng");

      if (data.expectedStatus === 200) {
        const successMsg = page.locator(".text-green-700");

        // [Assertion Pattern 3]: Visibility / DOM State Assertion
        // Xác nhận phần tử thông báo thành công thực sự xuất hiện và hiển thị trên màn hình.
        await expect(successMsg).toBeVisible();

        // [Assertion Pattern 4]: Substring / Text Content Assertion
        // Xác nhận nội dung văn bản bên trong phần tử có chứa từ khóa mong đợi.
        await expect(successMsg).toContainText("Tiết kiệm", {
          ignoreCase: true,
        });
      } else {
        const errorMsg = page.locator("p.text-red-600");

        // [Assertion Pattern 3]: Visibility / DOM State Assertion
        await expect(errorMsg).toBeVisible();

        // [Assertion Pattern 4]: Substring / Text Content Assertion
        await expect(errorMsg).toContainText(data.expectedError as string, {
          ignoreCase: true,
        });
      }
    });
  }
});
