import { Background } from './components/Background'
import { ServerCard } from './components/ServerCard'
import { MapPanel } from './components/MapPanel'
import { ActionsCard } from './components/ActionsCard'
import { useServerStatus } from './lib/useServerStatus'
import { deriveStatus } from './lib/derive'

/**
 * Jeden ekran, bez scrollowania (desktop): mapa po lewej na całą wysokość,
 * po prawej kolumna z nazwą/statusem/adresem (góra) i akcjami (dół).
 * Na małych ekranach to samo w pionie: nagłówek → mapa → akcje.
 */
export default function App() {
  const statusState = useServerStatus()
  const status = deriveStatus(statusState)

  return (
    <>
      <Background />

      <main className="mx-auto grid w-full max-w-[1680px] gap-4 p-3 sm:p-4 lg:min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(340px,400px)] lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-5 lg:p-5">
        <ServerCard status={status} className="lg:col-start-2 lg:row-start-1" />
        <MapPanel status={status} className="lg:col-start-1 lg:row-span-2 lg:row-start-1" />
        <ActionsCard
          status={status}
          updatedAt={statusState.updatedAt}
          className="lg:col-start-2 lg:row-start-2"
        />
      </main>
    </>
  )
}
