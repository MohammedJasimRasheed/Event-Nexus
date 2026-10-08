import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { EventProvider } from './context/EventContext'
import { ToastProvider } from './context/ToastContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EventProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </EventProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
