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

const description =
  'Smarter strategy. Seamless systems. More room to grow. ÉLEVÉ helps business owners simplify operations, automate everyday tasks and create a better customer experience.'

export const metadata: Metadata = {
  metadataBase: new URL('https://elevebeyond.com'),
  title: {
    default: 'ÉLEVÉ Business Partners · Elevate how you operate, automate and scale',
    template: '%s · ÉLEVÉ Business Partners',
  },
  description,
  applicationName: 'ÉLEVÉ',
  appleWebApp: { title: 'ÉLEVÉ', statusBarStyle: 'black-translucent' },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'ÉLEVÉ Business Partners',
    title: 'Elevate how you operate, automate and scale.',
    description,
  },
  twitter: { card: 'summary_large_image', title: 'Elevate how you operate, automate and scale.', description },
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
