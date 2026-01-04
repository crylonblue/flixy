import Link from 'next/link'

interface LogoProps {
  className?: string
  href?: string
}

export default function Logo({ className = '', href = '/' }: LogoProps) {
  return (
    <Link href={href} className={`brand-logo ${className}`}>
      flixy
    </Link>
  )
}

