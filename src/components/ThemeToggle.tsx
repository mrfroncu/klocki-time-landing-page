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
      className="btn-bevel btn-panel relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden"
      aria-label={`${LABEL[theme]} — kliknij, aby zmienić`}
      title={LABEL[theme]}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16 }}
          className="absolute inset-0 grid place-items-center"
        >
          <Icon />
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
