# HW04: Automation Testing

**Thông tin sinh viên:**

- **Họ và tên:** Trần Thanh Trí
- **MSSV:** 23127503
- **Lớp:** 23KTPM2
- **Môn học:** Kiểm thử phần mềm
- **Hệ thống (SUT):** EShop

---

## 1. Self-Assessment

| **No.** | **Criteria**        | **Grade** | **Self-Assessed Grade** |
| ------- | ------------------- | --------- | ----------------------- |
| **1**   | Task 1 - Feature A  | 25        | **25**                  |
| **2**   | Task 1 - Feature B  | 25        | **25**                  |
| **3**   | Task 1 - Feature C  | 25        | **25**                  |
| **4**   | Task 2 — Demo video | 15        | **15**                  |
| **5**   | Agent Skills        | 10        | **10**                  |
|         | **Total**           | **100**   | **100**                 |

---

## 2. Test Summary Report

Báo cáo dưới đây tổng hợp kết quả thực thi kiểm thử tự động bằng Playwright, áp dụng phương pháp Data-Driven Testing (DDT) và tích hợp kỹ thuật quản lý Known Bugs (Expected Failures) để tối ưu hóa luồng CI/CD.

### 2.1. Execution Metrics

- **Number of Features Automated:** 3 (Feature A: FR-01 - Đăng ký tài khoản (Pool A), Feature B: FR-09 - Mã Giảm Giá (Coupon) (Pool B), Feature C: FR-15 - Quản lý Sản phẩm (Product CRUD) (Pool C))
- **Number of Test Cases Automated:** 36 (12 Test Cases / Feature)
- **Number of Browser Runs:** 3 (Chrome, Firefox, Edge)

### 2.2. Results Breakdown (Cross-Browser Execution)

_Lưu ý: Các số liệu dưới đây được tính tổng trên cả 3 lần chạy đa trình duyệt (36 TCs x 3 Browsers = 108 Executions)._

- **Total Executed:** 105
  _(Không tính 3 TCs bị skipped)_
- **Passed:** 69
  _(Feature B & C: Bao gồm các kịch bản Happy Path và các "Expected Failures" - chủ động dùng `test.fail()` để cô lập Known Bugs, giúp giữ xanh luồng CI/CD)._
- **Failed:** 36
  _(Feature A: Toàn bộ kịch bản Failed phản ánh chân thực một lỗi Blocker nghiêm trọng làm gián đoạn hoàn toàn luồng Đăng ký tài khoản)._
- **Skipped:** 3
  _(Feature C: Chủ động dùng `test.skip()` cho TC11 trên 3 trình duyệt do UI chặn chọn dữ liệu ngoại lệ, cần chuyển hướng test ở tầng API)._

### 2.3. Defect Discovery

- **Total Number of Bugs Logged:** 9
- **Severity Breakdown:**
  - **[1] Blocker:** Lỗi nghiêm trọng chặn đứng toàn bộ luồng Đăng ký tài khoản (Feature A).
  - **[2] Critical:** Lỗi sai công thức tính toán tài chính (Feature B) và Lỗ hổng bảo mật XSS Injection (Feature C).
  - **[6] Major:** Các lỗi liên quan đến thiếu hụt Data Validation, sai lệch điều kiện biên (Boundary) và thiếu sót UI so với đặc tả (FR-01, FR-09, FR-15).
- **Summary:**
  Tất cả 9 bugs đều được phân tích chuyên sâu về nguyên nhân (root cause), đánh giá tác động, cấp nhãn mức độ nghiêm trọng và đính kèm Issue Link cùng hình ảnh minh chứng thực tế.
  Đặc biệt, ngoại trừ 1 lỗi Blocker được giữ nguyên để báo động đỏ, 8 lỗi còn lại đều được xử lý tinh tế trong kịch bản Automation bằng kỹ thuật đánh dấu `test.fail()` (Expected Failures). Điều này giúp cô lập các "Known Bugs", bảo vệ luồng CI/CD luôn "Xanh" và tránh hiệu ứng Alert Fatigue cho team phát triển. Chi tiết báo cáo xem tại file `Bug_Report.md`.

---

## 3. Demo Videos

### 3.1. Automation Script Demo (Task 2)

Video dưới đây demo luồng chạy kịch bản end-to-end cho chức năng **FR-15: Quản lý Sản phẩm (Feature C)**, bao gồm cấu hình chạy đa trình duyệt và cách xử lý sự cố (Fix logic cho AI) bằng cách bắt sự kiện Dialog và HTML5 Native Validation.

🔗 **YouTube Unlisted Link:** https://youtu.be/3MAqXpzOKZs

### 3.2. Agent Skill Demo

Video dưới đây mô phỏng kịch bản thực tế khi áp dụng **Agent Skill v1.3.0** (Hệ điều hành QA) để tự động hóa chức năng. Video thể hiện rõ cơ chế Zero-Hallucination và Human-in-the-Loop khi AI chủ động dừng lại yêu cầu cung cấp đặc tả giao diện (HTML/UI Locators) thay vì tự suy diễn (hallucinate) thông tin.

🔗 **YouTube Unlisted Link:** https://youtu.be/vBVPro4IOXo
