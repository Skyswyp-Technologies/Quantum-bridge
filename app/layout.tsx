"use client";

import { Urbanist } from "next/font/google";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css'

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { ToastContainer } from 'react-toastify'
import {  arbitrumSepolia,baseSepolia,sepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { BridgeProvider } from "@/context/BridgeContext";

const urbanist = Urbanist({ subsets: ["latin"] });

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: "Quantum Bridge",
  projectId: "c3bb48e466ab4f0e9ccaf92e7bd24dca",
  chains: [ arbitrumSepolia, sepolia, baseSepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
       <ToastContainer position="top-center" />
      <BridgeProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <body className={`${urbanist.className} flex flex-col h-full`}>
                <main className="flex-grow">{children}</main>
              </body>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </BridgeProvider>
    </html>
  );
}