# 🎓 Tutor Connect

Tutor Connect is a web platform designed to simplify how students find and connect with the right tutors based on their needs. Instead of relying on scattered sources or word-of-mouth, this system brings everything into one place — searchable, filterable, and easy to use.

---

## 💡 Why this project?

Finding a good tutor is often harder than it should be. Students usually struggle with:

* Limited visibility of available tutors
* No proper filtering based on subject or preferences
* Lack of structured information

Tutor Connect aims to solve this by providing a centralized platform where students can explore and connect with tutors more efficiently.

---

## 🚀 Features

* 🔍 Search tutors based on subjects
* ⭐ Filter tutors using ratings and preferences
* 📍 Location-based discovery (planned/improving)
* 🧾 Structured tutor profiles
* ⚡ Clean and responsive UI

---

## 🛠️ Tech Stack

**Frontend**

* React.js
* Tailwind / CSS

**Backend**

* Node.js
* Express.js

**Database**

* MongoDB

---

## 📁 Project Structure

```id="q9y6gq"
tutor-connect/
│
├── frontend/        # React frontend
├── backend/         # Express API and business logic
├── README.md
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```id="0z7y54"
git clone https://github.com/Arushagarwal28/tutor-connect.git
cd tutor-connect
```

---

### 2. Install dependencies

**Frontend**

```id="m4r9ok"
cd frontend
npm install
npm start
```

**Backend**

```id="b7qk2y"
cd backend
npm install
npm run dev
```

---

### 3. Environment Setup

Create a `.env` file inside the backend folder:

```id="1u9vcd"
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

---

## 🔌 API Overview

Basic endpoints available:

```id="i8q0zp"
POST   /api/auth/register
POST   /api/auth/login

GET    /api/tutors
POST   /api/tutors

GET    /api/reviews
POST   /api/reviews
```

---

## 📊 Current Status

The core functionality is implemented and working:

* Backend APIs are functional
* Tutor listing and filtering works
* Frontend is connected with backend

The project is still under active development with improvements planned.

---

## 🔮 Future Scope

Planned improvements to make the platform more practical and scalable:

* 📊 **Progress Tracking & Analytics**
  Allow students to monitor learning progress, sessions, and performance.

* 🔐 **OTP Authentication**
  Add secure login/signup using OTP verification.

* 🛠️ **Admin Panel**
  Dashboard for managing users, tutors, and platform activity.

* 💬 Real-time chat between tutors and students

* 📅 Session booking system

* 💳 Payment integration

---

## 🤝 Contributing

This project is part of an ongoing learning process. Contributions, suggestions, and improvements are welcome.

---

## 📌 Note

This is an evolving project built to explore full-stack development and real-world application structure. Some features are still in progress and will be refined over time.

---

## 📬 Contact

If you want to collaborate or discuss ideas, feel free to reach out.
