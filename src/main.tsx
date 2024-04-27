import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { AppRouter } from './routes/AppRouter'
import { SidebarProvider } from './context/SidebarContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SidebarProvider>

    <AppRouter />
    </SidebarProvider>
  </React.StrictMode>,
)
