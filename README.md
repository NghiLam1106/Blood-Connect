# 🩸 Blood-Connect

**Blood-Connect** là một nền tảng hỗ trợ kết nối những người hiến máu với các trung tâm y tế, bệnh viện cần máu. Dự án tích hợp các công nghệ web hiện đại từ giao diện người dùng, hệ thống API mạnh mẽ đến mô hình ML (AI) hỗ trợ gợi ý và tối ưu hóa việc thông báo cho người hiến máu phù hợp nhất dựa trên mức độ khẩn cấp, khoảng cách địa lý, và lịch sử hiến máu.

---

## 🛠 Công nghệ sử dụng (Tech Stack)

### 1. Frontend (Giao diện người dùng)
- **Framework/Thư viện:** React 19, Vite
- **Ngôn ngữ:** TypeScript
- **Styling:** Material UI (MUI), Tailwind CSS, Emotion
- **Quản lý state:** Zustand (cho global state nội bộ), React Router DOM (định tuyến)
- **Chuyên sâu UI:** Framer Motion (hiệu ứng), React Dropzone (kéo thả file)

### 2. Backend (Máy chủ API)
- **Framework:** NestJS
- **Ngôn ngữ:** TypeScript
- **Cơ sở dữ liệu:** Prisma ORM, với PostgreSQL hoặc MariaDB
- **Xác thực (Auth):** JWT (JSON Web Token), Passport (Local, JWT)
- **Cache & Message Queue:** Redis, Cache-Manager, BullMQ (xử lý hàng đợi mạnh mẽ)
- **Documentation:** SwaggerUI (@nestjs/swagger)

### 3. AI / Machine Learning (Mô hình Trí tuệ nhân tạo)
- **Framework Server:** FastAPI, Uvicorn (để host API)
- **Thư viện AI/Data:** Pandas, Scikit-learn, Joblib
- **Cách hoạt động:** Nhận request danh sách người hiến máu tiềm năng (qua file `donor_model.pkl` đã train), đánh giá mức độ phù hợp và điểm số khớp (matching score) nhằm chọn ra danh sách người hiến mẫu lý tưởng nhất dựa trên mức độ khẩn cấp (urgency) theo tham số thuật toán nội bộ.

---

## 📂 Cấu trúc thư mục

```text
Blood-Connect/
├── AI/                     # Phân hệ Trí tuệ nhân tạo (Mô hình dự đoán)
│   ├── main.py             # Server FastAPI cung cấp API dự đoán
│   ├── train.py            # Code dùng để huấn luyện mô hình
│   ├── donor_model.pkl     # Cấu trúc mô hình ML đã huấn luyện
│   ├── scaler.pkl          # File normalize/scale data
│   └── donor_dataset.csv   # Dataset mẫu dùng để train
│
├── backend/                # Server API (NestJS)
│   ├── src/                # Chứa source code modules (auth, users, donors, hospital...)
│   ├── prisma/             # Schema database, migrations, file seed
│   ├── test/               # Các file cấu hình testing e2e
│   ├── .env.example        # Mẫu thiết lập biến môi trường
│   └── package.json
│
├── frontend/               # Giao diện ứng dụng web (Vite + React)
│   ├── src/                # Code giao diện (Components, Pages, Hooks...)
│   ├── public/             # Tài nguyên ảnh, icon
│   ├── index.html          # File index gốc của Vite
│   ├── tailwind.config.js  # Cấu hình Tailwind CSS
│   └── package.json
│
└── README.md               # Tài liệu dự án
```

---

## 🚀 Hướng dẫn cài đặt và khởi chạy (Local Development)

Yêu cầu máy tính đã cài đặt: **Node.js** (>= 20.x), **Python** (>= 3.9), và nền tảng **Redis** / **Database** đang hoạt động liên tục (local hoặc docker).

### Bước 1: Khởi động Backend (NestJS)

1. Mở terminal, di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Cài đặt các gói thư viện:
   ```bash
   npm install
   ```
3. Cấu hình biến môi trường:
   - Copy file `.env.example` và đổi tên thành `.env`
   - Chỉnh sửa chuỗi kết nối Database (`DATABASE_URL`), cấu hình Redis, JWT Secret cho phù hợp môi trường của bạn.
4. Chạy Prisma migration & seed:
   ```bash
   npx prisma generate
   npx prisma db push
   # Hoặc npm run prisma:seed (nếu đã thiết lập seed database)
   ```
5. Chạy API Server:
   ```bash
   npm run start:dev
   ```
   *Quá trình này hỗ trợ Hot-Reload.*

### Bước 2: Khởi động Frontend (React + Vite)

1. Mở một terminal mới, di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
2. Cài đặt các gói thư viện:
   ```bash
   npm install
   ```
3. Chạy dev server:
   ```bash
   npm run dev
   ```
4. Truy cập giao diện thông qua link được sinh ra ở terminal (thường là `http://localhost:5173`).

### Bước 3: Khởi động AI API (FastAPI)

1. Mở một terminal mới, di chuyển vào thư mục `AI`:
   ```bash
   cd AI
   ```
2. Cài đặt thư viện Python (khuyến khích dùng môi trường ảo - `venv`):
   ```bash
   # Tạo và kích hoạt venv
   python -m venv .venv
   .venv\Scripts\activate      # Dành cho Windows
   # source .venv/bin/activate # Dành cho Mac/Linux

   # Cài đặt package
   pip install fastapi uvicorn pandas joblib scikit-learn
   ```
3. Chạy Server FastAPI:
   ```bash
   python main.py
   ```
   *Server AI sẽ chạy tại cổng mặc định `http://127.0.0.1:8000`*

---

## 📚 Tính năng & Luồng hoạt động chính của hệ thống

- **Hệ thống Quản trị (Admin) & Giao diện:** Sử dụng Redux/Zustand quản trị state tĩnh và động mượt mà, theme đa dạng và hệ thống routing bảo mật cao.
- **Xác thực bảo mật:** Sử dụng JWT/Passport JS để bảo vệ API Backend, chia Role tài khoản cụ thể (Admin, Hospital, Donor).
- **Hệ Thống Gợi Ý Người Hiến Máu (ML/AI):** Backend sẽ gửi một batch data lên module AI (`/predict`), mô hình machine learning sẽ tiến hành đánh giá khoảng cách di chuyển, recency (lần gần nhất hiến máu), độ khẩn cấp (urgency) của yêu cầu để xếp hạng và lọc ra "Matching Score", từ đó BullMQ và Redis sẽ đưa vào hàng đợi thông báo nhằm báo gọi khẩn cho người phù hợp nhất.
- **Hiệu Năng & Đồng Bộ:** Ứng dụng Redis Cache cùng hệ thống background Queue giúp hạn chế bottleneck khi gửi lượng lớn thông báo và lưu lượng yêu cầu đồng thời cao.
