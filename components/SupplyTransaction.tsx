"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useWalletClient } from "wagmi";
import { useBridge } from "@/context/BridgeContext";
import Image from "next/image";
import Link from "next/link";
import Header from "./Header";
import Navbar from "./Navbar";
import Gas from "./../public/gas.svg";
import Tools from "./../public/tools.svg";
import Time from "./../public/time.svg";
import { bridgeWrapper } from "@/helpers/helpers";
import { Config } from "@/config/config";

const SupplyTransaction: React.FC = () => {
  const router = useRouter();
  const { data: walletClient } = useWalletClient();
  const {
    fromToken,
    amount,
    tokens,
    supply,
    getTokenInfo,
    getSuppliedBalance,
    updateCreditLimit,
    txHash,
    setHash,
  } = useBridge();

  const [approveState, setApproveState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [supplyState, setSupplyState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedToken = tokens.find((t) => t.id === fromToken);
  const tokenSymbol = selectedToken?.symbol || "";
  const apy = 0.05; // Assuming 5% APY, you might want to fetch this from the context if available

  const calculatedRewards = amount * apy;
  const rewardsInUSD = calculatedRewards;

  const approveSupply = async () => {
    try {
      setApproveState("loading");
      const info = getTokenInfo(fromToken);
      if (walletClient) {
        
        const approveTx = await bridgeWrapper.approveBridge(
          Config.POOL_CONTRACT_ADDRESS,
          info!.address,
          amount,
          walletClient,
          info!.originChain
        );
        if (!approveTx.success) {
          setApproveState("error");
          toast.error("Approval failed");
        } else {
          setApproveState("success");
          setSupplyState("idle");
          toast.success("Approval successful");
        }
      }
    } catch (error) {
      setApproveState("error");
      toast.error("An error occurred during approval");
    }
  };

  const executeSupply = async () => {
    if (approveState !== "success") {
      toast.error("Please complete the approval step first");
      return;
    }

    try {
      setSupplyState("loading");
      const info = getTokenInfo(fromToken);
      if (walletClient) {
        const supplyTx = await supply(
          info!.address,
          amount.toString(),
          walletClient,
          info!.originChain
        );
        if (!supplyTx.success) {
          setSupplyState("error");
          toast.error("Supply failed");
        } else {
          setHash(supplyTx.hash);
          setSupplyState("success");
          setIsSuccess(true);
          toast.success("Supply successful");
          await getSuppliedBalance(walletClient.account.address, info!.originChain);
          await updateCreditLimit(walletClient.account.address, info!.originChain);
        }
      }
    } catch (error) {
      setSupplyState("error");
      toast.error("An error occurred during supply");
    }
  };

  const handleButtonClick = () => {
    if (approveState === "idle" || approveState === "error") {
      approveSupply();
    } else if (approveState === "success" && supplyState === "idle") {
      executeSupply();
    } else if (supplyState === "error") {
      executeSupply();
    } else if (isSuccess) {
      router.push("/lending");
    }
  };

  const getButtonText = () => {
    if (approveState === "idle" || approveState === "error") return "Approve";
    if (approveState === "loading") return "Approving...";
    if (approveState === "success" && supplyState === "idle") return "Supply";
    if (supplyState === "loading") return "Supplying...";
    if (supplyState === "error") return "Retry Supply";
    if (isSuccess) return "Back to Lending";
    return "Retry";
  };

  const isButtonDisabled = () => {
    return approveState === "loading" || supplyState === "loading";
  };

  const TransactionContent = () => (
    <div className="space-y-3">
      <div className={`rounded border ${approveState === "error" ? "border-red-500" : "border-[#3E4347]"} bg-[#1A1A1A80] p-2 w-full h-[58px] flex justify-between items-center`}>
        <div className="flex flex-col gap-1">
          <span className="text-[#A6A9B8] text-xs">Approve Token</span>
          <span className="text-[#A6A9B8] text-xs">Approve in wallet</span>
        </div>
        {approveState === "loading" && <span className="text-yellow-500">Loading...</span>}
        {approveState === "success" && <span className="text-green-500">✓</span>}
        {approveState === "error" && <span className="text-red-500">✗</span>}
      </div>

      <div className={`rounded border ${supplyState === "error" ? "border-red-500" : "border-[#3E4347]"} bg-[#1A1A1A80] p-2 w-full h-[58px] flex justify-between items-center`}>
        <div className="flex flex-col gap-1">
          <span className="text-[#A6A9B8] text-xs">Supply Token</span>
          <span className="text-[#A6A9B8] text-xs">Supplying token to pool</span>
        </div>
        {approveState === "success" && (
          <>
            {supplyState === "loading" && <span className="text-yellow-500">Loading...</span>}
            {supplyState === "success" && <span className="text-green-500">✓</span>}
            {supplyState === "error" && <span className="text-red-500">✗</span>}
          </>
        )}
      </div>

      {isSuccess ? (
        <div className="rounded border border-[#A6A9B880] bg-[#1A1A1ACC] p-2 w-full flex flex-col gap-3 justify-center">
          <span className="text-[#A6A9B8] text-xs font-bold">Transaction Successful</span>
          <div className="flex flex-col">
            <span className="text-[#A6A9B8] text-xs font-bold">Supply Details</span>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[#9A9A9A] text-sm">Supplied Amount:</span>
              <span className="text-white text-sm">{amount} {tokenSymbol}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[#9A9A9A] text-sm">USD Value:</span>
              <span className="text-white text-sm">$ {amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[#9A9A9A] text-sm">APY:</span>
              <span className="text-white text-sm">{(apy * 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[#9A9A9A] text-sm">Estimated Yearly Earnings:</span>
              <span className="text-white text-sm">$ {calculatedRewards.toFixed(2)}</span>
            </div>
            <span className="text-[#A6A9B8] text-xs font-bold mt-4">Transaction Details</span>
            <div className="mt-2">
              <span className="text-[#9A9A9A] text-sm">Transaction Hash:</span>
              <a href={`https://sepolia.basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm ml-2 break-all">
                {txHash}
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded border border-[#A6A9B880] bg-[#1A1A1ACC] p-2 w-full flex flex-col gap-1 justify-center">
          <span className="text-[#A6A9B8] text-xs font-bold">You supply</span>
          <div className="flex justify-between items-center">
            <span className="text-[#9A9A9A] text-xl">{amount} {tokenSymbol}</span>
            <span className="text-[#A6A9B8] text-xs">$ {amount.toFixed(2)}</span>
          </div>
          <span className="text-[#A6A9B8] text-xs font-bold">
                    Calculated Rewards
                  </span>

                  <div className="flex justify-between items-center">
                    <span className="text-[#9A9A9A] text-xl">
                      {calculatedRewards.toFixed(4)} {tokenSymbol}
                    </span>
                    <span className="text-[#A6A9B8] text-xs">
                      $ {rewardsInUSD.toFixed(2)}
                    </span>
                    </div>
        </div>
      )}
    </div>
  );

  const MobileDesign = () => (
    <div className="bg-[#000000] text-white md:hidden h-screen w-full flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col m-4 h-[calc(100vh-64px)] rounded-3xl border border-[#3E4347] relative">
        <div className="absolute inset-0 z-0">
          <Image src="/wave.png" alt="wave background" layout="fill" objectFit="cover" quality={100} />
          <div className="absolute w-[59px] h-[223px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-radial-glow from-[#6AEFFF33] to-[#6AEFFF] opacity-60 blur-3xl"></div>
        </div>
        <div className="flex-grow py-6 px-4 flex flex-col space-y-4 z-10 overflow-y-auto">
          <TransactionContent />
        </div>
        <div className="p-4 mt-auto z-10">
          <button
            onClick={handleButtonClick}
            disabled={isButtonDisabled()}
            className={`w-full py-3 rounded-full font-bold text-lg ${
              isButtonDisabled()
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] text-white hover:bg-gradient-to-l"
            } transition-colors duration-200`}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );

  const DesktopDesign = () => (
    <div className="bg-[#000000] text-white h-screen w-full hidden md:flex flex-col">
      <Navbar />
      <div className="flex-grow flex">
        <div className="w-full flex items-center justify-center">
          <div className="w-[360px] h-[calc(100vh-75px)] bg-[#000000] rounded-3xl border border-[#3E4347] overflow-hidden flex flex-col relative">
            <div className="absolute inset-0 z-0">
              <Image src="/wave.png" alt="wave background" layout="fill" objectFit="cover" quality={100} />
              <div className="absolute w-[59px] h-[223px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-radial-glow from-[#6AEFFF33] to-[#6AEFFF] opacity-60 blur-3xl"></div>
            </div>
            <div className="flex-grow py-6 px-4 flex flex-col space-y-4 z-10 overflow-y-auto">
              <TransactionContent />
            </div>
            <div className="px-6 pb-6 mt-auto z-10">
              <button
                onClick={handleButtonClick}
                disabled={isButtonDisabled()}
                className={`w-full py-3 rounded-full font-bold text-lg ${
                  isButtonDisabled()
                    ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] text-white hover:bg-gradient-to-l"
                } transition-colors duration-200`}
              >
                {getButtonText()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <MobileDesign />
      <DesktopDesign />
    </>
  );
};

export default SupplyTransaction;