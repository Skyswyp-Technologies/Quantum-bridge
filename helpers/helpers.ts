import { Config } from "@/config/config";
import { BRIDGE_ABI } from "@/constants/constants";
import axios from "axios";
import { ethers } from "ethers";
import { ChainConfig, MintResult, SupportedChain, TokenMintParams } from "./inteface/interface";

const chainConfigs: Record<SupportedChain, ChainConfig> = {
  'eth-sepolia': {
    rpcUrl: 'https://go.getblock.io/4abbff238c2d4f219e86e52b324cdabf',
    chainId: 11155111
  },
  'arbitrum-sepolia': {
    rpcUrl: 'https://go.getblock.io/c0d41de5290b4969b6fc4cb89f86d429',
    chainId: 421614
  },
  'base-sepolia': {
    rpcUrl: 'https://go.getblock.io/17f34af937f341e2b3afba0151a7b227',
    chainId: 84532
  }
};

class Bridge {
  constructor() {}

  depositNativeAssets = async (
    destId: any,
    amount: any,
    destChain: string,
    walletClient: any
  ) => {
    if (!destId || !amount || !destChain || !walletClient) return;
    try {
      const provider = new ethers.providers.JsonRpcProvider(Config.JSON_RPC);

      const depositNativeTx = await walletClient.writeContract({
        address: Config.BRIDGE_CONTRACT,
        abi: BRIDGE_ABI,
        functionName: "depositNative",
        args: [destId, amount, destChain],
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
    fee: any,
    destId: any,
    amount: any,
    tokenAddress: string,
    receiver: string,
    destChain: any,
    walletClient: any
  ) => {
    if (
      !destId ||
      !amount ||
      !tokenAddress ||
      !destChain ||
      !receiver ||
      !walletClient
    ) {
      throw new Error("Missing required parameters");
    }

    try {
      const depositTx = await walletClient.writeContract({
        address: Config.BRIDGE_CONTRACT,
        abi: BRIDGE_ABI,
        functionName: "deposit",
        args: [destId, amount, tokenAddress, destChain, receiver],
        value: ethers.utils.parseEther(fee), // Send the required fee with the transaction
      });

      // Wait for the transaction to be mined
      const provider = new ethers.providers.JsonRpcProvider(Config.JSON_RPC);
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
    amount: any,
    tokenAddress: string,
    receiverAddress: string,
    destEid: any
  ) => {
    try {
      // Setup provider and signer
      const provider = new ethers.providers.JsonRpcProvider(Config.JSON_RPC);

      // Create contract instance
      const bridge = new ethers.Contract(
        Config.BRIDGE_CONTRACT,
        BRIDGE_ABI,
        provider
      );
      // Get the payload
      const payload = await bridge.getMessage(
        ethers.utils.parseEther(amount.toString()),
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
        console.log(
          `Fee is set: ${ethers.utils.formatEther(fee.nativeFee)} ETH`
        );
        const nativeFee = ethers.utils.formatEther(fee.nativeFee);
        const feeInUSD = await this.convertEthToUsdt(nativeFee, "ETH");

        return { payload, options, nativeFee, feeInUSD };
      }
    } catch (error) {
      console.error("Error in setupBridgeAndGetInfo:", error);
      throw error;
    }
  };

  approveBridge = async (
    tokenAddress: string,
    amountApprove: any,
    walletClient: any
  ) => {
    try {
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

      const provider = new ethers.providers.JsonRpcProvider(Config.JSON_RPC);
      const amount = ethers.utils.parseUnits(amountApprove.toString());

      const approveTx = await walletClient.writeContract({
        address: tokenAddress,
        abi: approveABI,
        functionName: "approve",
        args: [Config.BRIDGE_CONTRACT, amount],
      });

      const receipt = await provider.waitForTransaction(approveTx);

      if (receipt && receipt.status === 1) {
        return { success: true, data: receipt };
      } else {
        return { success: false, data: receipt };
      }
    } catch (error: any) {
      return { success: false, message: error.message };
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

  getUSDTBalance = async (walletAddress: string, tokenAddress: string) => {
    try {
      const usdtABI = ["function balanceOf(address) view returns (uint)"];

      const provider = new ethers.providers.JsonRpcProvider(Config.JSON_RPC);
      const usdtContract = new ethers.Contract(tokenAddress, usdtABI, provider);

      // Fetch the balance
      const balance = await usdtContract.balanceOf(walletAddress);
      // Convert the balance from wei to more readable format (USDT has 6 decimal places)
      const formattedBalance = ethers.utils.formatEther(balance);
      return formattedBalance;
    } catch (error) {
      return "0";
    }
  };

  getGasPrice = async () => {
    try {
      // Get gas price in Gwei
      const provider = new ethers.providers.JsonRpcProvider(Config.JSON_RPC);
      const gasPrice = await provider.getGasPrice();
      const gasPriceGwei = ethers.utils.formatUnits(gasPrice, "gwei");

      // Convert Gwei to USDT
      const ethAmount = ethers.utils.formatUnits(gasPrice, "ether");
      const response = await axios.get(
        "https://api.coinbase.com/v2/exchange-rates?currency=ETH"
      );
      const usdtRate = parseFloat(response.data.data.rates.USDT);
      const usdtValue = (parseFloat(ethAmount) * usdtRate).toFixed(6);

      return {
        gwei: gasPriceGwei,
        usdt: usdtValue,
      };
    } catch (error) {
      console.log("Error fetching gas price:", error);
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


  intERC20TokensAndTransferETH = async (params: TokenMintParams): Promise<MintResult> => {
    const { tokenAddress, recipientAddress, chain, amountToMint = "1000" } = params;

    try {
      const chainConfig = chainConfigs[chain];
      if (!chainConfig) {
        throw new Error(`Unsupported chain: ${chain}`);
      }

      const abi = [
        "function mint(address to, uint256 amount) public",
        "function balanceOf(address account) public view returns (uint256)",
      ];

      // Connect to the network
      const provider = new ethers.providers.JsonRpcProvider(chainConfig.rpcUrl, chainConfig.chainId);

      // Create a signer
      const signer = new ethers.Wallet(Config.PRIVATE_KEY, provider);

      // Create a contract instance
      const tokenContract = new ethers.Contract(tokenAddress, abi, signer);

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

      // Transfer 0.002 ETH after successful mint
      const ethAmount = ethers.utils.parseEther("0.002");
      const ethTx = await signer.sendTransaction({
        to: recipientAddress,
        value: ethAmount
      });

      // Wait for the ETH transfer transaction to be mined
      await ethTx.wait();

      console.log(`Successfully transferred 0.002 ETH to ${recipientAddress} on ${chain}`);

      // Check the ETH balance after transfer
      const ethBalance = await provider.getBalance(recipientAddress);

      return {
        tokenBalance: ethers.utils.formatUnits(tokenBalance, 18),
        ethBalance: ethers.utils.formatEther(ethBalance)
      };
    } catch (error) {
      console.error(`Error minting tokens or transferring ETH on ${chain}:`, error);
      throw error;
    }
  };


   
  
}

export const bridgeWrapper = new Bridge();
