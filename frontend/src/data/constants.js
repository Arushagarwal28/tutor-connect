// ─────────────────────────────────────────────
// constants.js  –  All static option lists
// Replace with API responses when backend is ready
// ─────────────────────────────────────────────

export const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'Hindi', 'History', 'Geography',
  'Computer Science', 'Accountancy', 'Economics',
]

export const CLASSES = [
  'Class 1–5', 'Class 6–8', 'Class 9–10',
  'Class 11–12', 'Competitive Exams',
]

export const CLASS_NUMBERS = [
  '1','2','3','4','5','6','7','8','9','10','11','12',
]

export const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE']

export const TEACHING_MODES = [
  { value: 'home',   label: 'Home Tutor (visits student)' },
  { value: 'center', label: 'Tuition Center' },
  { value: 'online', label: 'Online' },
  { value: 'hybrid', label: 'Hybrid (Online + Offline)' },
]

export const RADIUS_OPTIONS = [
  { value: '1',  label: '1 km' },
  { value: '3',  label: '3 km' },
  { value: '5',  label: '5 km' },
  { value: '10', label: '10 km' },
  { value: 'custom', label: 'Custom' },
]

export const COVERAGE_RADIUS_OPTIONS = [
  '1','2','3','5','7','10',
]

export const BUDGET_RANGES = [
  '₹500 – ₹1,000/month',
  '₹1,000 – ₹2,000/month',
  '₹2,000 – ₹4,000/month',
  '₹4,000+/month',
]

export const RATING_FILTER_OPTIONS = [
  { value: '',    label: 'Any Rating' },
  { value: '4',   label: '4+ Stars' },
  { value: '4.5', label: '4.5+ Stars' },
]

export const SORT_OPTIONS = [
  'Sort: Distance (Near to Far)',
  'Sort: Rating (High to Low)',
  'Sort: Experience (High to Low)',
  'Sort: Price (Low to High)',
]

export const INDIAN_STATES = [
  'Andhra Pradesh','Bihar','Delhi','Gujarat','Haryana',
  'Karnataka','Kerala','Madhya Pradesh','Maharashtra',
  'Punjab','Rajasthan','Tamil Nadu','Telangana',
  'Uttar Pradesh','West Bengal',
]

export const NAV_LINKS = [
  { label: 'Features',        href: '/#features' },
  { label: 'How It Works',    href: '/#how-it-works' },
  { label: 'Verified Tutors', href: '/#trust' },
]

export const FOOTER_PLATFORM_LINKS = [
  'Find a Tutor', 'Become a Tutor', 'Tuition Centers', 'Online Tutoring',
]

export const FOOTER_SUBJECT_LINKS = [
  'Mathematics', 'Science', 'English', 'Commerce', 'Languages',
]
