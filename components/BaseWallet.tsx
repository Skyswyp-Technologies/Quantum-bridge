"use client";

import React from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { baseSepolia, sepolia } from "wagmi/chains";
import { Config } from "@/config/config";
import { getConfig } from "@/config/wagmi";

type Props = { children: ReactNode };

const queryClient = new QueryClient();

const BaseWallet = ({ children }: Props) => {
  const wagmiConfig = getConfig()

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
      <OnchainKitProvider apiKey={Config.PRIVATE_KEY} chain={baseSepolia}>
        <RainbowKitProvider modalSize="compact">{children}</RainbowKitProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default BaseWallet;
