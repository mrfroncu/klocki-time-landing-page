import type { ElementType, ReactNode } from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'

interface RevealProps {
  children: ReactNode
  /** Opóźnienie w sekundach. */
  delay?: number
  /** Dystans wjazdu w px. */
  y?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'header' | 'footer'
}

/** Pojedynczy element pojawiający się przy wejściu w widok. */
export function Reveal({ children, delay = 0, y = 18, className, as = 'div' }: RevealProps) {
  const reduce = useReducedMotion()
  const Tag = (reduce ? as : motion[as]) as ElementType

  if (reduce) {
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px -8% 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  )
}

/** Kontener, który rozłożonym w czasie ruchem odsłania swoje dzieci `RevealItem`. */
const groupVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

export function RevealGroup({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'ul'
}) {
  const reduce = useReducedMotion()
  const Tag = (reduce ? as : motion[as]) as ElementType

  if (reduce) {
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <Tag
      className={className}
      variants={groupVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-10% 0px' }}
    >
      {children}
    </Tag>
  )
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

export function RevealItem({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'li'
}) {
  const reduce = useReducedMotion()
  const Tag = (reduce ? as : motion[as]) as ElementType

  if (reduce) {
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <Tag className={className} variants={itemVariants}>
      {children}
    </Tag>
  )
}
