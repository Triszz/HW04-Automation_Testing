# Bug Report

**Thông tin sinh viên:**

- **Họ và tên:** Trần Thanh Trí
- **MSSV:** 23127503
- **Lớp:** 23KTPM2
- **Môn học:** Kiểm thử phần mềm
- **Hệ thống (SUT):** EShop

---

## Feature A: FR-01: Account Registration (Pool A)

### Bug 1: [Blocker] FR-01: Regex Validation tại Frontend sai logic, từ chối mọi mật khẩu hợp lệ

- **Mức độ (Severity):** Blocker (Nghiêm trọng - Cản trở hoàn toàn luồng người dùng)

- **Mô tả chi tiết:** Theo đặc tả yêu cầu FR-01 và hướng dẫn hiển thị trực tiếp trên giao diện, mật khẩu hợp lệ phải bao gồm: Tối thiểu 8 ký tự, có ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt (VD: `@, $, !, %, *, ?, &`). Tuy nhiên, khi thực hiện kiểm thử trên form Đăng ký và nhập một mật khẩu đáp ứng đầy đủ tất cả các tiêu chí trên (Ví dụ: `Password123!`), hệ thống lại từ chối việc submit form. Màn hình lập tức hiển thị cảnh báo lỗi màu đỏ: _"Mật khẩu quá yếu! Phải dài tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và KÝ TỰ ĐẶC BIỆT."_ Qua quá trình điều tra và phân tích hành vi UI (thử nghiệm nhập nhiều biến thể mật khẩu khác nhau, cũng như thay đổi dữ liệu ở các ô nhập liệu khác), hệ thống đều phản hồi bằng duy nhất một thông báo lỗi mật khẩu này. Bất kể dữ liệu đầu vào có hợp lệ hay không, hệ thống vẫn chặn cứng thao tác và không cho phép thực hiện Submit form. Điều này chứng tỏ logic validation trên Frontend đang bị hỏng hoàn toàn (broken validation).

- **Tác động:**
  - Người dùng thực tế hoàn toàn không thể đăng ký được tài khoản mới trên hệ thống dưới bất kỳ hình thức nào.
  - Lỗi validation này chặn đứng quá trình đăng ký ngay từ bước đầu tiên, che khuất (block) việc phát hiện các lỗi validation khác (như nhập trùng email, sai định dạng email, v.v.) và cản trở hoàn toàn việc kiểm thử chức năng tích hợp API.

- **Trạng thái Automation:** Tất cả các Test Cases tự động (bao gồm luồng Happy Path - TC01) đều trả về kết quả `Failed` do bị kẹt tại giao diện báo lỗi này. Để đảm bảo tính minh bạch và trung thực của báo cáo kiểm thử, kịch bản Automation vẫn được giữ nguyên hiện trạng để ghi nhận chính xác sự thất bại của hệ thống SUT mà không sử dụng mẹo lách lỗi (workaround).

- **Issue Link:** https://github.com/Triszz/HW04-Automation_Testing/issues/1

- **Ảnh chụp (Screenshot):**
  ![alt text](images/image.png)

### Bug 2: FR-01: Màn hình đăng ký thiếu trường nhập "Xác nhận mật khẩu" theo đặc tả yêu cầu

- **Mức độ (Severity):** Major (Cao - Sai lệch so với Đặc tả hệ thống)

- **Mô tả chi tiết:** Dựa trên tài liệu System Requirement của FR-01 (Account Registration): _"Phải có trường Xác nhận mật khẩu — hệ thống từ chối nếu hai trường không khớp."_ Tuy nhiên, trên giao diện thực tế của màn hình Đăng ký (`/register`), form nhập liệu chỉ có 3 trường: "Họ Tên", "Email" và "Mật khẩu". Hoàn toàn không có thẻ `<input>` nào dành cho việc xác nhận mật khẩu.

- **Tác động:**
  - Người dùng không thể xác nhận lại mật khẩu họ vừa nhập (rất dễ dẫn đến việc gõ nhầm mật khẩu mà không biết).
  - Không thể thực hiện kịch bản kiểm tra logic "Mật khẩu không khớp" như yêu cầu của khách hàng/giảng viên.

- **Trạng thái Automation:** Kịch bản Automation đã phải comment (vô hiệu hóa) dòng lệnh `await page.locator('label:has-text("Xác nhận mật khẩu") + input').fill(data.confirmPassword);` vì phần tử này không tồn tại trong DOM (gây lỗi Timeout khi chạy tự động). Test case Negative TC10 (Mật khẩu không khớp) hiện đang bị Block không thể thực thi.

- **Issue Link:** https://github.com/Triszz/HW04-Automation_Testing/issues/2

- **Ảnh chụp (Screenshot):**
  ![alt text](images/image-1.png)
