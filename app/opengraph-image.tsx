import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const alt = 'ÉLEVÉ Business Partners: Elevate how you operate, automate and scale.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function googleFont(family: string, weight: number, text: string) {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`)
    ).text()
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1]
    return url ? await (await fetch(url)).arrayBuffer() : null
  } catch {
    return null
  }
}

export default async function OpengraphImage() {
  const headline = 'Elevate how you operate, automate and scale.'
  const line = 'Smarter strategy. Seamless systems. More room to grow.'
  const [mark, serif, sans] = await Promise.all([
    readFile(join(process.cwd(), 'public/brand/eleve-mark-512.png')),
    googleFont('Cormorant+Garamond', 500, `ÉLEVÉ${headline}`),
    googleFont('Manrope', 500, `${line}BUSINESS PARTNERS ELEVEBEYOND.COM`),
  ])
  const fonts = [
    ...(serif ? [{ name: 'Cormorant', data: serif, weight: 500 as const, style: 'normal' as const }] : []),
    ...(sans ? [{ name: 'Manrope', data: sans, weight: 500 as const, style: 'normal' as const }] : []),
  ]

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#141317', color: '#f3efe8', padding: 72, gap: 64 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/png;base64,${mark.toString('base64')}`} width={300} height={300} alt="" style={{ alignSelf: 'center' }} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, gap: 26 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontFamily: 'Cormorant', fontSize: 44, letterSpacing: 14 }}>ÉLEVÉ</span>
            <span style={{ fontFamily: 'Manrope', fontSize: 16, letterSpacing: 7, color: '#c9aa78' }}>BUSINESS PARTNERS</span>
          </div>
          <span style={{ fontFamily: 'Cormorant', fontSize: 64, lineHeight: 1.05 }}>{headline}</span>
          <span style={{ fontFamily: 'Manrope', fontSize: 26, color: '#b9b2a6' }}>{line}</span>
          <span style={{ fontFamily: 'Manrope', fontSize: 18, letterSpacing: 5, color: '#c9aa78' }}>ELEVEBEYOND.COM</span>
        </div>
      </div>
    ),
    { ...size, fonts },
  )
}
