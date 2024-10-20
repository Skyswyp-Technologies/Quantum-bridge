import { http, cookieStorage, createConfig, createStorage } from 'wagmi';
import { baseSepolia, sepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, metaMask, walletConnect } from 'wagmi/connectors';

export function getConfig() {
  return createConfig({
    chains: [sepolia, baseSepolia],
    connectors: [
      coinbaseWallet({
        appName: "Quantum Bridge",
        preference: 'smartWalletOnly',
        version: '4',
      }),
      injected(),
      metaMask(),
      walletConnect({ projectId: "c3bb48e466ab4f0e9ccaf92e7bd24dca" }),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [sepolia.id]: http(),
      [baseSepolia.id]: http(),
    },
  });
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}