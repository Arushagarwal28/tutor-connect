import { useState } from 'react'

/**
 * Manages dashboard section selection and mobile sidebar state.
 *
 * @param {string} defaultSection
 * @returns {{ activeSection, setSection, sidebarOpen, openSidebar, closeSidebar, toggleSidebar }}
 */
export default function useDashboardNav(defaultSection = 'overview') {
  const [activeSection, setActiveSection] = useState(defaultSection)
  const [sidebarOpen,   setSidebarOpen]   = useState(false)

  const setSection    = (id) => { setActiveSection(id); setSidebarOpen(false) }
  const openSidebar   = ()   => setSidebarOpen(true)
  const closeSidebar  = ()   => setSidebarOpen(false)
  const toggleSidebar = ()   => setSidebarOpen(o => !o)

  return { activeSection, setSection, sidebarOpen, openSidebar, closeSidebar, toggleSidebar }
}
