import { test, expect } from "@playwright/test";
import productData from "../data/data_feature_c.json";

const ADMIN_URL = "http://localhost:5174/";

test.describe("Pool C - FR-15: Product CRUD (Add Product Validation)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ADMIN_URL);

    // Kiểm tra xem có đang ở trang Login không
    const loginBtn = page.getByRole("button", { name: "Login" });
    if (await loginBtn.isVisible()) {
      await page.getByPlaceholder("Email").fill("admin@eshop.com");
      await page.getByPlaceholder("Password").fill("Admin123!");
      await loginBtn.click();
    }

    // Đợi render Dashboard, sau đó click vào Tab "Sản phẩm"
    await page.getByText("Sản phẩm", { exact: true }).click();
    await expect(
      page.locator("h2", { hasText: "Quản lý Sản phẩm" }),
    ).toBeVisible();
  });

  for (const data of productData) {
    test(`[${data.id}] ${data.type} - ${data.description}`, async ({
      page,
    }) => {
      // BỎ QUA TC11 VÌ GIAO DIỆN KHÔNG CHO PHÉP CHỌN OPTION ẢO
      if (data.id === "TC11") {
        test.skip(
          true,
          "Skip do UI của dropdown đã chặn chọn option không tồn tại (Cần test qua API)",
        );
      }

      // ĐÁNH DẤU CÁC KNOWN BUGS
      if (["TC05", "TC06", "TC07", "TC08", "TC10", "TC12"].includes(data.id)) {
        test.fail(true, "Bug: API thiếu Validation hoàn toàn cho Input Data");
      }

      const nameInput = page.getByPlaceholder("Tên sản phẩm");
      const priceInput = page.getByPlaceholder("Giá tiền");
      const categorySelect = page.locator("select");
      const submitBtn = page.getByRole("button", { name: "Lưu sản phẩm" });

      // Lắng nghe sự kiện Alert của trình duyệt
      let dialogMessage = "";
      page.on("dialog", async (dialog) => {
        dialogMessage = dialog.message();
        await dialog.accept();
      });

      // Điền form
      if (data.name !== null && data.name !== undefined) {
        await nameInput.fill(data.name);
        await expect(nameInput).toHaveValue(data.name);
      }
      if (data.price !== null && data.price !== undefined) {
        await priceInput.fill(data.price.toString());
      }
      if (data.category_id !== null && data.category_id !== undefined) {
        await categorySelect.selectOption(data.category_id.toString());
      }

      await submitBtn.click();
      await page.waitForTimeout(500);

      if (data.expectedStatus === 201) {
        // [Assertion Pattern 1]: Form State / Value Assertion (Dev xoá trắng form sau khi thêm thành công)
        await expect(nameInput).toHaveValue("");

        // [Assertion Pattern 2]: Element Count / Table Assertion (Sản phẩm phải hiện ở bảng dưới)
        if (data.name) {
          const addedRow = page.locator(`td:has-text("${data.name}")`).first();
          await expect(addedRow).toBeVisible();
        }
      } else {
        // XỬ LÝ LỖI
        if (data.id === "TC03") {
          // Bắt lỗi HTML5 Native Validation (Do Dev xài thuộc tính `required` ở input tên)
          const validationMsg = await nameInput.evaluate(
            (el: HTMLInputElement) => el.validationMessage,
          );
          expect(validationMsg).not.toBe("");
        } else {
          // [Assertion Pattern 3]: Dialog Assertion (Bắt lỗi từ Alert)
          expect(dialogMessage.toLowerCase()).toContain(
            (data.expectedError as string).toLowerCase(),
          );
        }
      }
    });
  }
});
