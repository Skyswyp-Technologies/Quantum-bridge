interface GasPriceResult {
  gwei: string;
  usdt: string;
}

// interfaces.ts

export type SupportedChain = 'eth-sepolia' | 'base-sepolia';

export interface ChainConfig {
rpcUrl: string;
chainId: number;
destinationChain: string,
}

export interface TokenMintParams {
tokenAddress: string;
recipientAddress: string;
chain: SupportedChain ;
walletClient: any;
amountToMint?: string;
}

export interface MintResult {
tokenBalance: string;
recipientAddress: string,
chain: SupportedChain,
transactionHash: string
// ethBalance: string;
}


export interface TotalTokensBorrowedResponse {
  addresses: string[];
  amounts: number[];
}