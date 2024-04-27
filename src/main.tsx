import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { UserPage } from './pages/UserPage'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <>
      <UserPage />
    </>
  </React.StrictMode>,
)
