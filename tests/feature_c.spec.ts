import { test, expect } from "@playwright/test";
import productData from "../data/data_feature_c.json";

// Giả định URL của trang Quản lý sản phẩm
const ADMIN_PRODUCT_URL = "http://localhost:5174";

test.describe("Pool C - FR-15: Product CRUD (Add Product Validation)", () => {
  for (const data of productData) {
    test(`[${data.id}] ${data.type} - ${data.description}`, async ({
      page,
    }) => {
      await page.goto(ADMIN_PRODUCT_URL);

      // --- CẬP NHẬT 1: CHUẨN HOÁ LOCATORS THEO MÃ NGUỒN REACT ---
      const nameInput = page.getByPlaceholder("Tên sản phẩm");
      const priceInput = page.getByPlaceholder("Giá tiền");
      const categorySelect = page.locator("select");
      const submitBtn = page.getByRole("button", { name: "Lưu sản phẩm" });

      // --- CẬP NHẬT 2: BẮT SỰ KIỆN ALERT (DIALOG) CỦA TRÌNH DUYỆT ---
      let dialogMessage = "";
      page.on("dialog", async (dialog) => {
        dialogMessage = dialog.message();
        await dialog.accept(); // Bấm OK để đóng hộp thoại
      });

      // Điền dữ liệu
      if (data.name !== null && data.name !== undefined) {
        await nameInput.fill(data.name);
        // [Assertion Pattern 1]: Value Assertion
        await expect(nameInput).toHaveValue(data.name);
      }

      if (data.price !== null && data.price !== undefined) {
        await priceInput.fill(data.price.toString());
      }

      if (data.category_id !== null && data.category_id !== undefined) {
        await categorySelect.selectOption(data.category_id.toString());
      }

      // Click Lưu
      await submitBtn.click();

      // Đợi 1 chút để API xử lý và hiển thị Alert (nếu có)
      await page.waitForTimeout(500);

      // --- 3. KIỂM CHỨNG KẾT QUẢ ---
      if (data.expectedStatus === 201) {
        // [Assertion Pattern 2]: Element Count / Table Assertion
        // Nếu thành công, sản phẩm phải xuất hiện trong bảng (table)
        // Ta tìm thẻ <td> chứa tên sản phẩm vừa nhập
        if (data.name) {
          const addedProduct = page
            .locator(`td:has-text("${data.name}")`)
            .first();
          await expect(addedProduct).toBeVisible();
        }
      } else {
        // [Assertion Pattern 3]: Dialog/Text Assertion
        // Nếu lỗi, hệ thống phải văng Alert chứa câu báo lỗi
        expect(dialogMessage.toLowerCase()).toContain(
          (data.expectedError as string).toLowerCase(),
        );
      }
    });
  }
});
