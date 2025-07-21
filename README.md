# TruyenBro - Ứng dụng đọc truyện chữ đa nền tảng 📚

![Phiên bản](https://img.shields.io/badge/version-1.0.0-blue)
![Giấy phép](https://img.shields.io/badge/license-MIT-green)
![Nền tảng](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-lightgrey)
![React Native](https://img.shields.io/badge/React%20Native-0.76.7-61DAFB.svg)

**TruyenBro** là ứng dụng đọc truyện chữ miễn phí, được xây dựng với mục tiêu mang đến trải nghiệm đọc thoải mái và tiện lợi nhất cho các độc giả. Dù bạn đang online hay offline, trên điện thoại hay máy tính, thư viện truyện của bạn sẽ luôn ở bên cạnh.

![TruyenBro Demo GIF](https://link-den-anh-gif-demo-ung-dung-cua-ban.gif)
*(Mẹo: Hãy quay một video ngắn màn hình ứng dụng và chuyển thành file GIF để đặt vào đây!)*

---

## ✨ Tính năng nổi bật

-   📖 **Đọc Online & Offline:** Tìm kiếm và đọc hàng ngàn truyện trực tuyến. Tải về các chương yêu thích để đọc mọi lúc mọi nơi mà không cần kết nối mạng.
-   🎨 **Tùy biến giao diện đọc:**
    -   **Chế độ Sáng/Tối (Light/Dark Mode):** Tự động chuyển đổi theo hệ thống hoặc tùy chỉnh thủ công để bảo vệ mắt.
    -   **Thay đổi Font chữ & Cỡ chữ:** Chọn lựa font chữ và điều chỉnh kích thước văn bản cho trải nghiệm đọc dễ chịu nhất.
    -   **Tùy chỉnh màu nền:** Thay đổi màu nền trang đọc (trắng, vàng, đen).
-   🔖 **Quản lý thư viện cá nhân:**
    -   Lưu truyện vào thư viện để tiện theo dõi.
    -   **Đánh dấu trang:** Tự động lưu lại vị trí đang đọc dở.
    -   **Lịch sử đọc:** Dễ dàng xem lại các truyện đã đọc gần đây.
-   🔍 **Tìm kiếm và Lọc:** Tìm kiếm truyện theo tên, tác giả. Lọc truyện theo thể loại, trạng thái (hoàn thành, đang ra).
-   💳 **Ủng hộ tác giả (Tùy chọn):** Tích hợp thanh toán qua PayPal để độc giả có thể gửi một khoản donate nhỏ, ủng hộ các tác giả/dịch giả mà họ yêu mến.
-   🚀 **Hiệu năng cao:** Giao diện mượt mà, tốc độ phản hồi nhanh nhờ sử dụng các thư viện tối ưu như Reanimated và Gesture Handler.

---

## 📸 Ảnh chụp màn hình ứng dụng

| Giao diện chính | Chi tiết truyện | Chế độ đọc (Sáng) | Chế độ đọc (Tối) |
| :----------------------------------------------------------: | :----------------------------------------------------------: | :------------------------------------------------------------: | :------------------------------------------------------------: |
| ![Trang chủ](blob:https://www.facebook.com/be94f312-d746-4b65-8d8c-54053c6f5e34) | ![Chi tiết truyện](https://link-den-anh-chup-man-hinh-chi-tiet.png) | ![Đọc truyện sáng](https://link-den-anh-chup-man-hinh-doc-sang.png) | ![Đọc truyện tối](https://link-den-anh-chup-man-hinh-doc-toi.png) |

---

## 🛠️ Công nghệ sử dụng

-   **Frontend:** React Native, Expo SDK
-   **Routing:** Expo Router
-   **Quản lý trạng thái:** Zustand
-   **Giao diện & Hiệu ứng:** React Native Reanimated, Gesture Handler
-   **Lưu trữ Offline:** AsyncStorage
-   **Backend:** Appwrite (Authentication, Database, Storage)
-   **Thanh toán:** PayPal SDK, Express.js (cho server-side handling)

---

## 🚀 Cài đặt & Khởi chạy

### **1. Yêu cầu tiên quyết**
-   Node.js (phiên bản 18.x trở lên)
-   Yarn hoặc npm
-   Expo CLI (`npm install -g expo-cli`)
-   Git

### **2. Các bước cài đặt**

1.  **Sao chép (clone) repository về máy:**
    ```bash
    git clone [https://github.com/TQCuong241/Mobile-Light-Novel-React-Native.git](https://github.com/TQCuong241/Mobile-Light-Novel-React-Native.git)
    cd TruyenBro
    ```

2.  **Cài đặt các gói phụ thuộc:**
    ```bash
    yarn install
    ```

3.  **Cấu hình biến môi trường:**

4.  **Khởi chạy ứng dụng:**
    ```bash
    # Chạy trên máy ảo Android
    yarn android

    # Chạy trên máy ảo iOS
    yarn ios

    # Chạy trên trình duyệt Web
    yarn web
    ```
---
*Được phát triển với ❤️ bởi Quang Cường*
