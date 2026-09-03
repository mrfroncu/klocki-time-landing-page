interface BrandMarkProps {
  /** data-URI ikony serwera z pingu; gdy brak — rysujemy własny znak. */
  icon: string | null
  className?: string
}

/** Logo serwera: favicon z pingu, a w razie jego braku — blokowy znak „KT". */
export function BrandMark({ icon, className }: BrandMarkProps) {
  if (icon) {
    return (
      <img
        src={icon}
        alt=""
        width={40}
        height={40}
        className={`panel shrink-0 object-cover p-0.5 ${className ?? ''}`}
        style={{ imageRendering: 'pixelated' }}
      />
    )
  }

  return (
    <span
      className={`btn-bevel btn-brand grid shrink-0 place-items-center ${className ?? ''}`}
      aria-hidden
    >
      <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none">
        <path d="M4 4h4v6l4-6h4l-5 7 5 7h-4l-4-6v6H4V4Z" fill="currentColor" />
      </svg>
    </span>
  )
}
