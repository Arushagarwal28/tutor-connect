# TutorConnect — React + Vite Frontend

A clean React conversion of the TutorConnect static HTML/CSS/JS website.
No backend. No auth logic. UI-only, fully component-based, ready for API integration.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open in browser
# → http://localhost:5173
```

---

## 📁 Project Structure

```
tutorconnect-react/
├── index.html                          # Vite entry point
├── vite.config.js                      # Vite config
├── package.json
└── src/
    ├── main.jsx                        # React root mount
    ├── App.jsx                         # Router + routes
    │
    ├── styles/
    │   └── index.css                   # All CSS (exact original styles)
    │
    ├── data/
    │   ├── constants.js                # Static option lists (subjects, boards, etc.)
    │   └── placeholders.js             # UI placeholder data shapes (API-ready)
    │
    ├── pages/
    │   ├── HomePage.jsx                # Landing page
    │   ├── LoginPage.jsx               # Login (email + OTP)
    │   ├── RegisterPage.jsx            # 3-step registration
    │   ├── StudentDashboardPage.jsx    # Student dashboard
    │   └── TutorDashboardPage.jsx      # Tutor dashboard
    │
    └── components/
        ├── common/
        │   ├── LogoIcon.jsx            # SVG logo mark
        │   ├── VerifiedBadge.jsx       # Badge (sm/full/large sizes)
        │   ├── SectionHeader.jsx       # Reusable tag+title+subtitle
        │   ├── TutorCard.jsx           # Search result tutor card
        │   ├── RequestCard.jsx         # Enrollment / request row
        │   └── ComingSoonCard.jsx      # Analytics placeholder card
        │
        ├── layout/
        │   ├── Navbar.jsx              # Sticky nav with hamburger
        │   ├── Footer.jsx              # Site footer
        │   ├── DashboardSidebar.jsx    # Collapsible dashboard sidebar
        │   └── DashboardTopbar.jsx     # Dashboard header bar
        │
        ├── home/
        │   ├── HeroSection.jsx         # Hero + search card
        │   ├── FeaturesSection.jsx     # 6-feature grid
        │   ├── HowItWorksSection.jsx   # 3-step process + tutor CTA
        │   ├── TrustSection.jsx        # Verified badge explainer
        │   └── TestimonialsSection.jsx # 3 testimonial cards
        │
        ├── auth/
        │   ├── LoginForm.jsx           # Email+password form
        │   ├── OTPLoginForm.jsx        # Mobile OTP flow
        │   ├── StudentRegisterForm.jsx # Student step-2 fields
        │   └── TutorRegisterForm.jsx   # Tutor step-2 fields
        │
        └── dashboard/
            ├── shared/
            │   └── MessagesPanel.jsx   # Shared chat UI (student + tutor)
            ├── student/
            │   ├── TutorSearchSection.jsx    # Map + filter + tutor grid
            │   └── EnrolledTutorsSection.jsx # My tutors list
            └── tutor/
                ├── OverviewSection.jsx       # Stats + requests + activity
                ├── StudentRequestsSection.jsx # Accept/decline requests
                ├── MyStudentsSection.jsx     # Enrolled students table
                └── VerifiedBadgeSection.jsx  # Badge progress + explainer
```

---

## 🌐 Routes

| Path                  | Component               | Description              |
|-----------------------|-------------------------|--------------------------|
| `/`                   | `HomePage`              | Landing page             |
| `/login`              | `LoginPage`             | Login (email or OTP)     |
| `/register`           | `RegisterPage`          | 3-step registration      |
| `/register?type=tutor`| `RegisterPage`          | Pre-selects tutor role   |
| `/student/dashboard`  | `StudentDashboardPage`  | Student dashboard        |
| `/tutor/dashboard`    | `TutorDashboardPage`    | Tutor dashboard          |

---

## 🔌 Connecting the Backend

All placeholder handlers are clearly marked with `// TODO: POST /api/v1/...` comments.

### Auth (LoginPage.jsx, RegisterPage.jsx)
```js
// Replace these timeout stubs:
const handleEmailLogin = ({ email, password }) => {
  // TODO: POST /api/v1/auth/login
}
const handleSendOTP = (mobile) => {
  // TODO: POST /api/v1/auth/send-otp
}
```

### Data fetching (Dashboard pages)
```js
// Replace PLACEHOLDER_TUTORS with:
const [tutors, setTutors] = useState([])
useEffect(() => {
  fetch('/api/v1/tutors/search?' + params).then(r => r.json()).then(setTutors)
}, [params])
```

### All placeholder data shapes are defined in:
- `src/data/placeholders.js`  — mirrors the API response shapes
- `src/data/constants.js`     — static option lists for selects/chips

---

## ✅ Design Rules Followed

- ✅ Exact same CSS — not a single style changed
- ✅ Same class names as original HTML
- ✅ All hardcoded data moved to `src/data/`
- ✅ No auth logic implemented
- ✅ No backend calls (only `// TODO` placeholders)
- ✅ Every HTML page → one Page component
- ✅ Reusable components extracted (Navbar, Footer, Cards, Forms)
- ✅ React Router v6 for navigation
- ✅ useState for all interactive UI state
- ✅ Mobile responsive sidebar with open/close state
