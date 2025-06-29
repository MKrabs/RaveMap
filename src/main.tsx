import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { InfiniteListProvider } from './InfiniteListProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InfiniteListProvider>
      <App />
    </InfiniteListProvider>
  </StrictMode>,
)
