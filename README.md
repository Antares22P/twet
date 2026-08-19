# 🛰️ ORBIT — Live Group Tracking

A clean, modern live location tracking web application. Connect with friends in a room, see live distances, proximity connection beams, set destination pins, and follow shortest walkable foot paths with real-time ETAs.

---

## ⚡ Tech Stack

- **Frontend**: React + Vite (JavaScript)
- **Backend**: Java (Spring Boot)
- **Database**: Firebase Realtime Database
- **Routing**: OSRM (Open Source Routing Machine)

---

## 🚀 How to Run

### 1. Frontend (React + Vite)
```bash
cd client
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

### 2. Backend (Java Spring Boot)
```bash
cd server
mvn spring-boot:run
```
Backend runs at **`http://localhost:8080`**.

---

## 📁 Project Structure

```
ORBITT/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Map, Topbar, Sidebar, Controls, Onboarding
│   │   ├── context/            # OrbitContext (State) & SoundContext (Audio)
│   │   ├── services/           # Firebase RTDB & OSRM routing
│   │   ├── utils/              # Distance math (Haversine), confetti & storage
│   │   ├── styles/             # Glassmorphism dark cyberpunk UI
│   │   ├── App.jsx             # Main layout
│   │   └── main.jsx            # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── server/                     # Java Spring Boot Backend
    ├── src/main/java/com/orbit/
    │   ├── OrbitApplication.java
    │   ├── config/             # CORS & Firebase config
    │   ├── controller/         # REST API (Groups & Routing proxy)
    │   ├── model/              # Models
    │   └── service/            # OSRM & Firebase services
    ├── src/main/resources/
    │   └── application.yml
    └── pom.xml
```

---

## ✨ Features Included

- **Create & Join Groups**: 6-character room codes and shareable invite links.
- **Continuous Live Tracking**: High accuracy GPS, heading arrow vector, and speed in km/h.
- **Proximity Auto-Linking**: Green pulsing beam when members are within 50 meters.
- **Distance Mesh**: Cyan lines showing live distance between all group members.
- **Destination Pins & OSRM Routing**: Shortest walkable foot path calculations with live ETAs.
- **Arrival Celebration**: Confetti explosion and audio chime when reaching within 30m of destination.
- **Map Modes**: Dark CARTO and Satellite imagery toggle.
- **Mobile Optimized**: Responsive layout with swipe-down bottom-sheet.
