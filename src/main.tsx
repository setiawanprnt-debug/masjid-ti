import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { FinanceProvider } from './context/FinanceContext'
import { ContentProvider } from './context/ContentContext'
import { BeritaProvider } from './context/BeritaContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ContentProvider>
          <FinanceProvider>
            <BeritaProvider>
              <App />
            </BeritaProvider>
          </FinanceProvider>
        </ContentProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
