import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

window.addEventListener('unhandledrejection', (event) => {
  console.error('UNHANDLED REJECTION:', event.reason)
})

window.addEventListener('error', (event) => {
  console.error('UNCAUGHT ERROR:', event.message, event.filename, event.lineno)
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
