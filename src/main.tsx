import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './components/app/App.tsx'
import { InfiniteListProvider } from './providers/InfiniteListProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InfiniteListProvider>
      <App />
    </InfiniteListProvider>
  </StrictMode>,
)
