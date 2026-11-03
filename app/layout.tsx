import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Manrope } from 'next/font/google'
import './globals.css'

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' })
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

export const metadata: Metadata = {
  title: {
    default: 'ÉLEVÉ Business Partners · Strategy, Operations & Automation',
    template: '%s · ÉLEVÉ Business Partners',
  },
  description:
    'ÉLEVÉ Business Partners helps business owners simplify their operations, strengthen the customer experience, and build the capacity to scale.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111114',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${manrope.variable} ${cormorant.variable} bg-background`}>
      <body className="font-sans text-foreground">{children}</body>
    </html>
  )
}
