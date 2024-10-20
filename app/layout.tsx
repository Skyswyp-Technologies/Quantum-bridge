"use client";

import { Urbanist } from "next/font/google";
import "./globals.css";
import "@coinbase/onchainkit/styles.css"
import "react-toastify/dist/ReactToastify.css";
import "@rainbow-me/rainbowkit/styles.css";
import { ToastContainer } from "react-toastify";
import { BridgeProvider } from "@/context/BridgeContext";
import BaseWallet from "@/components/BaseWallet";
import { Providers } from "./providers";
const urbanist = Urbanist({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <ToastContainer position="top-center" />
      <BridgeProvider>
        <Providers>
          <body className={`${urbanist.className} flex flex-col h-full`}>
            <main className="flex-grow">{children}</main>
          </body>
          </Providers>
      </BridgeProvider>
    </html>
  );
}
