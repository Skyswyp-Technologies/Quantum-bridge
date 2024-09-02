"use client"

import { Urbanist } from 'next/font/google'
import './globals.css'

const urbanist = Urbanist({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${urbanist.className} flex flex-col h-full`}>
        <main className="flex-grow overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  )
}