import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'  // ← Step 13c
import './styles/index.css'

// ErrorBoundary is the outermost wrapper so it catches crashes
// from any component in the tree, including AuthProvider itself.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)