# 📊 Weekly Report System

A full-stack application designed to streamline the process of managing and submitting weekly reports. 

---

## 🛠️ Tech Stack

### 🌐 Frontend
- ⚛️ **React** - UI Library
- 📘 **TypeScript** - Typed JavaScript
- ⚡ **Vite** - Next Generation Frontend Tooling

### ⚙️ Backend
- 🟢 **Node.js** - JavaScript Runtime
- 🚂 **Express** - Web Framework for Node.js
- 📘 **TypeScript** - Typed JavaScript
- 🍃 **MongoDB (Mongoose)** - NoSQL Database

---

## 📂 Folder Structure

### 💻 Frontend
```text
frontend/
├── 📁 public/             # Public assets
├── 📁 src/
│   ├── 🖼️ assets/         # Static assets like images
│   ├── 🎨 App.css         # App specific styles
│   ├── ⚛️ App.tsx         # Main application component
│   ├── 🎨 index.css       # Global styles
│   └── 🚀 main.tsx        # Application entry point
├── 🔐 .env                # Environment variables
├── 🛠️ eslint.config.js    # ESLint configuration
├── 📦 package.json        # Frontend dependencies and scripts
├── ⚙️ tsconfig.json       # TypeScript configuration
└── ⚡ vite.config.ts      # Vite configuration
```

### 🗄️ Backend
```text
backend/
├── 📁 src/
│   ├── ⚙️ config/         # Configuration files (e.g., database connection)
│   └── 🚀 server.ts       # Backend entry point
├── 🔐 .env                # Environment variables
├── 📦 package.json        # Backend dependencies and scripts
└── ⚙️ tsconfig.json       # TypeScript configuration
```

---

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:
- 🟢 **Node.js**: v18.0.0 or newer
- 📦 **npm**: Node Package Manager (comes with Node.js)
- 🍃 **MongoDB**: A running local MongoDB instance or a remote MongoDB URI (e.g., MongoDB Atlas).

---

## 📥 How to Install

1. **Clone the repository** to your local machine (if you haven't already):
   ```bash
   git clone https://github.com/Sukitha543/Report-System.git
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

---

## 💻 How to Run the Frontend

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. 🌟 The frontend should now be running and accessible (usually on `http://localhost:5173`).

---

## ⚙️ How to Run the Backend

1. Open a new terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Ensure you have your `.env` file configured in the backend folder with the necessary variables (e.g., database credentials).
3. Start the backend development server:
   ```bash
   npm run dev
   ```
4. 🔥 The backend should now be running and connected to the database.
