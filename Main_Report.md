# BÁO CÁO HW#04 - Automation Testing

**Thông tin sinh viên:**

- **Họ và tên:** Trần Thanh Trí
- **MSSV:** 23127503
- **Lớp:** 23KTPM2
- **Môn học:** Kiểm thử phần mềm
- **Hệ thống (SUT):** EShop

---

## Automation Test Summary Report

Báo cáo dưới đây tổng hợp kết quả thực thi kiểm thử tự động bằng Playwright, áp dụng phương pháp Data-Driven Testing (DDT) và chạy đa trình duyệt (Multi-browser).

### 1. Execution Metrics

- **Number of Features Automated:** 3 (Feature A, Feature B, Feature C)
- **Number of Test Cases Automated:** 36 (12 Test Cases / Feature)
- **Number of Browser Runs:** 3 (Chrome, Firefox, Edge). Tổng cộng có **108 Browser Runs** trên toàn bộ Test Suite (36 TCs x 3 Browsers).
- **HTML Report:** Báo cáo HTML (Playwright HTML Reporter) được xuất đầy đủ, hiển thị rõ metadata **"Run by: 23127503"** trên tiêu đề.

### 2. Results Breakdown (Cross-Browser Execution)

- **Total Executed:** 105 (Không tính 3 TCs bị skipped)
- **Passed:** 69 (Bao gồm Happy Path và các "Expected Failures" đánh dấu bằng `test.fail()`)
- **Failed:** 36 (Lỗi Blocker tại Feature A làm gián đoạn toàn bộ luồng)
- **Skipped:** 3 (TC11 của Feature C chủ động dùng `test.skip()`)
- **Total Bugs Logged:** 9 Bugs (Bao gồm ảnh chụp màn hình, chi tiết tại file `Bug_Report.md` và GitHub Issues).

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

Kịch bản Automation được thiết kế bao gồm 12 Test Cases (phủ cả Happy Path và Negative/Edge Cases), **được cấu trúc theo mô hình Data-driven và lưu trữ dữ liệu tách biệt hoàn toàn trong file `data_feature_a.json` riêng biệt**. Kịch bản cũng áp dụng thành công **3 Assertion Patterns** theo đúng yêu cầu:

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

Qua quá trình chạy Automation kết hợp với Kiểm thử thăm dò thủ công (Exploratory Testing), em đã log thành công 4 Bugs nghiêm trọng:

- **[Major] Lỗi logic giá trị biên (Boundary Bug):** Hệ thống sử dụng toán tử `>` thay vì `>=` cho ngưỡng tối thiểu, từ chối mã khi đơn hàng vừa chạm mức 300,000đ.
- **[Major] Lỗi bảo mật bỏ qua xác thực (Auth Bypass):** API `/apply-coupon` không yêu cầu JWT Token, cho phép Guest áp dụng mã giảm giá, gây trải nghiệm UX xấu khi bị chặn lại ở bước thanh toán cuối và có nguy cơ rò rỉ (brute-force) mã khuyến mãi.
- **[Critical] Tính toán sai công thức toán học:** Nhờ phát hiện lỗ hổng Weak Assertion của AI, kiểm thử thủ công xác nhận Backend tính toán sai công thức loại Percent (nhân tổng tiền thay vì chia 100), trả về số tiền tiết kiệm âm hàng trăm triệu đồng. Sau khi nâng cấp kịch bản lên Strong Assertion, Automation đã bắt được lỗi này và em đã chủ động đánh dấu `test.fail()` cho TC02.
- **[Major] Thiếu Validation chặn số âm:** Hệ thống không có cơ chế làm sạch dữ liệu đầu vào (Input Validation), không chặn lỗi khi người dùng nhập số tiền tổng đơn hàng là số âm.

---

### Feature C: FR-15 - Quản lý Sản phẩm (Product CRUD) (Pool C)

**1. What the AI got wrong or missed:**

- **Kiến trúc SPA & Navigation (Flow Gap):** AI giả định hệ thống dùng cơ chế định tuyến đa trang (Multi-page) với URL truy cập trực tiếp (VD: `/admin/products/add`). Tuy nhiên, qua phân tích `App.jsx`, Web Admin là một Single Page Application (SPA). Toàn bộ module được render dựa trên state `activeTab`. Việc cố truy cập bằng URL sẽ gây thất bại toàn diện.
- **Silent Success (Thiếu phản hồi UI):** AI thiết lập Assertion đi tìm các thông báo thành công (Toast/Alert màu xanh). Nhưng lập trình viên đã không code bất kỳ thông báo nào cho hàm Thêm sản phẩm. Khi thêm thành công, hệ thống chỉ âm thầm xoá trắng form và gọi API fetch lại danh sách bảng.
- **Native HTML5 Validation vs JS Alert:** Đối với các trường hợp lỗi (Negative), AI dự đoán API sẽ luôn trả lỗi về UI. Trên thực tế:
  - Lỗi trống tên (TC03) bị chặn ngay tại Frontend bởi thuộc tính `required` (gây ra tooltip HTML5 Native) mà không bao giờ gọi xuống API.
  - Các lỗi khác từ API lại được hệ thống bắn ra dưới dạng `window.alert()` nguyên thuỷ thay vì hiển thị trên DOM.

**2. How I fixed it (Human Intervention):**

- **BeforeEach Hook:** Bổ sung khối `test.beforeEach` vào kịch bản để tự động hoá luồng Đăng nhập (tạo token JWT) và giả lập thao tác click vào menu `<li>Sản phẩm</li>` để kích hoạt đúng State của React trước mỗi Test Case.
- **Native Browser Dialogs Intercept:** Viết thêm hàm `page.on("dialog")` để Playwright chặn, đọc nội dung và tự động đóng hộp thoại `window.alert()`.
- **Hybrid Error Handling:** Cập nhật lại Assertions:
  - Đối với thành công: Kiểm tra việc form bị xoá trắng (`toHaveValue("")`) và kiểm chứng sản phẩm mới được render trên `<table/>`.
  - Đối với lỗi bỏ trống (TC03): Sử dụng `evaluate()` để trích xuất và kiểm tra thuộc tính `validationMessage` của DOM Element (Native HTML5).

**3. Test Execution & System Defect Discovery:**

Kịch bản Automation hoàn thiện chạy 12 Test Cases **(được nạp dữ liệu độc lập từ file `data_feature_c.json` theo chuẩn Data-Driven)**, bao gồm cả xử lý chuỗi dài 255 ký tự (Boundary), XSS Injection và Validation logic. Kịch bản sử dụng thành công 3 Assertion Patterns đặc thù cho React SPA:

1. `toHaveValue()`: Kiểm tra trạng thái reset form sau khi submit thành công (Form State Assertion).
2. `toBeVisible()`: Kiểm tra phần tử sản phẩm mới có được chèn vào DOM Table hay không (Data Grid Assertion).
3. Sử dụng `page.on('dialog')` kết hợp `expect().toContain()`: Bắt và kiểm chứng văn bản trong cửa sổ pop-up (Dialog/Alert Assertion).

Qua quá trình chạy Automation kết hợp phân tích Log, em đã phát hiện Backend của chức năng Thêm sản phẩm (FR-15) **hoàn toàn vắng bóng Data Validation**. Điều này dẫn đến việc log thành công 3 Bug Report lớn:

- **[Critical] Lỗ hổng bảo mật XSS (Cross-Site Scripting):** Hệ thống không mã hóa (sanitize) dữ liệu đầu vào. Tên sản phẩm chứa mã độc `<script>` vẫn được lưu thành công, nguy cơ cao gây tấn công XSS khi hiển thị ra trang chủ.
- **[Major] Thiếu Validation giá trị số học (Price):** API cho phép thêm sản phẩm với giá tiền rỗng, giá bằng `0`, và giá trị âm (Negative number).
- **[Major] Thiếu Validation độ dài và ràng buộc (Length & Null constraints):** Tên sản phẩm vượt quá 255 ký tự hoặc không chọn danh mục (Null Category) vẫn được API ghi nhận bình thường.

Riêng đối với TC11 (chọn danh mục không tồn tại), em đã chủ động sử dụng hàm `test.skip()` vì giao diện thẻ `<select>` đã chặn tốt trường hợp này. Việc test Validation của Foreign Key cần được thực hiện thông qua API Testing.

---

## Task 2: Demo Video

**1. Nội dung Video Demo:**
Video (với thời lượng trên 5 phút) trình bày toàn bộ quá trình thực thi kịch bản kiểm thử tự động từ đầu đến cuối (End-to-End) cho chức năng **Feature C (FR-15: Quản lý Sản phẩm)**.

- **Xác thực tác giả:** Video bắt đầu bằng việc chạy lệnh `whoami` và `hostname` trên terminal để minh chứng quyền tác giả của sinh viên.
- **Thực thi Đa trình duyệt (Multi-browser):** Kịch bản được thiết lập chạy thực tế trên 3 trình duyệt (Chrome, Firefox, Edge) thông qua framework Playwright.
- **Báo cáo HTML (HTML Report):** Cuối video là phần mở và phân tích báo cáo HTML Report do Playwright sinh ra, thể hiện rõ các kịch bản thành công (Passed), các luồng bị bỏ qua đúng chủ đích (Skipped), và đặc biệt là cách Playwright bảo vệ luồng CI/CD thông qua cơ chế Expected Failures (`test.fail()`) khi bắt được Known Bugs.

**2. Giải thích lỗi của AI & Cách khắc phục (AI Fix Narration):**
Trong video, em đã trực tiếp thuyết minh và giải thích một sai lầm nghiêm trọng của AI khi sinh script ban đầu và cách em đã rà soát, can thiệp:

- **Sai lầm của AI (AI Missed):** AI bị "ảo giác" (hallucinate) rằng hệ thống sẽ render lỗi dưới dạng các thẻ HTML thông thường trên DOM (VD: class `.text-red-500`). AI hoàn toàn thiếu ngữ cảnh về việc ứng dụng React SPA này sử dụng `window.alert()` và tính năng HTML5 Validation (`required`).
- **Cách khắc phục (Human Fix):** Em đã viết đè lại kịch bản, sử dụng `page.on('dialog')` để chặn/đọc nội dung Alert, và dùng `await element.evaluate(el => el.validationMessage)` để truy xuất lỗi HTML5. Sự can thiệp này là yếu tố then chốt giúp kịch bản chạy thành công thay vì bị văng lỗi Timeout 30s.

**3. Video Link:**

- 🔗 **YouTube Unlisted Link:** https://youtu.be/3MAqXpzOKZs
