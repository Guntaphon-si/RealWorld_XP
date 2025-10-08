# การติดตั้งและเริ่มใช้งาน (Getting Started)

### 1. Backend (FastAPI)

```bash
# Clone a repository
git clone https://github.com/Guntaphon-si/RealWorld_XP.git

# ไปที่โฟลเดอร์ Backend 
cd RealWorld_XP/Backend
นำไฟล์ .env และ stressLevel_rf.pkl มาใส่ใน Backend 

# สร้างและเปิดใช้งาน virtual environment
python -m venv venv
source venv/bin/activate  # สำหรับ macOS/Linux
venv\Scripts\activate    # สำหรับ Windows

# ติดตั้ง dependencies
pip install -r requirements.txt

# รันเซิร์ฟเวอร์
uvicorn main:app --reload
```
เซิร์ฟเวอร์ Backend จะทำงานที่ `http://127.0.0.1:8000`

### 2. Frontend (Angular)

```bash

# ติดตั้ง dependencies
npm install

# รันเซิร์ฟเวอร์
ng serve
```
แอปพลิเคชัน Frontend จะทำงานที่ `http://localhost:4200/`

---


