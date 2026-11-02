import type { Metadata, Viewport } from 'next'
import { Fraunces, Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' })

export const metadata: Metadata = {
  title: 'The Deep Reset · Operational Plan',
  description:
    'Customer Operations Setup pilot for Dreamworks365 The Deep Reset, prepared by ÉLEVÉ Business Partners. Nov 9 – Dec 18, 2026.',
  robots: { index: false, follow: false },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1e3b2c',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${fraunces.variable} bg-background`}>
      <body className="font-sans text-foreground">{children}</body>
    </html>
  )
}
