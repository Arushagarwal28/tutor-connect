import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute        from './components/auth/ProtectedRoute.jsx'
import GuestRoute            from './components/auth/GuestRoute.jsx'

import HomePage               from './pages/HomePage.jsx'
import LoginPage              from './pages/LoginPage.jsx'
import RegisterPage           from './pages/RegisterPage.jsx'
import StudentDashboardPage   from './pages/StudentDashboardPage.jsx'
import TutorDashboardPage     from './pages/TutorDashboardPage.jsx'
import TutorPublicProfilePage from './pages/TutorPublicProfilePage.jsx'
import NotFoundPage           from './pages/NotFoundPage.jsx'    // ← Step 13c

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public ───────────────────────────────────────── */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/tutor/:id" element={<TutorPublicProfilePage />} />

        {/* ── Guest-only (redirect logged-in users to dashboard) */}
        <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* ── Protected: Student only ──────────────────────── */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* ── Protected: Tutor only ────────────────────────── */}
        <Route
          path="/tutor/dashboard"
          element={
            <ProtectedRoute allowedRole="tutor">
              <TutorDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* ── 404 — proper page instead of silent redirect ─── */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </BrowserRouter>
  )
}