interface BrandMarkProps {
  /** data-URI ikony serwera z pingu; gdy brak — rysujemy własny znak. */
  icon: string | null
  className?: string
}

/** Logo serwera: favicon z pingu, a w razie jego braku — wektorowy znak „KT". */
export function BrandMark({ icon, className }: BrandMarkProps) {
  if (icon) {
    return (
      <img
        src={icon}
        alt=""
        width={40}
        height={40}
        className={`shrink-0 object-cover ${className ?? ''}`}
        style={{ imageRendering: 'pixelated' }}
      />
    )
  }

  return (
    <span
      className={`grid shrink-0 place-items-center bg-gradient-to-br from-brand to-accent text-brand-contrast ${className ?? ''}`}
      aria-hidden
    >
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 4h4v6l4-6h4l-5 7 5 7h-4l-4-6v6H4V4Z"
          fill="currentColor"
          opacity="0.95"
        />
      </svg>
    </span>
  )
}
