import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CheckIcon, CopyIcon } from './icons'

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* przejdź do fallbacku */
  }
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}

interface CopyAddressProps {
  /** Adres wpisywany w kliencie (host lub host:port). */
  address: string
}

/** Pełnej szerokości pole z adresem — kliknięcie w całość kopiuje. */
export function CopyAddress({ address }: CopyAddressProps) {
  const reduce = useReducedMotion()
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => void (timeoutRef.current && clearTimeout(timeoutRef.current)), [])

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(address)
    setState(ok ? 'copied' : 'error')
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setState('idle'), 2000)
  }, [address])

  const hint =
    state === 'copied' ? 'Skopiowano!' : state === 'error' ? 'Skopiuj ręcznie' : 'Kliknij, aby skopiować'
  const announce =
    state === 'copied'
      ? 'Skopiowano adres serwera do schowka'
      : state === 'error'
        ? `Nie udało się skopiować. Adres: ${address}`
        : ''

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleCopy}
        className="field group flex w-full items-center gap-3 py-2 pl-3.5 pr-2 text-left transition-transform duration-100 active:translate-y-px"
        aria-label={`Skopiuj adres serwera ${address}`}
      >
        <span className="min-w-0 flex-1 truncate font-mono text-base font-semibold tracking-tight text-fg sm:text-[1.05rem]">
          {address}
        </span>
        <span
          className={`btn-bevel grid h-9 w-9 shrink-0 place-items-center ${
            state === 'copied' ? 'btn-brand' : 'btn-panel'
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={state === 'copied' ? 'check' : 'copy'}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              className="grid place-items-center"
            >
              {state === 'copied' ? <CheckIcon className="h-4.5 w-4.5" /> : <CopyIcon className="h-4.5 w-4.5" />}
            </motion.span>
          </AnimatePresence>
        </span>
      </button>
      <span
        className={`h-4 text-[11px] ${state === 'copied' ? 'text-brand' : 'text-fg-subtle'}`}
        aria-hidden
      >
        {hint}
      </span>
      <span role="status" aria-live="polite" className="sr-only">
        {announce}
      </span>
    </div>
  )
}
