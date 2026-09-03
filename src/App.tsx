import { Background } from './components/Background'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { MapSection } from './components/MapSection'
import { ActionGrid } from './components/ActionGrid'
import { Footer } from './components/Footer'
import { useTheme } from './hooks/useTheme'
import { useServerStatus } from './lib/useServerStatus'
import { deriveStatus } from './lib/derive'

export default function App() {
  const theme = useTheme()
  const statusState = useServerStatus()
  const status = deriveStatus(statusState)

  return (
    <>
      <a
        href="#mapa"
        className="btn-bevel btn-brand sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:px-4 focus:py-2 focus:font-display focus:text-sm focus:font-semibold"
      >
        Przejdź do treści
      </a>

      <Background />

      <div id="top" className="scroll-mt-24" />
      <Navbar status={status} theme={theme} />

      <main>
        <Hero status={status} />
        <MapSection status={status} />
        <ActionGrid />
      </main>

      <Footer status={status} updatedAt={statusState.updatedAt} />
    </>
  )
}
