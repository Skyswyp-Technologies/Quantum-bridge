import { Config } from "@/config/config";
import { BRIDGE_ABI } from "@/constants/constants";
import axios from "axios";
import { ethers } from "ethers";

class Bridge {
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
    amount: string,
    tokenAddress: string,
    receiver: string,
    destChain: any,
    walletClient: any
  ) => {
    if (!destId || !amount || !tokenAddress || !destChain || !receiver || !walletClient) {
      throw new Error("Missing required parameters");
    }

    try {
      console.log("Preparing to call deposit with params:", {
        destId,
        amount,
        tokenAddress,
        destChain,
        receiver,
        fee
      });

      const depositTx = await walletClient.writeContract({
        address: Config.BRIDGE_CONTRACT,
        abi: BRIDGE_ABI,
        functionName: "deposit",
        args: [destId, amount, tokenAddress, destChain, receiver],
        value: ethers.utils.parseEther(fee) // Send the required fee with the transaction
      });

      console.log("Transaction sent:", depositTx);

      // Wait for the transaction to be mined
      const provider = new ethers.providers.JsonRpcProvider(Config.JSON_RPC);
      const receipt = await provider.waitForTransaction(depositTx);

      if (receipt.status === 1) {
        return { success: true, data: { receipt, hash: receipt.transactionHash } };
      } else {
        return { success: false, data: { receipt, hash: receipt.transactionHash } };
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

      const approveTx = await walletClient.writeContract({
        address: tokenAddress,
        abi: approveABI,
        functionName: "approve",
        args: [Config.BRIDGE_CONTRACT, amountApprove],
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
}

export const bridgeWrapper = new Bridge();
