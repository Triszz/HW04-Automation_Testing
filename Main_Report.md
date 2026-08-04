# BÁO CÁO HW#04 - Automation Testing

**Thông tin sinh viên:**

- **Họ và tên:** Trần Thanh Trí
- **MSSV:** 23127503
- **Lớp:** 23KTPM2
- **Môn học:** Kiểm thử phần mềm
- **Hệ thống (SUT):** EShop

---

## Task 1: Review & Gap Analysis of AI-generated Scripts

### Feature A: FR-01 - Account Registration (Pool A)

**1. What the AI got wrong or missed:**

- **Fragile & Missing Selectors:** AI sinh ra các CSS Selector dựa trên thuộc tính `name` (VD: `input[name="email"]`). Tuy nhiên, khi kiểm tra (Human Review) mã nguồn React thực tế của SUT, các thẻ input hoàn toàn không có `id`, `name`, hay `class` định danh. Thẻ `<label>` cũng thiếu thuộc tính `htmlFor`.
- **UI Mismatch (Missing Field):** AI đã sinh code để điền vào trường `confirmPassword` dựa trên Prompt đặc tả. Nhưng trên UI thực tế của SUT, trường "Xác nhận mật khẩu" hoàn toàn không tồn tại.

- **Lý do AI dự đoán sai (Why AI missed them):** Do Prompt chỉ được cung cấp đặc tả chức năng (Requirements) chứ không cung cấp mã nguồn HTML thực tế. AI do giới hạn về mặt ngữ cảnh đã tự động suy luận (hallucinate) ra các thuộc tính HTML tiêu chuẩn (như `name="email"`) và giả định rằng giao diện SUT được code tuân thủ 100% theo yêu cầu (có trường Confirm Password).

**2. How I fixed it (Human Intervention):**

- Thay thế toàn bộ selector của AI bằng kỹ thuật **CSS Adjacent Sibling (`+`)** (VD: `await page.locator('label:has-text("Họ Tên") + input').fill(data.name);`). Điều này giúp script bám sát góc nhìn của người dùng mà không cần phụ thuộc `id/class`.
- Comment lại dòng code điền `confirmPassword` vì UI không có.

**3. Test Execution & System Defect Discovery:**
Khi chạy script với data chuẩn xác, toàn bộ 12 Test Cases đều Failed. Qua phân tích (Root Cause Analysis), script Playwright hoàn toàn đúng, nhưng hệ thống SUT chứa **Blocker Bug**: Lập trình viên sử dụng Regex `/(?=.*\s)[A-Za-z\d\s]{8,}$/` chặn ngay đầu hàm Submit. Regex này sai logic (cấm ký tự đặc biệt, bắt buộc có khoảng trắng), khiến hệ thống từ chối mọi mật khẩu hợp lệ và báo lỗi _"Mật khẩu quá yếu..."_.
