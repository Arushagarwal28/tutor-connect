import { Link } from 'react-router-dom'
import LogoIcon from '../common/LogoIcon.jsx'
import { FOOTER_PLATFORM_LINKS, FOOTER_SUBJECT_LINKS } from '../../data/constants.js'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <div className="logo-icon"><LogoIcon size={24} /></div>
              <span>TutorConnect</span>
            </Link>
            <p>Connecting students with the best local tutors. Learn smarter, together.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="Twitter">t</a>
              <a href="#" aria-label="Instagram">in</a>
              <a href="#" aria-label="YouTube">▶</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            {FOOTER_PLATFORM_LINKS.map((l) => <a key={l} href="#">{l}</a>)}
          </div>

          <div className="footer-col">
            <h4>Subjects</h4>
            {FOOTER_SUBJECT_LINKS.map((l) => <a key={l} href="#">{l}</a>)}
          </div>

          <div className="footer-col">
            <h4>Contact Us</h4>
            <p>📧 support@tutorconnect.in</p>
            <p>📞 1800-XXX-XXXX (Toll Free)</p>
            <p>🕐 Mon–Sat, 9AM–7PM IST</p>
            <p style={{ marginTop: 12, fontSize: 13, color: '#94a3b8' }}>📍 New Delhi, India</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 TutorConnect. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
