import React from 'react'
import type { Metadata } from 'next'
import './styles.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Material History',
  description: 'Equipment and material history management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-zinc-950 antialiased">
        <a className="skip-link" href="#root">Skip to content</a>
        <div id="root" tabIndex={-1}>{children}</div>
      </body>
    </html>
  )
}
