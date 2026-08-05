import { test, expect } from "@playwright/test";
import productData from "../data/data_feature_c.json";

// Giả định URL của trang Thêm sản phẩm trong Admin
const ADMIN_ADD_PRODUCT_URL = "http://localhost:5173/admin/products/add";

test.describe("Pool C - FR-15: Product CRUD (Add Product Validation)", () => {
  for (const data of productData) {
    test(`[${data.id}] ${data.type} - ${data.description}`, async ({
      page,
    }) => {
      // Mở trang Thêm sản phẩm
      await page.goto(ADMIN_ADD_PRODUCT_URL);

      // --- 1. ĐỊNH NGHĨA LOCATORS (Dựa trên giả định tiêu chuẩn) ---
      // Dùng getByLabel hoặc Placeholder rất hiệu quả cho form nhập liệu
      const nameInput = page
        .getByPlaceholder("Nhập tên sản phẩm", { exact: false })
        .or(page.locator('input[name="name"]'));
      const priceInput = page.locator(
        'input[type="number"], input[name="price"]',
      );
      const categorySelect = page.locator("select");
      const submitBtn = page.getByRole("button", { name: /lưu|thêm/i });

      // --- 2. THỰC HIỆN THAO TÁC (ACTIONS) ---
      if (data.name !== null && data.name !== undefined) {
        await nameInput.fill(data.name);

        // [Assertion Pattern 1]: Element Property / Value Assertion
        // Đảm bảo UI nhận chính xác chuỗi (rất quan trọng với TC04, TC05 test chuỗi dài 255 ký tự)
        await expect(nameInput).toHaveValue(data.name);
      }

      if (data.price !== null && data.price !== undefined) {
        await priceInput.fill(data.price.toString());
      }

      if (data.category_id !== null && data.category_id !== undefined) {
        // Giả định thẻ select dùng value là id của danh mục (1, 2,...)
        await categorySelect.selectOption(data.category_id.toString());
      }

      // Click submit
      await submitBtn.click();

      // --- 3. KIỂM CHỨNG KẾT QUẢ (ASSERTIONS) ---
      if (data.expectedStatus === 201) {
        // TRƯỜNG HỢP THÀNH CÔNG (Positive & Edge Hợp lệ)
        // Giả định hệ thống hiện Toast message màu xanh hoặc class .text-green-600
        const successMsg = page
          .locator(".toast-success, .text-green-600, .alert-success")
          .first();

        // [Assertion Pattern 2]: Visibility / DOM State Assertion
        await expect(successMsg).toBeVisible({ timeout: 5000 });

        // [Assertion Pattern 3]: Text Content / Substring Assertion
        await expect(successMsg).toContainText("thành công", {
          ignoreCase: true,
        });
      } else {
        // TRƯỜNG HỢP LỖI (Negative & Edge Không hợp lệ)
        // Giả định hệ thống bôi đỏ dòng text ở dưới ô input hoặc hiện alert đỏ
        const errorMsg = page
          .locator(
            ".text-red-500, .text-red-600, .error-message, .invalid-feedback",
          )
          .first();

        // [Assertion Pattern 2]: Visibility / DOM State Assertion
        await expect(errorMsg).toBeVisible({ timeout: 5000 });

        // [Assertion Pattern 3]: Text Content / Substring Assertion
        await expect(errorMsg).toContainText(data.expectedError as string, {
          ignoreCase: true,
        });
      }
    });
  }
});
