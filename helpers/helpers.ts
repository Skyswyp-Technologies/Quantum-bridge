import { Config } from "@/config/config";
import { BRIDGE_ABI } from "@/constants/constants";
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
    destId: any,
    amount: any,
    tokenAddress: string,
    destChain: any,
    walletClient: any
  ) => {
    if (!destId || !amount || !destChain || !destChain || !walletClient) return;
    try {
      const provider = new ethers.providers.JsonRpcProvider(Config.JSON_RPC);
      const depositERC20Tx = await walletClient.writeContract({
        address: Config.BRIDGE_CONTRACT,
        abi: BRIDGE_ABI,
        functionName: "deposit",
        args: [destId, amount, tokenAddress, destChain],
      });

      const receipt = await provider.waitForTransaction(depositERC20Tx);
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
}

export const bridgeWrapper = new Bridge();
