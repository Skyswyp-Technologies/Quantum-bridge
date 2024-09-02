'use client'
import type { Metadata } from 'next'
import { Urbanist } from 'next/font/google'
import './globals.css'
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

const urbanist = Urbanist({ subsets: ['latin'] })

 const metadata: any = {
  title: 'Bridge dApp',
  description: 'A dApp for bridging assets across blockchain networks',
}

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'c3bb48e466ab4f0e9ccaf92e7bd24dca',
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">

      <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
      <body className={`${urbanist.className} flex flex-col h-full`}>
        <main className="flex-grow overflow-hidden">
          {children}
        </main>
      </body>
    </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
    </html>

  )
}