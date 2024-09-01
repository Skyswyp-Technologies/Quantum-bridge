import type { Metadata } from 'next'
import { Urbanist } from 'next/font/google'
import './globals.css'

const urbanist = Urbanist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bridge dApp',
  description: 'A dApp for bridging assets across blockchain networks',
}

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