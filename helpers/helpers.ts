import { Config } from "@/config/config";
import { BRIDGE_ABI } from "@/constants/constants";
import axios from "axios";
import { ethers } from "ethers";
import {
  ChainConfig,
  MintResult,
  SupportedChain,
  TokenMintParams,
} from "./inteface/interface";

const chainConfigs: Record<SupportedChain, ChainConfig> = {
  "eth-sepolia": {
    rpcUrl: "https://go.getblock.io/4abbff238c2d4f219e86e52b324cdabf",
    chainId: 11155111,
    destinationChain: "eth-sepolia"
  },
  "arbitrum-sepolia": {
    rpcUrl: "https://go.getblock.io/c0d41de5290b4969b6fc4cb89f86d429",
    chainId: 421614,
    destinationChain: "arbitrum-sepolia"
  },
  "base-sepolia": {
    rpcUrl: "https://go.getblock.io/17f34af937f341e2b3afba0151a7b227",
    chainId: 84532,
    destinationChain: "base-sepolia"
  },
};

class Bridge {
  constructor() {}

  depositNativeAssets = async (
    birdgeContract: string,
    destId: any,
    amount: any,
    destChain: SupportedChain,
    walletClient: any
   
  ) => {
    if (!birdgeContract || !destId || !amount || !destChain || !walletClient) return;
    try {

      const chainConfig = chainConfigs[destChain];
      if (!chainConfig) {
        throw new Error(`Unsupported source chain: ${destChain}`);
      }

      const provider = new ethers.providers.JsonRpcProvider(chainConfig.rpcUrl);

      const depositNativeTx = await walletClient.writeContract({
        address: birdgeContract,
        abi: BRIDGE_ABI,
        functionName: "depositNative",
        args: [destId, amount, chainConfig.destinationChain],
      });

      const receipt = await provider.waitForTransaction(depositNativeTx);
      // Get the transaction hash
      const hash = receipt.transactionHash;

      // Check if the transaction was successful
      if (receipt && receipt.status === 1) {
        return { success: true, data: { receipt, hash } };
      } else {
        return { success: false, data: { receipt, hash } };
      }
    } catch (error) {
      throw error;
    }
  };

  depositERC20Assets = async (
    bridgeContract: any,
    fee: any,
    destId: any,
    amount: any,
    tokenAddress: string,
    receiver: string,
    sourceChain: SupportedChain,
    walletClient: any
  ) => {
    if (
      !bridgeContract ||
      !fee ||
      !destId ||
      !amount ||
      !tokenAddress ||
      !sourceChain ||
      !receiver ||
      !walletClient
      
    ) {
      throw new Error("Missing required parameters");
    }

    try {

      console.log(bridgeContract, fee, destId, amount, tokenAddress, sourceChain, receiver)

      const chainConfig = chainConfigs[sourceChain];
      if (!chainConfig) {
        throw new Error(`Unsupported source chain: ${sourceChain}`);
      }


      const depositTx = await walletClient.writeContract({
        address: bridgeContract,
        abi: BRIDGE_ABI,
        functionName: "deposit",
        args: [destId, amount, tokenAddress, chainConfig.destinationChain, receiver],
        value: ethers.utils.parseEther(fee), // Send the required fee with the transaction
      });

      // Wait for the transaction to be mined
      const provider = new ethers.providers.JsonRpcProvider(chainConfig.rpcUrl);
      const receipt = await provider.waitForTransaction(depositTx);

      if (receipt.status === 1) {
        return {
          success: true,
          data: { receipt, hash: receipt.transactionHash },
        };
      } else {
        return {
          success: false,
          data: { receipt, hash: receipt.transactionHash },
        };
      }
    } catch (error) {
      console.error("Error in depositERC20Assets:", error);
      throw error;
    }
  };

  prepareBridgeInfo = async (
    contractBridge: string,
    amount: string,
    tokenAddress: string,
    receiverAddress: string,
    destEid: string,
    sourceChain: SupportedChain
  ) => {
    try {
      const chainConfig = chainConfigs[sourceChain];
      if (!chainConfig) {
        throw new Error(`Unsupported source chain: ${sourceChain}`);
      }

      // Setup provider
      const provider = new ethers.providers.JsonRpcProvider(chainConfig.rpcUrl);

      // Create contract instance
      const bridge = new ethers.Contract(contractBridge, BRIDGE_ABI, provider);

      // Get the token decimals
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ["function decimals() view returns (uint8)"],
        provider
      );
      const decimals = await tokenContract.decimals();

      // Get the payload
      const payload = await bridge.getMessage(
        ethers.utils.parseUnits(amount, decimals),
        tokenAddress,
        receiverAddress
      );

      // Get the options
      const options = await bridge.getLzReceiveOption(
        ethers.utils.parseUnits("500000", "wei"),
        ethers.utils.parseUnits("0", "wei")
      );

      // Get the fee
      const fee = await bridge.getFee(destEid, payload, options);

      if (fee) {
        const nativeFee = ethers.utils.formatEther(fee.nativeFee);
        const nativeCurrency = this.getNativeCurrency(sourceChain);

        const feeInUSD = await this.convertEthToUsdt(nativeFee, nativeCurrency);

        return {
          sourceChain,
          payload,
          options,
          nativeFee,
          feeInUSD,
          amountToSend: ethers.utils.formatUnits(
            ethers.utils.parseUnits(amount, decimals),
            decimals
          ),
        };
      } else {
        throw new Error("Failed to get fee information");
      }
    } catch (error) {
      console.error(`Error in prepareBridgeInfo for ${sourceChain}:`, error);
      throw error;
    }
  };

  approveBridge = async (
    bridgeContract: string,
    tokenAddress: string,
    amountApprove: string,
    walletClient: any,
    chain: SupportedChain
  ) => {
    try {
      const chainConfig = chainConfigs[chain];
      if (!chainConfig) {
        throw new Error(`Unsupported chain: ${chain}`);
      }

      const approveABI = [
        {
          inputs: [
            { internalType: "address", name: "spender", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
          ],
          name: "approve",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "nonpayable",
          type: "function",
        },
      ];

      const provider = new ethers.providers.JsonRpcProvider(chainConfig.rpcUrl);

      // Fetch the token contract to get the number of decimals
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ["function decimals() view returns (uint8)"],
        provider
      );
      const decimals = await tokenContract.decimals();

      const amount = ethers.utils.parseUnits(amountApprove, decimals);

      const approveTx = await walletClient.writeContract({
        address: tokenAddress,
        abi: approveABI,
        functionName: "approve",
        args: [bridgeContract, amount],
      });

      const receipt = await provider.waitForTransaction(approveTx);

      if (receipt && receipt.status === 1) {
        return {
          success: true,
          data: receipt,
          chain,
          approvedAmount: ethers.utils.formatUnits(amount, decimals),
        };
      } else {
        return {
          success: false,
          data: receipt,
          chain,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        chain,
      };
    }
  };

  convertEthToUsdt = async (ethAmount: any, symbol: string) => {
    try {
      // Coinbase API endpoint for ETH-USDT pair
      const url = `https://api.coinbase.com/v2/exchange-rates?currency=${symbol}`;

      // Make a GET request to the Coinbase API
      const response = await axios.get(url);

      // Extract the USDT rate from the response
      const usdtRate = parseFloat(response.data.data.rates.USDT);
      // Calculate the USDT value
      const usdtValue = (parseFloat(ethAmount) * usdtRate).toFixed(2);
      return usdtValue;
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      throw error;
    }
  };

  getNativeCurrency(chain: SupportedChain): string {
    switch (chain) {
      case "arbitrum-sepolia":
        return "ARB";
      case "eth-sepolia":
      case "base-sepolia":
      default:
        return "ETH";
    }
  }

  getUSDTBalance = async (
    walletAddress: string,
    tokenAddress: string,
    chain: SupportedChain
  ) => {
    try {
      const chainConfig = chainConfigs[chain];
      if (!chainConfig) {
        throw new Error(`Unsupported chain: ${chain}`);
      }

      const usdtABI = [
        "function balanceOf(address) view returns (uint)",
        "function decimals() view returns (uint8)",
      ];

      const provider = new ethers.providers.JsonRpcProvider(chainConfig.rpcUrl);
      const usdtContract = new ethers.Contract(tokenAddress, usdtABI, provider);

      // Fetch the balance
      const balance = await usdtContract.balanceOf(walletAddress);

      // Get the number of decimals for the token
      const decimals = await usdtContract.decimals();

      // Convert the balance from wei to a more readable format
      const formattedBalance = ethers.utils.formatUnits(balance, decimals);

      return {
        chain,
        balance: formattedBalance,
        address: walletAddress,
      };
    } catch (error) {
      console.log(
        `Error fetching USDT balance for ${walletAddress} on ${chain}:`,
        error
      );
      return {
        chain,
        balance: "0",
        address: walletAddress,
      };
    }
  };

  getGasPrice = async (chain: SupportedChain) => {
    try {
      const chainConfig = chainConfigs[chain];
      if (!chainConfig) {
        throw new Error(`Unsupported chain: ${chain}`);
      }

      // Get gas price in Gwei
      const provider = new ethers.providers.JsonRpcProvider(chainConfig.rpcUrl);
      const gasPrice = await provider.getGasPrice();
      const gasPriceGwei = ethers.utils.formatUnits(gasPrice, "gwei");

      // Convert Gwei to USDT
      const ethAmount = ethers.utils.formatUnits(gasPrice, "ether");

      // Determine the appropriate currency for the chain
      let currency = "ETH";
      if (chain === "arbitrum-sepolia") {
        currency = "ARB";
      }
      // Note: Base uses ETH as its native currency, so no change needed for base-sepolia

      const response = await axios.get(
        `https://api.coinbase.com/v2/exchange-rates?currency=${currency}`
      );
      const usdtRate = parseFloat(response.data.data.rates.USDT);
      const usdtValue = (parseFloat(ethAmount) * usdtRate).toFixed(6);

      return {
        chain,
        gwei: gasPriceGwei,
        usdt: usdtValue,
      };
    } catch (error) {
      console.log(`Error fetching gas price for ${chain}:`, error);
      throw error;
    }
  };

  shortenHash(hash: string, chars: number = 4): string {
    if (hash.length <= chars * 2) {
      return hash;
    }
    return `${hash.substring(0, chars)}...${hash.substring(
      hash.length - chars
    )}`;
  }

  mintERC20TokensAndTransferETH = async (
    params: TokenMintParams
  ): Promise<MintResult> => {
    const {
      tokenAddress,
      recipientAddress,
      chain,
      amountToMint = "1000",
    } = params;
  
    console.log({params})
  
    try {
      const chainConfig = chainConfigs[chain!];
      if (!chainConfig) {
        throw new Error(`Unsupported chain: ${chain}`);
      }
  
      const abi = [
        "function mint(address to, uint256 amount) public",
        "function balanceOf(address account) public view returns (uint256)",
      ];
  
      // Connect to the network
      const provider = new ethers.providers.JsonRpcProvider(
        chainConfig.rpcUrl,
        chainConfig.chainId
      );
  
      // Create a signer
      const signer = new ethers.Wallet(Config.PRIVATE_KEY, provider);
      // Create a contract instance
      const tokenContract = new ethers.Contract(tokenAddress, abi, signer);
  
      // Check the current balance of the recipient
      const currentBalance = await tokenContract.balanceOf(recipientAddress);
      const currentBalanceFormatted = ethers.utils.formatUnits(currentBalance, 18);
  
      if (parseFloat(currentBalanceFormatted) >= 1000) {
        throw new Error("You already have 1000 or more tokens. Please wait 24 hours before requesting more tokens.");
      }
  
      // Convert the amount to Wei (assuming 18 decimals, adjust if your token uses a different number)
      const amountInWei = ethers.utils.parseUnits(amountToMint, 18);
      // Call the mint function
      const tx = await tokenContract.mint(recipientAddress, amountInWei);
  
      // Wait for the transaction to be mined
      await tx.wait();
  
      console.log(
        `Successfully minted ${amountToMint} tokens to ${recipientAddress} on ${chain}`
      );
  
      // Check the balance after minting
      const tokenBalance = await tokenContract.balanceOf(recipientAddress);
  
      console.log(
        `New token balance for ${recipientAddress} on ${chain}: ${ethers.utils.formatUnits(tokenBalance, 18)}`
      );
  
      const formattedAmount = ethers.utils.formatUnits(tokenBalance, 18)
  
      return {
        tokenBalance: formattedAmount,
        recipientAddress,
        chain,
        transactionHash: tx.hash,
      };
    
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw error;
    }
  };
}

export const bridgeWrapper = new Bridge();
