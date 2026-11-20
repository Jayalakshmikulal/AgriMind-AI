` # 🌱 AgriMind AI

### AI-Powered Crop Intelligence and Precision Spraying Recommendation System

AgriMind AI is an AI-powered agricultural intelligence platform designed to help farmers make better crop-management decisions using artificial intelligence, image analysis, and sensor-based insights.

## 🚀 Key Features

- **AI Disease Detection:** Upload a crop image to identify potential plant diseases.
- **Crop Intelligence:** View crop-related insights using sensor data.
- **AI Advisory:** Receive recommendations based on crop observations.
- **Precision Spraying:** Explore targeted spraying recommendations.
- **Sensor Records:** View agricultural sensor information.
- **Multilingual Support:** Interface available in English, Kannada, Hindi, Malayalam, Tamil, and Telugu.

## 🛠️ Technologies Used

- Python
- FastAPI
- React
- TypeScript
- Vite
- PyTorch
- Hugging Face Transformers
- HTML and CSS

## 📁 Project Structure

```text
AgriMind-AI/
├── ai_models/
├── backend/
├── frontend-react/
├── utils/
├── test_images/
├── venv/
└── README.md
```

## ⚙️ How to Run

### 1. Clone the repository

```bash
git clone https://github.com/Jayalakshmikulal/AgriMind-AI.git
cd AgriMind-AI
```

### 2. Start the backend

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Backend API: http://127.0.0.1:8000

API documentation: http://127.0.0.1:8000/docs

### 3. Start the frontend

Open another terminal:

```bash
cd frontend-react
npm install
npm run dev
```

Frontend: http://localhost:5173

## 🎯 Project Goal

Our goal is to build an intelligent agricultural support system that combines AI-based crop analysis and sensor-driven insights to support smarter farming and precision agriculture.

## 👩‍💻 Team

Developed as a hackathon project.

## 📌 Note

AI disease predictions are advisory results and should be verified before taking agricultural treatment decisions.

---

**AgriMind AI | Smarter Farming Through Artificial Intelligence 🌱**
`