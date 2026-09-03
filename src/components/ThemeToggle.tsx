import { AnimatePresence, motion } from 'motion/react'
import type { Theme, ThemeController } from '../hooks/useTheme'
import { MonitorIcon, MoonIcon, SunIcon } from './icons'

const LABEL: Record<Theme, string> = {
  light: 'Motyw jasny',
  dark: 'Motyw ciemny',
  system: 'Motyw systemowy',
}

const ICON: Record<Theme, typeof SunIcon> = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
}

export function ThemeToggle({ theme, cycleTheme }: ThemeController) {
  const Icon = ICON[theme]

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="glass group relative grid h-10 w-10 place-items-center rounded-full text-fg-muted transition-colors hover:text-fg"
      aria-label={`${LABEL[theme]} — kliknij, aby zmienić`}
      title={LABEL[theme]}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -35, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 35, scale: 0.7 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 grid place-items-center"
        >
          <Icon />
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
