import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './components/app/App.tsx'
import { InfiniteListProvider } from './providers/InfiniteListProvider.tsx'
import { ThemeProvider } from './providers/ThemeProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <InfiniteListProvider>
        <App />
      </InfiniteListProvider>
    </ThemeProvider>
  </StrictMode>,
)
