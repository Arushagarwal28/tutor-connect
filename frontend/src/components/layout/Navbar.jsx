import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import LogoIcon from '../common/LogoIcon.jsx'
import { NAV_LINKS } from '../../data/constants.js'

export default function Navbar() {

  const navigate          = useNavigate()
  const location          = useLocation()
  const { auth, logout }  = useAuth()

  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)

  const isLoggedIn    = !auth.isLoading && !!auth.token
  const dashboardPath = auth.role === 'tutor' ? '/tutor/dashboard' : '/student/dashboard'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (!e.target.closest('.navbar')) setMenuOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [menuOpen])

  const handleAnchorClick = (e, href) => {
    if (!href.startsWith('/#')) return
    const id = href.replace('/#', '')
    const el = document.getElementById(id)
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }) }
    setMenuOpen(false)
  }

  // Logout: clear token then navigate only if not already on /
  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/', { replace: true })
    }
  }

  return (
    <header className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="logo">
          <div className="logo-icon"><LogoIcon size={28} /></div>
          <span>TutorConnect</span>
        </Link>

        <nav className="nav-links">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} onClick={(e) => handleAnchorClick(e, link.href)}>
              {link.label}
            </a>
          ))}

          {isLoggedIn ? (
            <>
              <Link to={dashboardPath} className="btn-ghost">My Dashboard</Link>
              <button onClick={handleLogout} className="btn-primary" style={{ cursor:'pointer', border:'none' }}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn-ghost">Sign In</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </>
          )}
        </nav>

        <button className="hamburger" aria-label="Menu" onClick={() => setMenuOpen(v => !v)}>
          <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : '' }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : '' }} />
        </button>
      </div>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <a key={link.label} href={link.href} onClick={(e) => { handleAnchorClick(e, link.href); setMenuOpen(false) }}>
            {link.label}
          </a>
        ))}

        {isLoggedIn ? (
          <>
            <Link to={dashboardPath} onClick={() => setMenuOpen(false)}>My Dashboard</Link>
            <button onClick={handleLogout} className="btn-primary" style={{ textAlign:'center', cursor:'pointer', border:'none', width:'100%' }}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    onClick={() => setMenuOpen(false)}>Sign In</Link>
            <Link to="/register" className="btn-primary" onClick={() => setMenuOpen(false)}>Get Started</Link>
          </>
        )}
      </div>
    </header>
  )
}