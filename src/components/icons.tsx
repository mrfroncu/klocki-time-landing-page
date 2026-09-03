import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = (props: IconProps): IconProps => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
})

export function CopyIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="9" y="9" width="12" height="12" rx="2.5" />
      <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m4 12.5 5 5 11-11" />
    </svg>
  )
}

export function ExternalIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14 4h6v6" />
      <path d="M20 4 10 14" />
      <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </svg>
  )
}

export function MapIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m9 4 6 2 4.4-1.8a1 1 0 0 1 1.4.92V17a1 1 0 0 1-.63.93L15 20l-6-2-4.4 1.8A1 1 0 0 1 3 18.88V6a1 1 0 0 1 .63-.93L9 4Z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  )
}

export function ActivityIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 12h4l3 8 4-16 3 8h4" />
    </svg>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  )
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

export function CubeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 2.5 3.5 7v10L12 21.5 20.5 17V7L12 2.5Z" />
      <path d="M3.5 7 12 11.75 20.5 7M12 21.5v-9.75" />
    </svg>
  )
}

export function SparkIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v4M12 17v4M5 12H3M21 12h-2M6.3 6.3 5 5M19 19l-1.3-1.3M17.7 6.3 19 5M5 19l1.3-1.3" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  )
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  )
}

export function MonitorIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function ExpandIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  )
}

export function DiscordIcon(props: IconProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      {...props}
    >
      <path d="M19.27 5.33A16.6 16.6 0 0 0 15.1 4a12 12 0 0 0-.53 1.1 15.4 15.4 0 0 0-4.15 0A12 12 0 0 0 9.9 4a16.6 16.6 0 0 0-4.17 1.33C3.09 9.3 2.37 13.16 2.73 16.96a16.7 16.7 0 0 0 5.1 2.6q.62-.85 1.09-1.79c-.6-.22-1.17-.5-1.71-.82q.22-.16.42-.33a11.94 11.94 0 0 0 10.14 0q.2.18.42.33-.82.49-1.72.82.47.94 1.1 1.78a16.6 16.6 0 0 0 5.09-2.6c.42-4.4-.72-8.23-3-11.62ZM9.3 14.62c-1 0-1.82-.92-1.82-2.05s.8-2.06 1.82-2.06 1.84.93 1.82 2.06c0 1.13-.8 2.05-1.82 2.05Zm5.4 0c-1 0-1.82-.92-1.82-2.05s.8-2.06 1.82-2.06 1.84.93 1.82 2.06c0 1.13-.8 2.05-1.82 2.05Z" />
    </svg>
  )
}

export function TagIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 7.5V4a1 1 0 0 1 1-1h3.5a2 2 0 0 1 1.42.6l9.5 9.5a2 2 0 0 1 0 2.83l-4.09 4.09a2 2 0 0 1-2.83 0l-9.5-9.5A2 2 0 0 1 3 8.5Z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  )
}

export function GlobeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 3.9 6 4 9-.1 3-1.5 6.3-4 9-2.5-2.7-3.9-6-4-9 .1-3 1.5-6.3 4-9Z" />
    </svg>
  )
}
