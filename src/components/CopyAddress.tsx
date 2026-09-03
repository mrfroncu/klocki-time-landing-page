import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CheckIcon, CopyIcon, GlobeIcon } from './icons'

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

  const message =
    state === 'copied'
      ? 'Skopiowano adres serwera do schowka'
      : state === 'error'
        ? `Nie udało się skopiować. Adres: ${address}`
        : ''

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="panel-inset group flex items-center gap-3 py-3 pl-4 pr-2.5 text-left transition-transform duration-100 active:translate-y-0.5"
        aria-label={`Skopiuj adres serwera ${address}`}
      >
        <GlobeIcon className="hidden shrink-0 text-fg-subtle sm:block" />
        <span className="font-mono text-base font-medium tracking-tight text-fg sm:text-lg">
          {address}
        </span>
        <span
          className={`btn-bevel ml-1 grid h-9 w-9 shrink-0 place-items-center ${
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
              {state === 'copied' ? <CheckIcon /> : <CopyIcon />}
            </motion.span>
          </AnimatePresence>
        </span>
      </button>

      <span className="h-4 font-display text-[11px] tracking-wide text-fg-subtle" aria-hidden>
        {state === 'copied'
          ? '✓ Skopiowano!'
          : state === 'error'
            ? 'Skopiuj ręcznie'
            : 'Kliknij, aby skopiować adres'}
      </span>
      <span role="status" aria-live="polite" className="sr-only">
        {message}
      </span>
    </div>
  )
}
