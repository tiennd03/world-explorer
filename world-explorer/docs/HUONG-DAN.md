# World Explorer — Hướng dẫn chạy, đưa lên GitHub và deploy

## 1. Chạy trên máy

Không cần Firebase hay API key. Dữ liệu quốc gia nằm sẵn trong `public/data/countries.json`; chỉ thời tiết là gọi API (Open-Meteo, miễn phí). Mở terminal trong thư mục `world-explorer`:

```powershell
npm install --before=2026-10-21
npm start
```

Mở http://localhost:4200.

Chạy unit test: `npm test` (Chrome mở trang Karma, kết quả `Executed 22 of 22 SUCCESS`).

## 2. Đưa lên GitHub

Tạo repo trống tên `world-explorer` trên GitHub (Public, không tick README), rồi:

```powershell
git init
git add .
git commit -m "feat: initial world explorer"
git branch -M main
git remote add origin https://github.com/tiennd03/world-explorer.git
git push -u origin main
```

Máy đã nhớ đăng nhập GitHub từ lần làm Shop Admin nên lần này không bị hỏi lại.

## 3. Deploy lên Firebase Hosting

App này chỉ cần Hosting, không dùng database. Tạo một project Firebase riêng cho gọn:

1. Firebase console → **Create a project** → tên `world-explorer` → tắt Analytics → Create.
2. Trong terminal:

```powershell
npx firebase-tools use --add      # chọn project world-explorer-xxxx, alias: default
npm run build
npx firebase-tools deploy --only hosting
git add .firebaserc
git commit -m "chore: add firebase project alias"
git push
```

Link demo sẽ có dạng `https://world-explorer-xxxx.web.app`. Điền link vào đầu README.

## 4. Cách dùng app

- **Trang chủ**: gõ tên nước hoặc thủ đô vào ô tìm kiếm (gõ không dấu vẫn được). Bấm các nút vùng (Asia, Europe…) để lọc, chọn **Sort by** để sắp xếp theo dân số hoặc diện tích. Kéo xuống để tải thêm.
- **URL đổi theo bộ lọc**: copy link gửi người khác, họ thấy đúng kết quả bạn đang xem.
- **Trang chi tiết**: bấm một thẻ quốc gia để xem thông tin, thời tiết thủ đô 5 ngày, và các nước láng giềng (bấm để chuyển sang nước đó).
- **Yêu thích**: bấm trái tim để lưu, xem lại ở mục **Favourites**.
- **Chế độ tối**: nút 🌙 / ☀️ góc trên bên phải.

## 5. Thử các tình huống lỗi (để hiểu interceptor)

1. Mở DevTools (F12) → tab **Network** → đổi **No throttling** thành **Offline**.
2. Tải lại trang: thanh tải màu tím chạy lâu hơn (đang thử lại 2 lần), rồi hiện thông báo đỏ "Network error" và nút **Try again**.
3. Đổi lại **No throttling**, bấm **Try again** → dữ liệu hiện ra.
4. Thử **Slow 4G** để xem skeleton loading.

## 6. Kiến thức mới so với Shop Admin

| Chủ đề | File để đọc |
| --- | --- |
| HttpClient, gọi REST API, nối 2 request bằng switchMap | `core/weather.service.ts` (geocoding → forecast) |
| Tải file dữ liệu tĩnh qua HttpClient + cache | `core/country.service.ts`, `public/data/countries.json` |
| Interceptor: loading, retry, toast lỗi | `core/interceptors.ts` |
| HttpContextToken: tắt interceptor cho từng request | `core/http-context.ts` |
| Mẫu Loadable (loading / success / error) | `core/loadable.ts` |
| Cache bằng shareReplay | `core/country.service.ts` |
| debounceTime + đồng bộ URL query params | `features/countries/country-list.component.ts` |
| switchMap hủy request cũ | `features/country-detail/country-detail.component.ts` |
| linkedSignal | `visibleCount` trong country-list |
| Directive tự viết + IntersectionObserver | `shared/in-viewport.directive.ts` |
| input() / output() giữa component cha–con | `shared/country-card.component.ts` |
| Tailwind CSS, dark mode bằng class | `src/styles.css`, `core/theme.service.ts` |
| OnPush change detection | mọi component |
| Test HTTP bằng HttpTestingController, test retry bằng fakeAsync | `core/*.spec.ts` |
