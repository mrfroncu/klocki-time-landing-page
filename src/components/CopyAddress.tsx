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
        className="group glass relative flex items-center gap-3 rounded-2xl py-3 pl-4 pr-3 text-left shadow-soft transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
        aria-label={`Skopiuj adres serwera ${address}`}
      >
        <GlobeIcon className="hidden shrink-0 text-fg-subtle sm:block" />
        <span className="font-mono text-base font-medium tracking-tight text-fg sm:text-lg">
          {address}
        </span>
        <span
          className={`ml-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-fg-muted transition-colors ${
            state === 'copied'
              ? 'border-success/40 bg-success-soft text-success'
              : 'border-border bg-bg-elevated/60 group-hover:text-fg'
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={state === 'copied' ? 'check' : 'copy'}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: -20 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: 20 }}
              transition={{ duration: 0.18 }}
              className="grid place-items-center"
            >
              {state === 'copied' ? <CheckIcon /> : <CopyIcon />}
            </motion.span>
          </AnimatePresence>
        </span>
      </button>

      <span className="h-4 text-xs font-medium text-fg-subtle" aria-hidden>
        {state === 'copied'
          ? 'Skopiowano!'
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
