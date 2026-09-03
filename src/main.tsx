import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { loadRuntimeConfig } from './config.ts'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Brak elementu #root')

const root = createRoot(rootElement)

// Najpierw spróbuj wczytać runtime override (/config.json), potem renderuj.
void loadRuntimeConfig().finally(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
