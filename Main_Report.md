# BÁO CÁO HW#04 - Automation Testing

**Thông tin sinh viên:**

- **Họ và tên:** Trần Thanh Trí
- **MSSV:** 23127503
- **Lớp:** 23KTPM2
- **Môn học:** Kiểm thử phần mềm
- **Hệ thống (SUT):** EShop

---

## Task 1: Review & Gap Analysis of AI-generated Scripts

### Feature A: FR-01 - Đăng ký tài khoản (Pool A)

**1. What the AI got wrong or missed:**

- **Fragile & Missing Selectors:** AI sinh ra các CSS Selector dựa trên thuộc tính `name` (VD: `input[name="email"]`). Tuy nhiên, khi kiểm tra (Human Review) mã nguồn React thực tế của SUT, các thẻ input hoàn toàn không có `id`, `name`, hay `class` định danh. Thẻ `<label>` cũng thiếu thuộc tính `htmlFor`.
- **UI Mismatch (Missing Field):** AI đã sinh code để điền vào trường `confirmPassword` dựa trên Prompt đặc tả. Nhưng trên UI thực tế của SUT, trường "Xác nhận mật khẩu" hoàn toàn không tồn tại.

- **Lý do AI dự đoán sai (Why AI missed them):** Do Prompt chỉ được cung cấp đặc tả chức năng (Requirements) chứ không cung cấp mã nguồn HTML thực tế. AI do giới hạn về mặt ngữ cảnh đã tự động suy luận (hallucinate) ra các thuộc tính HTML tiêu chuẩn (như `name="email"`) và giả định rằng giao diện SUT được code tuân thủ 100% theo yêu cầu (có trường Confirm Password).

**2. How I fixed it (Human Intervention):**

- Thay thế toàn bộ selector của AI bằng kỹ thuật **CSS Adjacent Sibling (`+`)** (VD: `await page.locator('label:has-text("Họ Tên") + input').fill(data.name);`). Điều này giúp script bám sát góc nhìn của người dùng mà không cần phụ thuộc `id/class`.
- Comment lại dòng code điền `confirmPassword` vì UI không có.

**3. Test Execution & System Defect Discovery:**

Kịch bản Automation được thiết kế bao gồm 12 Test Cases (phủ cả Happy Path và Negative/Edge Cases) và áp dụng thành công **3 Assertion Patterns** theo đúng yêu cầu:

1. `toHaveURL()`: Kiểm tra trạng thái điều hướng của trang (Page State / URL Assertion).
2. `toBeVisible()`: Kiểm tra trạng thái hiển thị của DOM (Visibility Assertion).
3. `toContainText()`: Kiểm tra nội dung văn bản báo lỗi (Text Content Assertion).

Khi chạy script với data chuẩn xác, toàn bộ 12 Test Cases đều trả về kết quả `Failed`. Thay vì sử dụng workaround để lách lỗi, em quyết định giữ nguyên hiện trạng kịch bản gốc để toàn bộ các test cases đều Failed. Điều này nhằm phản ánh trung thực thực trạng hỏng hóc (broken validation) của SUT trong báo cáo HTML.

Qua quá trình phân tích (Root Cause Analysis) và đối chiếu giao diện, em phát hiện và log thành công 2 Bugs:

- **[Blocker] Hỏng toàn diện logic Validation:** Lập trình viên sử dụng Regex `/(?=.*\s)[A-Za-z\d\s]{8,}$/` chặn ngay đầu hàm Submit. Regex này sai logic (cấm ký tự đặc biệt, bắt buộc có khoảng trắng), khiến hệ thống từ chối mọi mật khẩu hợp lệ và block hoàn toàn luồng đăng ký của người dùng.
- **[UI/UX] Thiếu trường nhập liệu so với đặc tả:** Màn hình đăng ký thực tế hoàn toàn vắng bóng trường "Xác nhận mật khẩu" (Confirm Password), gây sai lệch trải nghiệm và luồng UI so với yêu cầu ban đầu.

---

### Feature B: FR-09 - Mã Giảm Giá (Coupon) (Pool B)

**1. What the AI got wrong or missed:**

- **Missing Pre-conditions (Context/Flow Gap):** Kịch bản ban đầu do AI sinh ra chỉ tập trung vào việc điền form "Mã giảm giá". AI đã hoàn toàn bỏ qua các điều kiện tiên quyết (pre-conditions) của luồng giao diện Checkout: Để có `total_amount` thì phải có sản phẩm trong giỏ hàng, và để truyền được `user_id` thì người dùng phải thực hiện thao tác Đăng nhập trước đó.
- **Weak Assertions (Dẫn đến False Positive):** Đối với các test case thành công (TC02, TC04), AI chỉ thiết lập assertion kiểm tra sự xuất hiện của dòng chữ thông báo màu xanh (`toContainText("Tiết kiệm")`). AI đã bỏ sót việc trích xuất và so sánh chéo các giá trị số học thực tế (`expectedDiscount`, `expectedFinal`) từ file JSON. Điều này dẫn đến việc kịch bản Automation cho kết quả `Passed` (False Positive) dù hệ thống Backend đang tính toán sai lệch hoàn toàn công thức toán học (ra số âm hàng trăm triệu).
- **Lý do AI dự đoán sai (Why AI missed them):** AI thiếu đi góc nhìn toàn cảnh về luồng nghiệp vụ (End-to-End flow) và không dự đoán được mức độ nghiêm trọng của các lỗi logic toán học ở Backend. AI có xu hướng viết các UI Assertions khá "nông" (shallow) – chỉ quan tâm đến thay đổi trạng thái UI thay vì đi sâu vào Data Validation.

**2. How I fixed it (Human Intervention):**

- **Exploiting Dev Backdoor:** Thay vì viết thêm các hàm phức tạp như `login()` hay `addToCart()` để bù đắp thiếu sót của AI, em đã tiến hành Code Review mã nguồn React của frontend và phát hiện một lỗ hổng (backdoor): Lập trình viên để lộ một thẻ `input[type="number"]` cho phép sửa trực tiếp tổng tiền. Em đã map `data.total_amount` trực tiếp vào ô này, giúp tối ưu hóa kịch bản test.
- **Strict Mode Selectors:** Sửa lại các locator chung chung của AI (như `.text-red-600` bị trùng lặp với class của ô input) thành các selector đặc tả chính xác hơn (VD: `p.text-red-600`).
- **Handling Element States:** Bổ sung logic xử lý cho Edge Case (TC12 - Mã rỗng) bằng cách kiểm tra trạng thái nút bấm (`await expect(applyBtn).toBeDisabled();`) để ngăn chặn lỗi Timeout 30s do Playwright cố click vào phần tử bị mờ.
- **Upgrading to Strong Assertions:** Để khắc phục tình trạng lọt lưới (False Positive) của kịch bản gốc ở TC02, em đã nâng cấp Assertion bằng cách trích xuất trực tiếp `expectedDiscount` và `expectedFinal` từ file JSON, ép kiểu dữ liệu và format số có dấu phẩy (`toLocaleString()`). Việc đối chiếu chính xác các con số này buộc kịch bản phải đánh `Failed` ngay lập tức khi Backend trả về số tiền tính toán sai (số âm).

**3. Test Execution & System Defect Discovery:**

Kịch bản Automation được thiết kế bao gồm 12 Test Cases (Data-driven) và áp dụng thành công **4 Assertion Patterns** khác biệt, vượt yêu cầu của đề bài:

1. `toHaveValue()`: Kiểm tra giá trị thuộc tính (Value Assertion).
2. `toBeDisabled()`: Kiểm tra trạng thái khả dụng (State Assertion).
3. `toBeVisible()`: Kiểm tra trạng thái hiển thị trên DOM (Visibility Assertion).
4. `toContainText()` / `toHaveText()`: Kiểm tra nội dung văn bản (Text Assertion).

Khác với Feature A bị hỏng toàn diện, Feature B vẫn có những luồng hoạt động thành công. Do đó, đối với các lỗi phát hiện được, em áp dụng chiến lược sử dụng `test.fail()` của Playwright để đánh dấu chúng là **Known Bugs**. Kỹ thuật này giúp kịch bản phân tách rõ ràng giữa test case hỏng do lỗi Script và test case hỏng do khiếm khuyết của hệ thống.

Qua quá trình chạy Automation kết hợp với Kiểm thử thăm dò thủ công (Exploratory Testing), tôi đã log thành công 4 Bugs nghiêm trọng:

- **[Major] Lỗi logic giá trị biên (Boundary Bug):** Hệ thống sử dụng toán tử `>` thay vì `>=` cho ngưỡng tối thiểu, từ chối mã khi đơn hàng vừa chạm mức 300,000đ.
- **[Major] Lỗi bảo mật bỏ qua xác thực (Auth Bypass):** API `/apply-coupon` không yêu cầu JWT Token, cho phép Guest áp dụng mã giảm giá, gây trải nghiệm UX xấu khi bị chặn lại ở bước thanh toán cuối và có nguy cơ rò rỉ (brute-force) mã khuyến mãi.
- **[Critical] Tính toán sai công thức toán học:** Nhờ phát hiện lỗ hổng Weak Assertion của AI, kiểm thử thủ công xác nhận Backend tính toán sai công thức loại Percent (nhân tổng tiền thay vì chia 100), trả về số tiền tiết kiệm âm hàng trăm triệu đồng. Sau khi nâng cấp kịch bản lên Strong Assertion, Automation đã bắt được lỗi này và em đã chủ động đánh dấu `test.fail()` cho TC02.
- **[Major] Thiếu Validation chặn số âm:** Hệ thống không có cơ chế làm sạch dữ liệu đầu vào (Input Validation), không chặn lỗi khi người dùng nhập số tiền tổng đơn hàng là số âm.
