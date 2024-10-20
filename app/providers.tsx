"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { type State, WagmiProvider } from "wagmi";
import { getConfig } from "./../config/wagmi";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { baseSepolia, sepolia } from "wagmi/chains";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { Config } from "@/config/config";

export function Providers(props: { children: ReactNode; inialState?: State }) {
  const [config] = useState(() => getConfig());
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config} initialState={props.inialState}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider apiKey={Config.ONCHAINKIT} chain={baseSepolia}>
          {props.children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
