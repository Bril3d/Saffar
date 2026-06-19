# 🌿 SAFAR Chain — Full Stack Repository

> Veterinary antibiotic traceability & farm-to-consumer marketplace.  
> Built for **Chain & Brain Hackathon Edition 2** (Tunisia, April 2026)

This repository contains both the Frontend (React Native / Expo) and the Backend / AI services.

## 📺 Demo Video

https://github.com/user-agent/repo/assets/Demo.mp4

<video src="assets/Demo.mp4" width="100%" controls></video>

---

## 🏗️ Architecture

```
/                 → React Native Frontend (Expo)
backend/          → Node.js Express API (JWT auth, RBAC, SQLite)
ai_service/       → Python FastAPI (Isolation Forest, XGBoost)
shared/           → API contract for team alignment
scripts/          → Startup & seeding scripts
```

## 🚀 Backend & AI Quick Start

### 1. Backend (Node.js)
```bash
cd backend
npm install
cp ../.env.example ../.env
npm run seed          # Seed demo data
npm run dev           # Start on port 3000
```

### 2. AI Service (Python)
```bash
cd ai_service
pip install -r requirements.txt
python scripts/generate_data.py
python scripts/train_anomaly.py
python scripts/train_forecast.py
python main.py        # Start on port 8001
```

### 3. Ollama LLM
```bash
ollama pull phi3:mini
ollama serve          # Runs on port 11434
```

### 4. Start Everything
```powershell
.\scripts\start-all.ps1
```

## 🔐 Demo Credentials
All users: password `Test1234`

| Role | Email |
|------|-------|
| Admin | admin@safar.tn |
| Pharmacy | pharmacy@safar.tn |
| Vet | vet@safar.tn |
| Farmer 1 | farmer1@safar.tn |
| Farmer 2 | farmer2@safar.tn |
| Slaughterhouse | abattoir@safar.tn |
| Consumer 1 | consumer1@safar.tn |
| Consumer 2 | consumer2@safar.tn |

## 📚 API Documentation
See [shared/api-contract.md](shared/api-contract.md) for full API specification.

---

## 📱 Frontend Quick Start (Expo)

Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

### Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).
