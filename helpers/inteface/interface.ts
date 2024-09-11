interface GasPriceResult {
    gwei: string;
    usdt: string;
  }

  // interfaces.ts

export type SupportedChain = 'eth-sepolia' | 'arbitrum-sepolia' | 'base-sepolia';

export interface ChainConfig {
  rpcUrl: string;
  chainId: number;
}

export interface TokenMintParams {
  tokenAddress: string;
  recipientAddress: string;
  chain: SupportedChain;
  amountToMint?: string;
}

export interface MintResult {
  tokenBalance: string;
  ethBalance: string;
}