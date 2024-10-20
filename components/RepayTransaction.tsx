"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useWalletClient } from "wagmi";
import { useBridge } from "@/context/BridgeContext";
import Image from "next/image";
import Header from "./Header";
import Navbar from "./Navbar";
import { bridgeWrapper, lendingPoolWrapper } from "@/helpers/helpers";
import { Config } from "@/config/config";

const RepayTransaction: React.FC = () => {
  const router = useRouter();
  const { data: walletClient } = useWalletClient();
  const {
    fromToken,
    tokens,
    borrowBalance,
    repay,
    getTokenInfo,
    getBorrowedBalance,
    updateCreditLimit,
    txHash,
    setHash,
  } = useBridge();

  const [approveState, setApproveState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [repayState, setRepayState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [isSuccess, setIsSuccess] = useState(false);
  const [interest, setInterest] = useState("");
  const [repayAmount, setRepayAmount] = useState("");

  const selectedToken = tokens.find((t) => t.id === fromToken);
  const tokenSymbol = selectedToken?.symbol || "";
  const apy = 0.05; // Assuming 5% APY, you might want to fetch this from the context if available

  useEffect(() => {
    const tokenInfo = getTokenInfo(fromToken);
    if (!tokenInfo) return;

    const handleInterest = async () => {
      const result = await lendingPoolWrapper.interestAndRepayAMount(
        tokenInfo.address,
        borrowBalance,
        tokenInfo.originChain
      );
      setRepayAmount(result!.totalRepayAmount);
      setInterest(result!.interest);
    };

    handleInterest();
  }, [fromToken, borrowBalance, getTokenInfo]);

  const approveRepay = async () => {
    try {
      setApproveState("loading");
      const info = getTokenInfo(fromToken);

      if (walletClient && info) {
        const approveTx = await bridgeWrapper.approveBridge(
          Config.POOL_CONTRACT_ADDRESS,
          info.address,
          repayAmount.toString(),
          walletClient,
          info.originChain
        );
        if (!approveTx.success) {
          setApproveState("error");
          toast.error("Approval failed");
        } else {
          setApproveState("success");
          setRepayState("idle");
          toast.success("Approval successful");
        }
      }
    } catch (error) {
      setApproveState("error");
      toast.error("An error occurred during approval");
    }
  };

  const executeRepay = async () => {
    if (approveState !== "success") {
      toast.error("Please complete the approval step first");
      return;
    }

    try {
      setRepayState("loading");
      
      const info = getTokenInfo(fromToken);


      if (walletClient && info) {
        const result = await repay(
          info.address,
          borrowBalance.toString(),
          walletClient,
          info.originChain
        );
        setHash(result.hash);
        setRepayState("success");
        setIsSuccess(true);
        toast.success("Repayment successful");
        await getBorrowedBalance(
          walletClient.account.address,
          info.originChain
        );
        await updateCreditLimit(walletClient.account.address, info.originChain);
      }
    } catch (error) {
      setRepayState("error");
      toast.error("An error occurred during repayment");
    }
  };

  const handleButtonClick = () => {
    if (approveState === "idle" || approveState === "error") {
      approveRepay();
    } else if (approveState === "success" && repayState === "idle") {
      executeRepay();
    } else if (repayState === "error") {
      executeRepay();
    } else if (isSuccess) {
      router.push("/lending");
    }
  };

  const getButtonText = () => {
    if (approveState === "idle" || approveState === "error") return "Approve";
    if (approveState === "loading") return "Approving...";
    if (approveState === "success" && repayState === "idle") return "Repay";
    if (repayState === "loading") return "Repaying...";
    if (repayState === "error") return "Retry Repay";
    if (isSuccess) return "Back to Lending";
    return "Retry";
  };

  const isButtonDisabled = () => {
    return approveState === "loading" || repayState === "loading";
  };

  const TransactionContent = () => (
    <div className="space-y-3">
      <div
        className={`rounded border ${
          approveState === "error" ? "border-red-500" : "border-[#3E4347]"
        } bg-[#1A1A1A80] p-2 w-full h-[58px] flex justify-between items-center`}
      >
        <div className="flex flex-col gap-1">
          <span className="text-[#A6A9B8] text-xs">Approve Token</span>
          <span className="text-[#A6A9B8] text-xs">Approve in wallet</span>
        </div>
        {approveState === "loading" && (
          <span className="text-yellow-500">Loading...</span>
        )}
        {approveState === "success" && (
          <span className="text-green-500">✓</span>
        )}
        {approveState === "error" && <span className="text-red-500">✗</span>}
      </div>

      <div
        className={`rounded border ${
          repayState === "error" ? "border-red-500" : "border-[#3E4347]"
        } bg-[#1A1A1A80] p-2 w-full h-[58px] flex justify-between items-center`}
      >
        <div className="flex flex-col gap-1">
          <span className="text-[#A6A9B8] text-xs">Repay Loan</span>
          <span className="text-[#A6A9B8] text-xs">
            Repaying loan from wallet
          </span>
        </div>
        {approveState === "success" && (
          <>
            {repayState === "loading" && (
              <span className="text-yellow-500">Loading...</span>
            )}
            {repayState === "success" && (
              <span className="text-green-500">✓</span>
            )}
            {repayState === "error" && <span className="text-red-500">✗</span>}
          </>
        )}
      </div>

      {isSuccess ? (
        <div className="rounded border border-[#A6A9B880] bg-[#1A1A1ACC] p-2 w-full flex flex-col gap-3 justify-center">
          <span className="text-[#A6A9B8] text-xs font-bold">
            Transaction Successful
          </span>
          <div className="flex flex-col">
            <span className="text-[#A6A9B8] text-xs font-bold">
              Repayment Details
            </span>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[#9A9A9A] text-sm">Repaid Amount:</span>
              <span className="text-white text-sm">
                {repayAmount} {tokenSymbol}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[#9A9A9A] text-sm">USD Value:</span>
              <span className="text-white text-sm">
                $ {parseFloat(repayAmount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[#9A9A9A] text-sm">APY:</span>
              <span className="text-white text-sm">
                {(apy * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[#9A9A9A] text-sm">Interest Paid:</span>
              <span className="text-white text-sm">$ {interest}</span>
            </div>
            <span className="text-[#A6A9B8] text-xs font-bold mt-4">
              Transaction Details
            </span>
            <div className="mt-2">
              <span className="text-[#9A9A9A] text-sm">Transaction Hash:</span>
              <a
                href={`https://sepolia.basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 text-sm ml-2 break-all"
              >
                {txHash}
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded border border-[#A6A9B880] bg-[#1A1A1ACC] p-2 w-full flex flex-col gap-1 justify-center">
          <span className="text-[#A6A9B8] text-xs font-bold">You repay</span>
          <div className="flex justify-between items-center">
            <span className="text-[#9A9A9A] text-xl">
              {repayAmount} {tokenSymbol}
            </span>
            <span className="text-[#A6A9B8] text-xs">
              $ {parseFloat(repayAmount).toFixed(2)}
            </span>
          </div>
          <span className="text-[#A6A9B8] text-xs">Transaction details</span>

          <div className="flex flex-row gap-4 items-center">
            <div className="flex flex-row gap-2">
              <span className="text-[#A6A9B8] text-xs">APY</span>
              <span className="text-[#A6A9B8] text-xs">
                {(apy * 100).toFixed(2)}%
              </span>
            </div>

            <span className="text-[#A6A9B8] text-xs">
              Interest: ${interest}
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
          <Image
            src="/wave.png"
            alt="wave background"
            layout="fill"
            objectFit="cover"
            quality={100}
          />
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
              <Image
                src="/wave.png"
                alt="wave background"
                layout="fill"
                objectFit="cover"
                quality={100}
              />
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

export default RepayTransaction;
