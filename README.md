# Facebook Chat Focus Helper - Chrome Extension

**Facebook Chat Focus Helper** là tiện ích mở rộng Chrome giúp bạn **ẩn các đoạn chat không liên quan** và **tập trung vào đoạn chat theo từ khóa** trong giao diện Facebook Messenger Web.

---

## 🧩 Tính năng chính

- ✅ Ẩn tất cả các đoạn chat không chứa từ khóa bạn nhập
- ✅ Chỉ hiển thị đoạn chat bạn muốn tập trung
- ✅ Tự động lọc lại khi có tin nhắn mới xuất hiện
- ✅ Giao diện popup dễ sử dụng
- ✅ Nhớ trạng thái giữa các lần mở popup
- ✅ Hoạt động sau cả khi reload lại trang

---

## 🚀 Cách sử dụng

### 1. **Tải extension vào Chrome**

1. Clone hoặc tải mã nguồn về máy
2. Mở `chrome://extensions` trên Chrome
3. Bật chế độ **Developer mode (Chế độ dành cho nhà phát triển)**
4. Chọn **"Load unpacked" (Tải tiện ích chưa đóng gói)**
5. Chọn thư mục gốc của extension

---

### 2. **Sử dụng popup**

1. Truy cập [https://www.messenger.com](https://www.messenger.com)
2. Click icon extension trên thanh công cụ
3. Nhập từ khóa tiêu đề chat bạn muốn focus (ví dụ: `50-Nodejs-Quận 1-Chiều T7+CN`)
4. Nhấn **Start**
5. Các đoạn chat khác sẽ bị ẩn, chỉ giữ lại đoạn phù hợp
6. Nhấn **Stop** để hiển thị lại tất cả

---

## ⚙️ Tuỳ chọn và trạng thái

- Extension sẽ ghi nhớ từ khóa bạn đã nhập
- Khi bạn reload trang Messenger, tiện ích sẽ tự động kích hoạt lại filter nếu đang chạy
- Bạn có thể mở popup lại để kiểm tra hoặc thay đổi từ khóa bất cứ lúc nào

---

## 🛠 Developer Notes

- Source chính nằm trong `src/` và `common/html/`
- Các phần chính:
  - `popup.js` – xử lý giao diện popup và điều khiển
  - `content.js` – xử lý logic lọc chat trong trang Messenger
- Sử dụng `chrome.storage.local` để đồng bộ trạng thái
- Giao tiếp giữa popup và content script qua `chrome.tabs.sendMessage` và `onMessage`

---

## 💡 Tips

- Extension chỉ hoạt động trên **https://www.messenger.com**
- Bạn có thể ghim extension lên thanh công cụ Chrome để sử dụng nhanh
- Đảm bảo popup được mở khi muốn nhận phản hồi trực tiếp từ content script

## 🙌 Liên hệ

Nếu bạn cần hỗ trợ hoặc muốn đóng góp, hãy liên hệ qua
email: vulebaolong@gmail.com
