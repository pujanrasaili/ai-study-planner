# 🧠 StudyAI — AI-Powered Study Planner

A full-stack web application that helps students plan their studies intelligently using AI. Built with **React + Vite** (frontend) and **Python Flask** (backend), powered by **Groq (Llama 3)** for AI schedule generation.

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register/login
- 📚 **Subject Management** — Add subjects with exam dates, difficulty, and topic tracking
- 🤖 **AI Schedule Generator** — Groq Llama 3 creates a personalized 7-day study plan
- 📊 **Progress Tracking** — Charts showing study hours, streaks, and topic completion
- 🔥 **Study Streaks** — Stay motivated with daily streak tracking
- 🌙 **Dark UI** — Sleek dark theme with smooth animations

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, React Router v6, Recharts |
| Backend | Python Flask, SQLAlchemy, Flask-JWT-Extended |
| Database | SQLite (dev) / PostgreSQL (prod) |
| AI | Groq API (Llama 3) |
| Auth | JWT Tokens |

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/ai-study-planner.git
cd ai-study-planner
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Run the server
python app.py
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 🔑 Environment Variables

Create `backend/.env`:
```env
DATABASE_URL=sqlite:///studyplanner.db
JWT_SECRET_KEY=your-super-secret-key-here
GROQ_API_KEY=your-groq-api-key-here
```

Get your free Groq API key at: https://console.groq.com

---

## 📁 Project Structure

```
ai-study-planner/
├── backend/
│   ├── app.py              # Flask app entry point
│   ├── database.py         # SQLAlchemy setup
│   ├── requirements.txt
│   ├── .env.example
│   ├── models/
│   │   ├── user.py
│   │   ├── subject.py
│   │   └── session.py
│   └── routes/
│       ├── auth.py         # Register/Login
│       ├── subjects.py     # CRUD subjects
│       ├── schedule.py     # AI schedule generation
│       └── progress.py     # Stats & sessions
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Subjects.jsx
│   │   │   ├── Schedule.jsx
│   │   │   └── Progress.jsx
│   │   ├── components/
│   │   │   └── Layout.jsx
│   │   └── utils/
│   │       └── api.js
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 📸 Screenshots

> Dashboard with subject overview, stats, and quick actions  
> AI-generated weekly study schedule  
> Progress charts with streaks and topic completion

---

## 🧑‍💻 Author

**Pujan Rasaili**  
Software Engineering Student  
GitHub: [@pujanrasaili](https://github.com/pujanrasaili)

---

## 📄 License

MIT License — feel free to use and modify.
